"use client";


import { useTheme } from '../contexts/ThemeContext';
import '../styles/HomePage.css';

// Import the new sections
import FeaturedTools from './FeaturedTools';
import BenefitsSection from './BenefitsSection';
import TestimonialsSection from './TestimonialsSection';
import NewsletterSection from './NewsletterSection';

const HomePage = () => {
  const { theme } = useTheme();

  return (
    <div className={`home-page ${theme}`}>
      <FeaturedTools />
      <BenefitsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
};

export default HomePage;