const express = require('express');
const request = require('request'); // Use the 'request' module for making HTTP requests
const multer = require('multer');
const fs = require('fs');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 3030;;

// Set up multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Define your ChatPDF API key
const apiKey = process.env.apiKey; // Replace with your ChatPDF API key

app.use(express.json());
let uploadedPdfSourceId = null; // Initialize the variable

app.get('/', (req, res) => {
    res.send("Use /add-pdf to add pdf then /chat-with-pdf to chat")
})
 
// Route to handle PDF file upload and addition to ChatPDF
app.post('/add-pdf', upload.single('pdf'), (req, res) => {
    // Check if a file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Define the URL for adding a PDF via file upload
    const apiUrl = 'https://api.chatpdf.com/v1/sources/add-file';

    // Create a read stream for the uploaded file
    const fileStream = fs.createReadStream(req.file.path);

    // Set up the request options
    const options = {
        url: apiUrl,
        headers: {
            'x-api-key': apiKey,
        },
        formData: {
            file: fileStream,
        },
    };

    // Make the POST request to add the PDF
    request.post(options, (error, response, body) => {
        // Clean up the uploaded file
        fs.unlinkSync(req.file.path);

        if (error) {
            console.error('Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const responseData = JSON.parse(body);

        if (responseData.code === 'BAD_REQUEST') {
            console.error('ChatPDF Error:', responseData.message);
            return res.status(400).json({ error: responseData.message });
        }

        // Store the sourceId of the uploaded PDF for future use
        uploadedPdfSourceId = responseData.sourceId; // Assign the value here

        // Log the sourceId to the console for debugging
        console.log('Source ID:', uploadedPdfSourceId);

        // Successful response
        res.status(response.statusCode).json(responseData);
    });
});

// Route to handle chat interaction with the PDF
app.post('/chat-with-pdf', (req, res) => {
    const userMessage = req.body.message;

    if (!uploadedPdfSourceId) {
        return res.status(400).json({ error: 'No PDF uploaded yet' });
    }

    // Use the `sourceId` of the uploaded PDF
    const sourceId = uploadedPdfSourceId; // Access the variable here

    // Define the chat message
    const chatMessage = {
        sourceId,
        messages: [
            {
                role: 'user',
                content: userMessage,
            },
        ],
    };

    // Set up the request options for chatting with the PDF
    const chatOptions = {
        url: 'https://api.chatpdf.com/v1/chats/message',
        headers: {
            'x-api-key': apiKey, // Use your ChatPDF API key
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatMessage),
    };

    // Make the POST request to chat with the PDF
    request.post(chatOptions, (error, response, body) => {
        if (error) {
            console.error('ChatPDF Error:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const responseData = JSON.parse(body);

        if (responseData.code === 'BAD_REQUEST') {
            console.error('ChatPDF Error:', responseData.message);
            return res.status(400).json({ error: responseData.message });
        }

        // Successful response
        res.status(response.statusCode).json({ response: responseData.content });
    });
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
