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
    console.log('Function invoked, body length:', event.body.length);
    const { fileData, fileType } = JSON.parse(event.body);

    if (!fileData || !fileType) {
      console.log('Missing fileData or fileType');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing file data or type' }),
      };
    }

    const buffer = Buffer.from(fileData, 'base64');
    console.log('Buffer created, length:', buffer.length);

    let text = '';
    if (fileType === 'application/pdf') {
      console.log('Parsing PDF');
      const pdfData = await pdfParse(buffer);
      text = pdfData.text.trim();
      console.log('PDF text extracted, length:', text.length);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      console.log('Parsing DOCX');
      const docxData = await mammoth.extractRawText({ buffer });
      text = docxData.value.trim();
      console.log('DOCX text extracted, length:', text.length);
    } else {
      console.log('Unsupported file type:', fileType);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Unsupported file type' }),
      };
    }

    if (!text) {
      console.log('No text extracted');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Failed to parse resume: No text extracted' }),
      };
    }

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