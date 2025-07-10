import { motion } from 'framer-motion';

/**
 * ProfileHeader - Animated header component for profile pages
 * Features responsive design with mobile-optimized text and animations
 */
const ProfileHeader = ({ 
  title = "My Profile", 
  subtitle = "Your reading journey, connections, and literary adventures",
  mobileSubtitle = "Your reading journey & connections",
  icon = "👤",
  showIcon = true 
}) => {
  return (
    <motion.div
      className="text-center mb-4 sm:mb-8 relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-lora font-bold text-gradient mb-2 sm:mb-4 relative">
        {showIcon && <span className="hidden sm:inline">{icon} </span>}
        {title}
        <motion.div
          className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 bg-accent rounded-full opacity-20"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </h1>
      <motion.p
        className="font-open-sans text-primary/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <span className="hidden sm:inline">{subtitle}</span>
        <span className="sm:hidden">{mobileSubtitle}</span>
      </motion.p>
    </motion.div>
  );
};

export default ProfileHeader;
