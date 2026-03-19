import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';

const PremiumConfirm = () => {
    const { confirm, closeConfirm } = useNotification();
    const [loading, setLoading] = useState(false);
    const [canInteract, setCanInteract] = useState(false);

    // Safety lockout to prevent ghost clicks
    React.useEffect(() => {
        if (confirm) {
            const timer = setTimeout(() => setCanInteract(true), 500);
            return () => clearTimeout(timer);
        } else {
            setCanInteract(false);
        }
    }, [confirm]);

    if (!confirm) return null;

    const handleConfirm = () => {
        if (!canInteract) return;
        setLoading(true);
        // Delegate execution to the context which now handles it after state clear
        closeConfirm(true);
    };

    const handleCancel = () => {
        closeConfirm(false);
    };

    return (
        <div className="premium-confirm-overlay" 
            style={{ zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleCancel}
        >
            <div className="premium-confirm-card pulse-in" 
                style={{ opacity: 1, visibility: 'visible' }}
                onClick={(e) => e.stopPropagation()}>
                <div className="confirm-header">
                    <span className="confirm-brand">ATTIRE AUTHENTICATION</span>
                    <button className="confirm-close-lite" onClick={handleCancel} disabled={loading}>&times;</button>
                </div>

                <div className="confirm-content">
                    <div className="confirm-icon-vessel">
                        📦
                    </div>
                    <p className="confirm-message">{confirm.message}</p>
                </div>
                <div className="confirm-actions">
                    <button className="confirm-btn yes" onClick={handleConfirm} disabled={loading || !canInteract}>
                        {loading ? 'Processing...' : 'Yes, Proceed'}
                    </button>
                    <button className="confirm-btn no" onClick={closeConfirm} disabled={loading || !canInteract}>
                        Cancel
                    </button>
                </div>
            </div>
            <style>{`
                .premium-confirm-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    z-index: 999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.4s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .premium-confirm-card {
                    background: #1a1a1a;
                    border: 2px solid #c5a059;
                    width: 100%;
                    max-width: 450px;
                    padding: 50px;
                    position: relative;
                    box-shadow: 0 50px 100px rgba(0, 0, 0, 1), 0 0 30px rgba(197, 160, 89, 0.2);
                }

                .confirm-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }

                .confirm-brand {
                    font-size: 0.65rem;
                    letter-spacing: 5px;
                    color: rgba(197, 160, 89, 0.6);
                    font-weight: 800;
                    text-transform: uppercase;
                }

                .confirm-close-lite {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.2);
                    font-size: 1.8rem;
                    cursor: pointer;
                    line-height: 1;
                    transition: color 0.3s;
                }
                .confirm-close-lite:hover { color: #fff; }

                .confirm-content {
                    text-align: center;
                    margin-bottom: 40px;
                }

                .confirm-icon-vessel {
                    font-size: 3rem;
                    margin-bottom: 25px;
                    filter: grayscale(1) invert(1);
                    opacity: 0.7;
                }

                .confirm-message {
                    color: #fff;
                    font-family: 'Playfair Display', serif;
                    font-size: 1.6rem;
                    line-height: 1.4;
                    margin: 0;
                    font-weight: 400;
                }

                .confirm-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .confirm-btn {
                    padding: 16px;
                    border: 1px solid transparent;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    font-weight: 700;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .confirm-btn.yes {
                    background: #c5a059;
                    color: #000;
                }
                .confirm-btn.yes:hover {
                    background: #d4b47a;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(197, 160, 89, 0.3);
                }

                .confirm-btn.no {
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    border-color: rgba(255, 255, 255, 0.1);
                }
                .confirm-btn.no:hover {
                    color: #fff;
                    border-color: #fff;
                }

                .confirm-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @media (max-width: 480px) {
                    .premium-confirm-card { padding: 30px; }
                    .confirm-message { font-size: 1.3rem; }
                }

                .anim.zoom-in {
                    animation: zoomIn 0.6s cubic-bezier(0.19, 1, 0.22, 1);
                }

                @keyframes zoomIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default PremiumConfirm;
