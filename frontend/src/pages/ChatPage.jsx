import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import { ErrorMessage } from '../components/AlertMessages';
import searchService from '../services/searchService';
import userService from '../services/userService';

export const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const user = userService.getStoredUser();
  const sessionId = localStorage.getItem('sessionId');
  const userId = localStorage.getItem('userId');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load conversation history if available
    if (sessionId && userId) {
      loadConversationHistory();
    }
  }, [sessionId, userId]);

  const loadConversationHistory = async () => {
    try {
      const history = await searchService.getConversationHistory(sessionId, userId);
      const formattedMessages = history.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        structuredData: msg.structuredResponse,
      }));
      setMessages(formattedMessages);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const handleSendMessage = async (query) => {
    if (!query.trim()) return;

    setError(null);

    // Add user message immediately
    const userMessage = { role: 'user', content: query.trim() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send chat message
      const response = await searchService.chat(
        query.trim(),
        sessionId,
        userId
      );

      // Add assistant message with structured data
      const assistantMessage = {
        role: 'assistant',
        content: response.message.content,
        structuredData: response.message.structuredData,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
      // Remove user message if chat failed
      setMessages(prev => prev.filter(m => m !== userMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    userService.clearUserData();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Header user={user} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Chat Header */}
        <div className="border-b border-dark-700 py-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-primary-400 hover:text-primary-300 font-medium mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h2 className="text-2xl font-bold text-white">Medical Research Chat</h2>
          <p className="text-dark-400 text-sm mt-1">
            Ask follow-up questions and explore topics in depth
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-3xl mb-4">👋</p>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Start a conversation
                </h3>
                <p className="text-dark-400">
                  Ask me about any medical condition,<br />
                  treatment, or clinical research.
                </p>
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              role={message.role}
              content={message.content}
              structuredData={message.structuredData}
            />
          ))}

          {isLoading && (
            <ChatMessage
              role="assistant"
              content="Processing your question..."
              isLoading={true}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-dark-700 py-4">
          <ChatInput
            onSend={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask a follow-up question..."
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
