import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { Buffer } from 'buffer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileData, fileType } = req.body;
    const buffer = Buffer.from(fileData, 'base64');

    let text;
    if (fileType === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value } = await mammoth.extractRawText({ buffer });
      text = value;
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    res.status(200).json({ text });
  } catch (error) {
    console.error('Error during parsing:', error);
    res.status(500).json({ error: error.message || 'Failed to parse file' });
  }
}