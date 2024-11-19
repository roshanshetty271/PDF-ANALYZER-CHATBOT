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

    let filePath = '/tmp/uploaded-file.pdf';  // Temporary file storage location
    let userMessage;

    if (isLocal) {
      // Local file handling (works without Vercel limits)
      const formData = await req.formData();
      const file = formData.get('file');
      userMessage = formData.get('userMessage');

      if (!file || !userMessage) {
        return NextResponse.json(
          { error: 'Missing file or user message in the request body.' },
          { status: 400 }
        );
      }

      // Save the file locally in the temporary directory for processing
      const buffer = await file.arrayBuffer();
      fs.writeFileSync(filePath, Buffer.from(buffer));
    } else {
      // Vercel's serverless function file upload handling using Busboy
      const busboy = new Busboy({ headers: req.headers });
      const fileStream = new PassThrough();
      const parsed = { fields: {}, files: {} };

      // Pipe the incoming file to the temporary storage location
      await new Promise((resolve, reject) => {
        busboy.on('field', (fieldname, val) => {
          parsed.fields[fieldname] = val;
        });

        busboy.on('file', (fieldname, file, filename) => {
          const writeStream = fs.createWriteStream(filePath);
          file.pipe(writeStream);
          file.on('end', () => {
            parsed.files[fieldname] = filePath; // Store the file path for later use
          });
        });

        busboy.on('finish', resolve);
        busboy.on('error', reject);

        req.pipe(busboy);
      });

      userMessage = parsed.fields.userMessage;

      if (!parsed.files.file || !userMessage) {
        return NextResponse.json(
          { error: 'Missing file or user message in the request body.' },
          { status: 400 }
        );
      }
    }

    // Process the PDF (make sure to use an efficient library like pdf-parse)
    const { text } = await pdfParse(fs.readFileSync(filePath)); // pdfParse example, or use other extraction libs

    // Send to OpenAI API for analysis
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a helpful assistant...' },
        { role: 'user', content: userMessage },
        { role: 'system', content: `Extracted PDF: ${text}` },
      ],
    });

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
