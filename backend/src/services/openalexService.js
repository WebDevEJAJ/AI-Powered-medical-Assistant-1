/**
 * OpenAlex API Service
 * Fetches academic publications and research metadata
 */

import axios from 'axios';

const OPENLEX_BASE_URL = 'https://api.openalex.org/works';

export const openalexService = {
  /**
   * Search OpenAlex for publications
   */
  async search(query, options = {}) {
    const {
      limit = 50,
      minDate = null,
      sort = '-cited_by_count',
    } = options;

    try {
      const params = {
        search: query,
        per_page: Math.min(limit, 200),
        select: [
          'id',
          'title',
          'publication_year',
          'authorships',
          'cited_by_count',
          'open_access',
          'topics',
          'ids',
          'primary_location',
          'abstract_inverted_index',
        ].join(','),
      };

      const response = await axios.get(OPENLEX_BASE_URL, { params });

      const results = response.data?.results || [];
      return this.formatResults(results);
    } catch (error) {
      console.error('OpenAlex search error:', error.message);
      return [];
    }
  },

  /**
   * Format OpenAlex results
   */
  formatResults(results) {
    return results.map(work => ({
      id: work.id?.split('/').pop() || '',
      title: work.title || '',
      authors: this.extractAuthors(work),
      year: work.publication_year || new Date().getFullYear(),
      platform: 'OpenAlex',
      url: work.ids?.doi ? `https://doi.org/${work.ids.doi}` : work.id || '',
      doi: work.ids?.doi || null,
      abstract: work.abstract_inverted_index 
        ? this.reconstructAbstract(work.abstract_inverted_index)
        : '',
      snippet: this.getSnippet(work),
      citations: work.cited_by_count || 0,
      openAccess: work.open_access?.is_oa || false,
      concepts: (work.topics || []).slice(0, 5).map(c => c.display_name),
      metadata: {
        journal: work.primary_location?.source?.display_name || '',
        authorsCount: work.authorships?.length || 0,
      },
    }));
  },

  /**
   * Extract author names from OpenAlex work
   */
  extractAuthors(work) {
    if (!work.authorships) return [];
    return work.authorships
      .slice(0, 5)
      .map(a => a.author?.display_name || '')
      .filter(name => name);
  },

  /**
   * Reconstruct abstract from inverted index
   */
  reconstructAbstract(invertedIndex) {
    if (!invertedIndex) return '';
    
    const words = new Array(Math.max(...Object.values(invertedIndex).flat()) + 1);
    
    for (const [word, positions] of Object.entries(invertedIndex)) {
      positions.forEach(pos => {
        words[pos] = word;
      });
    }
    
    return words.filter(w => w).join(' ');
  },

  /**
   * Get snippet from abstract
   */
  getSnippet(work) {
    let snippet = '';
    
    if (work.abstract_inverted_index) {
      snippet = this.reconstructAbstract(work.abstract_inverted_index);
    }
    
    return snippet.substring(0, 200) + (snippet.length > 200 ? '...' : '');
  },

  /**
   * Search by disease and keywords
   */
  async searchByDisease(disease, keywords, options = {}) {
    const query = `${disease} ${keywords.join(' ')}`;
    return this.search(query, {
      ...options,
      sort: '-cited_by_count',
    });
  },
};

export default openalexService;
