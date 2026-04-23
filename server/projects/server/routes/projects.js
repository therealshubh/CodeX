import express from 'express';
import Project from '../models/Project';
const router = express.Router();
router.get('/', async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
});
export default router;