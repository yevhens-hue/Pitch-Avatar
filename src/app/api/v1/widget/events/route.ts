import { NextResponse } from 'next/server'

// Mock for External App -> Widget Event Inbound flow (Epic R4C-25761)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    console.log('[Widget REST API Mock] Received Event:', body)

    // In a real environment, PHP would authenticate this, 
    // and Go-trigger-service would process the event and push to WS/Socket.io.
    // For local Next.js mock, we just acknowledge receipt.

    return NextResponse.json({
      success: true,
      message: 'Event processed by Widget Mock',
      receivedPayload: body
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 })
  }
}
