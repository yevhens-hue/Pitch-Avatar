import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { parseOffice } from 'officeparser';
import { requireAuth } from '@/lib/auth-guard';

export async function POST(req: Request) {
  try {
    const authError = await requireAuth(req);
    if (authError) return authError;

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let content = '';
    const nameLower = file.name.toLowerCase();

    if (nameLower.endsWith('.pdf')) {
      const data = await pdf(buffer);
      content = data.text;
    } else if (nameLower.match(/\.(pptx|docx|xlsx|odt|odp|ods)$/)) {
      content = await parseOffice(buffer);
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload PDF, PPTX, or DOCX.' }, { status: 400 });
    }
    
    console.log(`Parsed document: ${file.name}, total chars: ${content.length}`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${file.name}`,
      charCount: content.length,
      content,
      preview: content.substring(0, 500) + '...'
    });
  } catch (error: unknown) {
    console.error('File parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
