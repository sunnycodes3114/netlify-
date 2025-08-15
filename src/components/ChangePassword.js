import React, { useState, useEffect } from 'react';
import { useChangePassword } from '@nhost/react';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [errorMsg, setErrorMsg] = useState(null);

  const { changePassword, isLoading, isSuccess, isError, error } = useChangePassword();
  const navigate = useNavigate();

  // Cursor glow tracking
  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Particles like in Login
  const particles = Array.from({ length: 40 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${15 + Math.random() * 10}s`
      }}
    />
  ));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    await changePassword(newPassword);
  };

  if (isSuccess) {
    setTimeout(() => navigate('/login'), 2000);
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>✅ Password Updated</h2>
          <p style={styles.text}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div className="bg-animation" style={styles.bgAnimation}></div>
      <div style={styles.particlesContainer}>{particles}</div>
      <div
        className="cursor-glow"
        style={{
          ...styles.cursorGlow,
          left: mousePosition.x - 100,
          top: mousePosition.y - 100
        }}
      />
      <div style={styles.card}>
        <h2 style={styles.title}>Reset Your Password</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={styles.input}
          />

          {errorMsg && <p style={{ color: 'red', fontSize: '14px' }}>{errorMsg}</p>}
          {isError && <p style={{ color: 'red', fontSize: '14px' }}>{error?.message}</p>}

          <button type="submit" disabled={isLoading} style={styles.button}>
            {isLoading ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Animations */}
      <style>{`
        .bg-animation {
          animation: bgShift 20s ease-in-out infinite;
          background: radial-gradient(circle at 20% 50%, #181b20 0%, #0f0f0f 50%, #16213e 100%);
          position: absolute; top:0; left:0; right:0; bottom:0;
        }
        @keyframes bgShift {
          0%, 100% { background: radial-gradient(circle at 20% 50%, #181b20 0%, #0f0f0f 50%, #16213e 100%); }
          50% { background: radial-gradient(circle at 80% 50%, #16213e 0%, #0f0f0f 50%, #181b20 100%); }
        }
        .particle {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(102, 126, 234, 0.6);
          border-radius: 50%;
          animation: float linear infinite;
        }
        @keyframes float {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#121212',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    color: '#fff',
    overflow: 'hidden'
  },
  bgAnimation: { zIndex: 0 },
  cursorGlow: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 1
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1
  },
  card: {
    background: 'rgba(255, 255, 255, 0.07)',
    padding: '2rem',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    width: '320px',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  text: { textAlign: 'center', fontSize: '14px', color: '#ccc' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  input: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: '14px',
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    outline: 'none'
  },
  button: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer'
  }
};
