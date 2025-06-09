'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = async (event) => {
    event.preventDefault()
    const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })

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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{
        background: 'linear-gradient(to bottom, #692B2C, #1F2163)',
      }}
    >
      {/* Back Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => router.push('/PublicPage')}
          className="bg-white text-[#1F2163] px-4 py-2 rounded-full text-sm font-medium shadow hover:shadow-md transition hover:scale-105"
        >
          ← Back to Public Page
        </button>
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="bg-white w-full max-w-md p-8 rounded-xl shadow-xl"
      >
        <div className="flex justify-center mb-6">
          <img
            src="/partnerlink.png"
            alt="PartnerLink Logo"
            className="w-[300px] object-contain"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#D9AC42]"
          />
        </div>

        <div className="mb-4 relative">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#D9AC42]"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-gray-600 cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>

        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-700">
            Remember Me
          </label>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-4">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-[#D9AC42] hover:bg-[#c6983b] text-white font-semibold py-2 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
        >
          Login
        </button>

        <p
          onClick={() => router.push('/login/reset-password')}
          className="text-sm text-center mt-4 text-[#692B2C] underline cursor-pointer"
        >
          Forgot Password?
        </p>
      </form>
    </div>
  )
}
