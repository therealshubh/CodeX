import mongoose from 'mongoose';
const projectSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String
});
const Project = mongoose.model('Project', projectSchema);
export default Project;