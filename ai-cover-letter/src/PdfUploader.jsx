import * as pdfjsLib from 'pdfjs-dist';
// Set worker path to standard CDN to avoid Vite build configuration headaches
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default function PdfUploader({ onTextExtracted }) {
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const typedarray = new Uint8Array(event.target.result);
      
      try {
        // FIX: Wrap typedarray in an object with the 'data' key
        const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
        let fullText = "";
        
        // Loop through each page to extract text
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(" ");
          fullText += pageText + " ";
        }
        
        onTextExtracted(fullText);
      } catch (error) {
        console.error("Error reading PDF: ", error);
        alert("Failed to parse PDF. Please try a different file.");
      }
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-4 border-2 border-dashed border-gray-400 rounded bg-gray-50 text-center">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Resume (Optional PDF)
      </label>
      <input 
        type="file" 
        accept="application/pdf" 
        onChange={handleFileUpload} 
        className="text-sm text-gray-500"
      />
    </div>
  );
}