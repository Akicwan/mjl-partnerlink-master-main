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
    const { data, error } = await supabase
      .from('profile_pictures')
      .select('profile_picture_url')
      .eq('user_id', userId)
      .single()

    if (data) {
      setPreview(data.profile_picture_url)
    }
  }

  const handleEmailUpdate = async () => {
    const { error } = await supabase.auth.updateUser({
      email: newEmail
    })
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

    // Upload to Supabase Storage
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

    // Get the uploaded file URL
    const { publicURL, error: urlError } = supabase
      .storage
      .from('profile-pictures')
      .getPublicUrl(fileName)

    if (urlError) {
      setUploading(false)
      alert('Failed to fetch URL: ' + urlError.message)
      return
    }

    // Insert the new profile picture URL into the profile_pictures table
    const { error: dbError } = await supabase
      .from('profile_pictures')
      .upsert({ user_id: user.id, profile_picture_url: publicURL }, { onConflict: ['user_id'] })

    setUploading(false)

    if (dbError) {
      alert('Failed to update profile picture URL: ' + dbError.message)
    } else {
      alert('Profile picture uploaded and updated!')
      fetchProfilePic(user.id)  // Refresh the profile picture
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-[#1F2163]">Admin Profile</h1>

        <div className="mb-4 text-center">
          {preview ? (
            <img src={preview} alt="Profile" className="w-32 h-32 rounded-full object-cover mx-auto" />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto" />
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Change Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-2 bg-[#D9AC42] text-white px-4 py-2 rounded-md hover:bg-[#FFB347]"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="mt-1 w-full border rounded-md px-3 py-2"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
          />
        </div>

        <button
          onClick={handleEmailUpdate}
          className="bg-[#1F2163] text-white px-4 py-2 rounded-md hover:bg-[#2c318f] w-full"
        >
          Update Email
        </button>
      </div>
    </div>
  )
}
