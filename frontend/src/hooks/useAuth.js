import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

/**
 * useAuth hook
 * Manages authentication and user state
 */
export const useAuth = () => {
  const navigate = useNavigate();

  const login = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    userService.clearUserData();
    navigate('/');
  };

  const getUser = () => {
    return userService.getStoredUser();
  };

  const isAuthenticated = () => {
    return !!userService.getStoredUser();
  };

  return {
    login,
    logout,
    getUser,
    isAuthenticated,
  };
};

export default useAuth;
