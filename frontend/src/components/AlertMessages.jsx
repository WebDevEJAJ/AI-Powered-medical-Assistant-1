import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorMessage = ({ message, title = 'Error' }) => {
  return (
    <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <div>
        <h4 className="font-semibold text-red-200">{title}</h4>
        <p className="text-red-100 text-sm mt-1">{message}</p>
      </div>
    </div>
  );
};

export const WarningMessage = ({ message }) => {
  return (
    <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
      <p className="text-yellow-100 text-sm">{message}</p>
    </div>
  );
};

export const SuccessMessage = ({ message }) => {
  return (
    <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
      <p className="text-green-100 text-sm">{message}</p>
    </div>
  );
};

export default ErrorMessage;
