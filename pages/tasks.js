// pages/tasks.js
import { useState, useEffect } from 'react';
import { useAuth } from '../src/authContext';
import supabase from '../supabaseClient';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [points, setPoints] = useState(1);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: newTask, due_date: dueDate, points, created_by: user.id, household_id: user.household_id }]);

      if (error) throw error;

      setTasks([...tasks, data[0]]);
      setNewTask('');
      setDueDate('');
      setPoints(1);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: true, completed_at: new Date() })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: true, completed_at: new Date() } : task));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Aufgaben</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700">Titel</label>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Frist</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Punkte</label>
            <input
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
            Aufgabe hinzufügen
          </button>
        </form>
        <h2 className="text-xl font-bold mb-4">Aufgabenliste</h2>
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
    </div>
  );
};

export default Tasks;
