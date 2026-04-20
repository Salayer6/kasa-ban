import { useState, useEffect, useCallback, useRef } from 'react';

// Replace with actual Apps Script URL later
const MOCK_URL = 'https://script.google.com/macros/s/AKfycbxFC13uELyjekZjXwzH047W8gaKS3pVYK0_dhMG42YBBEP2Up7b1rhItYL5qsIi3YlE/exec'; 

export function useTasks(pollingEnabled = true) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevTasksRef = useRef([]);

  const showNotification = (title, body) => {
    // Solo mostramos la notificación si la app NO es la pestaña activa (está en segundo plano)
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && document.hidden) {
      new Notification(title, { 
        body,
        icon: '/favicon.svg'
      });
    }
  };

  const fetchTasks = useCallback(async () => {
    if (!MOCK_URL || MOCK_URL.includes('YOUR_SCRIPT_ID')) {
      // Load from localStorage or use defaults
      const local = localStorage.getItem('kasa-ban-tasks');
      if (local) {
        try {
          setTasks(JSON.parse(local));
        } catch (e) {
          console.error('Failed to parse local tasks', e);
          localStorage.removeItem('kasa-ban-tasks');
        }
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
      setError(null);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(MOCK_URL, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      
      // Solo actualizamos si recibimos datos válidos (array)
      if (Array.isArray(data)) {
        // Detectamos cambios para notificar
        if (prevTasksRef.current && prevTasksRef.current.length > 0) {
          const newTasks = data.filter(nt => nt && nt.id && !prevTasksRef.current.find(ot => ot && String(ot.id) === String(nt.id)));
          const completedTasks = data.filter(nt => nt && nt.status === 'Done' && prevTasksRef.current.find(ot => ot && String(ot.id) === String(nt.id) && ot.status !== 'Done'));

          newTasks.forEach(t => showNotification('Nueva Tarea', `Alguien agregó: ${t.title}`));
          completedTasks.forEach(t => showNotification('¡Tarea Terminada!', `Se completó: ${t.title}`));
        }

        setTasks(data);
        prevTasksRef.current = data;
        localStorage.setItem('kasa-ban-tasks', JSON.stringify(data));
      } else if (data && data.error) {
        setError(data.error);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Error al conectar con la base de datos');
      
      // Fallback a localStorage si falla la red
      const local = localStorage.getItem('kasa-ban-tasks');
      if (local) {
        try {
          setTasks(JSON.parse(local));
        } catch (e) {
          localStorage.removeItem('kasa-ban-tasks');
        }
      }
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

  return { tasks, loading, error, updateTaskStatus, addTask, refetch: fetchTasks };
}

