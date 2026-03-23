import React, { useRef } from 'react'

function FeatureCard({ icon, title, description, accentBorder, accentIcon, onClick }) {
    const cardRef = useRef(null)

    const handleMouseMove = (e) => {
        const rect = cardRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        cardRef.current.style.setProperty('--mouse-x', `${x}px`)
        cardRef.current.style.setProperty('--mouse-y', `${y}px`)
    }

    return (
        <div
            ref={cardRef}
            className="card"
            onMouseMove={handleMouseMove}
            onClick={onClick}
            style={accentBorder ? { borderColor: 'var(--accent)' } : {}}
        >
            <div
                className="card-icon"
                style={accentIcon ? { color: 'var(--accent)' } : {}}
            >
                {icon}
            </div>
            <h3>{title}</h3>
            <p style={{ fontSize: '0.9rem' }}>{description}</p>
        </div>
    )
}

function FeatureCards({ onTryOnClick }) {
    const cards = [
        {
            icon: '📸',
            title: 'Virtual Tryon',
            description: 'Enable camera to start scanning.',
            accentBorder: false,
            accentIcon: false,
            onClick: onTryOnClick,
        },
        {
            icon: '👕',
            title: 'Select Apparel',
            description: 'Browse our library of 500+ brands.',
            accentBorder: false,
            accentIcon: false,
            onClick: null,
        },
        {
            icon: '🚀',
            title: 'Go Pro',
            description: 'Unlock 4K rendering and video try-ons.',
            accentBorder: true,
            accentIcon: true,
            onClick: null,
        },
    ]

    return (
        <section className="section">
            <h2>Start Creating Your Look</h2>
            <p>Select a mode to begin your virtual styling session.</p>
            <div className="grid-cards">
                {cards.map((card) => (
                    <FeatureCard key={card.title} {...card} />
                ))}
            </div>
        </section>
    )
}

export default FeatureCards
