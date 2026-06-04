import { createAdminClient } from '../../lib/supabase';
import { renderToStream } from '@react-pdf/renderer';
import BeautyReportPDF from '../../components/pdf/BeautyReportPDF';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { reportId, lang = 'fr' } = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (!reportId) {
      return res.status(400).json({ error: 'Missing reportId' });
    }

    const supabase = createAdminClient();

    // 1. Fetch analysis to verify paid status and retrieve report_json + email
    const { data: analysis, error: fetchErr } = await supabase
      .from('analyses')
      .select('is_paid, report_json, email, user_id')
      .eq('id', reportId)
      .single();

    if (fetchErr || !analysis) {
      console.error('[API Send PDF] Fetch error:', fetchErr);
      return res.status(404).json({ error: 'Report not found' });
    }

    if (!analysis.is_paid) {
      return res.status(403).json({ error: 'Report is not premium' });
    }

    // Determine target email
    let targetEmail = analysis.email;

    if (!targetEmail && analysis.user_id) {
      // Fallback: check if the user row has an email
      const { data: user } = await supabase
        .from('users')
        .select('email')
        .eq('id', analysis.user_id)
        .single();
      if (user && user.email) {
        targetEmail = user.email;
      }
    }

    if (!targetEmail) {
      return res.status(400).json({ error: 'No registered email found for this analysis' });
    }

    const reportData = { ...analysis.report_json, isPaid: true };

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.log(`[API Send PDF] Mock sending PDF to ${targetEmail} (RESEND_API_KEY is not configured)`);
      return res.status(200).json({
        ok: true,
        message: lang === 'fr' 
          ? `Rapport envoyé avec succès (simulation) à ${targetEmail}`
          : `Report successfully sent (mocked) to ${targetEmail}`,
        email: targetEmail,
        mocked: true
      });
    }

    // 2. Render PDF to stream
    const stream = await renderToStream(<BeautyReportPDF report={reportData} lang={lang} />);
    
    // Convert stream to Buffer
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);
    const base64Content = pdfBuffer.toString('base64');

    // 3. Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'Rate My Skin <report@ratemyskin.co>',
        to: targetEmail,
        subject: lang === 'fr' 
          ? 'Votre Rapport Esthétique de Peau' 
          : 'Your Skin Aesthetic Report',
        html: lang === 'fr'
          ? `<p>Bonjour,</p><p>Veuillez trouver ci-joint votre rapport esthétique de peau complet en format PDF.</p><p>L'équipe Rate My Skin</p>`
          : `<p>Hello,</p><p>Please find attached your complete skin aesthetic report in PDF format.</p><p>The Rate My Skin Team</p>`,
        attachments: [
          {
            filename: lang === 'fr' ? 'analyse-de-peau-rate-my-skin.pdf' : 'rate-my-skin-report.pdf',
            content: base64Content
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[API Send PDF] Resend API error:', errText);
      throw new Error('Failed to send email via Resend');
    }

    return res.status(200).json({
      ok: true,
      message: lang === 'fr'
        ? `Rapport envoyé à ${targetEmail}`
        : `Report sent to ${targetEmail}`,
      email: targetEmail
    });

  } catch (error) {
    console.error('[API Send PDF] Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
