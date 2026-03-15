import React, { useState, useEffect } from 'react';

const PageLoader = ({ children }) => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setVisible(false), 800);
    }, 1600); // 1.6s total
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {visible && (
        <div className={`page-loader${fadeOut ? ' fade-out' : ''}`}>
          <img src="/logo.png" alt="Attire" className="loader-logo" />
          <p className="loader-wordmark">A T T I R E</p>
          <div className="loader-bar">
            <div className="loader-progress" />
          </div>
        </div>
      )}
      {children}
    </>
  );
};

export default PageLoader;
