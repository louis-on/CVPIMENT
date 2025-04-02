require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Mistral API configuration
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Helper function to read PDF content
const readPDFContent = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error reading PDF:', error);
    throw new Error('Failed to read PDF file');
  }
};

// Helper function to process text with Mistral API
async function processWithMistral(text) {
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: "mistral-tiny",
        messages: [
          {
            role: "system",
            content: "You are a CV parsing assistant. Extract information from the CV text and return it in a structured JSON format with the following fields: personalInfo (firstName, lastName, jobTitle, synonymousTitles, interests), skills (array), experiences (array of objects with position, company, period, description), degrees (array of objects with degree, institution, year, description). IMPORTANT: Return ONLY valid JSON without any markdown formatting, additional text, or comments. Do not include trailing commas in arrays or objects."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Mistral API Error Response:', errorData);
      throw new Error(`Mistral API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Raw Mistral API Response:', data);

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response format from Mistral API');
    }

    let content = data.choices[0].message.content;
    console.log('Mistral API Content:', content);

    // Clean the content
    content = content
      // Remove markdown code blocks if present
      .replace(/```json\n?|\n?```/g, '')
      // Remove any text before the first {
      .replace(/^[^{]*({)/, '$1')
      // Remove any text after the last }
      .replace(/(})[^}]*$/, '$1')
      // Remove comments (both single-line and multi-line)
      .replace(/\/\/.*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove trailing commas in arrays
      .replace(/,(\s*])/g, '$1')
      // Remove trailing commas in objects
      .replace(/,(\s*})/g, '$1')
      // Remove any trailing commas before closing brackets
      .replace(/,(\s*[}\]])/g, '$1')
      // Remove empty lines
      .replace(/^\s*[\r\n]/gm, '')
      .trim();

    console.log('Cleaned JSON Content:', content);

    try {
      const parsedData = JSON.parse(content);
      console.log('Parsed JSON Data:', parsedData);
      return parsedData;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed to parse content:', content);
      
      // Return a default structure if parsing fails
      return {
        personalInfo: {
          firstName: "",
          lastName: "",
          jobTitle: "",
          synonymousTitles: [],
          interests: []
        },
        skills: [],
        experiences: [],
        degrees: []
      };
    }
  } catch (error) {
    console.error('Mistral API Error:', error);
    throw error;
  }
}

// Routes
app.post('/api/extract-cv', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the PDF content
    const pdfContent = await readPDFContent(req.file.path);

    // Process with Mistral API
    const extractedData = await processWithMistral(pdfContent);

    // Clean up the uploaded file
    fs.unlinkSync(req.file.path);

    res.json(extractedData);
  } catch (error) {
    console.error('Error processing CV:', error);
    res.status(500).json({ 
      error: 'Error processing CV',
      details: error.message
    });
  }
});

app.post('/api/generate-cv', async (req, res) => {
  try {
    const cvData = req.body;
    // Here we'll implement the PDF generation logic
    res.json({ message: 'CV generation endpoint' });
  } catch (error) {
    console.error('Error generating CV:', error);
    res.status(500).json({ error: 'Error generating CV' });
  }
});

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 