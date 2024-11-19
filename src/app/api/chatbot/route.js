import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { IncomingMessage } from 'http';
import { PassThrough } from 'stream';
import dotenv from 'dotenv';
import pdf from 'pdf-extraction';

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
    console.log("Request received", req);
    const isLocal = process.env.NODE_ENV === 'development';
    console.log("Is Local:", isLocal);
    let fileBuffer, userMessage;
    console.log("File Buffer:", fileBuffer);
    console.log("User Message:", userMessage);
    if (isLocal) {
      // Handle FormData locally
      const formData = await req.formData();
      console.log("Form Data:", formData);
      const file = formData.get('file');
      console.log("File:", file);
      userMessage = formData.get('userMessage');
      console.log("User Message:", userMessage);

      if (!file || !userMessage) {
        console.log("Missing file or user message in the request body.");
        return NextResponse.json(
          { error: 'Missing file or user message in the request body.' },
          { status: 400 }
        );
      }
      console.log("File Buffer (local):", fileBuffer);
      fileBuffer = Buffer.from(await file.arrayBuffer());

      console.log("File Buffer (local):", fileBuffer);  // Debug log for file buffer
    } else {
      // Parse file with built-in handling (ensure file data is available in the request)
      const form = new URLSearchParams(await req.text());
      console.log("Form:", form);
      userMessage = form.get('userMessage');
      console.log("User Message:", userMessage);
      fileBuffer = Buffer.from(form.get('file'), 'base64');
      console.log("File Buffer (production):", fileBuffer);
      console.log("File Buffer (production):", fileBuffer);  // Debug log for file buffer
    }

    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'File buffer is null or empty.' },
        { status: 400 }
      );
    }

    // Extract content from the uploaded PDF
    const pdfData = await pdf(fileBuffer);
    console.log("PDF Data:", pdfData);
    const pdfText = pdfData.text;

    console.log("PDF Text:", pdfText);

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
    console.log("Response:", response);

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
