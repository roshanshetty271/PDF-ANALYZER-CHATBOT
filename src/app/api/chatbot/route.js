import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import pdf from 'pdf-extraction';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to handle file uploads manually
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
      stream: true, // Enable streaming responses
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant...',
        },
        { role: 'user', content: userMessage },
        {
          role: 'system',
          content: `Here is the content extracted from the uploaded PDF: ${pdfText}`,
        },
      ],
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Handle the response chunk-by-chunk
          for await (const chunk of responseStream) {
            if (chunk?.choices[0]?.delta?.content) {
              const content = chunk.choices[0].delta.content;
              console.log('Extracted content:', content);

              // Check if content is not empty
              if (content) {
                // Enqueue smaller chunks
                controller.enqueue(encoder.encode(content));
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Error in streaming response:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.json(
      { error: 'Invalid data or error in the server processing.' },
      { status: 500 }
    );
  }
}
