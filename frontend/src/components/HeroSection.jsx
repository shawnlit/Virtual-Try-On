import React from 'react'

function HeroSection({ onOpenModal }) {
    return (
        <div className="hero-band">
            <p className="hero-eyebrow">Virtual Try-On Studio</p>
            <h1>
                See how it looks<br />
                on <em>you</em>, first.
            </h1>
            <p>
                Pick a pair of glasses or a hat, enable your camera,
                and see it on your face. No filters, no gimmicks.
            </p>
            <div className="hero-actions">
                <button className="btn btn-dark" onClick={onOpenModal}>
                    Try something on
                </button>
                <button className="btn btn-outline">
                    Browse collection
                </button>
            </div>
        </div>
    )
}

export default HeroSection
