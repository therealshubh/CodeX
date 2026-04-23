import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext.jsx';
import { VscClose, VscGithub, VscMail } from 'react-icons/vsc';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const action = isLogin ? login : register;
    const result = await action(email, password);

    if (!result.success) {
      setError(result.error);
    } else {
      onClose(); // Close modal on success
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      <div className="auth-overlay">
        <motion.div 
          className="auth-modal"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <button className="auth-close" onClick={onClose}>
            <VscClose size={24} />
          </button>

          <div className="auth-header">
            <div className="auth-logo">
              <div className="logo-icon">C</div>
            </div>
            <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
            <p>
              {isLogin 
                ? 'Enter your details to access your workspace.' 
                : 'Sign up to start building with Vibecode.'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label>Email address</label>
              <div className="input-with-icon">
                <VscMail className="input-icon" />
                <input 
                  type="email" 
                  autoFocus
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-block auth-submit"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign in' : 'Sign up')}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button className="btn btn-secondary btn-block auth-github">
            <VscGithub size={18} /> Continue with GitHub
          </button>

          <div className="auth-footer">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button className="text-link" onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
