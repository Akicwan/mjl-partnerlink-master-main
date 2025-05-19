'use client'   //
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { Eye, EyeOff } from 'lucide-react'


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
 


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
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) {
          setError(sessionError.message)
          return
        }
        localStorage.setItem('supabaseSession', JSON.stringify(sessionData))
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#692B2C',
      padding: '1rem'
    }}>
      <form onSubmit={handleLogin} style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <img 
          src="/partnerlink.png" 
          alt="MJL PartnerLink Logo" 
          style={{ width: '450px', height: '150px', marginBottom: '1rem', objectFit: 'contain' }} 
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

          <div style={{ marginBottom: '1rem', width: '100%', position: 'relative' }}>
            <label style={{ color: 'black', fontSize: '14px' }}>Password:</label><br />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 10px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9',
                color: 'black',
                fontSize: '14px'
              }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                top: '70%',
                right: '10px',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#333',
                fontSize: '16px'
              }}
            >
                {showPassword ? (
                  <EyeOff 
                    size={20} 
                    style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }} 
                    onClick={() => setShowPassword(false)}
                  />
                ) : (
                  <Eye 
                    size={20} 
                    style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', cursor: 'pointer' }} 
                    onClick={() => setShowPassword(true)}
                  />
                )}
            </span>
          </div>

               


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
            transition: 'background-color 0.3s ease, transform 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#B78B29'
            e.target.style.transform = 'scale(1.02)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#D9AC42'
            e.target.style.transform = 'scale(1)'
          }}
        >
          Login
        </button>

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

      {/* Back to Public Page Button OUTSIDE the form */}
      <button
        type="button"
        onClick={() => router.push('/PublicPage')}
        style={{
          marginTop: '1.5rem',
          padding: '10px 20px',
          backgroundColor: '#1F2163',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = '#2e3192'
          e.target.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = '#1F2163'
          e.target.style.transform = 'scale(1)'
        }}
      >
        ← Back to Public Page
      </button>
    </div>
  )
}
