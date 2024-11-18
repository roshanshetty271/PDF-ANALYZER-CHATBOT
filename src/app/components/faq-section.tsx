//faq-section.tsx

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What types of PDFs work best with this analyzer?',
    answer:
      'Our PDF Analyzer works well with a wide range of documents, including academic papers, reports, articles, and books. It performs best with text-based PDFs that have clear structure and formatting.',
  },
  {
    question: 'Can it explain scientific or technical documents?',
    answer:
      'Yes, our AI is trained on a diverse range of topics and can provide explanations for scientific and technical content. However, for highly specialized or niche topics, it\'s always best to verify the information with domain experts.',
  },
  {
    question: 'How is my data handled and protected?',
    answer:
      'We take data privacy seriously. Your uploaded PDFs are processed securely and are not stored permanently. All data is encrypted in transit and at rest, and we adhere to strict data protection guidelines.',
  },
  {
    question: 'Is there a limit to the size or number of PDFs I can analyze?',
    answer:
      'There are some limitations based on our current infrastructure. Generally, we can handle PDFs up to 50MB in size, and you can analyze up to 5 PDFs per day with a free account. Premium accounts have higher limits.',
  },
  {
    question: 'How accurate are the summaries and explanations?',
    answer:
      'Our AI strives for high accuracy, but as with any AI system, it\'s not perfect. The summaries and explanations are generally very good, but we always recommend cross-referencing important information, especially for critical decisions or academic work.',
  },
]

export const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <button
              onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              className="flex justify-between items-center w-full p-4 text-left"
            >
              <span className="font-semibold">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${activeIndex === index ? 'transform rotate-180' : ''}`}
              />
            </button>
            <AnimatePresence>
              {activeIndex === index && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-4 pb-4"
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default FAQSection
