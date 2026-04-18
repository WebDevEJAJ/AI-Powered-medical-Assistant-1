/**
 * User Routes
 */

import express from 'express';
import { userController } from '../controllers/userController.js';

const router = express.Router();

// POST /api/users/register - Register user
router.post('/register', userController.registerUser);

// GET /api/users/:userId/profile - Get user profile
router.get('/:userId/profile', userController.getUserProfile);

// PUT /api/users/:userId/preferences - Update preferences
router.put('/:userId/preferences', userController.updatePreferences);

// GET /api/users/:userId/sessions - Get user sessions
router.get('/:userId/sessions', userController.getUserSessions);

export default router;
