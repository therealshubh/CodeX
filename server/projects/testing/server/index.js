import express from 'express';
import mongoose from 'mongoose';
import todoRoutes from './routes/todo.js';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use('/api/todos', todoRoutes);

mongoose.connect('mongodb://localhost:27017/todos')
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));