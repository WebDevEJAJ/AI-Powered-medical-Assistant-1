/**
 * Ranking Service
 * Scores and ranks research results based on multiple criteria
 */

export const rankingService = {
  /**
   * Rank and filter results
   */
  rankResults(results, parsedQuery, options = {}) {
    const {
      maxResults = 8,
      weights = {},
    } = options;

    // Score each result
    const scoredResults = results.map(result => ({
      ...result,
      score: this.calculateScore(result, parsedQuery, weights),
    }));

    // Sort by score descending
    const ranked = scoredResults.sort((a, b) => b.score - a.score);

    // Return top results
    return {
      results: ranked.slice(0, maxResults),
      totalResults: results.length,
      rankedResults: ranked.length,
    };
  },

  /**
   * Calculate relevance score for a result
   */
  calculateScore(result, parsedQuery, weights = {}) {
    const {
      keywordWeight = 0.25,
      diseaseWeight = 0.25,
      recencyWeight = 0.15,
      citationWeight = 0.15,
      credibilityWeight = 0.10,
      locationWeight = 0.10,
    } = weights;

    const scores = {
      keyword: this.scoreKeywordRelevance(result, parsedQuery) * keywordWeight,
      disease: this.scoreDiseaseMatch(result, parsedQuery) * diseaseWeight,
      recency: this.scoreRecency(result) * recencyWeight,
      citation: this.scoreCitations(result) * citationWeight,
      credibility: this.scoreCredibility(result) * credibilityWeight,
      location: this.scoreLocationMatch(result, parsedQuery) * locationWeight,
    };

    result.rankings = scores;
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    return totalScore;
  },

  /**
   * Score keyword relevance (0-1)
   */
  scoreKeywordRelevance(result, parsedQuery) {
    const { keywords = [] } = parsedQuery;
    if (keywords.length === 0) return 0.5;

    const title = (result.title || '').toLowerCase();
    const abstract = (result.abstract || '').toLowerCase();
    const snippet = (result.snippet || '').toLowerCase();

    let matchCount = 0;
    for (const keyword of keywords) {
      if (title.includes(keyword.toLowerCase())) {
        matchCount += 2; // Title matches are weighted higher
      } else if (abstract.includes(keyword.toLowerCase())) {
        matchCount += 1;
      } else if (snippet.includes(keyword.toLowerCase())) {
        matchCount += 0.5;
      }
    }

    // Normalize to 0-1
    const score = Math.min(matchCount / (keywords.length * 2), 1);
    return score;
  },

  /**
   * Score disease match (0-1)
   */
  scoreDiseaseMatch(result, parsedQuery) {
    const { disease } = parsedQuery;
    if (!disease) return 0.5;

    const diseaseVariants = [disease, disease.toLowerCase(), disease.toUpperCase()];
    const title = result.title || '';
    const abstract = result.abstract || '';
    const conditions = result.condition ? result.condition.join(' ').toLowerCase() : '';

    let score = 0;
    
    for (const variant of diseaseVariants) {
      if (title.toLowerCase().includes(variant)) {
        score = Math.max(score, 0.9);
      } else if (conditions.includes(variant.toLowerCase())) {
        score = Math.max(score, 0.85);
      } else if (abstract.toLowerCase().includes(variant)) {
        score = Math.max(score, 0.6);
      }
    }

    return Math.min(score + 0.1, 1); // Base score of 0.1 for any result
  },

  /**
   * Score recency (0-1)
   * More recent = higher score
   */
  scoreRecency(result) {
    const year = result.year || new Date().getFullYear();
    const currentYear = new Date().getFullYear();
    const yearsDifference = currentYear - year;

    // Decay function: recent papers score higher
    if (yearsDifference <= 2) return 1.0;
    if (yearsDifference <= 5) return 0.9;
    if (yearsDifference <= 10) return 0.7;
    if (yearsDifference <= 20) return 0.5;
    return 0.3;
  },

  /**
   * Score based on citations (0-1)
   */
  scoreCitations(result) {
    const citations = result.citations || 0;

    // Logarithmic scoring to prevent high citation count from dominating
    if (citations === 0) return 0.5;
    if (citations < 10) return 0.6;
    if (citations < 50) return 0.7;
    if (citations < 100) return 0.8;
    if (citations < 500) return 0.9;
    return 1.0;
  },

  /**
   * Score source credibility (0-1)
   */
  scoreCredibility(result) {
    const platform = result.platform || 'other';
    
    const credibilityScores = {
      'PubMed': 0.95,
      'OpenAlex': 0.9,
      'ClinicalTrials': 0.95,
      'other': 0.5,
    };

    let score = credibilityScores[platform] || 0.5;

    // Peer-reviewed journals get higher score
    if (result.journal) {
      score = Math.min(score + 0.05, 1);
    }

    return score;
  },

  /**
   * Score location match (0-1)
   */
  scoreLocationMatch(result, parsedQuery) {
    const userLocation = parsedQuery.location;
    if (!userLocation) return 0.5;

    const resultLocation = result.locations?.[0]?.country || 
                          result.location || 
                          '';

    if (!resultLocation) return 0.3;

    const locationLower = resultLocation.toLowerCase();
    const userLocationLower = userLocation.toLowerCase();

    if (locationLower === userLocationLower) return 1.0;
    if (locationLower.includes(userLocationLower) || userLocationLower.includes(locationLower)) {
      return 0.8;
    }

    return 0.5;
  },

  /**
   * Filter results by criteria
   */
  filterResults(results, filters = {}) {
    const {
      minYear = null,
      maxYear = null,
      minCitations = null,
      platforms = null,
      openAccessOnly = false,
    } = filters;

    return results.filter(result => {
      if (minYear && result.year < minYear) return false;
      if (maxYear && result.year > maxYear) return false;
      if (minCitations && (result.citations || 0) < minCitations) return false;
      if (platforms && !platforms.includes(result.platform)) return false;
      if (openAccessOnly && !result.openAccess) return false;

      return true;
    });
  },

  /**
   * Deduplicate results by title
   */
  deduplicateResults(results) {
    const seen = new Set();
    const deduplicated = [];

    for (const result of results) {
      const titleLower = (result.title || '').toLowerCase().trim();
      
      if (!seen.has(titleLower)) {
        seen.add(titleLower);
        deduplicated.push(result);
      }
    }

    return deduplicated;
  },

  /**
   * Merge and normalize results from different sources
   */
  mergeResults(pubmedResults = [], openalexResults = [], clinicalTrialsResults = []) {
    // Combine all results
    const allResults = [
      ...pubmedResults,
      ...openalexResults,
      ...clinicalTrialsResults,
    ];

    // Deduplicate by title
    const deduplicated = this.deduplicateResults(allResults);

    return deduplicated;
  },
};

export default rankingService;
