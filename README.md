# CV Extraction Platform with Mistral

A modern web application that allows users to upload their CVs in PDF format, extract information using Mistral's OCR capabilities, and generate a new formatted CV.

## Features

- PDF CV upload with drag & drop interface
- Intelligent data extraction using Mistral OCR
- Structured editing interface for extracted data
- PDF generation and download
- Modern, responsive UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Mistral API key

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd cv-extraction-platform
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory and add your Mistral API key:
```
PORT=5000
MISTRAL_API_KEY=your_mistral_api_key_here
```

## Running the Application

1. Start the backend server:
```bash
npm run dev
```

2. In a new terminal, start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Usage

1. Open the application in your browser
2. Drag and drop your PDF CV or click to upload
3. Wait for the extraction process to complete
4. Review and edit the extracted information
5. Generate and download your new CV

## Technologies Used

- Frontend:
  - React
  - Tailwind CSS
  - Headless UI
  - React Dropzone

- Backend:
  - Node.js
  - Express
  - Mistral API
  - Multer (for file uploads)

## License

MIT 