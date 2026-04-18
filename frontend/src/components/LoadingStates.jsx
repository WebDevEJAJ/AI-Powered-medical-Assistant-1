import React from 'react';
import { Loader } from 'lucide-react';

export const LoadingSkeletons = () => {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="h-4 bg-dark-700 rounded w-3/4"></div>
          <div className="h-3 bg-dark-700 rounded w-full"></div>
          <div className="h-3 bg-dark-700 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
};

export const ResultsLoading = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader className="w-12 h-12 text-primary-500 animate-spin mb-4" />
      <p className="text-dark-400 font-medium">Searching medical databases...</p>
      <p className="text-dark-500 text-sm mt-2">This may take a few seconds</p>
    </div>
  );
};

export default LoadingSkeletons;
