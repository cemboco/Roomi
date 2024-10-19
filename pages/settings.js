// pages/settings.js
import { useState, useEffect } from 'react';
import { useAuth } from '../src/authContext';
import supabase from '../supabaseClient';

const Settings = () => {
  const { user, logout } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
    setLoading(false);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (password && newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error('Die neuen Passwörter stimmen nicht überein.');
        }

        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

        if (updateError) throw updateError;

        setError(null);
      } else if (email) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ email })
          .eq('id', user.id);

        if (updateError) throw updateError;

        setError(null);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { error: deleteError } = await supabase.auth.deleteUser();

      if (deleteError) throw deleteError;

      logout();
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">E-Mail ändern</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Aktuelles Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Neues Passwort</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Passwort bestätigen</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Änderungen speichern
          </button>
        </form>
        <button
          onClick={handleDeleteAccount}
          className="w-full p-2 text-white bg-red-500 rounded hover:bg-red-600 mt-4"
        >
          Konto löschen
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default Settings;
