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
    setResponse(""); // Clear previous responses

    // Create form data to send both file and message
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userMessage", userMessage);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        alert("Error while communicating with the server");
        return;
      }

      // Read the streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          result += chunk;
          setResponse((prev) => prev + chunk); // Update response incrementally
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong while sending the request.");
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
