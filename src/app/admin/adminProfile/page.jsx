'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AdminProfilePage() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [profilePic, setProfilePic] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        router.push('/login')
      } else {
        setUser(data.user)
        setEmail(data.user.email)
        setNewEmail(data.user.email)
        fetchProfilePic(data.user.id)
      }
    }

    fetchUser()
  }, [router])

  const fetchProfilePic = async (userId) => {
    const { data } = await supabase
      .from('profile_pictures')
      .select('profile_picture_url')
      .eq('user_id', userId)
      .single()

    if (data) setPreview(data.profile_picture_url)
  }

  const handleEmailUpdate = async () => {
    const { error } = await supabase.auth.updateUser({ email: newEmail })
    if (error) {
      alert('Error updating email: ' + error.message)
    } else {
      alert('Email updated successfully!')
      setEmail(newEmail)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setProfilePic(file)
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setPreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!profilePic || !user) return
    setUploading(true)

    const fileName = `${user.id}/profile.jpg`
    const { error: uploadError } = await supabase
      .storage
      .from('profile-pictures')
      .upload(fileName, profilePic, { upsert: true })

    if (uploadError) {
      setUploading(false)
      alert('Upload failed: ' + uploadError.message)
      return
    }

    const { publicURL, error: urlError } = supabase
      .storage
      .from('profile-pictures')
      .getPublicUrl(fileName)

    if (urlError) {
      setUploading(false)
      alert('Failed to fetch URL: ' + urlError.message)
      return
    }

    const { error: dbError } = await supabase
      .from('profile_pictures')
      .upsert({ user_id: user.id, profile_picture_url: publicURL }, { onConflict: ['user_id'] })

    setUploading(false)

    if (dbError) {
      alert('Failed to update profile picture URL: ' + dbError.message)
    } else {
      alert('Profile picture uploaded and updated!')
      fetchProfilePic(user.id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <button
          onClick={() => router.push('/admin')}
          className="text-sm text-gray-600 mb-6 hover:underline"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-semibold text-[#1F2163] mb-6 text-center">Admin Profile</h1>

        {/* Profile Picture */}
        <div className="mb-6 text-center">
          <div className="w-32 h-32 rounded-full mx-auto border border-gray-300 overflow-hidden mb-2">
            {preview ? (
              <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mt-2 text-sm" />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-2 bg-[#D9AC42] text-white px-4 py-2 rounded-md hover:bg-[#FFB347] text-sm"
          >
            {uploading ? 'Uploading...' : 'Upload Picture'}
          </button>
        </div>

        {/* Email Update */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
          <button
            onClick={handleEmailUpdate}
            className="mt-3 bg-[#1F2163] text-white w-full py-2 rounded-md hover:bg-[#2c318f] text-sm"
          >
            Update Email
          </button>
        </div>
      </div>
    </div>
  )
}
