import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ReviewPrompt = () => {
    const { user, isAuthenticated } = useContext(AuthContext);
    const [eligibleOrder, setEligibleOrder] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkEligibility = async () => {
            if (!isAuthenticated || !user) return;

            // Check if dismissed for this session
            const dismissed = sessionStorage.getItem('review_prompt_dismissed');
            if (dismissed) return;

            try {
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/orders`, {
                    headers: { 'x-auth-token': localStorage.getItem('token') }
                });

                if (res.data.success && res.data.orders.length > 0) {
                    // Find a delivered order older than 7 days that hasn't been reviewed
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                    const orderToReview = res.data.orders.find(o => {
                        const orderDate = new Date(o.createdAt);
                        return o.orderStatus === 'delivered' && orderDate <= sevenDaysAgo && !o.isReviewed;
                    });

                    if (orderToReview) {
                        setEligibleOrder(orderToReview);
                        // Delay slightly for premium entrance
                        setTimeout(() => setIsVisible(true), 3000);
                    }
                }
            } catch (err) {
                console.error('Error checking review eligibility:', err);
            }
        };

        checkEligibility();
    }, [isAuthenticated, user]);

    const handleLater = () => {
        setIsVisible(false);
        sessionStorage.setItem('review_prompt_dismissed', 'true');
    };

    const handleReviewNow = () => {
        setIsVisible(false);
        sessionStorage.setItem('review_prompt_dismissed', 'true');
        // Navigate to the first item for review
        if (eligibleOrder && eligibleOrder.items.length > 0) {
            navigate(`/product/${eligibleOrder.items[0].id}`);
        }
    };

    if (!isVisible || !eligibleOrder) return null;

    return (
        <div className="review-prompt-overlay">
            <div className="review-prompt-card anim from-bottom">
                <div className="review-prompt-content">
                    <div className="prompt-icon">💎</div>
                    <span className="prompt-eyebrow">Client Appreciation</span>
                    <h2>How is your ATTIRE experience?</h2>
                    <p>It has been over a week since your last acquisition. We would value your perspective on the <strong>{eligibleOrder.items[0]?.name}</strong>.</p>
                    
                    <div className="prompt-actions">
                        <button className="review-now-btn" onClick={handleReviewNow}>Share My Thoughts</button>
                        <button className="review-later-btn" onClick={handleLater}>Perhaps Later</button>
                    </div>
                </div>
            </div>

            <style>{`
                .review-prompt-overlay {
                    position: fixed;
                    bottom: 40px;
                    right: 40px;
                    z-index: 9999;
                    max-width: 400px;
                    pointer-events: none;
                }
                .review-prompt-card {
                    background: #fff;
                    border: 1px solid #000;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                    pointer-events: auto;
                    position: relative;
                }
                .review-prompt-content { text-align: center; }
                .prompt-icon { font-size: 2rem; margin-bottom: 20px; }
                .prompt-eyebrow { 
                    display: block; font-size: 0.6rem; letter-spacing: 4px; 
                    text-transform: uppercase; color: #c5a059; font-weight: 800;
                    margin-bottom: 15px;
                }
                .review-prompt-content h2 { 
                    font-family: 'Playfair Display', serif; 
                    font-size: 1.5rem; margin-bottom: 15px; color: #000; 
                }
                .review-prompt-content p { 
                    font-size: 0.85rem; color: #666; line-height: 1.6;
                    margin-bottom: 30px;
                }
                .prompt-actions { display: flex; flex-direction: column; gap: 12px; }
                
                .review-now-btn {
                    padding: 16px; background: #000; color: #c5a059;
                    border: none; font-size: 0.75rem; font-weight: 800;
                    text-transform: uppercase; letter-spacing: 2px;
                    cursor: pointer; transition: all 0.3s;
                }
                .review-now-btn:hover { background: #222; }
                
                .review-later-btn {
                    padding: 12px; background: transparent; color: #999;
                    border: none; font-size: 0.7rem; font-weight: 700;
                    text-transform: uppercase; letter-spacing: 1.5px;
                    cursor: pointer;
                }
                .review-later-btn:hover { color: #000; }

                @media(max-width: 500px) {
                    .review-prompt-overlay {
                        bottom: 0; right: 0; left: 0; max-width: 100%;
                    }
                    .review-prompt-card { border: none; border-top: 1px solid #eee; }
                }
            `}</style>
        </div>
    );
};

export default ReviewPrompt;
