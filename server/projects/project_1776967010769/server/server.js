import express from 'express';
import mongoose from 'mongoose';
const app = express();
app.use(express.json());
mongoose.connect('mongodb://localhost/jnv', { useNewUrlParser: true, useUnifiedTopology: true });
app.listen(5000, () => console.log('Server started on port 5000'));