// pages/purchases.js
import { useState, useEffect } from 'react';
import { useAuth } from '../src/authContext';
import supabase from '../supabaseClient';

const Purchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        const { data, error } = await supabase
          .from('purchases')
          .select('*')
          .eq('household_id', user.household_id);

        if (error) throw error;

        setPurchases(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.household_id) {
      fetchPurchases();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('purchases')
        .insert([{ item: newItem, quantity, household_id: user.household_id }]);

      if (error) throw error;

      setPurchases([...purchases, data[0]]);
      setNewItem('');
      setQuantity(1);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleComplete = async (purchaseId) => {
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ completed: true, completed_by: user.id, completed_at: new Date() })
        .eq('id', purchaseId);

      if (error) throw error;

      setPurchases(purchases.map(purchase => purchase.id === purchaseId ? { ...purchase, completed: true, completed_by: user.id, completed_at: new Date() } : purchase));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Einkaufsliste</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Artikel</label>
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Menge</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Hinzufügen
          </button>
        </form>
        <h2 className="text-xl font-bold mb-4">Einkaufsliste</h2>
        <ul>
          {purchases.map((purchase) => (
            <li key={purchase.id} className="mb-2 flex justify-between items-center">
              <div>
                <strong>{purchase.item}</strong> - {purchase.quantity}
              </div>
              <button
                onClick={() => handleComplete(purchase.id)}
                className="p-2 text-white bg-green-500 rounded hover:bg-green-600"
              >
                Erledigt
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Purchases;
