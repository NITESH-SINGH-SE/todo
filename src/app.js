const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const Task = require("../src/models/task");
require("../src/db/conn");

const app = express();
const PORT = 3000;
const JWT_SECRET = 'my_jwt_secret';


// Middleware for parsing JSON body
app.use(bodyParser.json());

// Middleware for JWT authentication
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    console.log(token);
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        console.log(JWT_SECRET);
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Create Task API
app.post('/api/tasks/create', authenticateToken, async (req, res) => {
    const { title, description, due_date, priority } = req.body;
    const user_id = req.user.id;

    try {
        const newTask = new Task({ title, description, due_date, user_id, priority });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Subtask API
app.put('/api/tasks/update/:task_id', authenticateToken, async (req, res) => {
    const { task_id } = req.params;
    const { due_date, status } = req.body;

    try {
        const updatedTask = await Task.findOneAndUpdate({ _id: task_id }, { due_date, status }, { new: true });
        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All User Tasks API
app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const userTasks = await Task.find({ user_id: req.user.id });
        res.json(userTasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get All User Subtasks API
app.get('/api/subtasks', authenticateToken, (req, res) => {
    // Implement logic to fetch subtasks based on filters
    const userSubtasks = subtasks.filter(subtask => subtask.userId === req.user.id);
    res.json(userSubtasks);
});

// Update Task API
app.put('/api/tasks/update/:task_id', authenticateToken, (req, res) => {
    const { task_id } = req.params;
    const { due_date, status } = req.body;

    const taskIndex = tasks.findIndex(task => task.id === parseInt(task_id));
    if (taskIndex !== -1) {
        tasks[taskIndex].due_date = due_date;
        tasks[taskIndex].status = status;
        res.sendStatus(200);
    } else {
        res.sendStatus(404); // Task not found
    }
});


// Update Subtask API
app.put('/api/subtasks/update/:subtask_id', authenticateToken, async (req, res) => {
    const { subtask_id } = req.params;
    const { status } = req.body;

    try {
        const updatedSubtask = await Subtask.findOneAndUpdate({ _id: subtask_id }, { status }, { new: true });
        if (!updatedSubtask) {
            return res.status(404).json({ error: 'Subtask not found' });
        }
        res.json(updatedSubtask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Delete Task API (Soft Deletion)
app.delete('/api/tasks/delete/:task_id', authenticateToken, async (req, res) => {
    const { task_id } = req.params;

    try {
        const deletedTask = await Task.findOneAndUpdate({ _id: task_id }, { deleted_at: new Date() }, { new: true });
        res.json(deletedTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Subtask API (Soft Deletion)
app.delete('/api/subtasks/delete/:subtask_id', authenticateToken, async (req, res) => {
    const { subtask_id } = req.params;

    try {
        const deletedSubtask = await Subtask.findOneAndUpdate({ _id: subtask_id }, { deleted_at: new Date() }, { new: true });
        if (!deletedSubtask) {
            return res.status(404).json({ error: 'Subtask not found' });
        }
        res.json(deletedSubtask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
