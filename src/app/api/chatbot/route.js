import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import pdf from 'pdf-extraction';
import formidable from 'formidable';

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
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return NextResponse.json({ error: 'Error in server processing.' }, { status: 500 });
    }

    const userMessage = fields.userMessage;
    const file = files.file;

    // Process the file and userMessage as needed
    // ...

    return NextResponse.json({ message: 'Success' });
  });
}
