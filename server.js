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
const processWithMistral = async (text) => {
  try {
    if (!MISTRAL_API_KEY) {
      throw new Error('Mistral API key is not configured');
    }

    const response = await axios.post(
      MISTRAL_API_URL,
      {
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content: `You are a CV parsing assistant. Extract and structure the following information from the CV text into a JSON format with the following structure:
            {
              "skills": ["skill1", "skill2", ...],
              "experiences": [
                {
                  "company": "company name",
                  "position": "job title",
                  "period": "time period",
                  "description": "job description"
                }
              ],
              "degrees": [
                {
                  "degree": "degree name",
                  "institution": "institution name",
                  "year": "graduation year",
                  "description": "additional details"
                }
              ]
            }
            
            Important: Respond ONLY with the JSON object, no additional text or explanation.`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      },
      {
        headers: {
          'Authorization': `Bearer ${MISTRAL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Mistral API Response:', response.data);

    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('Invalid response format from Mistral API');
    }

    const content = response.data.choices[0].message.content;
    
    // Try to parse the content directly first
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // If direct parsing fails, try to extract JSON from the content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No valid JSON found in Mistral response');
    }
  } catch (error) {
    console.error('Mistral API Error:', error.response?.data || error.message);
    throw new Error(`Mistral API Error: ${error.response?.data?.error?.message || error.message}`);
  }
};

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