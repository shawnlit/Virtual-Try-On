import React from 'react'

const stats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '1,200+', label: 'Frames & Hats' },
    { number: '40%', label: 'Fewer Returns' },
    { number: '4.9★', label: 'Average Rating' },
]

function StatsBar() {
    return (
        <div className="stats-bar">
            {stats.map(({ number, label }) => (
                <div className="stat-item" key={label}>
                    <span className="stat-number">{number}</span>
                    <span className="stat-label">{label}</span>
                </div>
            ))}
        </div>
    )
}

export default StatsBar
