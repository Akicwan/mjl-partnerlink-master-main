'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSendResetLink = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:3000/login/change-password', // or your deployed URL
    })

    if (error) {
      setIsSuccess(false)
      setMessage(error.message)
    } else {
      setIsSuccess(true)
      setMessage('Password reset link sent! Check your email.')
    }
  }

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#692B2C',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <form onSubmit={handleSendResetLink} style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <h2 style={{ textAlign: 'center', color: '#692B2C' }}>Reset Your Password</h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
            color: 'black',
          }}
        />

        <button type="submit" style={{
          padding: '10px',
          backgroundColor: '#D9AC42',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}>
          Send Reset Link
        </button>

        {message && (
          <p style={{
            color: isSuccess ? 'green' : 'red',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
