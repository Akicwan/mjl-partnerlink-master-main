'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (event) => {
    event.preventDefault()

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      return
    }

    const user = data.user
    if (user) {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        setError(profileError.message)
        return
      }

      if (rememberMe) {
        // Save the session for persistent login (cookies or localStorage can be used here)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          setError(sessionError.message)
          return
        }
        localStorage.setItem('supabaseSession', JSON.stringify(sessionData)) // Storing session info in localStorage
      }

      if (userProfile.role === 'admin') {
        router.push('/admin')
      } else if (userProfile.role === 'partner') {
        router.push('/partner')
      } else {
        setError('Invalid role or access denied.')
      }
    }
  }

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', backgroundColor: '#692B2C'
    }}>
      <form onSubmit={handleLogin} style={{
        backgroundColor: 'white', padding: '2rem', borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '400px',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <img 
          src="/MJL-logo.png" 
          alt="MJL PartnerLink Logo" 
          style={{ width: '150px', height: '150px', marginBottom: '1rem', objectFit: 'contain' }} 
        />

        <div style={{ marginBottom: '1rem', width: '100%' }}>
          <label style={{ color: 'black', fontSize: '14px' }}>Email:</label><br />
          <input
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px',
              backgroundColor: '#f9f9f9', color: 'black', fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '0.5rem', width: '100%' }}>
          <label style={{ color: 'black', fontSize: '14px' }}>Password:</label><br />
          <input
            type="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px',
              backgroundColor: '#f9f9f9', color: 'black', fontSize: '14px'
            }}
          />
        </div>

        {/* Remember Me Checkbox */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          <label htmlFor="rememberMe" style={{ fontSize: '14px', color: 'black' }}>
            Remember Me
          </label>
        </div>

        {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            border: 'none',
            borderRadius: '4px',
            backgroundColor: '#D9AC42',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
          }}
          className="transition duration-300 ease-in-out transform hover:bg-[#B78B29] hover:scale-105"
        >
          Login
        </button>

        {/* Redirect to reset-password page */}
        <p
          onClick={() => router.push('/login/reset-password')}
          style={{
            marginTop: '1rem',
            color: '#692B2C',
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline'
          }}
        >
          Forgot Password?
        </p>
      </form>
    </div>
  )
}
