import React, { useState, useEffect, useRef } from 'react';
import './CSS/Hero.css';

const Hero = () => {
    const videos = [
        '/videos/hero-background1.mp4',
        '/videos/hero-background2.mp4',
        '/videos/hero-background3.mp4'
    ];
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.src = videos[currentVideoIndex];
            video.load();
        }
    }, [currentVideoIndex]);

    const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
    };

    return (
        <section id="home" className="hero">
            <video
                ref={videoRef}
                className="hero-video"
                autoPlay
                muted
                loop={false}
                playsInline
                onEnded={handleVideoEnd}
            >
                Your browser does not support the video tag.
            </video>
            <div className="hero-overlay"></div>
            <div className="container hero-container">
                <div className="hero-content">
                    <h1 className="hero-title">
                        Create custom <span className="text-gradient">3D objects</span> in minutes
                    </h1>
                    <p className="section-desc hero-desc">
                        A creative custom 3D printing studio specializing in personalized keychains, unique gift items, custom products, and pop-style miniature figures. From thoughtful gifts and branded merchandise to fun collectibles, each piece is designed to capture your ideas in high-quality, durable 3D form. Whether you have a clear design or just a rough concept, the team helps you turn imagination into something you can hold in your hands.
                    </p>
                    <a href="#products" className="btn btn-primary">Start Creating</a>
                </div>
            </div>
        </section>
    );
};

export default Hero;