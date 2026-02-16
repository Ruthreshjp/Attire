import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';


const HeroCarousel = () => {
    const [slides, setSlides] = useState([]);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/content/home');
                const data = await response.json();
                if (response.ok && data.carousel && data.carousel.length > 0) {
                    setSlides(data.carousel.filter(s => s.isActive !== false));
                } else {
                    // Fallback to defaults if no backend content
                    setSlides([
                        {
                            id: 1,
                            image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80',
                            title: 'New Season Collection',
                            subtitle: 'Discover the latest trends',
                            buttonText: 'Shop Now',
                            link: '/products?category=new-arrivals'
                        },
                        {
                            id: 2,
                            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80',
                            title: 'Summer Sale',
                            subtitle: 'Up to 50% off on selected items',
                            buttonText: 'Explore Deals',
                            link: '/products?category=sale'
                        }
                    ]);
                }
            } catch (err) {
                console.error('Error fetching carousel:', err);
            }
        };
        fetchSlides();
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        fade: true,
        cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
        arrows: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false
                }
            }
        ]
    };

    return (
        <div className="hero-carousel">
            <Slider {...settings}>
                {slides.map((slide) => (
                    <div key={slide.id} className="hero-slide">
                        <div className="hero-image-container">
                            <img src={slide.image} alt={slide.title} className="hero-image" />
                            <div className="hero-overlay"></div>
                        </div>
                        <div className="hero-content">
                            <h2 className="hero-title">{slide.title}</h2>
                            <p className="hero-subtitle">{slide.subtitle}</p>
                            <Link to={slide.link} className="hero-button">
                                {slide.buttonText}
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
