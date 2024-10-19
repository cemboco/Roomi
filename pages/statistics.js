// pages/statistics.js
import { useState, useEffect } from 'react';
import { useAuth } from '../src/authContext';
import supabase from '../supabaseClient';

const Statistics = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('household_id', user.household_id);

        if (error) throw error;

        setTasks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.household_id) {
      fetchTasks();
    }
  }, [user]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const taskStats = tasks.reduce((acc, task) => {
    if (task.completed) {
      acc.completed++;
      acc.totalPoints += task.points;
      if (task.created_by in acc.userStats) {
        acc.userStats[task.created_by].completed++;
        acc.userStats[task.created_by].totalPoints += task.points;
      } else {
        acc.userStats[task.created_by] = { completed: 1, totalPoints: task.points };
      }
    }
    return acc;
  }, { completed: 0, totalPoints: 0, userStats: {} });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Statistiken</h1>
        <div className="mb-6">
          <h2 className="text-xl font-bold">Gesamt</h2>
          <p>Erledigte Aufgaben: {taskStats.completed}</p>
          <p>Gesamte Punkte: {taskStats.totalPoints}</p>
        </div>
        <div>
          <h2 className="text-xl font-bold">Pro Benutzer</h2>
          <ul>
            {Object.entries(taskStats.userStats).map(([userId, stats]) => (
              <li key={userId} className="mb-2">
                <strong>Benutzer {userId}</strong>
                <p>Erledigte Aufgaben: {stats.completed}</p>
                <p>Gesamte Punkte: {stats.totalPoints}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
