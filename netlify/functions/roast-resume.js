// Netlify Function: roast-resume
// Receives a base64-encoded PDF or DOCX, extracts the text,
// sends it to Claude for feedback, and returns the result.
// The Anthropic API key stays server-side (Netlify env var) — never in browser JS.

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { fileBase64, fileType, fileName } = JSON.parse(event.body);

    if (!fileBase64 || !fileType) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing file data.' }) };
    }

    // Basic size guard (Netlify functions have a ~6MB request limit anyway)
    const buffer = Buffer.from(fileBase64, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return { statusCode: 400, body: JSON.stringify({ error: 'File too large (max 5MB).' }) };
    }

    // Extract text depending on file type
    let resumeText = '';
    if (fileType === 'application/pdf') {
      const parsed = await pdfParse(buffer);
      resumeText = parsed.text;
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Only PDF or DOCX files are supported.' }) };
    }

    resumeText = resumeText.trim().slice(0, 12000); // keep prompt size sane

    if (!resumeText) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Could not read any text from that file.' }) };
    }

    // Call Claude for feedback
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server is not configured (missing API key).' }) };
    }

    const prompt = `You are a blunt, practical resume reviewer for a student/internship platform called HunarIntern. A student named in the filename "${fileName || 'resume'}" has submitted their resume below.

Give direct, constructive feedback — not generic praise. Structure your response with these sections, using short plain-language paragraphs or bullet points, no markdown headers with #:

1. Overall impression (1-2 sentences)
2. What's working
3. What's hurting them (be specific — vague bullet points, missing metrics, formatting issues, weak action verbs, etc.)
4. Top 3 fixes to make first
5. One honest encouraging closing line

Keep the whole response under 350 words. Be direct and useful, not harsh for the sake of it, and not softened into meaninglessness either.

Resume text:
"""
${resumeText}
"""`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return { statusCode: 502, body: JSON.stringify({ error: 'AI service error. Please try again shortly.' }) };
    }

    const data = await response.json();
    const feedback = data.content && data.content[0] && data.content[0].text
      ? data.content[0].text
      : 'No feedback returned — please try again.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback })
    };

  } catch (err) {
    console.error('roast-resume error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Something went wrong processing your resume.' }) };
  }
};
