# PDF Analyzer Chatbot

This is a PDF Analyzer Chatbot application built using [Next.js](https://nextjs.org), React, and OpenAI's API. The application allows users to upload PDF files, extract text from them, and interact with an AI to get summaries or ask questions about the content.

## Features

- **Upload PDFs**: Easily upload your PDF files for analysis.
- **Text Extraction**: Extracts text from PDF files using `pdf-extraction`.
- **AI Interaction**: Uses OpenAI's API to provide summaries and answer questions about the PDF content.
- **Real-time Streaming**: Streams AI responses for a seamless user experience.
- **Responsive Design**: Built with React and Tailwind CSS for a modern, responsive UI.

## Getting Started

### Prerequisites

- Node.js (>=16.0.0)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/pdf-analyzer-chatbot.git
   cd pdf-analyzer-chatbot
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   Create a `.env` file in the root directory and add your OpenAI API key:

   ```
   VITE_OPENAI_API_KEY=your_openai_api_key
   ```

### Running the Application

To start the development server, run:

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- **Frontend**: Built with React and Next.js, featuring components like `ChatInterface`, `LandingPage`, and more.
- **Backend**: API routes in Next.js handle file uploads and interaction with OpenAI's API.

### Key Files

- **API Route**: Handles PDF uploads and AI interaction.
  ```javascript:src/app/api/chatbot/route.js
  startLine: 1
  endLine: 115
  ```

- **Chat Interface**: Main component for user interaction.
  ```typescript:src/app/components/chat-interface.tsx
  startLine: 1
  endLine: 106
  ```

- **Styling**: CSS for the chat interface.
  ```css:src/app/components/chat-interface.module.css
  startLine: 1
  endLine: 64
  ```

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI](https://openai.com) for their powerful API.
- [Vercel](https://vercel.com) for hosting and deployment.
