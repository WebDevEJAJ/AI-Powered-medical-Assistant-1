/**
 * User Controller
 * Handles user registration and profile management
 */

import User from '../models/User.js';
import { memoryService } from '../services/memoryService.js';
import { responseFormatterService } from '../services/responseFormatterService.js';

export const userController = {
  /**
   * Register or update user
   */
  async registerUser(req, res) {
    try {
      const { name, age, gender, location, medicalHistory = '' } = req.body;

      if (!name || !age || !gender || !location) {
        return res.status(400).json(
          responseFormatterService.error(
            'Name, age, gender, and location are required',
            400
          )
        );
      }

      // Generate session ID
      const sessionId = memoryService.generateSessionId();

      // Create or find user
      let user = await User.findOne({ name, age, location });

      if (!user) {
        user = new User({
          sessionId,
          name,
          age,
          gender,
          location,
          medicalHistory,
        });
        await user.save();
      }

      // Create session for the user
      const session = await memoryService.createSession(user._id, {
        disease: null,
        keywords: [],
        intent: 'information',
        location,
      });

      return res.json(
        responseFormatterService.success(
          {
            user: responseFormatterService.formatUserProfile(user),
            sessionId: session.sessionId,
          },
          'User registered successfully'
        )
      );
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json(
        responseFormatterService.error(
          'Registration failed',
          500,
          error.message
        )
      );
    }
  },

  /**
   * Get user profile
   */
  async getUserProfile(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json(
          responseFormatterService.error('User not found', 404)
        );
      }

      return res.json(
        responseFormatterService.success(
          responseFormatterService.formatUserProfile(user),
          'Profile retrieved successfully'
        )
      );
    } catch (error) {
      console.error('Profile retrieval error:', error);
      return res.status(500).json(
        responseFormatterService.error(
          'Failed to retrieve profile',
          500,
          error.message
        )
      );
    }
  },

  /**
   * Update user preferences
   */
  async updatePreferences(req, res) {
    try {
      const { userId } = req.params;
      const { theme, language, resultsPerPage } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json(
          responseFormatterService.error('User not found', 404)
        );
      }

      if (theme) user.preferences.theme = theme;
      if (language) user.preferences.language = language;
      if (resultsPerPage) user.preferences.resultsPerPage = resultsPerPage;

      await user.save();

      return res.json(
        responseFormatterService.success(
          responseFormatterService.formatUserProfile(user),
          'Preferences updated successfully'
        )
      );
    } catch (error) {
      console.error('Update preferences error:', error);
      return res.status(500).json(
        responseFormatterService.error(
          'Failed to update preferences',
          500,
          error.message
        )
      );
    }
  },

  /**
   * Get user sessions
   */
  async getUserSessions(req, res) {
    try {
      const { userId } = req.params;

      const sessions = await memoryService.getUserSessions(userId);

      return res.json(
        responseFormatterService.success(
          sessions.map(s => responseFormatterService.formatSession(s)),
          'Sessions retrieved successfully'
        )
      );
    } catch (error) {
      console.error('Get sessions error:', error);
      return res.status(500).json(
        responseFormatterService.error(
          'Failed to retrieve sessions',
          500,
          error.message
        )
      );
    }
  },
};

export default userController;
