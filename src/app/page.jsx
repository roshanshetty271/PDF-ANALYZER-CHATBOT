//page.tsx

"use client";

import "dotenv/config";

import { useState } from "react";
import LandingPage from "./components/landing-page";
import ChatInterface from "./components/chat-interface";
import AboutSection from "./components/about-section";
import { FAQSection } from "./components/faq-section";
import ContactForm from "./components/contact-form";
import { motion } from "framer-motion"; // Import motion
import { ChevronDown } from "lucide-react"; // Import ChevronDown icon

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
    }
  };

  const handleStartChatting = () => {
    scrollToSection("chat");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 shadow-sm z-50">
        <nav className="container mx-auto px-4 py-4">
          <ul className="flex justify-center space-x-6">
            {["home", "chat", "about", "faq", "contact"].map((section) => (
              <li key={section}>
                <button
                  onClick={() => scrollToSection(section)}
                  className={`text-lg font-medium ${
                    activeSection === section
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="container mx-auto px-4 pt-20">
        <section id="home" className="min-h-screen flex items-center justify-center">
          <LandingPage onStartChatting={handleStartChatting} />
        </section>

        <section id="chat" className="min-h-screen py-20">
          <ChatInterface />
        </section>

        <section id="about" className="py-20">
          <AboutSection />
        </section>

        <section id="faq" className="py-20">
          <FAQSection />
        </section>

        <section id="contact" className="py-20">
          <ContactForm />
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 PDF Analyzer Chatbot. All rights reserved.</p>
        </div>
      </footer>

      <motion.button
        onClick={() => scrollToSection("home")}
        className="fixed bottom-8 right-8 bg-blue-600 text-white p-3 rounded-full shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <ChevronDown className="w-6 h-6 transform rotate-180" />
      </motion.button>
    </div>
  );
}
