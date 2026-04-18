/**
 * Query Parser Service
 * Extracts disease, intent, keywords, and context from user input
 */

const DISEASE_KEYWORDS = {
  'cancer': ['cancer', 'tumor', 'malignancy', 'carcinoma', 'lymphoma', 'leukemia'],
  'diabetes': ['diabetes', 'diabetic', 'hyperglycemia', 'glucose', 'insulin'],
  'heart disease': ['heart', 'cardiac', 'cardiovascular', 'arrhythmia', 'hypertension'],
  'stroke': ['stroke', 'cerebrovascular', 'thrombosis', 'hemorrhage'],
  'asthma': ['asthma', 'bronchial', 'respiratory', 'wheezing'],
  'copd': ['copd', 'emphysema', 'bronchitis', 'lung disease'],
  'alzheimers': ['alzheimer', 'dementia', 'cognitive decline', 'neurodegeneration'],
  'parkinsons': ['parkinson', 'tremor', 'rigidity', 'motor'],
  'depression': ['depression', 'depressive', 'mood disorder', 'major depression'],
  'anxiety': ['anxiety', 'panic', 'phobia', 'anxiety disorder'],
};

const INTENT_KEYWORDS = {
  'treatment': ['treatment', 'therapy', 'medicine', 'drug', 'medication', 'cure', 'manage', 'managing'],
  'diagnosis': ['diagnosis', 'diagnose', 'symptoms', 'signs', 'causes', 'why'],
  'research': ['research', 'study', 'trial', 'clinical trial', 'research study', 'breakthrough'],
  'information': ['what is', 'tell me', 'explain', 'information', 'about', 'how', 'prevention'],
  'prognosis': ['prognosis', 'outcome', 'survival', 'recovery', 'life expectancy'],
};

export const queryParserService = {
  /**
   * Parse user query and extract key information
   */
  parseQuery(query, userContext = {}) {
    const parsedQuery = {
      originalQuery: query,
      disease: null,
      intent: 'information',
      keywords: [],
      severity: 'moderate',
      location: userContext.location || null,
      context: {},
    };

    const lowerQuery = query.toLowerCase();

    // Extract disease
    for (const [disease, keywords] of Object.entries(DISEASE_KEYWORDS)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        parsedQuery.disease = disease;
        break;
      }
    }

    // Extract intent
    for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        parsedQuery.intent = intent;
        break;
      }
    }

    // Extract keywords
    parsedQuery.keywords = this.extractKeywords(query);

    // Detect severity indicators
    const severityKeywords = {
      urgent: ['urgent', 'emergency', 'critical', 'severe', 'serious'],
      moderate: [],
      mild: ['mild', 'slight', 'minor', 'light'],
    };

    for (const [level, keywords] of Object.entries(severityKeywords)) {
      if (keywords.some(keyword => lowerQuery.includes(keyword))) {
        parsedQuery.severity = level;
        break;
      }
    }

    return parsedQuery;
  },

  /**
   * Extract meaningful keywords from query
   */
  extractKeywords(query) {
    // Remove common words
    const stopwords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'what', 'which',
      'who', 'whom', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
      'more', 'some', 'such', 'no', 'nor', 'not', 'only', 'same', 'so',
      'than', 'too', 'very', 'just', 'me', 'my', 'myself', 'we', 'our',
    ]);

    const words = query.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopwords.has(word));

    // Remove duplicates and limit to 10 keywords
    return [...new Set(words)].slice(0, 10);
  },

  /**
   * Extract medical context from natural language
   */
  extractContext(query, userProfile = {}) {
    const context = {
      age: userProfile.age || null,
      gender: userProfile.gender || null,
      location: userProfile.location || null,
      medicalHistory: userProfile.medicalHistory || null,
      symptoms: [],
      medications: [],
      timeline: null,
    };

    const lowerQuery = query.toLowerCase();

    // Extract timeline (e.g., "for 2 weeks", "since 3 months")
    const timelineMatch = query.match(/(?:for|since|during|past)\s+(\d+)\s+(day|week|month|year)s?/i);
    if (timelineMatch) {
      context.timeline = `${timelineMatch[1]} ${timelineMatch[2]}s`;
    }

    return context;
  },

  /**
   * Validate query for medical relevance
   */
  validateQuery(query) {
    if (query.length < 3) {
      return { valid: false, error: 'Query too short' };
    }
    if (query.length > 1000) {
      return { valid: false, error: 'Query too long' };
    }
    return { valid: true };
  },
};

export default queryParserService;
