import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import PdfUploader from './PdfUploader';

// Initialize Gemini (Ensure your API key is pulled from the Vite environment)
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    skills: '',
    resumeText: '' // For Phase 3
  });
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateCoverLetter = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // The Prompt Engineering Payload
      const prompt = `
        You are an expert career coach writing a professional cover letter.
        Candidate Name: ${formData.name}
        Target Role: ${formData.role}
        Target Company: ${formData.company}
        Key Skills: ${formData.skills}
        Resume Context: ${formData.resumeText ? formData.resumeText : 'N/A'}
        
        Write a compelling, modern cover letter. Ensure the tone is confident and professional.
        Format the output in clean HTML paragraphs (do not use markdown blocks or raw text).
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      setOutput(response.text());
    } catch (error) {
      console.error("API Error:", error);
      
      if (error.message.includes("503") || error.message.includes("high demand")) {
        setOutput("<p class='text-amber-600 font-medium'>Google's AI servers are currently experiencing high traffic. Please wait 30 seconds and click Generate again.</p>");
      } else {
        setOutput("<p class='text-red-600'>Error generating letter. Please verify your API connection.</p>");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    // Strips HTML tags for the clipboard
    const cleanText = output.replace(/<[^>]*>?/gm, '');
    navigator.clipboard.writeText(cleanText);
    alert("Copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6">AI Cover Letter Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Form */}
        <form onSubmit={generateCoverLetter} className="flex flex-col gap-4">
          <input name="name" placeholder="Your Name" onChange={handleInputChange} required className="p-2 border rounded" />
          <input name="role" placeholder="Target Job Role" onChange={handleInputChange} required className="p-2 border rounded" />
          <input name="company" placeholder="Target Company" onChange={handleInputChange} required className="p-2 border rounded" />
          <textarea name="skills" placeholder="Key Skills (comma separated)" onChange={handleInputChange} required className="p-2 border rounded h-24" />
          
          {/* Phase 3 Dropzone Placeholder */}
          <PdfUploader onTextExtracted={(text) => setFormData({...formData, resumeText: text})} />

          <button type="submit" disabled={isGenerating} className="bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:opacity-50">
            {isGenerating ? "Generating..." : "Generate Cover Letter"}
          </button>
        </form>

        {/* Output & UX Polish */}
        <div className="bg-gray-50 p-6 rounded border relative">
          <h2 className="text-xl font-semibold mb-4">Generated Output</h2>
          {output ? (
            <>
              <div dangerouslySetInnerHTML={{ __html: output }} className="prose mb-4" />
              <button onClick={copyToClipboard} className="absolute top-4 right-4 bg-gray-200 p-2 rounded text-sm hover:bg-gray-300">
                Copy
              </button>
            </>
          ) : (
            <p className="text-gray-400 italic">Your cover letter will appear here...</p>
          )}
        </div>
      </div>
    </div>
  );
}