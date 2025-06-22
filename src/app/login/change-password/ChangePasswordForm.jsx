'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient'; // double-check this path too

export default function ChangePasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('access_token');

  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const exchangeToken = async () => {
      if (accessToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: accessToken,
        });
        if (error) {
          setMessage('Session error: ' + error.message);
        }
      }
    };

    exchangeToken();
  }, [accessToken]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setIsSuccess(false);
      setMessage(error.message);
    } else {
      setIsSuccess(true);
      setMessage('Password changed successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#692B2C',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <form onSubmit={handlePasswordChange} style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <h2 style={{ textAlign: 'center', color: '#692B2C' }}>Set New Password</h2>

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
          Change Password
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
  );
}
