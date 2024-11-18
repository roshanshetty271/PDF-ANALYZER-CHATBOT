//landing-page.tsx

import { motion } from 'framer-motion'
import { FileText, MessageCircle, Search } from 'lucide-react'

export default function LandingPage({ onStartChatting }: { onStartChatting: () => void }) {
  return (
    <div className="text-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl md:text-6xl font-bold mb-6"
      >
        PDF Analyzer Chatbot
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-xl md:text-2xl mb-8"
      >
        Upload PDFs, get summaries, and ask questions about the content.
      </motion.p>
      <motion.button
        onClick={onStartChatting}
        className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Start Chatting
      </motion.button>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: FileText, title: 'Upload PDF', description: 'Easily upload your PDF files' },
          { icon: Search, title: 'Analyze Content', description: 'Our AI analyzes the PDF content' },
          { icon: MessageCircle, title: 'Get Insights', description: 'Ask questions and get explanations' },
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + index * 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <feature.icon className="w-12 h-12 text-blue-600 mb-4 mx-auto" />
            <h2 className="text-xl font-semibold mb-2">{feature.title}</h2>
            <p>{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}