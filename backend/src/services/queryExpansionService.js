/**
 * Query Expansion Service
 * Intelligently expands queries to improve retrieval
 */

export const queryExpansionService = {
  /**
   * Expand query with synonyms and related terms
   */
  expandQuery(parsedQuery) {
    const { disease, keywords, intent } = parsedQuery;
    
    const expansionTerms = [
      ...keywords,
      ...this.getSynonyms(disease),
      ...this.getIntentKeywords(intent),
      ...this.getDiseaseRelatedTerms(disease),
    ];

    // Deduplicate and limit
    const uniqueTerms = [...new Set(expansionTerms)]
      .filter(term => term && term.length > 2)
      .slice(0, 15);

    return {
      originalQuery: parsedQuery.originalQuery,
      expandedTerms: uniqueTerms,
      expandedQuery: uniqueTerms.join(' '),
      searchStrategies: this.generateSearchStrategies(parsedQuery),
    };
  },

  /**
   * Get synonyms for a disease
   */
  getSynonyms(disease) {
    if (!disease) return [];

    const synonymMap = {
      'cancer': ['malignancy', 'carcinoma', 'tumor', 'oncology', 'neoplasm'],
      'diabetes': ['hyperglycemia', 'glucose intolerance', 'diabetes mellitus', 'insulin resistance'],
      'heart disease': ['cardiovascular disease', 'cardiac disease', 'CHD', 'coronary disease'],
      'stroke': ['cerebrovascular accident', 'CVA', 'brain attack', 'ischemic stroke', 'hemorrhagic stroke'],
      'asthma': ['bronchial asthma', 'reactive airway disease', 'obstructive airway'],
      'copd': ['chronic obstructive pulmonary disease', 'emphysema', 'chronic bronchitis'],
      'alzheimers': ['Alzheimer disease', 'AD', 'dementia', 'neurodegenerative disease'],
      'parkinsons': ['Parkinson disease', 'PD', 'movement disorder', 'neurodegenerative'],
      'depression': ['major depressive disorder', 'MDD', 'depressive episode', 'mood disorder'],
      'anxiety': ['anxiety disorder', 'generalized anxiety', 'panic disorder'],
    };

    return synonymMap[disease] || [];
  },

  /**
   * Get keywords related to intent
   */
  getIntentKeywords(intent) {
    const intentKeywords = {
      'treatment': ['treatment options', 'therapy', 'management', 'medications', 'interventions'],
      'diagnosis': ['diagnosis', 'diagnostic criteria', 'screening', 'clinical presentation'],
      'research': ['research', 'clinical trials', 'studies', 'clinical study', 'randomized controlled trial'],
      'prognosis': ['prognosis', 'outcome', 'survival rate', 'mortality', 'complications'],
      'information': ['information', 'overview', 'facts', 'epidemiology', 'pathophysiology'],
    };

    return intentKeywords[intent] || [];
  },

  /**
   * Get disease-related terms for better retrieval
   */
  getDiseaseRelatedTerms(disease) {
    if (!disease) return [];

    const diseaseTerms = {
      'cancer': ['oncology', 'malignancy', 'chemotherapy', 'radiation', 'immunotherapy', 'surgery'],
      'diabetes': ['endocrinology', 'glucose control', 'insulin', 'blood sugar', 'diabetes management'],
      'heart disease': ['cardiology', 'cardiovascular', 'coronary', 'arrhythmia', 'heart failure'],
      'stroke': ['neuroradiology', 'neurology', 'thrombectomy', 'thrombolysis'],
      'asthma': ['pulmonology', 'bronchospasm', 'inhalers', 'asthma control'],
      'copd': ['pulmonology', 'emphysema', 'lung function', 'bronchodilators'],
      'alzheimers': ['neurology', 'cognitive decline', 'amyloid', 'tau protein'],
      'parkinsons': ['neurology', 'dopamine', 'motor symptoms', 'deep brain stimulation'],
      'depression': ['psychiatry', 'psychotherapy', 'antidepressants', 'mental health'],
      'anxiety': ['psychiatry', 'anxiety management', 'anxiolytics', 'cognitive therapy'],
    };

    return diseaseTerms[disease] || [];
  },

  /**
   * Generate multiple search strategies
   */
  generateSearchStrategies(parsedQuery) {
    const { disease, keywords, intent } = parsedQuery;
    
    const strategies = [];

    // Strategy 1: Disease + Intent
    if (disease && intent) {
      strategies.push({
        name: 'disease_intent',
        query: `${disease} ${intent}`,
        weight: 1.0,
      });
    }

    // Strategy 2: Keywords + Disease
    if (disease && keywords.length > 0) {
      strategies.push({
        name: 'keywords_disease',
        query: `${keywords.join(' ')} ${disease}`,
        weight: 0.9,
      });
    }

    // Strategy 3: Just keywords
    if (keywords.length > 0) {
      strategies.push({
        name: 'keywords_only',
        query: keywords.join(' '),
        weight: 0.7,
      });
    }

    // Strategy 4: Disease only (if disease exists)
    if (disease) {
      strategies.push({
        name: 'disease_only',
        query: disease,
        weight: 0.6,
      });
    }

    return strategies;
  },

  /**
   * Apply location-based expansion
   */
  expandWithLocation(expandedQuery, location) {
    if (!location) return expandedQuery;

    return {
      ...expandedQuery,
      expandedTerms: [...expandedQuery.expandedTerms, location],
      expandedQuery: `${expandedQuery.expandedQuery} ${location}`,
    };
  },
};

export default queryExpansionService;
