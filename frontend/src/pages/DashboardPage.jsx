import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, Brain, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { ErrorMessage } from '../components/AlertMessages';
import searchService from '../services/searchService';
import userService from '../services/userService';

// AI Loading Messages
const AI_MESSAGES = [
  'Scanning PubMed for recent publications…',
  'Querying OpenAlex for academic metadata…',
  'Fetching active clinical trials…',
  'Analyzing 120+ research papers…',
  'Ranking results by relevance & citations…',
  'Generating AI-powered insights with LLaMA 3…',
];

const AILoader = () => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % AI_MESSAGES.length);
    }, 2500);
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 1, 95));
    }, 200);
    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto py-16 flex flex-col items-center"
    >
      {/* Pulsing Brain */}
      <div className="relative mb-8">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-400/30 absolute inset-0 blur-xl"
        />
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30 relative">
          <Brain className="w-10 h-10 text-white animate-pulse" />
        </div>
      </div>

      {/* Status Text */}
      <motion.p
        key={msgIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="text-lg font-medium text-white mb-2 text-center"
      >
        {AI_MESSAGES[msgIndex]}
      </motion.p>
      <p className="text-sm text-gray-500 mb-8">Please wait, this may take 10–20 seconds</p>

      {/* Progress Bar */}
      <div className="w-full max-w-sm h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-xs text-gray-600 mt-3">{progress}% complete</p>
    </motion.div>
  );
};

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentQueries] = useState([
    'Lung cancer treatment options',
    'Type 2 diabetes management',
    'COVID-19 long-term effects',
    "Parkinson's disease research",
  ]);

  const user = userService.getStoredUser();

  const handleLogout = () => {
    userService.clearUserData();
    navigate('/');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const userContext = {
        age: user?.age,
        gender: user?.gender,
        location: user?.location,
      };

      const results = await searchService.search(query, userContext);

      sessionStorage.setItem('lastSearch', JSON.stringify({
        query,
        results,
        timestamp: new Date().toISOString(),
      }));

      navigate('/results', { state: { searchResults: results } });
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecentQuery = async (recentQuery) => {
    setQuery(recentQuery);
    setTimeout(() => {
      const submitEvent = new Event('submit', { bubbles: true });
      submitEvent.preventDefault = () => {};
      handleSearch(submitEvent, recentQuery);
    }, 0);
  };

  const handleChatClick = () => {
    navigate('/chat');
  };

  // Stagger children animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1a2b] via-[#0a1628] to-[#000814]">
      <Header user={user} onLogout={handleLogout} />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        {/* Hero Section */}
        <div className="mb-14">
          <motion.h2
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 text-center tracking-tight"
          >
            Ask about any{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              medical condition
            </span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lg text-gray-400 text-center mb-10 max-w-2xl mx-auto"
          >
            Get evidence-based answers backed by research from PubMed, OpenAlex, and ClinicalTrials.gov
          </motion.p>

          {/* Search Form */}
          {!isLoading ? (
            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className="max-w-2xl mx-auto mb-10"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative group"
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 'lung cancer treatment', 'type 2 diabetes management'..."
                  className="w-full px-8 py-5 pr-16 bg-white/5 border-2 border-white/10 rounded-full text-white text-lg placeholder-gray-500 outline-none transition-all duration-300 backdrop-blur-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 focus:shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-white/20"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-full transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:scale-110 active:scale-95"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
              </motion.div>
            </motion.form>
          ) : (
            <AILoader />
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <ErrorMessage message={error} />
            </motion.div>
          )}

          {/* Start Chat Button */}
          {!isLoading && (
            <motion.div variants={itemVariants} className="flex justify-center mb-14">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={handleChatClick}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-bold text-lg transition-all duration-300 flex items-center gap-3 shadow-lg shadow-cyan-500/25"
              >
                <Sparkles className="w-5 h-5" />
                Start Chat
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Popular Queries */}
        {!isLoading && (
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-300 mb-5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Popular Queries
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentQueries.map((q, index) => (
                <motion.button
                  key={index}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    borderColor: 'rgba(6, 182, 212, 0.5)',
                    boxShadow: '0 8px 30px rgba(6, 182, 212, 0.1)',
                  }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRecentQuery(q)}
                  className="p-5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-left transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <Search className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <p className="text-gray-300 font-medium group-hover:text-white transition-colors">{q}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardPage;
