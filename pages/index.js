// pages/index.js
import { useAuth } from '../src/authContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const Home = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Willkommen bei der Haushalts-WebApp</h1>
        <button
          onClick={() => router.push('/login')}
          className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600 mb-4"
        >
          Login
        </button>
        <button
          onClick={() => router.push('/signup')}
          className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600"
        >
          Registrieren
        </button>
      </div>
    </div>
  );
};

export default Home;
