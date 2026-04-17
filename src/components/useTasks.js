import { useState, useEffect, useCallback } from 'react';

// Replace with actual Apps Script URL later
const MOCK_URL = null; // 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec'

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!MOCK_URL) {
      // Load from localStorage or use defaults
      const local = localStorage.getItem('kasa-ban-tasks');
      if (local) {
        setTasks(JSON.parse(local));
      } else {
        const defaults = [
          { id: '1', title: 'Comprar pan', status: 'To Do', assignedTo: 'Naxhito' },
          { id: '2', title: 'Lavar los platos', status: 'In Progress', assignedTo: 'Cualquiera' }
        ];
        setTasks(defaults);
        localStorage.setItem('kasa-ban-tasks', JSON.stringify(defaults));
      }
      setLoading(false);
      return;
    }

    try {
      // Use no-cache to ensure we get latest from Sheets
      const res = await fetch(MOCK_URL);
      const data = await res.json();
      setTasks(data);
      localStorage.setItem('kasa-ban-tasks', JSON.stringify(data));
    } catch (err) {
      setError('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    
    // Only set interval if we HAVE a real URL to poll from
    let interval;
    if (MOCK_URL) {
      interval = setInterval(fetchTasks, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchTasks]);

  const syncTasks = async (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem('kasa-ban-tasks', JSON.stringify(updatedTasks));
    
    if (MOCK_URL) {
      try {
        // Apps Script sometimes prefers text/plain to avoid CORS preflight, 
        // but we treat it as JSON in the backend.
        await fetch(MOCK_URL, {
          method: 'POST',
          mode: 'no-cors', // Common for Apps Script Simple POSTs
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify({ action: 'sync', tasks: updatedTasks }),
        });
      } catch (err) {
        console.error('Failed to sync tasks', err);
      }
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    await syncTasks(updatedTasks);
  };

  const addTask = async (newTask) => {
    const task = { ...newTask, id: Date.now().toString() };
    const updatedTasks = [...tasks, task];
    await syncTasks(updatedTasks);
  }

  return { tasks, loading, error, updateTaskStatus, addTask };
}

