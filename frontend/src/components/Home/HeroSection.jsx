import { useState, useEffect } from 'react';

const heroImages = [
  {
    src: 'https://plus.unsplash.com/premium_photo-1681488394409-5614ef55488c?q=80&w=1664&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modern library with bookshelves',
    heading: '📚 Discover a World of Books',
    subheading: 'Swap, share, and explore with fellow readers ✨',
    ctaText: '🚀 Browse Now',
    ctaLink: '/login',
  },
  {
    src: 'https://images.unsplash.com/photo-1533327325824-76bc4e62d560?q=80&w=1469&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Cozy reading nook',
    heading: '🌟 Start Your Reading Journey',
    subheading: 'Join a vibrant community of book lovers 📖💫',
    ctaText: '✨ Sign Up',
    ctaLink: '/register',
  },
  {
    src: 'https://images.unsplash.com/photo-1549503017-48c5ddd5a729?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Warm library reading room',
    heading: '💬 Connect Through Stories',
    subheading: 'Engage in passionate discussions and swaps 🤝📚',
    ctaText: '🎯 Learn More',
    ctaLink: '/login',
  },
];

const HeroSection = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [imageLoadStates, setImageLoadStates] = useState({});

  // Preload images and track their load states
  useEffect(() => {
    const loadImage = (src, index) => {
      // Set loading state first
      setImageLoadStates(prev => ({
        ...prev,
        [index]: 'loading'
      }));

      const img = new window.Image();
      img.onload = () => {
        setImageLoadStates(prev => ({
          ...prev,
          [index]: 'loaded'
        }));
      };
      img.onerror = () => {
        setImageLoadStates(prev => ({
          ...prev,
          [index]: 'error'
        }));
      };
      img.src = src;
    };

    heroImages.forEach((image, index) => {
      loadImage(image.src, index);
    });
  }, []); // Empty dependency array - only run once on mount

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const currentImageState = imageLoadStates[currentImage];

  return (
    <div className="relative">
      <section className="relative h-[60vh] md:h-[70vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background Image Layer */}
        <div className="absolute inset-0">
          {currentImageState === 'loaded' ? (
            <img
              key={heroImages[currentImage].src}
              src={heroImages[currentImage].src}
              alt={heroImages[currentImage].alt}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: 0.7 }}
            />
          ) : currentImageState === 'error' ? (
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)'
              }}
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-300 animate-pulse" />
          )}
        </div>

        {/* Color Overlay */}
        <div className="absolute inset-0 bg-opacity-40 backdrop-blur-sm" />

        {/* Content Container */}
        <div className="relative z-10 text-center card shadow-elevated p-4 md:p-8 rounded-2xl max-w-xs md:max-w-3xl mx-4">
          <h1
            className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 transition-opacity duration-500"
            style={{
              color: 'var(--primary)',
              fontFamily: 'Lora, serif'
            }}
          >
            {heroImages[currentImage].heading}
          </h1>

          <p
            className="text-sm md:text-lg lg:text-xl mb-4 md:mb-6 transition-opacity duration-500"
            style={{
              color: 'var(--accent)',
              fontFamily: 'Open Sans, sans-serif'
            }}
          >
            {heroImages[currentImage].subheading}
          </p>
          
          <a
            href={heroImages[currentImage].ctaLink}
            className="inline-block btn btn-primary text-white px-4 md:px-8 py-2 md:py-4 rounded-xl font-semibold text-sm md:text-lg transition-all duration-300"
            style={{
              fontFamily: 'Lora, serif',
              boxShadow: '0 4px 15px rgba(69, 106, 118, 0.3)'
            }}
          >
            {heroImages[currentImage].ctaText}
          </a>
        </div>
        
        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImage 
                  ? 'scale-125' 
                  : 'bg-[var(--bg-card)] opacity-50 hover:opacity-75'
              }`}
              style={{
                backgroundColor: index === currentImage ? 'var(--accent)' : undefined
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default HeroSection;