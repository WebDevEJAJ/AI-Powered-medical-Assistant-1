import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const ResultCard = ({ result, onOpenSource }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="card hover:shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-primary-600 bg-opacity-20 text-primary-400 text-xs font-semibold rounded">
              {result.platform}
            </span>
            {result.score && (
              <span className="text-dark-400 text-xs">
                Relevance: {Math.round(result.score * 100)}%
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-dark-50 mb-2 hover:text-primary-400 cursor-pointer">
            {result.title}
          </h3>

          {result.authors && result.authors.length > 0 && (
            <p className="text-sm text-dark-400 mb-2">
              By {result.authors.slice(0, 2).join(', ')}
              {result.authors.length > 2 && ' et al.'}
            </p>
          )}

          <p className="text-dark-300 text-sm mb-3 line-clamp-2">
            {result.snippet || result.abstract}
          </p>

          <div className="flex items-center gap-4 text-xs text-dark-400">
            {result.year && <span>Year: {result.year}</span>}
            {result.citations !== undefined && (
              <span>Citations: {result.citations}</span>
            )}
            {result.status && <span>Status: {result.status}</span>}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
          aria-label="Toggle details"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-dark-700 space-y-3">
          {result.metadata?.journal && (
            <div>
              <p className="text-xs text-dark-500 uppercase tracking-wider">Journal</p>
              <p className="text-dark-300">{result.metadata.journal}</p>
            </div>
          )}

          {result.eligibility && (
            <>
              <div>
                <p className="text-xs text-dark-500 uppercase tracking-wider">Status</p>
                <p className="text-dark-300">{result.eligibility.gender}</p>
              </div>
              <div>
                <p className="text-xs text-dark-500 uppercase tracking-wider">Criteria</p>
                <p className="text-dark-300 text-sm line-clamp-3">
                  {result.eligibility.criteria}
                </p>
              </div>
            </>
          )}

          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors"
          >
            View Full Article
          </a>
        </div>
      )}
    </div>
  );
};

export default ResultCard;
