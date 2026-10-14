import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import './CSS/Hero.css';

const DEFAULT_VIDEOS = [
    '/videos/hero-background1.mp4',
    '/videos/hero-background2.mp4',
    '/videos/hero-background3.mp4'
];

const Hero = () => {
    const { siteSettings } = useData() || {};
    const mediaType = siteSettings?.hero_media_type || 'video';
    const videos = (Array.isArray(siteSettings?.hero_videos) && siteSettings.hero_videos.length > 0)
        ? siteSettings.hero_videos
        : DEFAULT_VIDEOS;

    // Carousel & Image management
    const images = React.useMemo(() => {
        let list = [];
        if (Array.isArray(siteSettings?.hero_images) && siteSettings.hero_images.length > 0) {
            list = siteSettings.hero_images.filter(Boolean);
        }
        if (list.length === 0 && siteSettings?.hero_image) {
            list = [siteSettings.hero_image];
        }
        return list;
    }, [siteSettings?.hero_images, siteSettings?.hero_image]);

    const carouselEnabled = !!siteSettings?.hero_carousel_enabled && images.length > 1;
    const carouselSpeed = Math.max(2, Number(siteSettings?.hero_carousel_speed) || 5);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoRef = useRef(null);

    // Auto-advance image carousel
    useEffect(() => {
        if (mediaType !== 'image' || !carouselEnabled || images.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, carouselSpeed * 1000);
        return () => clearInterval(timer);
    }, [mediaType, carouselEnabled, images.length, carouselSpeed]);

    useEffect(() => {
        const video = videoRef.current;
        if (video && mediaType === 'video') {
            video.play().catch(() => {});
        }
    }, [currentVideoIndex, mediaType]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    const handleExploreClick = (e) => {
        if (window.location.pathname === '/') {
            e.preventDefault();
            const element = document.getElementById('products');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <section id="home" className="hero">
            {mediaType === 'image' && images.length > 0 ? (
                <div className="hero-carousel-container" aria-label="Hero Image Carousel">
                    {images.map((imgUrl, idx) => (
                        <img
                            key={`${imgUrl}-${idx}`}
                            src={imgUrl}
                            alt={`${siteSettings?.hero_title || "3D Printing Background"} - Slide ${idx + 1}`}
                            className={`hero-image-bg ${idx === currentImageIndex ? 'active' : ''}`}
                            loading={idx === 0 ? "eager" : "lazy"}
                        />
                    ))}
                    {carouselEnabled && images.length > 1 && (
                        <div className="hero-carousel-dots" role="tablist" aria-label="Hero Slide Selection">
                            {images.map((_, dotIdx) => (
                                <button
                                    key={dotIdx}
                                    type="button"
                                    className={`hero-carousel-dot ${dotIdx === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(dotIdx)}
                                    aria-label={`Go to slide ${dotIdx + 1}`}
                                    role="tab"
                                    aria-selected={dotIdx === currentImageIndex}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <video
                    ref={videoRef}
                    src={videos[currentVideoIndex]}
                    preload="metadata"
                    className="hero-video"
                    autoPlay
                    muted
                    loop={videos.length === 1}
                    playsInline
                    onEnded={handleVideoEnd}
                >
                    Your browser does not support the video tag.
                </video>
            )}

            {/* Cinematic Lighting Layers */}
            <div className="hero-overlay-top"></div>
            <div className="hero-overlay-vignette"></div>
            <div className="hero-overlay-spotlight"></div>
            <div className="hero-overlay-grain"></div>

            <div className="container hero-container">
                <div className="hero-content-centered">
                    <div className="hero-reveal-wrap">
                        <h1 className="hero-title-cinematic">
                            3D Printing Meets<br />
                            <span className="hero-title-gradient">Creativity.</span>
                        </h1>
                    </div>

                    <div className="hero-reveal-wrap">
                        <p className="hero-desc-refined">
                            {siteSettings?.hero_subtitle || 'Custom 3D printing services in India for personalized gifts, décor and prototypes. Explore our collection or share your idea for a custom quote, delivered across India.'}
                        </p>
                    </div>

                    <div className="hero-cta-sequence">
                        <Link to="/#products" className="btn-cinematic-primary" onClick={handleExploreClick}>
                            <span>Explore Collection</span>
                            <ChevronRight size={18} />
                        </Link>
                        <Link to="/contact" className="btn-cinematic-secondary">
                            <span>Order Now</span>
                        </Link>
                    </div>

                    {/* Verified Trust Badges - Simplified */}
                    <div className="hero-trust-bar-minimal">
                        <div className="trust-item-mini">
                            <ShieldCheck size={14} />
                            <span>Pro-Grade Materials</span>
                        </div>
                        <div className="trust-item-mini">
                            <Truck size={14} />
                            <span>Nationwide Shipping</span>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    );
};

export default Hero;