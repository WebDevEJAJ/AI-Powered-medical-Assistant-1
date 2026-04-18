/**
 * Response Formatter Service
 * Formats data for API responses
 */

export const responseFormatterService = {
  /**
   * Format successful response
   */
  success(data = null, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Format error response
   */
  error(message = 'Error', statusCode = 500, details = null) {
    return {
      success: false,
      statusCode,
      message,
      details,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Format search results
   */
  formatSearchResults(results, metadata = {}) {
    return {
      count: results.length,
      results: results.map(result => this.formatResult(result)),
      metadata: {
        totalResults: metadata.totalResults || results.length,
        searchTime: metadata.searchTime || null,
        sources: Array.from(new Set(results.map(r => r.platform))),
      },
    };
  },

  /**
   * Format individual result
   */
  formatResult(result) {
    return {
      id: result.id,
      title: result.title,
      authors: result.authors || [],
      year: result.year,
      platform: result.platform,
      url: result.url,
      abstract: result.abstract,
      snippet: result.snippet,
      citations: result.citations || 0,
      relevanceScore: result.score || null,
      rankings: result.rankings || null,
      metadata: {
        journal: result.journal || result.metadata?.journal,
        doi: result.doi || result.metadata?.doi,
        status: result.status, // for clinical trials
        locations: result.locations, // for clinical trials
        eligibility: result.eligibility, // for clinical trials
      },
    };
  },

  /**
   * Format conversation response
   */
  formatConversationResponse(message, sessionId = null) {
    return {
      messageId: message._id,
      sessionId: sessionId || message.sessionId,
      role: message.role,
      content: message.content,
      messageType: message.messageType,
      structuredResponse: message.structuredResponse || null,
      timestamp: message.createdAt,
    };
  },

  /**
   * Format session
   */
  formatSession(session) {
    return {
      sessionId: session.sessionId,
      title: session.title,
      context: session.context,
      messageCount: session.metadata.messageCount,
      createdAt: session.createdAt,
      lastActivity: session.metadata.lastActivity,
      isArchived: session.metadata.isArchived,
    };
  },

  /**
   * Format chat response with structured data
   */
  formatChatResponse(message, processingTime) {
    return {
      messageId: message._id,
      role: message.role,
      content: message.content,
      messageType: message.messageType,
      structuredData: {
        conditionOverview: message.structuredResponse?.conditionOverview,
        researchInsights: message.structuredResponse?.researchInsights,
        clinicalTrialsInfo: message.structuredResponse?.clinicalTrialsInfo,
        personalizedInsight: message.structuredResponse?.personalizedInsight,
        sources: message.structuredResponse?.sources?.map(s => ({
          id: s.id,
          title: s.title,
          authors: s.authors,
          year: s.year,
          platform: s.platform,
          url: s.url,
          snippet: s.snippet,
          relevanceScore: s.score,
        })),
      },
      metadata: {
        processingTime: `${processingTime}ms`,
        sourceCount: message.structuredResponse?.sources?.length || 0,
      },
      timestamp: message.createdAt,
    };
  },

  /**
   * Format user profile
   */
  formatUserProfile(user) {
    return {
      id: user._id,
      sessionId: user.sessionId,
      name: user.name,
      age: user.age,
      gender: user.gender,
      location: user.location,
      preferences: user.preferences,
      createdAt: user.createdAt,
    };
  },

  /**
   * Format error for specific HTTP status codes
   */
  formatHttpError(statusCode, message, details = null) {
    const errorMessages = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    };

    return {
      success: false,
      statusCode,
      message: message || errorMessages[statusCode] || 'Error',
      details,
      timestamp: new Date().toISOString(),
    };
  },
};

export default responseFormatterService;
