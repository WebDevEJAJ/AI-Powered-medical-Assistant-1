import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter } from 'lucide-react';
import Header from '../components/Header';
import ResultCard from '../components/ResultCard';
import { ResultsLoading } from '../components/LoadingStates';
import userService from '../services/userService';

export const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  
  const user = userService.getStoredUser();
  const searchState = location.state?.searchResults;

  useEffect(() => {
    if (searchState) {
      setResults(searchState.results || []);
      setFilteredResults(searchState.results || []);
      setIsLoading(false);
    } else {
      // Redirect to dashboard if no search results
      navigate('/dashboard');
    }
  }, [searchState, navigate]);

  useEffect(() => {
    // Filter results
    let filtered = results;

    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(r => r.platform === selectedPlatform);
    }

    setFilteredResults(filtered);
  }, [selectedPlatform, results]);

  const handleLogout = () => {
    userService.clearUserData();
    navigate('/');
  };

  const platforms = ['all', ...new Set(results.map(r => r.platform))];

  return (
    <div className="min-h-screen bg-dark-900">
      <Header user={user} onLogout={handleLogout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </button>

          <h1 className="text-3xl font-bold text-white mb-2">Research Results</h1>
          <p className="text-dark-400">
            Found {results.length} relevant{' '}
            {results.length === 1 ? 'result' : 'results'}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <Filter className="w-5 h-5 text-dark-400" />
          <div className="flex gap-2 flex-wrap">
            {platforms.map(platform => (
              <button
                key={platform}
                onClick={() => setSelectedPlatform(platform)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPlatform === platform
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                }`}
              >
                {platform === 'all' ? 'All Sources' : platform}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <ResultsLoading />
        ) : (
          <div className="space-y-4">
            {filteredResults.length > 0 ? (
              filteredResults.map((result, index) => (
                <ResultCard key={index} result={result} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-dark-400 text-lg">
                  No results found for this filter
                </p>
              </div>
            )}
          </div>
        )}

        {/* AI Response Section */}
        {searchState?.aiResponse && (
          <div className="mt-12 card">
            <h2 className="text-2xl font-bold text-white mb-6">AI-Powered Insights</h2>

            <div className="space-y-6">
              {searchState.aiResponse.conditionOverview && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-300 mb-2">
                    Condition Overview
                  </h3>
                  <p className="text-dark-200 leading-relaxed">
                    {searchState.aiResponse.conditionOverview}
                  </p>
                </div>
              )}

              {searchState.aiResponse.researchInsights && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-300 mb-2">
                    Research Insights
                  </h3>
                  <p className="text-dark-200 leading-relaxed whitespace-pre-wrap">
                    {searchState.aiResponse.researchInsights}
                  </p>
                </div>
              )}

              {searchState.aiResponse.clinicalTrialsInfo && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-300 mb-2">
                    Clinical Trials
                  </h3>
                  <p className="text-dark-200 leading-relaxed">
                    {searchState.aiResponse.clinicalTrialsInfo}
                  </p>
                </div>
              )}

              {searchState.aiResponse.personalizedInsight && (
                <div>
                  <h3 className="text-lg font-semibold text-primary-300 mb-2">
                    Personalized Insight
                  </h3>
                  <p className="text-dark-200 leading-relaxed">
                    {searchState.aiResponse.personalizedInsight}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPage;
