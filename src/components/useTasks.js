import { useState, useEffect } from 'react';

// Replace with actual Apps Script URL later
const MOCK_URL = null; // 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    if (!MOCK_URL) {
      // Mock data for UI testing
      setTasks([
        { id: '1', title: 'Comprar pan', status: 'To Do', assignedTo: 'Naxhito' },
        { id: '2', title: 'Lavar los platos', status: 'In Progress', assignedTo: 'Cualquiera' }
      ]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(MOCK_URL);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const updateTaskStatus = async (taskId, newStatus) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    
    if (MOCK_URL) {
      try {
        await fetch(MOCK_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'sync', tasks: updatedTasks }),
        });
      } catch (err) {
        console.error('Failed to sync tasks');
      }
    }
  };

  const addTask = async (newTask) => {
    const task = { ...newTask, id: Date.now().toString() };
    const updatedTasks = [...tasks, task];
    setTasks(updatedTasks);

    if (MOCK_URL) {
      try {
        await fetch(MOCK_URL, {
          method: 'POST',
          body: JSON.stringify({ action: 'sync', tasks: updatedTasks }),
        });
      } catch(err) {
        console.error('Failed to sync new task');
      }
    }
  }

  return { tasks, loading, error, updateTaskStatus, addTask };
}
