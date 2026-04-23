import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();
const Todo = mongoose.model('Todo', {
  title: String,
  completed: Boolean
});

router.get('/', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching todos' });
  }
});

router.post('/', async (req, res) => {
  try {
    const todo = new Todo(req.body);
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ message: 'Error creating todo' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(todo);
  } catch (err) {
    res.status(404).json({ message: 'Todo not found' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Todo deleted successfully' });
  } catch (err) {
    res.status(404).json({ message: 'Todo not found' });
  }
});

export default router;