import React, { useState } from 'react';
import { Client } from "@gradio/client";
import { useNotification } from '../context/NotificationContext';
import './TryOnModal.css';

const TryOnModal = ({ isOpen, onClose, product, selectedColor }) => {
    const { showAlert } = useNotification();
    const [userPhoto, setUserPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [error, setError] = useState(null);

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUserPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            setResultImage(null);
            setError(null);
        }
    };

    const handleProceed = async () => {
        if (!userPhoto) {
            showAlert('Please upload your photo first');
            return;
        }

        setIsGenerating(true);
        setError(null);

        try {
            // Find the cloth image based on selected color
            let clothImageUrl = "";
            const currentSelectedColor = (product.colors || []).find(c => c.name === selectedColor);

            if (currentSelectedColor && currentSelectedColor.images && currentSelectedColor.images.length > 0) {
                const img = currentSelectedColor.images[0];
                clothImageUrl = typeof img === 'string' ? img : img.url;
            } else if (product.images && product.images.length > 0) {
                const img = product.images[0];
                clothImageUrl = typeof img === 'string' ? img : img.url;
            }

            if (!clothImageUrl) {
                throw new Error("Product image not found");
            }

            console.log("Connecting to Hugging Face Space (yisol/IDM-VTON)...");
            const client = await Client.connect("yisol/IDM-VTON", {
                hf_token: process.env.REACT_APP_HF_TOKEN
            });

            console.log("Processing cloth image (bypassing CORS)...");
            // Use the backend proxy for any external images to avoid CORS
            const proxyUrl = `${process.env.REACT_APP_API_URL}/api/proxy-image?url=${encodeURIComponent(clothImageUrl)}`;
            const clothResponse = await fetch(proxyUrl);
            const clothBlob = await clothResponse.blob();

            console.log("Sending request to AI model...");
            const result = await client.predict("/tryon", [
                {
                    "background": userPhoto,
                    "layers": [],
                    "composite": null
                },
                clothBlob,
                product.name || "garment",
                true,
                false,
                30,
                42
            ]);

            if (result.data && result.data[0]) {
                const output = result.data[0];
                setResultImage(typeof output === 'string' ? output : (output.url || output.data));
                console.log("AI Generation successful!");
            } else {
                throw new Error("The AI returned an empty response. Please try with a different photo.");
            }

        } catch (err) {
            console.error("Detailed Try-on error:", err);

            // Check for specific error types
            if (err.message?.includes("429") || err.message?.includes("queue")) {
                setError("The AI service is currently overloaded with too many requests. Please try again in 1-2 minutes.");
            } else if (err.message?.includes("401") || err.message?.includes("token")) {
                setError("Hugging Face Space authentication failed. The set token might be invalid.");
            } else if (err.message?.includes("Paused")) {
                setError("The Virtual Try-On service is currently sleeping/paused. Please contact support or try later.");
            } else {
                setError(`AI Error: ${err.message || "Something went wrong. Please check your internet and try again."}`);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="tryon-modal-overlay" onClick={(e) => e.target.className === 'tryon-modal-overlay' && onClose()}>
            <div className="tryon-modal-container">
                <button className="close-modal" onClick={onClose}>&times;</button>
                <h2>Virtual Try-On</h2>
                <p className="subtitle">Instant Preview: See how the {selectedColor} {product.name} looks on you</p>

                <div className="tryon-content">
                    <div className="upload-section">
                        <h3>1. Your Photo</h3>
                        <div className={`photo-upload-box ${photoPreview ? 'has-image' : ''}`}>
                            {photoPreview ? (
                                <img src={photoPreview} alt="User" className="preview-img" />
                            ) : (
                                <div className="upload-placeholder">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <p>Click to upload your photo</p>
                                    <span style={{ fontSize: '0.7rem', color: '#888' }}>(Full body or upper body works best)</span>
                                </div>
                            )}
                            <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                        </div>
                    </div>

                    <div className="arrow-divider">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>

                    <div className="result-section">
                        <h3>2. AI Generated Result</h3>
                        <div className={`result-box ${isGenerating ? 'generating' : ''}`}>
                            {isGenerating ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>AI is processing your request...</p>
                                </div>
                            ) : resultImage ? (
                                <img src={resultImage} alt="Try-on Result" className="result-img" />
                            ) : (
                                <div className="result-placeholder">
                                    <p>Your instant preview will appear here</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {error && <p className="error-message">{error}</p>}

                <div className="modal-actions">
                    <button
                        className="proceed-btn"
                        onClick={handleProceed}
                        disabled={!userPhoto || isGenerating}
                    >
                        {isGenerating ? 'Processing...' : 'Proceed to Try-On'}
                    </button>
                    {resultImage && (
                        <button className="download-btn" onClick={() => window.open(resultImage, '_blank')}>
                            Open Full Image
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TryOnModal;
