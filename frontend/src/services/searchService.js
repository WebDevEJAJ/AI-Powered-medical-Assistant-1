import apiClient from './api';

export const searchService = {
  /**
   * Search medical research
   */
  async search(query, userContext = {}) {
    try {
      const response = await apiClient.post('/search/search', {
        query,
        userContext,
      });
      return response.data.data;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  },

  /**
   * Send chat message with context
   */
  async chat(query, sessionId, userId) {
    try {
      const response = await apiClient.post('/search/chat', {
        query,
        sessionId,
        userId,
      });
      return response.data.data;
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  },

  /**
   * Get conversation history
   */
  async getConversationHistory(sessionId, userId) {
    try {
      const response = await apiClient.get(`/search/history/${sessionId}/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('History retrieval error:', error);
      throw error;
    }
  },

  /**
   * Format search query with user context
   */
  formatQuery(query, userContext = {}) {
    return {
      query,
      userContext,
    };
  },
};

export default searchService;
