import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse PDF text
    const data = await pdf(buffer);
    const content = data.text;
    
    console.log(`Parsed PDF: ${file.name}, total chars: ${content.length}`);

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${file.name}`,
      charCount: content.length,
      preview: content.substring(0, 500) + '...'
    });
  } catch (error: unknown) {
    console.error('PDF parsing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to process document';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
