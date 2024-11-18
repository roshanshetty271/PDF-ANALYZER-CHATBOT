//about-section.tsx

import { motion } from 'framer-motion'
import { FileText, Brain, MessageCircle } from 'lucide-react'

export default function AboutSection() {
  const steps: { icon: React.ElementType; title: string; description: string }[] = [
    { icon: FileText, title: 'Upload PDF', description: 'Start by uploading your PDF document to our secure platform.' },
    { icon: Brain, title: 'Analyze Content', description: 'Our advanced AI processes and understands the content of your PDF.' },
    {
      icon: MessageCircle,
      title: 'Get Summary & Ask Questions',
      description: 'Receive a concise summary and ask follow-up questions for deeper insights.',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md text-center"
          >
            <step.icon
              className="w-12 h-12 text-blue-600 mb-4 mx-auto"
              aria-label={`${step.title} Icon`}
            />
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-12">
        <h3 className="text-2xl font-bold mb-4">Our Technology</h3>
        <p className="text-gray-600 mb-4">
          Our PDF Analyzer Chatbot leverages cutting-edge natural language processing and machine learning algorithms to
          provide accurate and insightful analysis of your documents. By combining advanced text extraction techniques
          with state-of-the-art language models, we&apos;re able to understand context, identify key concepts, and generate
          human-like responses to your questions.
        </p>

        <p className="text-gray-600">
          The application is built using React and Next.js, ensuring a fast and responsive user experience. We utilize
          the Vercel AI SDK for seamless integration of AI capabilities, allowing us to provide real-time, interactive
          conversations about your PDF content.
        </p>
      </div>
    </div>
  )
}
