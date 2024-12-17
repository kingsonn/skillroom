'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chatbot({ topic = '', studyMaterial = '' }) {
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your AI Learning Assistant. How can I help you today?", isBot: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOptionClick = (option) => {
    // Add user's selected option as a message
    setMessages(prev => [...prev, {
      text: option,
      isBot: false
    }]);
    
    // Send the selected option as a message
    handleSendMessage(null, option);
  };

  const extractMessageText = (data) => {
    try {
      const output = data.outputs[0]?.outputs[0];
      if (!output) return null;
      
      // Try to get the message from results first
      const messageText = output.results?.message?.text;
      if (messageText) {
        // Parse the JSON string if it's in JSON format
        if (messageText.includes('```json')) {
          const jsonStr = messageText.replace(/```json\n|\n```/g, '');
          const parsed = JSON.parse(jsonStr);
          
          // If it's an assessment question, return the full parsed object
          if (parsed.intent === 'assessment') {
            return { type: 'assessment', data: parsed };
          }
          // For other intents, return just the answer
          return { type: 'text', data: parsed.answer || messageText };
        }
        return { type: 'text', data: messageText };
      }
      
      // Fallback to messages array
      const messageFromArray = output.messages?.[0]?.message;
      if (messageFromArray) {
        if (messageFromArray.includes('```json')) {
          const jsonStr = messageFromArray.replace(/```json\n|\n```/g, '');
          const parsed = JSON.parse(jsonStr);
          
          if (parsed.intent === 'assessment') {
            return { type: 'assessment', data: parsed };
          }
          return { type: 'text', data: parsed.answer || messageFromArray };
        }
        return { type: 'text', data: messageFromArray };
      }
      
      return { type: 'text', data: "I'm sorry, I couldn't process that request." };
    } catch (error) {
      console.error('Error extracting message:', error);
      return { type: 'text', data: "I'm sorry, I encountered an error processing the response." };
    }
  };

  const handleSendMessage = async (e, optionText = null) => {
    if (e) e.preventDefault();
    const messageToSend = optionText || inputMessage;
    if (!messageToSend.trim()) return;

    if (!optionText) {
      // Only add to messages if it's not an option click (options are added separately)
      setMessages(prev => [...prev, { text: messageToSend, isBot: false }]);
    }
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/langflow/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          sessionId: localStorage.getItem('userEmail'),
          topic: topic,
          studyMaterial: studyMaterial
        }),
      });

      const data = await response.json();
      console.log('Chat response:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botResponse = extractMessageText(data);
      setMessages(prev => [...prev, {
        ...botResponse,
        isBot: true
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'text',
        data: "I'm sorry, I encountered an error. Please try again.",
        isBot: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message, index) => {
    const isAssessment = message.type === 'assessment';
    
    return (
      <div key={index} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
        <div className={`max-w-[80%] p-3 rounded-lg ${
          message.isBot 
            ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' 
            : 'bg-blue-600 text-white'
        }`}>
          {isAssessment ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">{message.data.question}</p>
              <div className="space-y-2">
                {message.data.options.map((option, optIndex) => (
                  <button
                    key={optIndex}
                    onClick={() => handleOptionClick(option)}
                    className="w-full text-left p-2 rounded-md bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors text-sm text-gray-900 dark:text-white"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm">{message.data || message.text}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="hidden lg:block w-96 fixed top-16 right-0 bottom-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI Learning Assistant</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {topic ? `Currently discussing: ${topic}` : 'Ask me anything about your courses'}
        </p>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[calc(100vh-13rem)]">
        {messages.map((message, index) => renderMessage(message, index))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 dark:bg-gray-700">
              <p className="text-sm">Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}