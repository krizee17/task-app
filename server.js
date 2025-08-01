const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'LOGIN')));

// In-memory storage for tasks (in a real app, you'd use a database)
let tasks = [
  {
    id: '1',
    name: 'Workshop Task',
    description: 'Complete the workshop assignment',
    status: 'in-progress',
    dueDate: '2024-01-15',
    category: 'Work',
    createdAt: new Date().toISOString(),
    completed: false
  },
  {
    id: '2',
    name: 'Complete Figma Task',
    description: 'Design the user interface in Figma',
    status: 'to-do',
    dueDate: '2024-01-20',
    category: 'Design',
    createdAt: new Date().toISOString(),
    completed: false
  },
  {
    id: '3',
    name: 'Complete Portswigger lab',
    description: 'Finish the cybersecurity lab exercises',
    status: 'to-do',
    dueDate: '2024-01-25',
    category: 'Study',
    createdAt: new Date().toISOString(),
    completed: false
  }
];

// API Routes

// Get all tasks
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

// Get task by ID
app.get('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// Create new task
app.post('/api/tasks', (req, res) => {
  const { name, description, dueDate, category } = req.body;
  
  if (!name || !description) {
    return res.status(400).json({ error: 'Task name and description are required' });
  }

  const newTask = {
    id: uuidv4(),
    name,
    description,
    status: 'to-do',
    dueDate: dueDate || null,
    category: category || 'General',
    createdAt: new Date().toISOString(),
    completed: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// Update task
app.put('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const { name, description, status, dueDate, category, completed } = req.body;
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    name: name || tasks[taskIndex].name,
    description: description || tasks[taskIndex].description,
    status: status || tasks[taskIndex].status,
    dueDate: dueDate || tasks[taskIndex].dueDate,
    category: category || tasks[taskIndex].category,
    completed: completed !== undefined ? completed : tasks[taskIndex].completed
  };

  res.json(tasks[taskIndex]);
});

// Delete task
app.delete('/api/tasks/:id', (req, res) => {
  const taskIndex = tasks.findIndex(t => t.id === req.params.id);
  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const deletedTask = tasks.splice(taskIndex, 1)[0];
  res.json({ message: 'Task deleted successfully', task: deletedTask });
});

// Clear all tasks
app.delete('/api/tasks', (req, res) => {
  tasks = [];
  res.json({ message: 'All tasks cleared successfully' });
});

// Get tasks by status
app.get('/api/tasks/status/:status', (req, res) => {
  const status = req.params.status;
  const filteredTasks = tasks.filter(task => task.status === status);
  res.json(filteredTasks);
});

// Get today's tasks
app.get('/api/tasks/today', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return true;
    return task.dueDate === today;
  });
  res.json(todayTasks);
});

// Serve the main dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'LOGIN', 'dashboard.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/tasks`);
}); 