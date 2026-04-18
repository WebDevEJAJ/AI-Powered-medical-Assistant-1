/**
 * ClinicalTrials.gov API Service
 * Fetches clinical trial information
 */

import axios from 'axios';

const CLINICAL_TRIALS_BASE_URL = process.env.CLINICAL_TRIALS_API_URL || 'https://clinicaltrials.gov/api/v2/studies';

export const clinicalTrialsService = {
  /**
   * Search clinical trials
   */
  async search(query, options = {}) {
    const {
      limit = 50,
      status = null, // RECRUITING, NOT_YET_RECRUITING, ACTIVE_NOT_RECRUITING, etc.
      location = null,
    } = options;

    try {
      const params = {
        'query.term': query,
        pageSize: Math.min(limit, 100),
      };

      if (status) params.status = status;
      if (location) params.location_country = location;

      const response = await axios.get(CLINICAL_TRIALS_BASE_URL, { params });

      const trials = response.data?.studies || [];
      return this.formatResults(trials);
    } catch (error) {
      console.error('ClinicalTrials search error:', error.message);
      return [];
    }
  },

  /**
   * Format clinical trial results
   */
  formatResults(trials) {
    return trials.map(trial => this.formatTrial(trial));
  },

  /**
   * Format individual trial
   */
  formatTrial(trial) {
    const protocolSection = trial.protocolSection || {};
    const identificationModule = protocolSection.identificationModule || {};
    const statusModule = protocolSection.statusModule || {};
    const designModule = protocolSection.designModule || {};
    const armsInterventionsModule = protocolSection.armsInterventionsModule || {};
    const eligibilityModule = protocolSection.eligibilityModule || {};
    const contactsLocationsModule = protocolSection.contactsLocationsModule || {};

    return {
      id: identificationModule.nctId || '',
      title: identificationModule.officialTitle || identificationModule.briefTitle || '',
      platform: 'ClinicalTrials',
      url: `https://clinicaltrials.gov/study/${identificationModule.nctId}`,
      status: statusModule.overallStatus || 'UNKNOWN',
      condition: identificationModule.conditions || [],
      interventions: (armsInterventionsModule.interventions || [])
        .map(i => i.interventionName)
        .filter(Boolean),
      phase: designModule.phases || [],
      enrollment: statusModule.enrollmentInfo?.count || 0,
      startDate: statusModule.startDateStruct?.date || null,
      completionDate: statusModule.completionDateStruct?.date || null,
      
      eligibility: {
        criteria: eligibilityModule.eligibilityCriteria || '',
        gender: eligibilityModule.gender || 'ALL',
        minimumAge: eligibilityModule.minimumAge || null,
        maximumAge: eligibilityModule.maximumAge || null,
      },

      locations: (contactsLocationsModule.locations || [])
        .slice(0, 5)
        .map(loc => ({
          facility: loc.facility || '',
          city: loc.city || '',
          state: loc.state || '',
          country: loc.country || '',
        })),

      sponsors: identificationModule.sponsors || [],
      snippet: this.generateSnippet(trial),
      abstract: identificationModule.briefSummary || '',
    };
  },

  /**
   * Generate snippet from trial data
   */
  generateSnippet(trial) {
    const protocolSection = trial.protocolSection || {};
    const identificationModule = protocolSection.identificationModule || {};
    const briefSummary = identificationModule.briefSummary || '';
    
    return briefSummary.substring(0, 200) + (briefSummary.length > 200 ? '...' : '');
  },

  /**
   * Search by disease and location
   */
  async searchByDiseaseAndLocation(disease, location, options = {}) {
    const query = disease;
    return this.search(query, {
      ...options,
      location,
      status: 'RECRUITING',
    });
  },

  /**
   * Get trial details by NCT ID
   */
  async getTrialDetails(nctId) {
    try {
      const params = {
        'query.term': nctId,
        pageSize: 1,
      };

      const response = await axios.get(CLINICAL_TRIALS_BASE_URL, { params });
      const trials = response.data?.studies || [];
      
      if (trials.length === 0) return null;
      
      return this.formatTrial(trials[0]);
    } catch (error) {
      console.error('Error fetching trial details:', error.message);
      return null;
    }
  },
};

export default clinicalTrialsService;
