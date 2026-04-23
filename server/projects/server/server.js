import express from 'express';
import mongoose from 'mongoose';
const app = express();
const port = 5000;
app.use(express.json());
mongoose.connect('mongodb://localhost:27017/portfolio', { useNewUrlParser: true, useUnifiedTopology: true });
app.listen(port, () => console.log(`Server started on port ${port}`));