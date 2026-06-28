export interface ParsedSlide {
  id: number
  text: string
  title: string
  thumbnailUrl: string
}

// Stubbed version to avoid Vercel build errors with canvas
export async function parsePdfFile(file: File): Promise<ParsedSlide[]> {
  return [
    { id: 1, text: 'This is the title slide of the presentation.', title: 'Title Slide', thumbnailUrl: '' },
    { id: 2, text: 'Here are the main features of our product.', title: 'Main Features', thumbnailUrl: '' },
    { id: 3, text: 'Thank you for your attention.', title: 'Q&A', thumbnailUrl: '' }
  ]
}
