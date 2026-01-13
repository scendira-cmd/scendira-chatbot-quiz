import React from 'react';

const LogoScreen = () => {
  return (
    <div className="logo-screen active">
      <div className="logo-container">
        <img src={`${process.env.PUBLIC_URL}/images/scendira-logo.png`} alt="Scendira Logo" className="main-logo" />
        <p className="tagline">Discover Your Signature Scent</p>
      </div>
    </div>
  );
};

export default LogoScreen;