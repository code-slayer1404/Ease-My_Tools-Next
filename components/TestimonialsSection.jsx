"use client";


import '../styles/TestimonialsSection.css';

const TestimonialsSection = () => {

  const testimonials = [
    {
      text: "This website saved me hours of work! The background removal tool is magical.",
      name: 'Sarah Chen',
      role: "Graphic Designer"
    },
    {
      text: "As a student, these free tools are a lifesaver for my projects and assignments.",
      name: 'Alex Rodriguez',
      role: "University Student"
    },
    {
      text: "The image tools are incredibly fast and produce professional-quality results.",
      name: 'Michael Thompson',
      role: "Photographer"
    }
  ];

  return (
    <section className="testimonials-section">
      <div className="container">
        <h2>{"Loved by Thousands of Users"}</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-content">
                <p>"{testimonial.text}"</p>
              </div>
              <div className="testimonial-author">
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