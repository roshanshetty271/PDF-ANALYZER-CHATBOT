import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { OpenAI } from 'openai';
import { IncomingMessage } from 'http';
import { PassThrough } from 'stream';
import Busboy from 'busboy'; // Import busboy as a function
import pdfParse from 'pdf-parse';
import dotenv from 'dotenv';

dotenv.config();

// OpenAI API configuration
const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY, // Ensure this environment variable is correctly set
});

// Disable body parser to handle the file upload manually
export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to use busboy
  },
};

// Define type for the parsed object
interface Parsed {
  fields: Record<string, string>;
  files: Record<string, string>;
}

export async function POST(req) {
  try {
    const isLocal = process.env.NODE_ENV === 'development';
    let filePath = isLocal ? './uploaded-file.pdf' : '/tmp/uploaded-file.pdf'; // Local or serverless path
    let userMessage = '';

    if (isLocal) {
      // Local development mode (No Vercel file size limit)
      const formData = await req.formData();
      const file = formData.get('file');
      userMessage = formData.get('userMessage') || '';

      if (!file || !userMessage) {
        return NextResponse.json(
          { error: 'Missing file or user message in the request body.' },
          { status: 400 }
        );
      }

      // Save the file locally for processing
      const buffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));

    } else {
      // Vercel or production serverless environment (with busboy handling file upload)
      const busboy = Busboy({ headers: req.headers }); // Correct usage of busboy

      const parsed: Parsed = { fields: {}, files: {} };

      // Handle file upload and fields
      await new Promise((resolve, reject) => {
        busboy.on('field', (fieldname, val) => {
          parsed.fields[fieldname] = val;
        });

        busboy.on('file', (fieldname, file) => {
          const writeStream = fs.createWriteStream(filePath);
          file.pipe(writeStream);
          file.on('end', () => {
            parsed.files[fieldname] = filePath; // Store file path
          });
        });

        busboy.on('finish', resolve);
        busboy.on('error', reject);

        req.pipe(busboy);
      });

      userMessage = parsed.fields.userMessage || '';

      if (!parsed.files.file || !userMessage) {
        return NextResponse.json(
          { error: 'Missing file or user message in the request body.' },
          { status: 400 }
        );
      }
    }

    // Parse the uploaded PDF and extract text
    const { text } = await pdfParse(fs.readFileSync(filePath));

    // Send the extracted text and user message to OpenAI API for analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: userMessage },
        { role: 'system', content: `Extracted PDF content: ${text}` },
      ],
    });

    // Return extracted PDF content and AI analysis
    return NextResponse.json({
      pdfContent: text,
      message: response.choices[0]?.message?.content || 'No response from AI.',
    });
  } catch (error) {
    console.error('Error processing the request:', error);
    return NextResponse.json(
      { error: 'Error processing the request.' },
      { status: 500 }
    );
  }
}
