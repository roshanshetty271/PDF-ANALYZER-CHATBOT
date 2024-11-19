import React, { useState } from "react";
import styles from "./chat-interface.module.css";
import CustomMarkdown from "./custom-markdown/custom-markdown";

const ChatInterface = () => {
  const [userMessage, setUserMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  // Handle message input
  const handleMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserMessage(event.target.value);
  };

  // Send message and file to API
  const handleSendMessage = async () => {
    if (!file || !userMessage) {
      alert("Please upload a file and enter a message");
      return;
    }
    setLoading(true);
    setResponse('');

    try {
      const fileBuffer = await file.arrayBuffer();

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        body: JSON.stringify({ userMessage, fileBuffer }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setResponse((prev) => prev + result); // Update UI with partial results
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process the request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatInterfaceContainer}>
      <div className={styles.chatInputContainer}>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        <input
          type="text"
          placeholder="Ask about the PDF"
          value={userMessage}
          onChange={handleMessageChange}
          className={styles.messageInput}
        />
        <button
          disabled={loading}
          onClick={handleSendMessage}
          className={styles.sendButton}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>

      {response && (
        <div className={styles.responseContainer}>
          <h3>AI&apos;s Response:</h3>
          <CustomMarkdown content={response} />
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
