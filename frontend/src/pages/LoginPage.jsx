import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Brain, Sun, Moon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import userService from '../services/userService';
import { useTheme } from '../context/ThemeContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'male',
    location: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const age = parseInt(formData.age);
      if (age < 1 || age > 150) {
        setError('Please enter a valid age between 1 and 150');
        setIsLoading(false);
        return;
      }

      await userService.registerUser(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 sm:px-6 relative transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-black via-dark-900 to-dark-800' : 'bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50'}`}>
      
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 shadow-lg transition-all hover:scale-110"
      >
        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-blue-600" />}
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md pt-8"
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-4xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Curalink
            </h1>
          </motion.div>
          <p className={`text-xl font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            AI Medical Research
          </p>
          <p className={`text-sm mt-2 font-light ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Evidence-based answers powered by LLaMA 3
          </p>
        </div>

        {/* Glassmorphism Form Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`rounded-2xl p-8 backdrop-blur-xl border shadow-2xl ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white/40 shadow-blue-900/5'}`}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2"
              >
                <span className="shrink-0">⚠️</span>
                <p>{error}</p>
              </motion.div>
            )}

            <div>
              <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-cyan-500/50 ${isDarkMode ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-cyan-500' : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-cyan-500'}`}
                placeholder="Dr. Sarah Connor"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="1"
                  max="150"
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-cyan-500/50 ${isDarkMode ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-cyan-500' : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-cyan-500'}`}
                  placeholder="35"
                />
              </div>

              <div>
                <label htmlFor="gender" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-cyan-500/50 appearance-none cursor-pointer ${isDarkMode ? 'bg-black/40 border-white/10 text-white focus:border-cyan-500' : 'bg-white/80 border-gray-300 text-gray-900 focus:border-cyan-500'}`}
                >
                  <option value="male" className={isDarkMode ? 'bg-dark-800' : 'bg-white'}>Male</option>
                  <option value="female" className={isDarkMode ? 'bg-dark-800' : 'bg-white'}>Female</option>
                  <option value="other" className={isDarkMode ? 'bg-dark-800' : 'bg-white'}>Other</option>
                  <option value="prefer_not_to_say" className={isDarkMode ? 'bg-dark-800' : 'bg-white'}>Prefer not to say</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 outline-none focus:ring-2 focus:ring-cyan-500/50 ${isDarkMode ? 'bg-black/40 border-white/10 text-white placeholder-gray-500 focus:border-cyan-500' : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-cyan-500'}`}
                placeholder="San Francisco, USA"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Interactive Bottom Icons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-10 grid grid-cols-3 gap-4"
        >
          {[
            { icon: '🔬', title: 'Deep Research' },
            { icon: '🤖', title: 'AI-Powered' },
            { icon: '📚', title: 'Evidence-Based' },
          ].map((item, idx) => (
            <motion.div 
              key={item.title} 
              whileHover={{ y: -5, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }}
              className={`text-center p-4 rounded-2xl cursor-pointer transition-colors border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white/50 border-white/40'}`}
            >
              <div className="text-3xl mb-2 grayscale hover:grayscale-0 transition-all">{item.icon}</div>
              <p className={`text-[11px] font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.title}</p>
            </motion.div>
          ))}
        </motion.div>

      </motion.div>
    </div>
  );
};

export default LoginPage;
