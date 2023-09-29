// adminRoutes.js

const express = require('express');
const router = express.Router();

// Import necessary controllers and middleware
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware'); // For authentication

// Define your admin routes
// These routes are protected and require authentication
router.use(authMiddleware); // Apply authentication middleware to all routes below

// Route to customize chatbot settings
router.put('/customize-chatbot', adminController.customizeChatbot);

// Route to upload and manage PDFs
router.post('/upload-pdf', adminController.uploadPDF);
router.get('/list-pdfs', adminController.listPDFs);
router.get('/get-pdf/:pdfId', adminController.getPDF);
router.delete('/delete-pdf/:pdfId', adminController.deletePDF);

// Route to set initial and ending chatbot messages
router.put('/set-chat-messages', adminController.setChatMessages);

// Route to specify a fallback to connect to human agents
router.put('/set-fallback', adminController.setFallback);

module.exports = router;
