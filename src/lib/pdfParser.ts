import * as pdfjsLib from 'pdfjs-dist'

// Set up the worker for pdfjs
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
}

export interface ParsedSlide {
  id: number
  text: string
  title: string
  thumbnailUrl: string
}

export async function parsePdfFile(file: File): Promise<ParsedSlide[]> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise
    const numPages = pdf.numPages
    
    const slides: ParsedSlide[] = []
    
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      
      // Extract text
      const textContent = await page.getTextContent()
      const textItems = textContent.items.map((item: any) => item.str)
      const text = textItems.join(' ')
      
      // Render to image (thumbnail)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      
      if (context) {
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise
        
        // Convert to base64 jpeg to save space
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
        
        slides.push({
          id: pageNum,
          text: text,
          title: `Slide ${pageNum}`,
          thumbnailUrl
        })
      }
    }
    
    return slides
  } catch (error) {
    console.error('Error parsing PDF:', error)
    return []
  }
}
