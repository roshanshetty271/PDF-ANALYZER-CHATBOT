import { NextResponse } from 'next/server';
import fs from 'fs';
import { OpenAI } from 'openai';
import { IncomingMessage } from 'http';
import { PassThrough } from 'stream';
import Busboy from 'busboy';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY,
});

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to use busboy
  },
};

export async function POST(req) {
  try {
    const isLocal = process.env.NODE_ENV === 'development';

    let fileBuffer, userMessage;

    if (isLocal) {
      // Parse FormData for local environment
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
      // Use busboy for Vercel (production)
      const busboy = new Busboy({ headers: req.headers });
      const fileStream = new PassThrough();
      const parsed = {
        fields: {},
        files: {},
      };

      // Pipe request into Busboy
      req.pipe(busboy);

      // Parse the incoming request
      busboy.on('field', (fieldname, val) => {
        parsed.fields[fieldname] = val;
      });

      busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
        const fileBufferChunks = [];
        file.on('data', (chunk) => {
          fileBufferChunks.push(chunk);
        });

        file.on('end', () => {
          parsed.files[fieldname] = Buffer.concat(fileBufferChunks);
          fileStream.end(); // End file stream
        });
      });

      busboy.on('finish', () => {
        // Files and fields have been parsed
        userMessage = parsed.fields.userMessage;

        if (!parsed.files.file || !userMessage) {
          return NextResponse.json(
            { error: 'Missing file or user message in the request body.' },
            { status: 400 }
          );
        }

        fileBuffer = parsed.files.file;
      });

      busboy.on('error', (err) => {
        console.error('Error in Busboy:', err);
        return NextResponse.json(
          { error: 'Error in processing file upload.' },
          { status: 500 }
        );
      });
    }

    // Extract content from the uploaded PDF
    const pdf = require('pdf-extraction');
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
