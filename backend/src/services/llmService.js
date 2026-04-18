/**
 * LLM Service (Hugging Face Integration)
 * Generates grounded AI responses using retrieved sources
 */

import { HfInference } from '@huggingface/inference';

export const llmService = {
  /**
   * Helper to call Hugging Face Inference API
   */
  async callHuggingFaceAPI(prompt) {
    const hf = new HfInference(process.env.HF_API_KEY.trim());
    const modelId = process.env.HF_MODEL?.trim() || 'meta-llama/Meta-Llama-3-8B-Instruct';
    
    const response = await hf.chatCompletion({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1500,
      temperature: 0.3,
    });
    
    return response.choices[0]?.message?.content || '';
  },

  /**
   * Generate structured response based on research results
   */
  async generateResponse(query, results, context = {}) {
    try {
      // Format sources for the prompt
      const sourcesText = this.formatSources(results);

      // Build the prompt
      const prompt = this.buildPrompt(query, results, sourcesText, context);

      // Generate response via Hugging Face
      const responseText = await this.callHuggingFaceAPI(prompt);

      // Parse the structured response
      const structured = this.parseStructuredResponse(responseText, results);

      return structured;
    } catch (error) {
      console.error('LLM generation error:', error.response?.data || error.message);
      return this.generateFallbackResponse(query, results);
    }
  },

  /**
   * Build the prompt for Gemini
   */
  buildPrompt(query, results, sourcesText, context) {
    return `You are a medical research assistant. Based on the following research sources, provide a comprehensive answer to the user's query.

USER QUERY: ${query}

USER CONTEXT:
- Disease/Condition: ${context.disease || 'Not specified'}
- Intent: ${context.intent || 'general information'}
- Location: ${context.location || 'Not specified'}

RESEARCH SOURCES:
${sourcesText}

INSTRUCTIONS:
1. Provide a comprehensive answer grounded only in the provided sources
2. DO NOT make up or speculate beyond what the sources say
3. Cite sources for key claims
4. Structure your response with these sections:
   - Condition Overview: Brief explanation of the disease
   - Research Insights: Key findings from research
   - Clinical Trials Information: Relevant clinical trials
   - Key Recommendations: Based on the research
   - Personalized Insight: Any insights relevant to the user's context

5. Format each source citation as [Source X: Title - Year]
6. Be clear about what is not known or requires specialist consultation

Please provide a detailed, well-researched response:`;
  },

  /**
   * Format sources for inclusion in prompt
   */
  formatSources(results) {
    return results
      .slice(0, 10)
      .map((result, index) => `[Source ${index + 1}]
Title: ${result.title}
Authors: ${(result.authors || []).join(', ') || 'Unknown'}
Year: ${result.year}
Platform: ${result.platform}
Abstract/Summary: ${result.abstract || result.snippet || 'N/A'}
Citation: ${result.url}
---`)
      .join('\n\n');
  },

  /**
   * Parse structured response from Gemini
   */
  parseStructuredResponse(responseText, results) {
    const structured = {
      conditionOverview: this.extractSection(responseText, 'Condition Overview'),
      researchInsights: this.extractSection(responseText, 'Research Insights'),
      clinicalTrialsInfo: this.extractSection(responseText, 'Clinical Trials'),
      keyRecommendations: this.extractSection(responseText, 'Recommendations'),
      personalizedInsight: this.extractSection(responseText, 'Personalized'),
      fullResponse: responseText,
      sources: results,
    };

    return structured;
  },

  /**
   * Extract a section from response text
   */
  extractSection(text, sectionName) {
    const nameRegexStr = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Look for the section name, optionally wrapped in ** or #, optionally followed by :
    // Capture everything until the next line that starts with **[A-Z], #[A-Z], or [Source
    const regex = new RegExp(`(?:\\*\\*|#+)?\\s*${nameRegexStr}\\s*(?:\\*\\*|:)*\\s*([\\s\\S]*?)(?=\\n(?:\\s*\\*\\*\\s*[A-Z]|\\s*#+\\s*[A-Z]|\\[Source)|$)`, 'i');
    
    const match = text.match(regex);
    
    if (match && match[1]) {
      // Strip any lingering markdown artifacts (like asterisks or colons) from the ends
      let extracted = match[1].trim();
      extracted = extracted.replace(/^[\s:*]+|[\s:*]+$/g, '');
      return extracted.trim() || 'No information provided.';
    }

    // Fallback: return first 300 chars if section not found
    return text.substring(0, 300);
  },

  /**
   * Generate fallback response if LLM fails
   */
  generateFallbackResponse(query, results) {
    const topResults = results.slice(0, 5);
    
    return {
      conditionOverview: 'Unable to generate overview at this time.',
      researchInsights: topResults
        .map(r => `${r.title} (${r.year}) - ${r.platform}`)
        .join('; '),
      clinicalTrialsInfo: 'Clinical trial information from sources above.',
      personalizedInsight: 'Please consult with a healthcare professional for personalized medical advice.',
      fullResponse: 'Research results are available above. Please review the sources for detailed information.',
      sources: topResults,
    };
  },

  /**
   * Generate follow-up answer based on conversation context
   */
  async generateFollowUpResponse(followUpQuery, previousContext, results) {
    try {
      const prompt = `You are a medical research assistant continuing a conversation.

PREVIOUS CONTEXT:
Disease/Condition: ${previousContext.disease}
Previous Question: ${previousContext.previousQuery}
User Context: Age ${previousContext.age}, ${previousContext.gender}, from ${previousContext.location}

FOLLOW-UP QUESTION: ${followUpQuery}

RESEARCH SOURCES:
${this.formatSources(results)}

Provide a focused answer to the follow-up question, using the previous context to understand what the user is asking. Be specific and grounded in the provided sources.`;

      const responseText = await this.callHuggingFaceAPI(prompt);
      return responseText;
    } catch (error) {
      console.error('Follow-up generation error:', error.response?.data || error.message);
      return 'Unable to generate follow-up response. Please try again.';
    }
  },

  /**
   * Validate response credibility
   */
  validateResponseCredibility(response, results) {
    const issues = [];

    // Check if response cites sources
    const citationCount = (response.fullResponse.match(/\[Source/g) || []).length;
    if (citationCount === 0) {
      issues.push('Response does not cite any sources');
    }

    // Check if response is grounded
    const unsafePatterns = [
      'i think',
      'probably',
      'might',
      'could be',
      'in my opinion',
      'it seems',
    ];

    const hasSafeLanguage = unsafePatterns.some(pattern =>
      response.fullResponse.toLowerCase().includes(pattern)
    );

    if (hasSafeLanguage) {
      issues.push('Response contains speculative language');
    }

    return {
      credible: issues.length === 0,
      concerns: issues,
      citationCount,
    };
  },
};

export default llmService;
