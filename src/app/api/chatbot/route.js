import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import pdf from 'pdf-extraction';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
  timeout: 120000, // Set a higher timeout
});

export const config = {
  api: {
    bodyParser: false, // Disable body parser for file uploads
  },
};

export async function POST(req) {
  try {
    console.log('Request received:', { method: req.method, url: req.url });

    const formData = await req.formData();
    const file = formData.get('file');
    const userMessage = formData.get('userMessage');

    if (!file || !userMessage) {
      console.error('Missing file or user message in the request body.');
      return NextResponse.json(
        { error: 'Missing file or user message in the request body.' },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (!fileBuffer) {
      console.error('File buffer is null or empty.');
      return NextResponse.json(
        { error: 'File buffer is null or empty.' },
        { status: 400 }
      );
    }

    // Extract text from the uploaded PDF
    console.log('Extracting text from PDF...');
    const pdfData = await pdf(fileBuffer);
    const pdfText = pdfData.text;
    console.log('Extracted PDF Text:', pdfText);

    // Stream response from OpenAI API
    console.log('Sending extracted text to OpenAI API...');
    const responseStream = await openai.chat.completions.create({
      model: 'gpt-4',
      stream: true, // Enable streaming
      messages: [
        { role: 'system', content: 'You are a helpful assistant...' },
        { role: 'user', content: userMessage },
        {
          role: 'system',
          content: `Here is the content extracted from the uploaded PDF: ${pdfText}`,
        },
      ],
    });

    const reader = responseStream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('Stream finished.');
              controller.close();
              break;
            }
            const chunk = decoder.decode(value, { stream: true });
            console.log('Chunk received:', chunk); // Debugging log
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (err) {
          console.error('Error in streaming response:', err);
          controller.error(err); // Notify client of error
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.json(
      { error: 'Invalid data or error in the server processing.' },
      { status: 500 }
    );
  }
}
