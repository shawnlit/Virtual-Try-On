import React, { useState } from 'react'

function LoginModal({ onClose, onLogin }) {
    const [isSignup, setIsSignup] = useState(true)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const endpoint = isSignup ? '/api/signup' : '/api/login'
        const body = isSignup ? { email, password, name } : { email, password }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed')
            }

            // Successfully authenticated
            if (isSignup) {
                alert('Account created! Please check your email for verification.')
                setIsSignup(false)
            } else {
                onLogin(data.user)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className="login-container">
                <div className="login-left">
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2>Try it on before you take it home.</h2>
                        <p style={{ marginTop: 8 }}>
                            {isSignup ? 'Create a free account to save your try-ons.' : 'Welcome back! Sign in to continue.'}
                        </p>
                    </div>
                </div>

                <div className="login-right">
                    <h2>{isSignup ? 'Create an account' : 'Sign in'}</h2>
                    <p className="login-subtitle">
                        {isSignup ? 'Free forever. No credit card required.' : 'Enter your credentials to access your account.'}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        {isSignup && (
                            <input
                                type="text"
                                placeholder="First name"
                                className="input-field"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            className="input-field"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 8, textAlign: 'center' }}>
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="btn btn-dark"
                            style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : (isSignup ? 'Create account & start trying on' : 'Sign in')}
                        </button>
                    </form>

                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 14, textAlign: 'center' }}>
                        {isSignup ? (
                            <>
                                Already have an account?{' '}
                                <span
                                    style={{ color: 'var(--text-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => { setIsSignup(false); setError('') }}
                                >
                                    Sign in
                                </span>
                            </>
                        ) : (
                            <>
                                Don't have an account?{' '}
                                <span
                                    style={{ color: 'var(--text-primary)', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => { setIsSignup(true); setError('') }}
                                >
                                    Create account
                                </span>
                            </>
                        )}
                    </p>

                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 8, textAlign: 'center' }}>
                        By continuing you agree to our Terms and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginModal
