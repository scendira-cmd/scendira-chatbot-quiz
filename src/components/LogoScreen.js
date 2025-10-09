import React from 'react';

const LogoScreen = () => {
  return (
    <div className="logo-screen active">
      <div className="logo-container">
        <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="Scendira Logo" className="main-logo" />
        <h1 className="company-name">Scendira</h1>
        <p className="tagline">Discover Your Signature Scent</p>
      </div>
    </div>
  );
};

export default LogoScreen;