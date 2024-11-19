import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
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
    console.log('Request received:', { method: req.method, url: req.url });

    const isLocal = process.env.NODE_ENV === 'development';
    console.log('Is Local Environment:', isLocal);

    let fileBuffer, userMessage;

    // if (isLocal) {
      // Handle FormData in local environment
      console.log('Parsing FormData locally...');
      const formData = await req.formData();
      const file = formData.get('file');
      userMessage = formData.get('userMessage');

      if (!file || !userMessage) {
        console.error('Missing file or user message in the request body.');
        return NextResponse.json(
          { error: 'Missing file or user message in the request body.' },
          { status: 400 }
        );
      }

      fileBuffer = Buffer.from(await file.arrayBuffer());
      console.log('File Buffer (Local):', fileBuffer);
    // } else {
    //   // Production environment: handle file and userMessage from the request body
    //   console.log('Parsing form data in production environment...');
    //   const form = new URLSearchParams(await req.text());
    //   console.log('Form Data:', form);

    //   userMessage = form.get('userMessage');
    //   const filePath = path.join(process.cwd(), 'uploads', 'uploadedFile.pdf');
    //   console.log('File Path:', filePath);

    //   if (fs.existsSync(filePath)) {
    //     fileBuffer = fs.readFileSync(filePath);
    //     console.log('File Buffer (Production):', fileBuffer);
    //   } else {
    //     console.error('File not found in the uploads directory on the server.');
    //     return NextResponse.json(
    //       { error: 'File not found on the server.' },
    //       { status: 404 }
    //     );
    //   }
    // }

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

    // Send request to OpenAI API
    console.log('Sending extracted text to OpenAI API...');
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
    console.log('OpenAI Response:', response);

    return NextResponse.json({
      pdfContent: pdfText,
      message: response.choices[0]?.message?.content || 'No response from AI.',
    });
  } catch (error) {
    console.error('Error processing the request:', error);

    // Check for specific error types
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response error:', error.response.status, error.response.data);
      return NextResponse.json(
        { error: `OpenAI API error: ${error.response.status}` },
        { status: error.response.status }
      );
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      return NextResponse.json(
        { error: 'No response from OpenAI API.' },
        { status: 504 }
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
      return NextResponse.json(
        { error: 'Error in server processing.' },
        { status: 500 }
      );
    }
  }
}
