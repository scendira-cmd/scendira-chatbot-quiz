import React, { useState, useEffect } from 'react';

const Navigation = ({ onPrevious, onRestart, canGoPrevious, isResultsScreen }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [mouseTimer, setMouseTimer] = useState(null);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsVisible(true);
      
      if (mouseTimer) {
        clearTimeout(mouseTimer);
      }
      
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      
      setMouseTimer(timer);
    };

    const handleScroll = () => {
      setIsVisible(true);
    };

    const handleClick = () => {
      setIsVisible(true);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClick);

    // Initial hide timer
    const initialTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      if (mouseTimer) clearTimeout(mouseTimer);
      clearTimeout(initialTimer);
    };
  }, [mouseTimer]);

  const handleButtonClick = () => {
    if (isResultsScreen && onRestart) {
      onRestart();
    } else if (!isResultsScreen && onPrevious) {
      onPrevious();
    }
  };

  return (
    <nav className={`nav-panel ${!isVisible ? 'hidden' : ''}`}>
      <div className="nav-content">
        <div className="nav-logo">
          <img src={`${process.env.PUBLIC_URL}/images/scendira-logo.png`} alt="Scendira" className="nav-logo-img" />
          {/* <span className="nav-title">Scendira</span> */}
        </div>
        <button 
          className="prev-button"
          onClick={handleButtonClick}
          disabled={!isResultsScreen && !canGoPrevious}
        >
          {isResultsScreen ? 'Retake Quiz' : '← Go to previous question'}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;