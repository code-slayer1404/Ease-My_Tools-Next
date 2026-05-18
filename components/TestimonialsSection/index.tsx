import styles from './styles.module.css';

const TestimonialsSection = () => {

  const testimonials = [
    {
      text: "This website saved me hours of work! The background removal tool is magical.",
      name: 'Product Designer',
      role: "Graphic Designer"
    },
    {
      text: "As a student, these free tools are a lifesaver for my projects and assignments.",
      name: 'Graduate Student',
      role: "University Student"
    },
    {
      text: "The image tools are incredibly fast and produce professional-quality results.",
      name: 'Content Creator',
      role: "Photographer"
    }
  ];

  return (
    <section className={styles["testimonials-section"]}>
      <div className={`container`}>
        <h2>{"What Users Say"}</h2>
        <div className={styles["testimonials-grid"]}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles["testimonial-card"]}>
              <div className={styles["testimonial-content"]}>
                <p>{"\""}{testimonial.text}{"\""}</p>
              </div>
              <div className={styles["testimonial-author"]}>
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
