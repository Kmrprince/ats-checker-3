import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { Buffer } from 'buffer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb', // Set the file upload limit
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract fileData and fileType from the request body
    const { fileData, fileType } = req.body; 
    const buffer = Buffer.from(fileData, 'base64'); // Decode base64 data

    let text;
    if (fileType === 'application/pdf') {
      const pdfData = await pdfParse(buffer); // Parse PDF text content
      text = pdfData.text; // Assign text from PDF
    } else if (
      fileType === 'application/msword' || 
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value } = await mammoth.extractRawText({ buffer }); // Handle DOCX extracting
      text = value; // Assign text from DOCX
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    res.status(200).json({ text }); // Send back extracted text
  } catch (error) {
    console.error('Error during parsing:', error);
    res.status(500).json({ error: error.message || 'Failed to parse file' });
  }
}