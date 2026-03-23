import React from 'react'

const steps = [
    {
        n: 'Step 01',
        title: 'Pick a product',
        desc: 'Choose a frame or hat from our collection. Each one is mapped for real-time positioning.',
    },
    {
        n: 'Step 02',
        title: 'Allow camera',
        desc: "We'll ask for camera permission once. Nothing is recorded or uploaded — it all stays on your device.",
    },
    {
        n: 'Step 03',
        title: 'See it live',
        desc: 'The accessory appears on your face instantly. Move around, check all angles.',
    },
]

function HowItWorks() {
    return (
        <section className="section">
            <div className="section-label">How it works</div>
            <div className="steps-grid">
                {steps.map(({ n, title, desc }) => (
                    <div className="step-card" key={n}>
                        <div className="step-number">{n}</div>
                        <h3>{title}</h3>
                        <p>{desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default HowItWorks
