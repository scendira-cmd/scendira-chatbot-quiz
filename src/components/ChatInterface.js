import React, { useState, useEffect, useRef } from 'react';

const ChatInterface = ({ messages, currentQuestion, onUserAnswer }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('=== CHAT INTERFACE - CURRENT QUESTION CHANGED ===');
    console.log('Current Question:', currentQuestion);
    // Focus input when component mounts or new question appears
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;

    const answer = inputValue.trim();
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay for natural conversation flow
    setTimeout(() => {
      setIsTyping(false);
    }, 1500);

    await onUserAnswer(answer);
  };

  const handleImageChoice = async (option) => {
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    await onUserAnswer(option.description, true, option);
  };

  const renderMessage = (message) => {
    if (message.type === 'bot') {
      return (
        <div key={message.id} className="message-wrapper bot-message">
          <div className="message-bubble bot-bubble">
            <div className="message-text">{message.text}</div>
            
            {/* Render image choices if this is an image question */}
            {message.questionData && message.questionData.options && (
              <div className="image-choices">
                {message.questionData.options.map((choice, index) => (
                  <div
                    key={index}
                    className="image-choice-option"
                    onClick={() => handleImageChoice(choice)}
                  >
                    <img 
                      src={`${process.env.PUBLIC_URL}/images/${choice.image}`} 
                      alt={choice.description}
                      className="choice-image"
                      onError={(e) => {
                        console.error('Image failed to load:', choice.image);
                        console.error('Full path:', `${process.env.PUBLIC_URL}/images/${choice.image}`);
                        e.target.style.border = '2px solid red';
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', choice.image);
                      }}
                    />
                    <span className="choice-description">{choice.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="message-time">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    } else {
      return (
        <div key={message.id} className="message-wrapper user-message">
          <div className="message-bubble user-bubble">
            {message.isImageChoice ? (
              <div className="user-image-choice">
                <img 
                  src={`${process.env.PUBLIC_URL}/images/${message.selectedOption.image}`} 
                  alt={message.selectedOption.description}
                  className="selected-image"
                />
                <span>{message.text}</span>
              </div>
            ) : (
              <div className="message-text">{message.text}</div>
            )}
          </div>
          <div className="message-time">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>Fragrance Discovery Chat</h2>
        <p>Let's find your perfect scent together</p>
      </div>
      
      <div className="messages-container">
        {messages.map(renderMessage)}
        
        {isTyping && (
          <div className="message-wrapper bot-message">
            <div className="message-bubble bot-bubble typing">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Only show input if current question doesn't have image choices */}
      {currentQuestion && !currentQuestion.options && (
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer here..."
              className="chat-input"
              disabled={isTyping}
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!inputValue.trim() || isTyping}
            >
              <span>→</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ChatInterface;