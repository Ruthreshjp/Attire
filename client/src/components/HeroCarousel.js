import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';

const DEFAULT_SLIDES = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1800&q=80',
        title: 'The New Collection',
        subtitle: 'Precision-crafted silhouettes for the modern wardrobe.',
        buttonText: 'Explore Now',
        link: '/products',
        pre: 'Spring / Summer 2026'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1800&q=80',
        title: 'Timeless Elegance',
        subtitle: 'From formal occasions to weekend escapades — dressed perfectly.',
        buttonText: 'Shop Collection',
        link: '/products',
        pre: 'Premium Essentials'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1800&q=80',
        title: 'Wear Your Story',
        subtitle: 'Fashion is a language. Let yours speak volumes.',
        buttonText: 'Discover More',
        link: '/about',
        pre: 'The ATTIRE Experience'
    },
];

const HeroCarousel = ({ slides: initialSlides }) => {
    const [slides, setSlides] = useState([]);

    useEffect(() => {
        if (initialSlides && initialSlides.length > 0) {
            setSlides(initialSlides.filter(s => s.isActive !== false).map((s, idx) => ({
                ...s, id: s.id || idx,
                image: s.image?.url || s.image || s.imageUrl
            })));
        } else {
            setSlides(DEFAULT_SLIDES);
        }
    }, [initialSlides]);

    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5500,
        pauseOnHover: true,
        fade: true,
        cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
        arrows: true,
    };

    if (slides.length === 0) return null;

    return (
        <div className="hero-carousel">
            <Slider {...settings}>
                {slides.map((slide) => (
                    <div key={slide.id} className="hero-slide">
                        <div className="hero-image-container">
                            <img src={slide.image} alt={slide.title} className="hero-image" />
                            <div className="hero-overlay" />
                        </div>
                        <div className="hero-content">
                            {slide.pre && <p className="hero-pre" style={{ color: (slide.titleColor === 'gold' ? '#c5a059' : slide.titleColor) || 'white' }}>{slide.pre}</p>}
                            <h1 className="hero-title" style={{ color: (slide.titleColor === 'gold' ? '#c5a059' : slide.titleColor) || 'white' }}>{slide.title}</h1>
                            <p className="hero-subtitle" style={{ color: (slide.subtitleColor === 'gold' ? '#c5a059' : slide.subtitleColor) || 'white' }}>{slide.subtitle}</p>
                            <Link to={slide.link || '/products'} className="hero-button">
                                {slide.buttonText || 'Shop Now'}
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default HeroCarousel;
