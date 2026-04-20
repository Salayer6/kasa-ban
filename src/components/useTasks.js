import { useState, useEffect, useCallback } from 'react';

// Replace with actual Apps Script URL later
const MOCK_URL = 'https://script.google.com/macros/s/AKfycbxFC13uELyjekZjXwzH047W8gaKS3pVYK0_dhMG42YBBEP2Up7b1rhItYL5qsIi3YlE/exec'; 

export function useTasks(pollingEnabled = true) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (!MOCK_URL || MOCK_URL.includes('YOUR_SCRIPT_ID')) {
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
      const res = await fetch(MOCK_URL);
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      // Solo actualizamos si recibimos datos válidos (array)
      if (Array.isArray(data)) {
        setTasks(data);
        localStorage.setItem('kasa-ban-tasks', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Error al conectar con la base de datos');
      
      // Fallback a localStorage si falla la red
      const local = localStorage.getItem('kasa-ban-tasks');
      if (local) setTasks(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    // Only set interval if we HAVE a real URL to poll from and polling is enabled
    let interval;
    if (MOCK_URL && pollingEnabled) {
      interval = setInterval(fetchTasks, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [fetchTasks]);

  const syncTasks = async (updatedTasks) => {
    // 1. Update UI and LocalStorage
    setTasks(updatedTasks);
    localStorage.setItem('kasa-ban-tasks', JSON.stringify(updatedTasks));

    // 2. Sync to Cloud
    if (MOCK_URL && !MOCK_URL.includes('YOUR_SCRIPT_ID')) {
      try {
        await fetch(MOCK_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'sync', tasks: updatedTasks }),
        });
      } catch (err) {
        console.error('Failed to sync tasks', err);
      }
    }
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const updated = tasks.map(t => {
      // Use String() to ensure comparison works even if Google Sheets converts ID to number
      return String(t.id) === String(taskId) ? { ...t, status: newStatus } : t;
    });
    syncTasks(updated);
  };

  const addTask = (newTask) => {
    const task = { ...newTask, id: Date.now().toString() };
    syncTasks([...tasks, task]);
  }

  return { tasks, loading, error, updateTaskStatus, addTask };
}

