# AI Cover Letter Generator 🚀

A modern, production-ready AI Software-as-a-Service (SaaS) application that dynamically generates personalized, professional cover letters. This project leverages the Google Gemini API for intelligent generation and `pdfjs-dist` for local, secure resume parsing.

**[View Live Demo]** *((https://coverletter1.vercel.app/))*

## ✨ Features

* **Intelligent Prompt Engineering:** Uses the Google Gemini API (Gemini 3.5 Flash) to generate highly contextual cover letters based on the user's target role, company, and skills.
* **Smart Resume Parsing (Phase 3):** Users can upload their PDF resume. The app extracts the text entirely on the client side using `pdf.js` and injects it into the LLM context payload for hyper-personalized output.
* **Instant Copy-to-Clipboard:** Cleanly formats the LLM output into HTML paragraphs with a 1-click clipboard utility.
* **Responsive UI/UX:** Styled completely with Tailwind CSS v4 for a polished, mobile-responsive layout, including graceful loading states and error handling for API rate limits.
* **Secure Architecture:** API keys are protected via Vite environment variables and abstracted from the public repository.

## 🛠️ Tech Stack

* **Frontend:** React.js, Vite
* **Styling:** Tailwind CSS (v4 Vite Plugin)
* **AI Provider:** Google Generative AI SDK (`@google/generative-ai`)
* **File Parsing:** PDF.js (`pdfjs-dist`)
* **Deployment:** Vercel

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
* Node.js (v18 or higher recommended)
* A free [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/ai-cover-letter.git](https://github.com/your-username/ai-cover-letter.git)
   cd ai-cover-letter
