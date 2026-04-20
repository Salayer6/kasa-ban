import React, { useState } from 'react';
import { Settings, Plus, Layout, ListTodo, Clock, CheckCircle2 } from 'lucide-react';
import { useTasks } from './useTasks';
import { translations } from './translations';
import './KanbanBoard.css';

const DB_COLUMNS = ['To Do', 'In Progress', 'Done'];
const USERS = ['Marco', 'Naxhito', 'Nena', 'Cualquiera'];

export default function KanbanBoard({ currentUser, onChangeProfile }) {
  const { tasks, loading, updateTaskStatus, addTask } = useTasks();
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [activeMobileColumn, setActiveMobileColumn] = useState('To Do');
  
  const t = translations[currentUser] || translations.Naxhito;
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser);

  // Map database column names to translated display names
  const displayColumns = DB_COLUMNS.map((dbName, index) => ({
    id: dbName,
    label: t.columns[index],
    icon: index === 0 ? <ListTodo size={20} /> : index === 1 ? <Clock size={20} /> : <CheckCircle2 size={20} />
  }));

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
      addTask({ title: newTaskTitle, status: 'To Do', assignedTo: newTaskAssignee || t.unassigned });
      setNewTaskTitle('');
      setNewTaskAssignee(currentUser);
      setIsAdding(false);
    }
  };

  return (
    <div className="kanban-layout">
      <header className="kanban-header glass-panel">
        <div className="header-left">
          <h1>Kasa-ban</h1>
          <button className="btn-primary" onClick={() => setIsAdding(true)} style={{ marginLeft: '1rem' }}>
            <Plus size={18} /> {t.newTask}
          </button>
        </div>
        <div className="header-right">
          <span className="user-greeting">{t.hello}, {currentUser}</span>
          <button className="btn-secondary" onClick={onChangeProfile}>
            <Settings size={18} /> {t.switchUser}
          </button>
        </div>
      </header>

      {isAdding && (
        <div className="task-add-form glass-panel">
          <input 
            placeholder={t.taskTitlePlaceholder} 
            value={newTaskTitle} 
            onChange={e => setNewTaskTitle(e.target.value)} 
          />
          <select 
            value={newTaskAssignee} 
            onChange={e => setNewTaskAssignee(e.target.value)}
          >
            {USERS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleAddTask}>{t.add}</button>
            <button className="btn-secondary" onClick={() => setIsAdding(false)}>{t.cancel}</button>
          </div>
        </div>
      )}

      <nav className="mobile-nav glass-panel">
        {displayColumns.map(col => (
          <button 
            key={col.id} 
            className={`mobile-nav-item ${activeMobileColumn === col.id ? 'active' : ''}`}
            onClick={() => setActiveMobileColumn(col.id)}
          >
            {col.icon}
            <span>{col.label}</span>
          </button>
        ))}
      </nav>

      <main className="kanban-board">
        {displayColumns.map(col => (
          <div 
            key={col.id} 
            className={`kanban-column glass-panel ${activeMobileColumn === col.id ? 'mobile-visible' : 'mobile-hidden'}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <h2>{col.icon} {col.label}</h2>
            <div className="kanban-tasks">
              {loading ? (
                <div className="loading-state">{t.loading}</div>
              ) : (
                tasks.filter(t => t.status === col.id).map(task => (
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

