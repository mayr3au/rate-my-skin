import { renderToStream } from '@react-pdf/renderer';
import BeautyReportPDF from '../../components/pdf/BeautyReportPDF';
import { createAdminClient } from '../../lib/supabase';
import { applyCors } from '../../lib/security';

export default async function handler(req, res) {
  const isGet = req.method === 'GET';
  if (req.method !== 'POST' && !isGet) {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Handle CORS
  if (applyCors(req, res)) return;

  try {
    // Accept both the GET form used by the report page
    // (window.open('/api/generate-pdf?analysisId=...')) and the POST form.
    let reportId, bodyReportData, lang;
    if (isGet) {
      reportId = req.query.reportId || req.query.analysisId || null;
      lang = req.query.lang || 'fr';
    } else {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
      reportId = body.reportId || body.analysisId || null;
      bodyReportData = body.reportData;
      lang = body.lang || 'fr';
    }

    let reportData = bodyReportData;

    // If a report id is provided, fetch it from Supabase
    if (reportId) {
      const supabase = createAdminClient();
      if (!supabase) {
        return res.status(503).json({ error: 'Database unavailable' });
      }
      const { data: analysis, error } = await supabase
        .from('analyses')
        .select('is_paid, report_json')
        .eq('id', reportId)
        .single();

      if (error || !analysis) {
        console.error('[API PDF] Supabase fetch error:', error);
        return res.status(404).json({ error: 'Report not found in database' });
      }

      // Verify payment status in production
      if (!analysis.is_paid && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Report is not unlocked (premium check failed)' });
      }

      reportData = { ...analysis.report_json, isPaid: analysis.is_paid };
    } else if (reportData) {
      reportData = { ...reportData, isPaid: (req.body && req.body.isPaid) || false };
    }

    if (!reportData) {
      return res.status(400).json({ error: 'Missing reportId/analysisId or reportData' });
    }

    // Render the React PDF document to a stream
    const stream = await renderToStream(<BeautyReportPDF report={reportData} lang={lang} />);

    const filename = lang === 'fr' ? 'analyse-de-peau-rate-my-skin.pdf' : 'rate-my-skin-report.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-store');

    stream.pipe(res);
  } catch (error) {
    console.error('[API PDF] Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
}
