/**
 * Search Routes
 */

import express from 'express';
import { searchController } from '../controllers/searchController.js';

const router = express.Router();

// POST /api/search - Main search endpoint
router.post('/search', searchController.search);

// POST /api/chat - Chat with context
router.post('/chat', searchController.chat);

// GET /api/history/:sessionId/:userId - Get conversation history
router.get('/history/:sessionId/:userId', searchController.getConversationHistory);

export default router;
