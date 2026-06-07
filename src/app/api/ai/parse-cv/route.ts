import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = '';
    
    if (file.name.toLowerCase().endsWith('.pdf')) {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else {
      // Basic fallback for non-PDFs (e.g. basic text reading, though .docx is binary)
      // For a robust .docx parsing we would need mammoth, but we'll try to extract raw text as best effort
      text = buffer.toString('utf-8');
    }

    // Limit text length to avoid token limits
    text = text.substring(0, 15000);

    const systemPrompt = `You are a CV parser. Extract the following information from the provided resume text.
Return the result strictly as a valid JSON object with the following keys:
- firstName
- lastName
- email
- company (the most recent or current company)
- position (the most recent or current job title)
- country
- linkedin (the URL if present)

If any field is not found, use an empty string "". Do not include markdown formatting like \`\`\`json.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const resultText = response.choices[0]?.message?.content?.trim() || '{}';
    const parsedData = JSON.parse(resultText);

    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error('CV parsing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse CV' },
      { status: 500 }
    );
  }
}
