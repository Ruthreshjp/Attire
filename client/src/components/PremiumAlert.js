import React from 'react';
import { useNotification } from '../context/NotificationContext';

const PremiumAlert = () => {
    const { alert, closeAlert } = useNotification();
    const [canInteract, setCanInteract] = React.useState(false);

    // Safety lockout to prevent ghost clicks
    React.useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => setCanInteract(true), 400);
            return () => clearTimeout(timer);
        } else {
            setCanInteract(false);
        }
    }, [alert]);

    if (!alert) return null;

    const handleAction = (e) => {
        if (e) e.stopPropagation();
        if (!canInteract) return;
        closeAlert();
    };

    return (
        <div className="premium-alert-overlay" onClick={handleAction}>
            <div className="premium-alert-card pulse-in" onClick={(e) => e.stopPropagation()}>
                <div className="alert-header">
                    <span className="alert-brand">{alert.type === 'error' ? 'ATTIRE SYSTEM ALERT' : 'ATTIRE CONFIRMATION'}</span>
                    <button className="alert-close-lite" onClick={handleAction}>&times;</button>
                </div>

                <div className="alert-content">
                    <div className="alert-icon-large">
                        {alert.type === 'error' ? '⚡' : '✨'}
                    </div>
                    <p className="alert-message">{alert.message}</p>
                </div>
                <div className="alert-actions">
                    <button className="alert-btn action" onClick={handleAction} disabled={!canInteract}>
                        Acknowledge
                    </button>
                </div>
            </div>

            <style>{`
                .premium-alert-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    z-index: 1000000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.4s ease;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .premium-alert-card {
                    background: #1a1a1a;
                    border: 2px solid #c5a059;
                    width: 100%;
                    max-width: 450px;
                    padding: 50px;
                    position: relative;
                    box-shadow: 0 50px 100px rgba(0, 0, 0, 1), 0 0 30px rgba(197, 160, 89, 0.15);
                    text-align: center;
                }

                .alert-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }

                .alert-brand {
                    font-size: 0.65rem;
                    letter-spacing: 5px;
                    color: rgba(197, 160, 89, 0.6);
                    font-weight: 800;
                    text-transform: uppercase;
                }

                .alert-close-lite {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.2);
                    font-size: 1.8rem;
                    cursor: pointer;
                    line-height: 1;
                    transition: color 0.3s;
                }
                .alert-close-lite:hover { color: #fff; }

                .alert-content {
                    margin-bottom: 40px;
                }

                .alert-icon-large {
                    font-size: 3.5rem;
                    margin-bottom: 25px;
                }

                .alert-message {
                    color: #fff;
                    font-family: 'Playfair Display', serif;
                    font-size: 1.6rem;
                    line-height: 1.4;
                    margin: 0;
                    font-weight: 400;
                }

                .alert-actions {
                    display: flex;
                    justify-content: center;
                }

                .alert-btn.action {
                    width: 100%;
                    padding: 16px;
                    background: #c5a059;
                    color: #000;
                    border: none;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    font-weight: 700;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                .alert-btn.action:hover {
                    background: #d4b47a;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(197, 160, 89, 0.3);
                }

                .anim.zoom-in {
                    animation: zoomIn 0.6s cubic-bezier(0.19, 1, 0.22, 1);
                }

                @keyframes zoomIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }

                @media (max-width: 480px) {
                    .premium-alert-card { padding: 30px; }
                    .alert-message { font-size: 1.3rem; }
                }
            `}</style>
        </div>
    );
};

export default PremiumAlert;
