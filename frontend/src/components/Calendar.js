import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import '../styles/Calendar.css';

function Calendar({ token, userId }) {
  const [currentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [tasks, setTasks] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchTasksForMonth();
  }, [currentMonth]);

  const fetchTasksForMonth = async () => {
    try {
      const response = await axios.get(API_URL + '/api/tasks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tasksByDate = {};
      response.data.forEach(task => {
        if (!tasksByDate[task.date]) {
          tasksByDate[task.date] = [];
        }
        tasksByDate[task.date].push(task);
      });
      setTasks(tasksByDate);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateClick = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedDate) {
      alert('Please enter a task title');
      return;
    }

    try {
      await axios.post(
        API_URL + '/api/tasks',
        { title: taskTitle, date: selectedDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTasksForMonth();
      setTaskTitle('');
      setShowModal(false);
    } catch (err) {
      alert('Error adding task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    const firstConfirm = window.confirm('⚠️ WARNING: Delete this task?\n\nThis action cannot be undone!');
    if (!firstConfirm) return;
    
    const secondConfirm = window.confirm('Are you absolutely sure you want to delete this task?');
    if (!secondConfirm) return;
    try {
      await axios.delete(API_URL + `/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasksForMonth();
    } catch (err) {
      alert('Error deleting task');
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const calendarDays = [];

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="calendar">
      <div className="calendar-header">
        <h2>Calendar</h2>
        <div className="month-navigation">
          <button
            onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)}
            disabled={currentMonth === 0}
          >
            ← Previous
          </button>
          <h3>{months[currentMonth]} {currentYear}</h3>
          <button
            onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)}
            disabled={currentMonth === 11}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {calendarDays.map((day, index) => {
            const dateStr = day ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
            const dayTasks = dateStr ? (tasks[dateStr] || []) : [];

            return (
              <div
                key={index}
                className={`calendar-day ${day ? 'active' : 'empty'}`}
                onClick={() => day && handleDateClick(day)}
              >
                {day && (
                  <>
                    <div className="day-number">{day}</div>
                    <div className="day-tasks">
                      {dayTasks.slice(0, 2).map(task => (
                        <div
                          key={task.id}
                          className="task-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          title="Click to delete"
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && <div className="task-more">+{dayTasks.length - 2} more</div>}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Task for {selectedDate}</h3>
            <form onSubmit={handleAddTask}>
              <div className="form-group">
                <label>Task Description</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Enter task description"
                  autoFocus
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Add Task
                </button>
              </div>
            </form>

            {tasks[selectedDate] && tasks[selectedDate].length > 0 && (
              <div className="tasks-list">
                <h4>Tasks on this date:</h4>
                {tasks[selectedDate].map(task => (
                  <div key={task.id} className="task-list-item">
                    {task.title}
                    <button
                      onClick={() => {
                        handleDeleteTask(task.id);
                        setShowModal(false);
                      }}
                      className="delete-task-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Calendar;
