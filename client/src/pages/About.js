import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import './About.css';

const About = () => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/content/about');
                if (response.ok) {
                    const data = await response.json();
                    setContent(data);
                }
            } catch (err) {
                console.error('Error fetching about content:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    // Use default content if none exists in DB
    const displayContent = content || {
        hero: {
            title: "The Art of Dressing Well",
            subtitle: "Crafting perfection for the modern gentleman since 2024.",
            image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=1600&q=80"
        },
        sections: [{
            title: "Our Story",
            content: "ATTIRE was born from a simple observation: the modern gentleman deserves more than just accessories; he deserves statements of character. What started as a small boutique specializing in handcrafted ties has grown into a global destination for premium men's accessories.\n\nWe believe that style is a language, and the right accessories are the punctuation that gives it meaning. Every piece in our collection is curated with an eye for timeless elegance and contemporary flair.",
            image: "https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=800&q=80"
        }],
        values: [
            { icon: "💎", title: "Uncompromising Quality", description: "We source only the finest materials, from Italian leather to Japanese silk, ensuring every piece lasts a lifetime." },
            { icon: "🎨", title: "Timeless Design", description: "Our designs transcend trends, focusing on classic silhouettes that remain elegant decade after decade." },
            { icon: "🤝", title: "Ethical Sourcing", description: "We partner with artisans and workshops that share our commitment to fair wages and sustainable practices." }
        ],
        cta: {
            title: "Join the ATTIRE Legacy",
            description: "Experience the difference of premium accessories designed for those who know the value of detail."
        }
    };

    return (
        <div className="about-page">
            <Navbar />
            <div className="about-hero" style={displayContent.hero.image ? { backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)), url(${displayContent.hero.image})` } : {}}>
                <div className="about-hero-content">
                    <h1>{displayContent.hero.title}</h1>
                    <p>{displayContent.hero.subtitle}</p>
                </div>
            </div>

            {displayContent.sections.map((section, index) => (
                <div key={index} className="about-section container">
                    <div className="about-grid">
                        {section.image && (
                            <div className="about-image">
                                <img src={section.image} alt={section.title} />
                            </div>
                        )}
                        <div className="about-text">
                            <h2>{section.title}</h2>
                            {section.content.split('\n\n').map((p, i) => (
                                <p key={i}>{p}</p>
                            ))}
                        </div>
                    </div>
                </div>
            ))}

            <div className="values-section">
                <div className="container">
                    <h2 className="section-title">Our Values</h2>
                    <div className="values-grid">
                        {displayContent.values.map((value, index) => (
                            <div key={index} className="value-card">
                                <div className="value-icon">{value.icon}</div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="about-cta">
                <div className="container">
                    <h2>{displayContent.cta.title}</h2>
                    <p>{displayContent.cta.description}</p>
                    <button className="cta-button" onClick={() => window.location.href = '/products'}>Explore Collection</button>
                </div>
            </div>
        </div>
    );
};

export default About;
