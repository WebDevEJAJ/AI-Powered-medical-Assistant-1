/**
 * Search Controller
 * Handles medical research queries and search operations
 */

import { queryParserService } from '../services/queryParserService.js';
import { queryExpansionService } from '../services/queryExpansionService.js';
import { pubmedService } from '../services/pubmedService.js';
import { openalexService } from '../services/openalexService.js';
import { clinicalTrialsService } from '../services/clinicalTrialsService.js';
import { rankingService } from '../services/rankingService.js';
import { llmService } from '../services/llmService.js';
import { memoryService } from '../services/memoryService.js';
import { responseFormatterService } from '../services/responseFormatterService.js';
import User from '../models/User.js';

export const searchController = {
  /**
   * Main search endpoint - handles full pipeline
   */
  async search(req, res) {
    const startTime = Date.now();

    try {
      const { query, sessionId, userContext = {} } = req.body;

      // Validate input
      if (!query) {
        return res.status(400).json(
          responseFormatterService.error('Query is required', 400)
        );
      }

      const validation = queryParserService.validateQuery(query);
      if (!validation.valid) {
        return res.status(400).json(
          responseFormatterService.error(validation.error, 400)
        );
      }

      // Parse query
      const parsedQuery = queryParserService.parseQuery(query, userContext);

      // Expand query
      const expandedQuery = queryExpansionService.expandQuery(parsedQuery);

      // Use a concise search query for APIs (the full expanded query is too long and causes 400 errors)
      const apiSearchQuery = parsedQuery.disease
        ? `${parsedQuery.disease} ${parsedQuery.keywords.slice(0, 3).join(' ')}`.trim()
        : query;

      // Fetch from multiple APIs in parallel
      const [pubmedResults, openalexResults, clinicalTrialsResults] = await Promise.all([
        pubmedService.search(apiSearchQuery, { limit: 50 }),
        openalexService.search(apiSearchQuery, { limit: 50 }),
        clinicalTrialsService.search(apiSearchQuery, { limit: 30 }),
      ]);

      // Debug logging
      console.log('[SEARCH] Query:', expandedQuery.expandedQuery);
      console.log('[SEARCH] PubMed results:', pubmedResults.length);
      console.log('[SEARCH] OpenAlex results:', openalexResults.length);
      console.log('[SEARCH] ClinicalTrials results:', clinicalTrialsResults.length);

      // Merge and deduplicate results
      const mergedResults = rankingService.mergeResults(
        pubmedResults,
        openalexResults,
        clinicalTrialsResults
      );

      // Rank and filter
      const rankedResults = rankingService.rankResults(mergedResults, parsedQuery, {
        maxResults: 8,
      });

      // Generate AI response using Gemini
      const aiResponse = await llmService.generateResponse(
        query,
        rankedResults.results,
        parsedQuery
      );

      const processingTime = Date.now() - startTime;

      return res.json(
        responseFormatterService.success(
          {
            query,
            parsedQuery,
            expandedQuery: expandedQuery.expandedTerms,
            results: rankedResults.results,
            aiResponse,
            metadata: {
              processingTime,
              totalSourcesSearched: mergedResults.length,
              resultsReturned: rankedResults.results.length,
            },
          },
          'Search completed successfully'
        )
      );
    } catch (error) {
      console.error('Search error:', error);
      return res.status(500).json(
        responseFormatterService.error(
          'Search failed',
          500,
          error.message
        )
      );
    }
  },

  /**
   * Chat endpoint - handles conversation with context
   */
  async chat(req, res) {
    const startTime = Date.now();

    try {
      const { query, sessionId, userId } = req.body;

      if (!query || !userId) {
        return res.status(400).json(
          responseFormatterService.error('Query and userId are required', 400)
        );
      }

      // Get or create session
      const session = await memoryService.getOrCreateSession(userId, sessionId);

      // Get session context
      const sessionContext = await memoryService.getSessionContext(
        session.sessionId,
        userId
      );

      // Get user profile
      const user = await User.findOne({ _id: userId });

      // Parse query with context
      const userContext = {
        location: user?.location,
        age: user?.age,
        gender: user?.gender,
      };

      const parsedQuery = queryParserService.parseQuery(query, userContext);

      // Merge with session context
      if (sessionContext.context.disease) {
        parsedQuery.disease = sessionContext.context.disease;
      }

      // Expand query
      const expandedQuery = queryExpansionService.expandQuery(parsedQuery);

      // Use a concise search query for APIs
      const apiSearchQuery = parsedQuery.disease
        ? `${parsedQuery.disease} ${parsedQuery.keywords.slice(0, 3).join(' ')}`.trim()
        : query;

      // Fetch from APIs
      const [pubmedResults, openalexResults, clinicalTrialsResults] = await Promise.all([
        pubmedService.search(apiSearchQuery, { limit: 50 }),
        openalexService.search(apiSearchQuery, { limit: 50 }),
        clinicalTrialsService.search(apiSearchQuery, { limit: 30 }),
      ]);

      const mergedResults = rankingService.mergeResults(
        pubmedResults,
        openalexResults,
        clinicalTrialsResults
      );

      const rankedResults = rankingService.rankResults(mergedResults, parsedQuery, {
        maxResults: 8,
      });

      // Generate AI response
      const aiResponse = await llmService.generateResponse(
        query,
        rankedResults.results,
        parsedQuery
      );

      // Save messages to session
      const userMessage = await memoryService.addMessage(
        session.sessionId,
        userId,
        'user',
        query,
        'text'
      );

      const assistantMessage = await memoryService.addMessage(
        session.sessionId,
        userId,
        'assistant',
        aiResponse.fullResponse,
        'structured_response',
        {
          conditionOverview: aiResponse.conditionOverview,
          researchInsights: aiResponse.researchInsights,
          clinicalTrialsInfo: aiResponse.clinicalTrialsInfo,
          personalizedInsight: aiResponse.personalizedInsight,
          sources: rankedResults.results,
        }
      );

      // Update session context
      await memoryService.updateSessionContext(
        session.sessionId,
        userId,
        {
          disease: parsedQuery.disease || sessionContext.context.disease,
          keywords: parsedQuery.keywords,
          intent: parsedQuery.intent,
        }
      );

      const processingTime = Date.now() - startTime;

      return res.json(
        responseFormatterService.success(
          {
            sessionId: session.sessionId,
            message: responseFormatterService.formatChatResponse(
              assistantMessage,
              processingTime
            ),
          },
          'Response generated successfully'
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      return res.status(500).json(
        responseFormatterService.error('Chat failed', 500, error.message)
      );
    }
  },

  /**
   * Get conversation history
   */
  async getConversationHistory(req, res) {
    try {
      const { sessionId, userId } = req.params;

      const sessionContext = await memoryService.getSessionContext(sessionId, userId);

      return res.json(
        responseFormatterService.success(
          {
            sessionId,
            messages: sessionContext.recentMessages.map(msg =>
              responseFormatterService.formatConversationResponse(msg, sessionId)
            ),
            context: sessionContext.context,
          },
          'History retrieved successfully'
        )
      );
    } catch (error) {
      console.error('History retrieval error:', error);
      return res.status(500).json(
        responseFormatterService.error(
          'Failed to retrieve history',
          500,
          error.message
        )
      );
    }
  },
};

export default searchController;
