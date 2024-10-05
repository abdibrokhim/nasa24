import { NextResponse } from 'next/server';
import { chatCompletion } from '../utils/chat';

export const runtime = 'nodejs'; // Ensure Node.js runtime

export async function POST(request: Request) {
  try {
    const { question, stream } = await request.json();
    const messages = [{ role: "user", content: question }];

    if (stream) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      // Assume chatCompletion returns an async generator for streaming
      const completionStream = await chatCompletion(messages, "gpt-4o-mini", true);

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of completionStream) {
              const data = decoder.decode(chunk);

              // Process and enqueue the data
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            controller.close();
          } catch (err) {
            console.error('Error in stream:', err);
            controller.error(err);
          }
        },
      });

      return new Response(readableStream, {
        headers: { 'Content-Type': 'text/event-stream' },
      });
    } else {
      const answer = await chatCompletion(messages);
      return NextResponse.json({ answer });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}