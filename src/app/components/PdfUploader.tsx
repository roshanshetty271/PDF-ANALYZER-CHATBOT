import { useState } from "react";

const PdfUploader = ({ onTextExtracted }: { onTextExtracted: (text: string) => void }) => {
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("https://chatbot-pdf.vercel.app/api/chatbot", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to process PDF");
        }

        const data = await response.json();
        if (data.text) {
          onTextExtracted(data.text);
        } else if (data.error) {
          alert(`Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Error extracting text from PDF:", error);
        alert("Failed to process the PDF file.");
      }
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
    </div>
  );
};

export default PdfUploader;
