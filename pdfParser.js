// pdfParser.js

const fs = require('fs');
const pdf = require('pdf-parse');

// Define the path to your PDF file
const pdfPath = 'path-to-your-pdf-file.pdf'; // Update with your PDF file's path

// Read the PDF file
const dataBuffer = fs.readFileSync(pdfPath);

// Convert the buffer to a string and parse the PDF
pdf(dataBuffer).then(data => {
  // Extracted text from the PDF
  const extractedText = data.text;

  // You can now process or display the extracted text
  console.log(extractedText);
}).catch(error => {
  console.error('Error:', error);
});
