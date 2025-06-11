import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ icon, title, desc }) => {
  return (
    <motion.div
      className="bookish-glass bookish-shadow p-6 rounded-xl text-center hover:bg-opacity-90 transition-all duration-300"
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-5xl mb-6 text-[var(--accent)]">{icon}</div>
      <h3 className="text-2xl font-['Lora'] text-[var(--primary)] mb-4">{title}</h3>
      <p className="text-[var(--text)] font-['Open_Sans'] leading-relaxed">{desc}</p>
    </motion.div>
  );
};

export default FeatureCard;