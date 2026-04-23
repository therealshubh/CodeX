import React from 'react';
import { motion } from 'framer-motion';
import Project from './components/Project';
function App() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
      <h1>My Portfolio</h1>
      <Project />
    </motion.div>
  );
}
export default App;