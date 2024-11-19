import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { IncomingMessage } from 'http';
import { PassThrough } from 'stream';
import dotenv from 'dotenv';
import pdf from 'pdf-extraction';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY, // Ensure this is set correctly in your environment variables
});

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to handle file uploads manually
  },
};

export async function POST(req) {
  try {
    const isLocal = process.env.NODE_ENV === 'development';

    let fileBuffer, userMessage;

    if (isLocal) {
      // Handle FormData locally
      const formData = await req.formData();
      const file = formData.get('file');
      userMessage = formData.get('userMessage');

      if (!file || !userMessage) {
        return NextResponse.json(
          { error: 'Missing file or user message in the request body.' },
          { status: 400 }
        );
      }

      fileBuffer = Buffer.from(await file.arrayBuffer());
    } else {
      // Parse file with built-in handling (ensure file data is available in the request)
      const form = new URLSearchParams(await req.text());
      userMessage = form.get('userMessage');
      fileBuffer = Buffer.from(form.get('file'), 'base64');
    }

    // Extract content from the uploaded PDF
    const pdfData = await pdf(fileBuffer);
    const pdfText = pdfData.text;

    console.log('Extracted PDF text:', pdfText);

    // Send request to OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
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

    return NextResponse.json({
      pdfContent: pdfText,
      message: response.choices[0]?.message?.content || 'No response from AI.',
    });
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.json(
      { error: 'Invalid data or error in the server processing.' },
      { status: 500 }
    );
  }
}
