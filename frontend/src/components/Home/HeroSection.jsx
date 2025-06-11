import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const heroImages = [
    {
      src: '/assets/hero-bg.jpg',
      alt: 'Modern library with bookshelves',
      heading: 'Discover a World of Books',
      subheading: 'Swap, share, and explore with BookSwaps.',
      ctaText: 'Browse Now',
      ctaLink: '#trending-books',
    },
    {
      src: '/assets/reading-nook.jpg',
      alt: 'Cozy reading nook',
      heading: 'Start Your Reading Journey',
      subheading: 'Join a community of book lovers today.',
      ctaText: 'Sign Up',
      ctaLink: '/register',
    },
    {
      src: '/assets/warm-library.jpg',
      alt: 'Warm library reading room',
      heading: 'Connect Through Stories',
      subheading: 'Engage in discussions and swaps.',
      ctaText: 'Learn More',
      ctaLink: '#features',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  return (
    <section className="relative h-[70vh] w-full flex items-center justify-center overflow-hidden">
      <AnimatePresence>
        <motion.img
          key={heroImages[currentImage].src}
          src={heroImages[currentImage].src}
          alt={heroImages[currentImage].alt}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[var(--primary)] bg-opacity-40 backdrop-blur-sm" />
      <motion.div
        className="relative z-10 text-center bookish-glass bookish-shadow p-8 rounded-2xl max-w-3xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <motion.h1
          className="text-4xl md:text-5xl font-['Lora'] text-[var(--secondary)] text-gradient mb-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {heroImages[currentImage].heading}
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-[var(--secondary)] font-['Open_Sans'] mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {heroImages[currentImage].subheading}
        </motion.p>
        <motion.a
          href={heroImages[currentImage].ctaLink}
          className="inline-block bookish-button-enhanced text-[var(--secondary)] px-6 py-3 rounded-xl font-['Open_Sans']"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {heroImages[currentImage].ctaText}
        </motion.a>
      </motion.div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`w-3 h-3 rounded-full ${index === currentImage ? 'bg-[var(--accent)]' : 'bg-[var(--secondary)] opacity-50'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;