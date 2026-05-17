import dynamic from "next/dynamic";
import styles from './styles.module.css';

// Import the new sections
import FeaturedTools from '../FeaturedTools';
import BenefitsSection from '../BenefitsSection';
import TestimonialsSection from '../TestimonialsSection';

const NewsletterSection = dynamic(() => import("../NewsletterSection"), {
  loading: () => null,
});

const HomePage = () => {

  return (
    <div className={styles["home-page"]}>
      <FeaturedTools />
      <BenefitsSection />
      <TestimonialsSection />
      <NewsletterSection />
    </div>
  );
};

export default HomePage;
