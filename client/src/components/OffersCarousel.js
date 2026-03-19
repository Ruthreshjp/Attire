import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';

const FALLBACK_OFFERS = [
    {
        _id: '1',
        name: 'Classic Oxford Shirt',
        category: 'Shirts',
        originalPrice: 3499,
        specialPrice: 1999,
        discount: 43,
        images: [{ url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80' }],
        isSpecialOffer: true,
    },
    {
        _id: '2',
        name: 'Slim Fit Chinos',
        category: 'Pants',
        originalPrice: 2999,
        specialPrice: 1699,
        discount: 43,
        images: [{ url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80' }],
        isSpecialOffer: true,
    },
    {
        _id: '3',
        name: 'Premium Graphic Tee',
        category: 'T-Shirts',
        originalPrice: 1499,
        specialPrice: 799,
        discount: 47,
        images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80' }],
        isSpecialOffer: true,
    },
    {
        _id: '4',
        name: 'Selvedge Denim Jeans',
        category: 'Jeans',
        originalPrice: 4499,
        specialPrice: 2499,
        discount: 44,
        images: [{ url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80' }],
        isSpecialOffer: true,
    },
    {
        _id: '5',
        name: 'Heritage Kurta',
        category: 'Kurta',
        originalPrice: 2999,
        specialPrice: 1499,
        discount: 50,
        images: [{ url: 'https://images.unsplash.com/photo-1610414316335-97836802f067?w=600&q=80' }],
        isSpecialOffer: true,
    },
];

const OffersCarousel = () => {
    const [offers, setOffers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:5000/api/products')
            .then(r => r.json())
            .then(data => {
                if (data.success) {
                    const specialOffers = data.products.filter(p => p.isSpecialOffer);
                    setOffers(specialOffers.length >= 3 ? specialOffers : FALLBACK_OFFERS);
                } else {
                    setOffers(FALLBACK_OFFERS);
                }
            })
            .catch(() => setOffers(FALLBACK_OFFERS));
    }, []);

    const settings = {
        dots: true,
        infinite: true,
        speed: 700,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        arrows: false,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 640,  settings: { slidesToShow: 1 } },
        ],
    };

    if (offers.length === 0) return null;

    return (
        <section className="offers-section">
            <div className="offers-header">
                <p className="pre">Limited Time</p>
                <h2>Exclusive Offers</h2>
            </div>
            <Slider {...settings}>
                {offers.map(offer => {
                    const image = offer.images?.[0]
                        ? (typeof offer.images[0] === 'string' ? offer.images[0] : offer.images[0].url)
                        : offer.image;
                    const price = offer.specialPrice || offer.price;
                    const original = offer.originalPrice;
                    const pct = original && price < original
                        ? Math.round(((original - price) / original) * 100)
                        : offer.discount;

                    return (
                        <div key={offer._id} onClick={() => navigate(`/product/${offer._id}`)}>
                            <div className="offer-card">
                                {pct > 0 && <span className="offer-badge">{pct}% OFF</span>}
                                <img src={image} alt={offer.name} />
                                <div className="offer-info">
                                    <p className="offer-tag">{offer.category}</p>
                                    <p className="offer-name">{offer.name}</p>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        <span className="offer-price">₹{price?.toLocaleString('en-IN')}</span>
                                        {original && original > price && (
                                            <span className="offer-old-price">₹{original.toLocaleString('en-IN')}</span>
                                        )}
                                    </div>
                                    {offer.couponCode && (
                                        <div className="offer-code-badge" style={{ marginTop: '5px', fontSize: '0.7rem', background: '#c5a059', color: '#000', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, display: 'inline-block' }}>
                                            CODE: {offer.couponCode}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </Slider>
        </section>
    );
};

export default OffersCarousel;
