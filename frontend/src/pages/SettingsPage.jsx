import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun } from 'lucide-react';
import Header from '../components/Header';
import { ErrorMessage, SuccessMessage } from '../components/AlertMessages';
import userService from '../services/userService';

export const SettingsPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('dark');
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);

  const user = userService.getStoredUser();

  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setSuccessMessage('Theme updated successfully');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleLogout = () => {
    userService.clearUserData();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <Header user={user} onLogout={handleLogout} />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
        </div>

        {/* Messages */}
        {error && <div className="mb-6"><ErrorMessage message={error} /></div>}
        {successMessage && <div className="mb-6"><SuccessMessage message={successMessage} /></div>}

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Profile Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={user?.name || ''}
                  disabled
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-400 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Age
                  </label>
                  <input
                    type="text"
                    value={user?.age || ''}
                    disabled
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-200 mb-2">
                    Gender
                  </label>
                  <input
                    type="text"
                    value={user?.gender || ''}
                    disabled
                    className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-200 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={user?.location || ''}
                  disabled
                  className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-dark-400 cursor-not-allowed"
                />
              </div>

              <p className="text-sm text-dark-500 italic">
                Profile information is fixed for this session. Logout to change settings.
              </p>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">Appearance</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-3">
                  Theme
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${theme === 'dark'
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                      }`}
                  >
                    <Moon className="w-5 h-5" />
                    Dark
                  </button>

                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${theme === 'light'
                        ? 'bg-primary-600 text-white'
                        : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                      }`}
                  >
                    <Sun className="w-5 h-5" />
                    Light
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="card">
            <h2 className="text-xl font-semibold text-white mb-4">About</h2>
            <div className="space-y-3 text-sm text-dark-300">
              <div>
                <p className="font-medium text-dark-200">Version</p>
                <p>1.0.0</p>
              </div>

              <div>
                <p className="font-medium text-dark-200">Data Sources</p>
                <p>PubMed, OpenAlex, ClinicalTrials.gov</p>
              </div>

              <div>
                <p className="font-medium text-dark-200">AI Model</p>
                <p>HUGGING FACE LLAMA 3 8B</p>
              </div>

              <div className="pt-4 border-t border-dark-700">
                <p className="text-dark-500">
                  Curalink is an AI-powered medical research assistant.
                  Always consult with healthcare professionals for medical advice.
                </p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-700">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Logout</h2>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-red-900 bg-opacity-30 hover:bg-opacity-50 text-red-300 border border-red-700 rounded-lg font-medium transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
