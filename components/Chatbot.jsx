'use client';

import { useState, useRef, useEffect } from 'react';

export default function Chatbot({ topic = '', studyMaterial = '', onRemedialTopic }) {
  const [messages, setMessages] = useState([
    { type: 'text', data: "Hi! I'm your AI Learning Assistant. How can I help you today?", isBot: true }
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
    setMessages(prev => [...prev, {
      type: 'text',
      data: option,
      isBot: false
    }]);

    // Send the selected option as a message
    handleSendMessage(null, option);
  };

  const extractMessageText = (data) => {
    try {
      const output = data.outputs[0]?.outputs[0];
      if (!output) return null;

      const messageText = output.results?.message?.text;
      if (messageText) {
        if (messageText.includes('```json')) {
          const jsonStr = messageText.replace(/```json\n|\n```/g, '');
          const parsed = JSON.parse(jsonStr);

          if (parsed.intent === 'assessment') {
            return { type: 'assessment', data: parsed };
          }
          if (parsed.intent === 'assessment_over') {
            return { 
              type: 'assessment_over', 
              data: {
                feedback: parsed.feedback,
                score: parsed.score
              }
            };
          }
          if (parsed.intent === 'remedial' && parsed.confirmation === true) {
            return {
              type: 'remedial',
              data: {
                topic: parsed.topic,
                message: parsed.message || 'Adding remedial topic to your learning path.'
              }
            };
          }
          return { type: 'text', data: parsed.answer || messageText };
        }
        return { type: 'text', data: messageText };
      }

      // ... rest of your existing code
    } catch (error) {
      console.error('Error extracting message:', error);
      return { type: 'text', data: "I'm sorry, I encountered an error processing the response." };
    }
  };

  const handleSendMessage = async (e, optionText = null) => {
    if (e) e.preventDefault();
    const messageToSend = optionText || inputMessage;
    if (!messageToSend.trim()) return;

    setInputMessage('');
    setIsLoading(true);

    if (!optionText) {
      setMessages(prev => [...prev, { 
        type: 'text',
        data: messageToSend,
        isBot: false 
      }]);
    }

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
      
      // Handle remedial topic
      if (botResponse.type === 'remedial' && onRemedialTopic) {
        onRemedialTopic(botResponse.data.topic);
      }
      
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
    const isAssessmentOver = message.type === 'assessment_over';
    const isRemedial = message.type === 'remedial';
    
    return (
      <div key={index} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
        <div className={`max-w-[80%] p-3 rounded-lg ${
          message.isBot 
          ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100' 
          : 'bg-blue-600 text-white'
        }`}>
          {isAssessmentOver ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  {parseInt(message.data.score) >= 70 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 11-16 0 8 8 0 0116 0zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">Assessment Complete!</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          parseInt(message.data.score) >= 70 ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${message.data.score}%` }}
                      ></div>
                    </div>
                    <span className="text-lg font-bold min-w-[4rem] text-right">
                      {message.data.score}%
                    </span>
                  </div>
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${
                parseInt(message.data.score) >= 70 
                ? 'bg-green-500/10 border-green-500/20' 
                : 'bg-yellow-500/10 border-yellow-500/20'
              }`}>
                <div className="flex items-start space-x-2">
                  {parseInt(message.data.score) >= 70 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                  <p className="text-sm flex-1">{message.data.feedback}</p>
                </div>
              </div>
            </div>
          ) : isAssessment ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm font-medium flex-1">{message.data.question}</p>
              </div>
              <div className="space-y-2">
                {message.data.options.map((option, optIndex) => (
                  <button
                    key={optIndex}
                    onClick={() => handleOptionClick(option)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 
                    border border-white/10 hover:border-white/20 
                    transition-all duration-200 ease-in-out
                    text-sm group relative
                    focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 rounded border border-white/20 group-hover:border-white/40 
                        flex items-center justify-center group-hover:bg-white/5 transition-all duration-200">
                        <span className="text-xs">{String.fromCharCode(65 + optIndex)}</span>
                      </div>
                      <span className="flex-1">{option}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5 text-white/0 group-hover:text-white/50 transition-all duration-200" 
                        viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : isRemedial ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                </svg>
                <span className="font-medium">Remedial Topic Added</span>
              </div>
              <p className="text-sm">{message.data.message}</p>
            </div>
          ) : (
            <p className="text-sm">{message.data}</p>
          )}
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => (
    <div className="flex justify-start">
      <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">Roomie is typing...</span>
      </div>
    </div>
  );

  return (
    <div className="hidden lg:flex flex-col w-96 fixed top-16 right-0 bottom-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center transform transition-all duration-200 group-hover:scale-105 group-hover:rotate-3">
              <div className="absolute inset-0 rounded-xl bg-blue-400 animate-pulse opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
              <div className="relative flex items-center justify-center">
                <span className="text-white text-xl font-bold tracking-wider">R</span>
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 border-2 border-white dark:border-gray-800"></div>
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 w-6 h-1.5 bg-blue-500/20 blur-sm rounded-full transform -translate-x-1/2"></div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>Roomie</span>
              <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 rounded-md">AI</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {topic ? `Currently discussing: ${topic}` : 'Ask me anything about your courses'}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-y-auto h-[calc(100vh-13rem)] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {messages.map((message, index) => renderMessage(message, index))}
        {isLoading && renderTypingIndicator()}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <span>Send</span>
            {!isLoading && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}