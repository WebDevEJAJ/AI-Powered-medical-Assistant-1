/**
 * PubMed API Service
 * Fetches medical publications from PubMed
 */

import axios from 'axios';

const PUBMED_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export const pubmedService = {
  /**
   * Search PubMed for publications
   */
  async search(query, options = {}) {
    const {
      limit = 50,
      minDate = null,
      maxDate = null,
      sort = 'relevance',
    } = options;

    try {
      // Search for article IDs
      const searchParams = {
        db: 'pubmed',
        term: query,
        retmode: 'json',
        retmax: limit,
        sort: sort === 'recent' ? 'pub_date' : 'relevance',
      };

      if (minDate) searchParams.mindate = minDate;
      if (maxDate) searchParams.maxdate = maxDate;

      const searchUrl = `${PUBMED_BASE_URL}/esearch.fcgi`;
      const searchResponse = await axios.get(searchUrl, { params: searchParams });

      const idList = searchResponse.data?.esearchresult?.idlist || [];
      
      if (idList.length === 0) {
        return [];
      }

      // Fetch full details for each article
      const articles = await this.fetchArticleDetails(idList.slice(0, limit));
      
      return articles;
    } catch (error) {
      console.error('PubMed search error:', error.message);
      return [];
    }
  },

  /**
   * Fetch detailed article information
   */
  async fetchArticleDetails(pmids) {
    try {
      if (pmids.length === 0) return [];

      const params = {
        db: 'pubmed',
        id: pmids.join(','),
        retmode: 'json',
      };

      const fetchUrl = `${PUBMED_BASE_URL}/esummary.fcgi`;
      const response = await axios.get(fetchUrl, { params });

      const articles = [];
      const data = response.data?.result;

      if (!data) return [];

      for (const pmid of pmids) {
        if (!data[pmid]) continue;

        const article = data[pmid];
        const {
          title = '',
          authors = [],
          pubdate = '',
          fulljournalname = '',
          uid = pmid,
        } = article;

        articles.push({
          id: uid,
          title: title,
          authors: authors.map(a => a.name || ''),
          year: this.extractYear(pubdate),
          journal: fulljournalname,
          platform: 'PubMed',
          url: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`,
          doi: this.extractDOI(article),
          abstract: article.abstract || '',
          keywords: article.keywords || [],
          citations: 0, // PubMed doesn't provide direct citation count in this API
        });
      }

      return articles;
    } catch (error) {
      console.error('Error fetching article details:', error.message);
      return [];
    }
  },

  /**
   * Extract year from publication date
   */
  extractYear(dateString) {
    if (!dateString) return new Date().getFullYear();
    const yearMatch = dateString.match(/(\d{4})/);
    return yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
  },

  /**
   * Extract DOI from article data
   */
  extractDOI(article) {
    if (article.doi) return article.doi;
    if (article.articleids) {
      const doiObj = article.articleids.find(id => id.idtype === 'doi');
      return doiObj?.value || null;
    }
    return null;
  },

  /**
   * Format articles for response
   */
  formatResults(articles) {
    return articles.map(article => ({
      id: article.id,
      title: article.title,
      authors: article.authors,
      year: article.year,
      platform: 'PubMed',
      url: article.url,
      abstract: article.abstract,
      snippet: article.abstract.substring(0, 200) + '...',
      metadata: {
        journal: article.journal,
        doi: article.doi,
        keywords: article.keywords,
      },
    }));
  },
};

export default pubmedService;
