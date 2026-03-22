import React, { useState } from 'react'

const products = [
    { id: 1, category: 'glasses', emoji: '🕶', name: 'Aviator Pro', brand: 'Ray-Ban', price: '$149' },
    { id: 2, category: 'glasses', emoji: '👓', name: 'Round Classic', brand: 'Persol', price: '$220' },
    { id: 3, category: 'glasses', emoji: '🕶', name: 'Cat-Eye Slim', brand: 'Gucci', price: '$390' },
    {
        id: 4, category: 'hats', emoji: '🧢', name: "Snapback '96", brand: 'Nike', price: '$45'
    },
    { id: 5, category: 'hats', emoji: '🎩', name: 'Wool Fedora', brand: 'Stetson', price: '$120' },
    { id: 6, category: 'hats', emoji: '👒', name: 'Raffia Brim', brand: 'H&M', price: '$35' },
]

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'glasses', label: 'Glasses' },
    { key: 'hats', label: 'Hats' },
]

function ProductGallery({ onTryOnClick }) {
    const [activeTab, setActiveTab] = useState('all')

    const filtered = activeTab === 'all'
        ? products
        : products.filter(p => p.category === activeTab)

    return (
        <section className="section">
            <div className="section-label">Collection</div>

            <div className="filter-tabs">
                {TABS.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`filter-tab${activeTab === key ? ' active' : ''}`}
                        onClick={() => setActiveTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <div className="product-grid">
                {filtered.map(product => (
                    <div key={product.id} className="product-card">
                        <button
                            className="product-card-try-btn"
                            onClick={() => onTryOnClick(product)}
                        >
                            Try on
                        </button>
                        <span className="product-card-emoji">{product.emoji}</span>
                        <div className="product-card-name">{product.name}</div>
                        <div className="product-card-brand">{product.brand}</div>
                        <div className="product-card-price">{product.price}</div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default ProductGallery
