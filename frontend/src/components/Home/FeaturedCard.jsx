import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, desc }) => {
  return (
    <motion.div
      className="bookish-glass bookish-shadow p-4 md:p-6 rounded-xl text-center hover:bg-opacity-90 transition-all duration-300"
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-3xl md:text-5xl mb-4 md:mb-6 text-[var(--accent)]">{icon}</div>
      <h3 className="text-lg md:text-2xl font-['Lora'] text-[var(--primary)] mb-3 md:mb-4">{title}</h3>
      <p className="text-sm md:text-base text-[var(--text)] font-['Open_Sans'] leading-relaxed">{desc}</p>
    </motion.div>
  );
};

export default FeatureCard;