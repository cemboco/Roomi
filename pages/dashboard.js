// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useAuth } from '../src/authContext';
import supabase from '../supabaseClient';

const Dashboard = () => {
  const { user } = useAuth();
  const [household, setHousehold] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHousehold = async () => {
      try {
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', user.household_id)
          .single();

        if (householdError) throw householdError;

        setHousehold(householdData);

        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('household_id', user.household_id);

        if (tasksError) throw tasksError;

        setTasks(tasksData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.household_id) {
      fetchHousehold();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">{household?.name}</h1>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Aufgaben</h2>
          <ul>
            {tasks.map((task) => (
              <li key={task.id} className="mb-2 flex justify-between items-center">
                <div>
                  <strong>{task.title}</strong> - {task.due_date ? new Date(task.due_date).toLocaleString() : 'Kein Termin'}
                </div>
                <button
                  onClick={() => handleComplete(task.id)}
                  className="p-2 text-white bg-green-500 rounded hover:bg-green-600"
                >
                  Erledigt
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => router.push('/tasks')}
          className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600"
        >
          Aufgaben verwalten
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
