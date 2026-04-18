import apiClient from './api';

export const userService = {
  /**
   * Register user
   */
  async registerUser(userData) {
    try {
      const response = await apiClient.post('/users/register', userData);
      const { user, sessionId } = response.data.data;

      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('userId', user.id);

      return { user, sessionId };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/profile`);
      return response.data.data;
    } catch (error) {
      console.error('Profile retrieval error:', error);
      throw error;
    }
  },

  /**
   * Update preferences
   */
  async updatePreferences(userId, preferences) {
    try {
      const response = await apiClient.put(`/users/${userId}/preferences`, preferences);
      return response.data.data;
    } catch (error) {
      console.error('Update preferences error:', error);
      throw error;
    }
  },

  /**
   * Get user sessions
   */
  async getUserSessions(userId) {
    try {
      const response = await apiClient.get(`/users/${userId}/sessions`);
      return response.data.data;
    } catch (error) {
      console.error('Get sessions error:', error);
      throw error;
    }
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Clear user data
   */
  clearUserData() {
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userId');
  },
};

export default userService;
