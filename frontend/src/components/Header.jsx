import React from 'react';
import { LogOut, Settings, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-md shadow-cyan-500/20">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-xl font-bold text-white">Curalink</h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              AI Powered
            </span>
          </motion.div>

          {user && (
            <div className="flex items-center gap-4 sm:gap-6">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/20">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.location}</p>
                </div>
              </div>

              {/* Settings */}
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/settings')}
                className="p-2.5 rounded-lg transition-all text-gray-400 hover:text-white"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </motion.button>

              {/* Logout */}
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(239,68,68,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onLogout}
                className="p-2.5 rounded-lg transition-all text-gray-400 hover:text-red-400"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
