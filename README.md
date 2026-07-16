# AI Skill Gap Checker

## Project Overview
The **AI Skill Gap Checker** is an intelligent web application designed to help recruiters and hiring managers quickly evaluate candidates. By comparing a candidate's Resume against a Job Description (JD), the application automatically extracts relevant skills, identifies matches and missing requirements, calculates a compatibility percentage, and provides a concise hiring verdict using AI.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, Tailwind CSS v4, Framer Motion, Lucide React
- **Backend**: Next.js API Routes (Serverless)
- **AI Model**: Google Gemini API (`gemini-flash-lite-latest` / Gemini 1.5+ Multimodal)
- **Styling**: Tailwind CSS with custom theming (Dark/Light mode)

## Installation
1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the required dependencies:
```bash
npm install
```

## Environment Variables
Create a `.env.local` file in the root of your project and add your API key. *(Note: While the original prompt suggested `OPENAI_API_KEY`, this project leverages Gemini for its native PDF handling capabilities)*.

```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

## Running the Application

Because this project is built with Next.js, both the frontend and backend run concurrently on the same development server.

### Frontend & Backend
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Features
- **AI Skill Extraction**: Intelligently parses raw text and PDF files to extract core competencies.
- **Skill Matching**: Compares the candidate's extracted skills directly against the Job Description.
- **Percentage Calculation**: Calculates an accurate compatibility score (0-100%) based on skill overlap and contextual relevance.
- **AI Verdict**: Provides a definitive hiring recommendation ("Qualified", "Almost There", "Not Yet") with bulleted reasoning.
- **Responsive UI**: A sleek, fully responsive interface featuring smooth micro-animations, glassmorphism, and seamless light/dark mode support.
- **PDF Export**: Allows users to save the generated analysis report as a high-quality PDF.

## Assumptions
- The Job Description is provided as plain text via the application interface.
- Resumes are provided either as raw text or uploaded as standard PDF documents.
- The Next.js API route operates strictly as the backend for the AI integration, keeping the API key securely on the server and avoiding client-side exposure.

## Trade-offs
1. **Google Gemini vs. OpenAI**: 
   - **Trade-off**: Chose Google Gemini API (`GEMINI_API_KEY`) over OpenAI.
   - **Reasoning**: Gemini inherently supports multimodal inputs, meaning we can pass raw PDF binary data directly to the AI model. This eliminates the need for unreliable, native Node.js PDF parsing libraries (like `pdf-parse` or `pdf2json`) which frequently cause build failures on modern deployment platforms (like Vercel) and Windows environments due to canvas binding dependencies.
2. **Native Print Dialog vs. Client-side PDF Generation**:
   - **Trade-off**: Used the browser's native `window.print()` combined with specific `@media print` CSS rules instead of a library like `html2pdf.js`.
   - **Reasoning**: Modern styling frameworks like Tailwind CSS v4 utilize advanced color spaces (such as `oklch()` and `oklab()`). Client-side canvas libraries (`html2canvas`) cannot parse these modern CSS functions, leading to crashes or stripped colors. Relying on the native browser print engine guarantees 100% visual fidelity, flawless text-selection in the resulting PDF, and significantly reduces the client-side JavaScript bundle size.
