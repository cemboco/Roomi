// pages/onboarding.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/authContext';
import supabase from '../supabaseClient';

const Onboarding = () => {
  const [householdName, setHouseholdName] = useState('');
  const [householdType, setHouseholdType] = useState('');
  const [householdCode, setHouseholdCode] = useState('');
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (householdCode) {
        // Join household by code
        const { data, error } = await supabase
          .from('households')
          .select('id')
          .eq('code', householdCode)
          .single();

        if (error) throw error;

        await supabase
          .from('users')
          .update({ household_id: data.id })
          .eq('id', user.id);

        router.push('/dashboard');
      } else {
        // Create new household
        const { data, error } = await supabase
          .from('households')
          .insert([{ name: householdName, type: householdType, code: generateCode() }])
          .select('id')
          .single();

        if (error) throw error;

        await supabase
          .from('users')
          .update({ household_id: data.id })
          .eq('id', user.id);

        router.push('/dashboard');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const generateCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6">Onboarding</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Name des Haushalts</label>
            <input
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Haushaltsform</label>
            <select
              value={householdType}
              onChange={(e) => setHouseholdType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Wähle eine Form</option>
              <option value="WG">WG</option>
              <option value="Familie">Familie</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Haushaltscode (optional)</label>
            <input
              type="text"
              value={householdCode}
              onChange={(e) => setHouseholdCode(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Weiter
          </button>
        </form>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default Onboarding;
