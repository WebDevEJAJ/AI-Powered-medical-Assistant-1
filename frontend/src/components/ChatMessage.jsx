import React from 'react';
import { ChevronRight } from 'lucide-react';

export const ResponseSection = ({ title, content, icon: Icon = null }) => {
  if (!content) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-5 h-5 text-primary-400" />}
        <h4 className="text-sm font-bold text-primary-300 uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <p className="text-dark-200 leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    </div>
  );
};

export const ChatMessage = ({ role, content, isLoading = false, structuredData = null }) => {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slideUp`}>
      <div
        className={`max-w-2xl p-4 rounded-lg ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-dark-800 border border-dark-700 text-dark-100'
        }`}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
            <span className="text-sm">Processing...</span>
          </div>
        ) : (
          <>
            {isUser ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <div className="space-y-4">
                <p className="whitespace-pre-wrap leading-relaxed">{content}</p>

                {structuredData && (
                  <div className="mt-6 pt-4 border-t border-dark-600 space-y-6">
                    {structuredData.conditionOverview && (
                      <ResponseSection
                        title="Condition Overview"
                        content={structuredData.conditionOverview}
                      />
                    )}

                    {structuredData.researchInsights && (
                      <ResponseSection
                        title="Research Insights"
                        content={structuredData.researchInsights}
                      />
                    )}

                    {structuredData.clinicalTrialsInfo && (
                      <ResponseSection
                        title="Clinical Trials"
                        content={structuredData.clinicalTrialsInfo}
                      />
                    )}

                    {structuredData.personalizedInsight && (
                      <ResponseSection
                        title="Personalized Insight"
                        content={structuredData.personalizedInsight}
                      />
                    )}

                    {structuredData.sources && structuredData.sources.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-primary-300 uppercase tracking-wider">
                          Sources ({structuredData.sources.length})
                        </h4>
                        <div className="space-y-2">
                          {structuredData.sources.slice(0, 5).map((source, idx) => (
                            <a
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-start gap-2 p-2 hover:bg-dark-700 rounded transition-colors group"
                            >
                              <ChevronRight className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-primary-300 group-hover:text-primary-200 truncate">
                                  {source.title}
                                </p>
                                <p className="text-xs text-dark-500">
                                  {source.platform} • {source.year}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
