import React, { useState } from 'react';
import { Settings, Plus } from 'lucide-react';
import { useTasks } from './useTasks';
import './KanbanBoard.css';

const COLUMNS = ['To Do', 'In Progress', 'Done'];

export default function KanbanBoard({ onChangeProfile }) {
  const { tasks, loading, updateTaskStatus, addTask } = useTasks();
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');

  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTaskId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && targetStatus) {
      updateTaskStatus(taskId, targetStatus);
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask({ title: newTaskTitle, status: 'To Do', assignedTo: newTaskAssignee || 'Unassigned' });
      setNewTaskTitle('');
      setNewTaskAssignee('');
      setIsAdding(false);
    }
  };

  return (
    <div className="kanban-layout">
      <header className="kanban-header glass-panel">
        <div className="header-left">
          <h1>Kasa-ban</h1>
          <button className="btn-primary" onClick={() => setIsAdding(true)} style={{ marginLeft: '1rem' }}>
            <Plus size={18} /> Nueva Tarea
          </button>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={onChangeProfile}>
            <Settings size={18} /> Cambiar Vista
          </button>
        </div>
      </header>

      {isAdding && (
        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', gap: '1rem' }}>
          <input 
            placeholder="Título de la tarea" 
            value={newTaskTitle} 
            onChange={e => setNewTaskTitle(e.target.value)} 
          />
          <input 
            placeholder="Asignado a..." 
            value={newTaskAssignee} 
            onChange={e => setNewTaskAssignee(e.target.value)} 
          />
          <button className="btn-primary" onClick={handleAddTask}>Agregar</button>
          <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancelar</button>
        </div>
      )}

      <main className="kanban-board">
        {COLUMNS.map(col => (
          <div 
            key={col} 
            className="kanban-column glass-panel"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col)}
          >
            <h2>{col}</h2>
            <div className="kanban-tasks">
              {loading ? (
                <div className="loading-state">Cargando tareas...</div>
              ) : (
                tasks.filter(t => t.status === col).map(task => (
                  <div 
                    key={task.id} 
                    className="task-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <h3>{task.title}</h3>
                    <div className="task-meta">
                      <span className="task-assignee">{task.assignedTo}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
