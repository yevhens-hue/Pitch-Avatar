import React, { useState } from 'react';
import styles from './AuthModal.module.css';
import { supabase } from '../../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        alert("Check your email for confirmation!");
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        <h2 className={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</h2>
        <p className={styles.subtitle}>
          {isLogin ? 'Welcome back to Pitch Avatar.' : 'Start creating interactive presentations.'}
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div style={{color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input 
              type="email" 
              className={styles.input} 
              placeholder="Email address" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
          
          {isLogin && (
            <button 
              type="button" 
              className={styles.demoBtn} 
              onClick={() => {
                setEmail('admin@pitch-avatar.com');
                setPassword('admin12345');
              }}
            >
              Try Demo Account
            </button>
          )}
        </form>


        <div className={styles.switchMode}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Create an account' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
