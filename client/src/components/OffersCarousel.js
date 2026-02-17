import React from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';


const OffersCarousel = () => {
    const [offers, setOffers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchSpecialOffers = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/products');
                const data = await response.json();
                if (data.success) {
                    const specialOffers = data.products.filter(p => p.isSpecialOffer);
                    // Ensure unique products by _id
                    const uniqueOffers = Array.from(new Map(specialOffers.map(item => [item['_id'], item])).values());
                    setOffers(uniqueOffers);
                }
            } catch (err) {
                console.error('Error fetching special offers:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSpecialOffers();
    }, []);

    const settings = {
        dots: false,
        infinite: offers.length > 5,
        speed: 600,
        slidesToShow: 5,
        slidesToScroll: 1,
        autoplay: offers.length > 5,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        arrows: true,
        responsive: [
            {
                breakpoint: 1400,
                settings: {
                    slidesToShow: 4,
                    infinite: offers.length > 4,
                    autoplay: offers.length > 4
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    infinite: offers.length > 3,
                    autoplay: offers.length > 3
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    infinite: offers.length > 2,
                    autoplay: offers.length > 2
                }
            },
            {
                breakpoint: 576,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false,
                    infinite: offers.length > 1,
                    autoplay: offers.length > 1
                }
            }
        ]
    };

    if (loading) return null;
    if (offers.length === 0) return null;

    return (
        <div className="offers-section">
            <div className="section-header">
                <h2 className="section-title">Special Offers</h2>
                <p className="section-subtitle">Limited time deals you don't want to miss</p>
            </div>

            <div className="offers-carousel">
                <Slider {...settings}>
                    {offers.map((offer) => (
                        <div key={offer._id} className="offer-slide-wrapper">
                            <div className="offer-card">
                                <div className="offer-image-container">
                                    <img
                                        src={offer.images && offer.images[0] ? (typeof offer.images[0] === 'string' ? offer.images[0] : offer.images[0].url) : offer.image}
                                        alt={offer.name}
                                        className="offer-image"
                                    />
                                    <div className="offer-badge">{offer.discount}% OFF</div>
                                </div>
                                <div className="offer-content">
                                    <h3 className="offer-title">{offer.name}</h3>
                                    <p className="offer-category">{offer.category}</p>
                                    <div className="offer-code">
                                        <span>Code:</span>
                                        <strong>{offer.couponCode}</strong>
                                    </div>
                                    <Link to={`/product/${offer._id}`} className="offer-button">Shop Now</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default OffersCarousel;
