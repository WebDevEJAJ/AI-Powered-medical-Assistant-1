import React, { useState } from 'react';
import { Send, Paperclip } from 'lucide-react';

export const ChatInput = ({ onSend, isLoading = false, placeholder = 'Ask about medical conditions...' }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <div className="flex-1 relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="w-full input-field resize-none focus:ring-1 focus:ring-primary-600 max-h-32"
          rows="2"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="p-3 hover:bg-dark-700 rounded-lg transition-colors text-dark-400 hover:text-dark-200"
          aria-label="Attach file"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
          aria-label="Send message"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
