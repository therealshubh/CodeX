import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { VscArrowLeft, VscBook, VscCode, VscRobot } from 'react-icons/vsc';
import './Documentation.css';

export default function Documentation() {
  const navigate = useNavigate();

  return (
    <div className="docs-container">
      <nav className="docs-nav">
        <div className="docs-logo" onClick={() => navigate('/')}>
          <div className="logo-icon">V</div>
          <span>Vibecode</span>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          <VscArrowLeft /> Back to Home
        </button>
      </nav>

      <main className="docs-main">
        <motion.div 
          className="docs-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Documentation</h1>
          <p>Learn how to use Vibecode's AI-powered workspace to build faster.</p>
        </motion.div>

        <div className="docs-content">
          <motion.section 
            className="docs-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2><VscBook className="section-icon" /> Getting Started</h2>
            <p>
              Welcome to Vibecode! After logging in to your account, you will be taken to your personal workspace.
              The interface is divided into three main areas:
            </p>
            <ul>
              <li><strong>Sidebar (Left):</strong> Contains your File Explorer where you can create, rename, and delete files and folders.</li>
              <li><strong>Editor (Center):</strong> The main coding area equipped with a fully-featured code editor.</li>
              <li><strong>AI Assistant (Right):</strong> Your personal Grok AI chat window seamlessly integrated into the editor.</li>
            </ul>
          </motion.section>

          <motion.section 
            className="docs-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2><VscCode className="section-icon" /> File Management</h2>
            <p>
              Vibecode uses a virtual file system to manage your projects. Use the Sidebar to:
            </p>
            <div className="docs-card-grid">
              <div className="docs-card">
                <h3>Create Files</h3>
                <p>Click the "New File" icon at the top of the sidebar. Files are automatically saved as you type.</p>
              </div>
              <div className="docs-card">
                <h3>Organize</h3>
                <p>Create folders by clicking the "New Folder" icon to keep your growing codebase neat and organized.</p>
              </div>
            </div>
          </motion.section>

          <motion.section 
            className="docs-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2><VscRobot className="section-icon" /> AI Assistant (Grok)</h2>
            <p>
              The integrated AI Assistant is powered by the blazing fast Groq AI API. It acts as your expert programming language model.
            </p>
            <ul>
              <li><strong>Context Aware:</strong> The AI knows what files you have in your project and can read their contents.</li>
              <li><strong>Ask Questions:</strong> Need help debugging? Just ask the AI in the chat panel.</li>
              <li><strong>Code Generation:</strong> The AI can generate code snippets that you can directly insert into your open files.</li>
            </ul>
          </motion.section>
        </div>
      </main>
    </div>
  );
}
