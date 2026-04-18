/**
 * Memory Service
 * Manages conversation context and session memory
 */

import Session from '../models/Session.js';
import Message from '../models/Message.js';

export const memoryService = {
  /**
   * Create a new session
   */
  async createSession(userId, initialContext = {}) {
    try {
      const session = new Session({
        userId,
        sessionId: this.generateSessionId(),
        context: initialContext,
        messages: [],
      });

      await session.save();
      return session;
    } catch (error) {
      console.error('Error creating session:', error.message);
      throw error;
    }
  },

  /**
   * Get or create session
   */
  async getOrCreateSession(userId, sessionId = null) {
    try {
      if (sessionId) {
        const session = await Session.findOne({
          sessionId,
          userId,
        }).populate('messages');

        if (session) return session;
      }

      // Create new session if not found
      return await this.createSession(userId);
    } catch (error) {
      console.error('Error getting session:', error.message);
      throw error;
    }
  },

  /**
   * Add message to session
   */
  async addMessage(sessionId, userId, role, content, messageType = 'text', structuredResponse = null) {
    try {
      const session = await Session.findOne({ sessionId, userId });

      if (!session) {
        throw new Error('Session not found');
      }

      const message = new Message({
        sessionId: session._id,
        userId,
        role,
        content,
        messageType,
        structuredResponse,
      });

      await message.save();

      // Add to session
      session.messages.push(message._id);
      session.metadata.messageCount += 1;
      session.metadata.lastActivity = new Date();

      // Update title if this is the first user message
      if (role === 'user' && session.metadata.messageCount === 1) {
        session.title = content.substring(0, 50) + (content.length > 50 ? '...' : '');
      }

      await session.save();

      return message;
    } catch (error) {
      console.error('Error adding message:', error.message);
      throw error;
    }
  },

  /**
   * Get session context for follow-up queries
   */
  async getSessionContext(sessionId, userId) {
    try {
      const session = await Session.findOne({
        sessionId,
        userId,
      }).populate({
        path: 'messages',
        options: { sort: { createdAt: -1 }, limit: 5 },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      return {
        sessionId: session.sessionId,
        context: session.context,
        recentMessages: session.messages.reverse(),
        messageCount: session.metadata.messageCount,
      };
    } catch (error) {
      console.error('Error getting session context:', error.message);
      throw error;
    }
  },

  /**
   * Update session context
   */
  async updateSessionContext(sessionId, userId, contextUpdates) {
    try {
      const session = await Session.findOne({ sessionId, userId });

      if (!session) {
        throw new Error('Session not found');
      }

      // Merge context updates
      session.context = {
        ...session.context,
        ...contextUpdates,
      };

      await session.save();
      return session;
    } catch (error) {
      console.error('Error updating context:', error.message);
      throw error;
    }
  },

  /**
   * Get user sessions
   */
  async getUserSessions(userId, limit = 10) {
    try {
      const sessions = await Session.find({ userId, 'metadata.isArchived': false })
        .sort({ 'metadata.lastActivity': -1 })
        .limit(limit)
        .select('sessionId title context metadata createdAt');

      return sessions;
    } catch (error) {
      console.error('Error getting user sessions:', error.message);
      throw error;
    }
  },

  /**
   * Archive session
   */
  async archiveSession(sessionId, userId) {
    try {
      const session = await Session.findOne({ sessionId, userId });

      if (!session) {
        throw new Error('Session not found');
      }

      session.metadata.isArchived = true;
      await session.save();

      return session;
    } catch (error) {
      console.error('Error archiving session:', error.message);
      throw error;
    }
  },

  /**
   * Delete session
   */
  async deleteSession(sessionId, userId) {
    try {
      const session = await Session.findOne({ sessionId, userId });

      if (!session) {
        throw new Error('Session not found');
      }

      // Delete associated messages
      await Message.deleteMany({ sessionId: session._id });

      // Delete session
      await Session.deleteOne({ _id: session._id });

      return { message: 'Session deleted' };
    } catch (error) {
      console.error('Error deleting session:', error.message);
      throw error;
    }
  },

  /**
   * Merge context from multiple messages
   */
  async mergeContextFromMessages(sessionId, userId) {
    try {
      const session = await Session.findOne({ sessionId, userId }).populate('messages');

      if (!session) {
        throw new Error('Session not found');
      }

      // Extract disease and keywords from all user messages
      const allKeywords = new Set();
      let lastDisease = session.context.disease;

      for (const message of session.messages) {
        if (message.role === 'user' && message.metadata?.expandedQuery) {
          message.metadata.expandedQuery
            .split(' ')
            .forEach(word => {
              if (word.length > 2) allKeywords.add(word);
            });
        }
      }

      return {
        disease: lastDisease,
        keywords: Array.from(allKeywords),
        messageCount: session.metadata.messageCount,
      };
    } catch (error) {
      console.error('Error merging context:', error.message);
      throw error;
    }
  },

  /**
   * Generate unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
};

export default memoryService;
