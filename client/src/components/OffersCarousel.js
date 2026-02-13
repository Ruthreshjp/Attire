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
                    setOffers(specialOffers);
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
        infinite: true,
        speed: 600,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        arrows: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows: false
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
                                        src={offer.images && offer.images[0] ? offer.images[0].url : offer.image}
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
