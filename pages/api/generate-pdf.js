import { renderToStream } from '@react-pdf/renderer';
import BeautyReportPDF from '../../components/pdf/BeautyReportPDF';
import { createAdminClient } from '../../lib/supabase';
import { applyCors } from '../../lib/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Handle CORS
  if (applyCors(req, res)) return;

  try {
    const { reportId, reportData: bodyReportData, lang = 'fr' } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    let reportData = bodyReportData;

    // If reportId is provided, fetch it from Supabase
    if (reportId) {
      const supabase = createAdminClient();
      const { data: analysis, error } = await supabase
        .from('analyses')
        .select('is_paid, report_json')
        .eq('id', reportId)
        .single();

      if (error || !analysis) {
        console.error('[API PDF] Supabase fetch error:', error);
        return res.status(404).json({ error: 'Report not found in database' });
      }

      // Verify payment status (skip in dev environment if desired)
      if (!analysis.is_paid && process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Report is not unlocked (premium check failed)' });
      }

      reportData = { ...analysis.report_json, isPaid: analysis.is_paid };
    } else if (reportData) {
      reportData = { ...reportData, isPaid: req.body.isPaid || false };
    }

    if (!reportData) {
      return res.status(400).json({ error: 'Missing reportId or reportData' });
    }

    // Render the React PDF document to stream
    const stream = await renderToStream(<BeautyReportPDF report={reportData} lang={lang} />);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${
        lang === 'fr' ? 'analyse-de-peau-rate-my-skin.pdf' : 'rate-my-skin-report.pdf'
      }"`
    );

    // Pipe PDF stream directly to response
    stream.pipe(res);
  } catch (error) {
    console.error('[API PDF] Error generating PDF:', error);
    res.status(500).json({ error: error.message });
  }
}
