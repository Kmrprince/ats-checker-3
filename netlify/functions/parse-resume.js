const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    console.log('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { fileData, fileType } = JSON.parse(event.body);

    if (!fileData || !fileType) {
      console.log('Missing file data or type:', { fileData, fileType });
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing file data or type' }),
      };
    }

    const buffer = Buffer.from(fileData, 'base64');

    let text = '';
    if (fileType === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      console.log('Unsupported file type:', fileType);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Unsupported file type' }),
      };
    }

    if (!text.trim()) {
      console.log('No text extracted from file');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No text extracted from file' }),
      };
    }

    console.log('Text extracted successfully, length:', text.length);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: text }),
    };
  } catch (error) {
    console.error('Function error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Function failed: ${error.message}` }),
    };
  }
};