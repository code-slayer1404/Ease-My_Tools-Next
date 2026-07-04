// import styles from "./styles.module.css"

// const TestimonialsSection = () => {
//     const testimonials = [
//         {
//             text: "Set your custom target size and compress any image perfectly without losing quality!",
//             name: "Government Exam Aspirant",
//             role: "Verified User",
//         },
//         {
//             text: "As a student, these free tools are a lifesaver for my projects and assignments.",
//             name: "Graduate Student",
//             role: "University Student",
//         },
//         {
//             text: "The image tools are incredibly fast and produce professional-quality results.",
//             name: "Content Creator",
//             role: "Photographer",
//         },
//     ]

//     return (
//         <section className={styles["testimonials-section"]}>
//             <div className={`container`}>
//                 <h2>{"What Users Say"}</h2>
//                 <div className={styles["testimonials-grid"]}>
//                     {testimonials.map((testimonial, index) => (
//                         <div key={index} className={styles["testimonial-card"]}>
//                             <div className={styles["testimonial-content"]}>
//                                 <p>
//                                     {'"'}
//                                     {testimonial.text}
//                                     {'"'}
//                                 </p>
//                             </div>
//                             <div className={styles["testimonial-author"]}>
//                                 <strong>{testimonial.name}</strong>
//                                 <span>{testimonial.role}</span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         </section>
//     )
// }

// export default TestimonialsSection





import { Card, CardContent } from "@/components/ui/card"

const TestimonialsSection = () => {
    const testimonials = [
        {
            text: "Set your custom target size and compress any image perfectly without losing quality!",
            name: "Government Exam Aspirant",
            role: "Verified User",
        },
        {
            text: "As a student, these free tools are a lifesaver for my projects and assignments.",
            name: "Graduate Student",
            role: "University Student",
        },
        {
            text: "The image tools are incredibly fast and produce professional-quality results.",
            name: "Content Creator",
            role: "Photographer",
        },
        {
            text: "Instant Markdown rendering — supports text styling, quotes, lists, and code.",
            name: "Content Editor",
            role: "Editor",
        },
    ]

    return (
        <section className="bg-background py-16">
            <div className="container mx-auto px-4 sm:max-w-screen-2xl">
                <h2 className="mb-10 text-center text-3xl font-bold">
                    What Users Say
                </h2>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {testimonials.map((testimonial, index) => (
                        <Card
                            key={index}
                            className="shadow-md outline-1 transition-all duration-300 hover:shadow-lg"
                        >
                            <CardContent className="flex h-full flex-col justify-between p-6">
                                <p className="mb-4 text-xl text-muted-foreground italic">
                                    "{testimonial.text}"
                                </p>
                                <div className="mt-auto">
                                    <strong className="block text-base text-foreground">
                                        {testimonial.name}
                                    </strong>
                                    <span className="text-sm text-muted-foreground">
                                        {testimonial.role}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default TestimonialsSection









