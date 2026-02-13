import React, { useEffect, useState } from 'react';


const WelcomeScreen = ({ onComplete }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fade out after 2.5 seconds
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 2500);

        // Complete after 3 seconds
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <div className={`welcome-screen ${fadeOut ? 'fade-out' : ''}`}>
            <div className="welcome-content">
                <div className="welcome-logo">
                    <img src="/biglogo.png" alt="Attire Logo" />
                </div>
                <h1 className="welcome-title">A T T I R E</h1>
                <p className="welcome-subtitle">THE COMPLETE MEN'S SHOP</p>
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        </div>
    );
};

export default WelcomeScreen;
