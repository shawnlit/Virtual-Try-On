import React from 'react'

const testimonials = [
    {
        brand: 'Nike',
        quote: 'Our headwear return rate dropped by more than a third after adding virtual try-on. It actually works.',
    },
    {
        brand: 'Ray-Ban',
        quote: 'Customers who use the try-on convert at 2× the rate. The frame tracking is solid.',
    },
    {
        brand: 'Gucci',
        quote: "We integrated it in a weekend. The SDK was clean, the docs were real — not just marketing copy.",
    },
]

function Testimonials() {
    return (
        <section className="section">
            <div className="section-label">What brands say</div>
            <div className="testimonial-grid">
                {testimonials.map(t => (
                    <div className="testimonial-card" key={t.brand}>
                        <div className="testimonial-header">
                            <span className="testimonial-brand">{t.brand}</span>
                            <span className="testimonial-stars">★★★★★</span>
                        </div>
                        <p className="testimonial-text">"{t.quote}"</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default Testimonials
