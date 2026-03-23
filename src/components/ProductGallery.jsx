import React, { useState, useEffect } from 'react'

const products = [
    { id: 1, category: 'glasses', emoji: '🕶', name: 'Urban Aviator', brand: 'Luxottica', price: '$149', modelPath: '/models/glasses1.glb' },
    { id: 2, category: 'glasses', emoji: '👓', name: 'Modern Square', brand: 'Ray-Ban', price: '$220', modelPath: '/models/glasses2.glb' },
    { id: 3, category: 'hats', emoji: '🧢', name: 'Street Cap V1', brand: 'Adidas', price: '$35', modelPath: '/models/cap1.glb' },
    { id: 4, category: 'hats', emoji: '🧢', name: 'Pro Series Cap', brand: 'Nike', price: '$45', modelPath: '/models/cap2.glb' },
]

const TABS = [
    { key: 'all', label: 'All' },
    { key: 'glasses', label: 'Glasses' },
    { key: 'hats', label: 'Hats' },
]

function ProductGallery({ onTryOnClick, activeTab: externalActiveTab }) {
    const [activeTab, setActiveTab] = useState(externalActiveTab || 'all')

    useEffect(() => {
        if (externalActiveTab) {
            setActiveTab(externalActiveTab)
        }
    }, [externalActiveTab])

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
