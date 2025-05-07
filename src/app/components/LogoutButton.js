import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('An error occurred during logout', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-blue-900 text-white px-4 py-2 rounded-md mt-4 transition duration-300 ease-in-out hover:bg-blue-700 hover:shadow-md cursor-pointer"
    >
      Logout
    </button>
  );
}
