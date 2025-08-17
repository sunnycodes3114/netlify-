import React, { useState, useEffect } from 'react';
import {
  useSignUpEmailPassword,
  useSignInEmailPassword,
  useAuthenticationStatus,
} from '@nhost/react';
import { useNavigate } from 'react-router-dom';
import { nhost } from '../lib/nhost';

function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [customError, setCustomError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [resendSuccess, setResendSuccess] = useState(null);

  const { signUpEmailPassword } = useSignUpEmailPassword();
  const { signInEmailPassword } = useSignInEmailPassword();
  const { isAuthenticated } = useAuthenticationStatus();

  const navigate = useNavigate();

  // Get URL params
  const params = new URLSearchParams(window.location.search);
  const shouldShowSignOutAll = params.get('logout');

  // Redirect only if authenticated AND not in logout mode
  useEffect(() => {
    if (isAuthenticated && !shouldShowSignOutAll) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, shouldShowSignOutAll]);

  // Mouse glow effect
  useEffect(() => {
    const handleMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // Typing animation for subtitle
  useEffect(() => {
    const messages = [
      'await chatbot.connect()',
      'initializing neural networks...',
      'establishing secure connection...',
      'ready for conversation ✨',
    ];
    let index = 0;
    let char = 0;

    const type = () => {
      const msg = messages[index];
      if (char <= msg.length) {
        setDisplayText(msg.slice(0, char));
        char++;
      } else {
        setTimeout(() => {
          char = 0;
          index = (index + 1) % messages.length;
        }, 2000);
      }
    };

    const interval = setInterval(type, 100);
    return () => clearInterval(interval);
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCustomError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setCustomError('Please fill in all fields.');
      return;
    }
    if (isSignUp && password.length < 6) {
      setCustomError('Password must be at least 6 characters long.');
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await signUpEmailPassword(email, password);

        if (error) {
          if (error.message?.includes('already exists')) {
            setCustomError('An account with this email already exists. Please sign in instead.');
          } else {
            setCustomError(error.message || 'Sign up failed. Please try again.');
          }
        } else {
          setSuccessMessage('A verification email has been sent!');
        }
      } else {
        const { error } = await signInEmailPassword(email, password);

        if (error) {
          const msg = (error.message || '').toLowerCase();

          if (msg.includes('email not verified') || msg.includes('unverified') || msg.includes('verify')) {
            setCustomError('📧 Your email is not verified. Please check your inbox for the verification link.');
          } else if (msg.includes('invalid') || msg.includes('credentials')) {
            setCustomError('❌ Invalid email or password.');
          } else if (msg.includes('too many attempts')) {
            setCustomError('🔒 Too many failed attempts. Try again later.');
          } else {
            setCustomError(`❌ ${error.message || 'Sign in failed.'}`);
          }
        } else {
          setSuccessMessage('✅ Signed in! Redirecting...');
          setTimeout(() => navigate('/dashboard'), 1000);
        }
      }
    } catch (err) {
      setCustomError(`❌ ${err.message || 'An unexpected error occurred.'}`);
    }
  };

  // Forgot password
  const handleForgotPassword = async () => {
    setCustomError(null);
    setSuccessMessage(null);

    if (!email) {
      setCustomError('Please enter your email.');
      return;
    }

    try {
      const { error } = await nhost.auth.resetPassword({
        email,
        redirectTo: `${window.location.origin}/change-password`,
      });

      if (error) {
        setCustomError(error.message || 'Failed to send reset link.');
      } else {
        setSuccessMessage('📩 Password reset link sent! Check your email.');
      }
    } catch (err) {
      setCustomError('Error sending reset email.');
    }
  };

  // Resend verification email
  const handleResendVerification = async () => {
    setCustomError(null);
    setResendSuccess(null);

    if (!email) {
      setCustomError('Please enter your email to resend verification.');
      return;
    }

    try {
      const { error } = await nhost.auth.sendVerificationEmail({ email });

      if (error) {
        setCustomError(error?.message || 'Failed to resend verification email.');
      } else {
        setResendSuccess('📧 Verification email has been resent! Check your inbox and spam folder.');
        setTimeout(() => setResendSuccess(null), 5000);
      }
    } catch (err) {
      setCustomError('Error sending verification email.');
    }
  };

  // Sign out from all devices (works even if not authenticated)
  const handleSignOutAll = async () => {
    try {
      const { error } = await nhost.auth.signOut({ all: true });
      if (error) throw error;

      setSuccessMessage('✅ Signed out of all devices. You can now sign in securely.');
    } catch (err) {
      setCustomError(`❌ Failed to sign out: ${err.message}`);
    }
  };

  // Floating particles
  const particles = Array.from({ length: 50 }, (_, i) => (
    <div
      key={i}
      className="particle"
      style={{
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 20}s`,
        animationDuration: `${15 + Math.random() * 10}s`,
      }}
    />
  ));

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div className="bg-animation" style={styles.bgAnimation} />

      {/* Particles */}
      <div className="particles-container" style={styles.particlesContainer}>
        {particles}
      </div>

      {/* Cursor Glow */}
      <div
        className="cursor-glow"
        style={{
          ...styles.cursorGlow,
          left: mousePosition.x - 100,
          top: mousePosition.y - 100,
        }}
      />

      {/* Left Side: Animated Sphere */}
      <div style={styles.leftSide}>
        <div style={styles.sphereContainer}>
          <div className="sphere-ring ring-1" style={styles.sphereRing1} />
          <div className="sphere-ring ring-2" style={styles.sphereRing2} />
          <div className="sphere-ring ring-3" style={styles.sphereRing3} />
          <div className="sphere" style={styles.sphere}>
            <div className="sphere-core" style={styles.sphereCore} />
          </div>
        </div>
        <div className="floating-element elem-1" style={styles.floatingElement1} />
        <div className="floating-element elem-2" style={styles.floatingElement2} />
        <div className="floating-element elem-3" style={styles.floatingElement3} />
      </div>

      {/* Right Side: Auth Form */}
      <div style={styles.rightSide}>
        <div style={styles.formContainer}>
          {/* Title */}
          <div className="title-container">
            <h1 style={styles.title}>
              {Array.from('CHATBOT').map((char, i) => (
                <span key={i} className="title-char" style={{ animationDelay: `${i * 0.1}s` }}>
                  {char}
                </span>
              ))}
            </h1>
            <div style={styles.titleUnderline} />
          </div>

          {/* Subtitle */}
          <div style={styles.subtitleContainer}>
            <p style={styles.subtitle}>
              {displayText}
              <span style={styles.cursorBlink}>|</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Email Input */}
            <div style={styles.inputContainer}>
              <div style={styles.inputIcon}>📧</div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                autoComplete="username"
              />
              <div style={styles.inputLine} />
            </div>

            {/* Password Input */}
            <div style={styles.inputContainer}>
              <div style={styles.inputIcon}>🔐</div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <div style={styles.inputLine} />
            </div>

            {/* Buttons */}
            <div style={styles.buttonContainer}>
              <button type="submit" style={styles.primaryButton}>
                {isSignUp ? 'Create Account' : 'Launch Chat'}
                <div style={styles.btnGlow} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setCustomError(null);
                  setSuccessMessage(null);
                }}
                style={styles.secondaryButton}
              >
                {isSignUp ? '← Sign In' : '✨ Sign Up'}
              </button>
            </div>
          </form>

          {/* Forgot Password */}
          {!isSignUp && (
            <button
              type="button"
              onClick={handleForgotPassword}
              style={styles.forgotPasswordButton}
            >
              Forgot Password?
            </button>
          )}

          {/* Success: Verification Sent */}
          {successMessage?.includes('verification') && (
            <div style={styles.verificationSuccess}>
              ✅ A verification email has been sent to <strong>{email}</strong>.<br />
              Please check your <strong>inbox and spam folder</strong> to verify your account.

              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  style={{
                    padding: '8px 16px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  📨 Resend Verification Email
                </button>
              </div>

              {resendSuccess && (
                <div style={{
                  marginTop: '10px',
                  fontSize: '13px',
                  color: '#69d27a',
                  fontWeight: '500',
                }}>
                  {resendSuccess}
                </div>
              )}
            </div>
          )}

          {/* Success: Other Messages (e.g. password reset) */}
          {successMessage && !successMessage.includes('verification') && (
            <div style={styles.successContainer} role="status">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {customError && (
            <div style={styles.errorContainer} role="alert">
              <p style={styles.error}>{customError}</p>
            </div>
          )}

          {/* 🔐 Sign Out of All Devices (Visible when ?logout is in URL) */}
          {shouldShowSignOutAll && (
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleSignOutAll}
                style={styles.signOutAllButton}
              >
                🔐 Sign Out of All Devices
              </button>
            </div>
          )}

          {/* Hint: Link to logout all */}
          {!shouldShowSignOutAll && (
            <p style={styles.logoutHint}>
              Forgot to log out?{' '}
              <a href="/login?logout" style={styles.logoutLink}>
                Terminate all sessions
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        .bg-animation {
          animation: bgShift 20s ease-in-out infinite;
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 20% 50%, #181b20 0%, #0f0f0f 50%, #16213e 100%);
          z-index: 0;
        }
        @keyframes bgShift {
          0%, 100% { background: radial-gradient(circle at 20% 50%, #181b20 0%, #0f0f0f 50%, #16213e 100%); }
          50% { background: radial-gradient(circle at 80% 50%, #16213e 0%, #0f0f0f 50%, #181b20 100%); }
        }

        .particle {
          position: absolute;
          width: 2px; height: 2px;
          background: rgba(102, 126, 234, 0.6);
          border-radius: 50%;
          animation: float linear infinite;
          z-index: 1;
        }
        @keyframes float {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }

        .sphere {
          width: 250px; height: 250px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #667eea 100%);
          filter: blur(1px);
          box-shadow: 0 0 100px rgba(102, 126, 234, 0.6), inset 0 0 50px rgba(255, 255, 255, 0.2);
          animation: sphereRotate 15s linear infinite, spherePulse 3s ease-in-out infinite;
          margin: auto;
        }
        @keyframes sphereRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spherePulse { 0%,100% { transform: scale(1); filter: brightness(1); } 50% { transform: scale(1.05); filter: brightness(1.2); } }

        .sphere-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(102, 126, 234, 0.4);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: ringRotate 10s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        .ring-1 { width: 300px; height: 300px; }
        .ring-2 { width: 350px; height: 350px; border-color: rgba(118,75,162,0.3); animation-duration: 15s; animation-direction: reverse; }
        .ring-3 { width: 400px; height: 400px; border-color: rgba(240,147,251,0.2); animation-duration: 20s; }
        @keyframes ringRotate { from { transform: scale(1); } to { transform: scale(1.1) rotate(360deg); } }

        .floating-element {
          position: absolute;
          border-radius: 50%;
          box-shadow: 0 0 20px #667eea;
          animation: float-random 8s ease-in-out infinite;
          pointer-events: none;
        }
        .elem-1 { width: 20px; height: 20px; top: 20%; right: 10%; background: linear-gradient(45deg, #667eea, #764ba2); animation-delay: 0s; }
        .elem-2 { width: 15px; height: 15px; bottom: 30%; left: 15%; background: linear-gradient(45deg, #f093fb, #f5576c); animation-delay: -2s; animation-duration: 10s; }
        .elem-3 { width: 25px; height: 25px; top: 60%; left: 20%; background: linear-gradient(45deg, #764ba2, #667eea); animation-delay: -4s; animation-duration: 12s; }
        @keyframes float-random {
          0%,100% { transform: translateY(0); rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(10px) rotate(240deg); }
        }

        .title-char {
          display: inline-block;
          animation: titleBounce 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        @keyframes titleBounce { to { opacity: 1; transform: translateY(0); } }

        .title-underline {
          height: 4px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-radius: 2px;
          margin-bottom: 30px;
          width: 0%;
          animation: underlineGrow 2s ease-out 1s forwards;
        }
        @keyframes underlineGrow { from { width: 0; } to { width: 100%; } }

        .cursor-blink {
          animation: blink 1s infinite;
          color: #8ab4f8;
          margin-left: 2px;
        }
        @keyframes blink { 0%,50% { opacity: 1; } 51%,100% { opacity: 0; } }

        .error-container {
          animation: errorSlideIn 0.5s ease-out;
        }
        @keyframes errorSlideIn {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ✅ Define styles AFTER component
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#181b20',
    color: '#fafafa',
    fontFamily: "'Inter', sans-serif",
  },
  bgAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  },
  cursorGlow: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 1,
    transition: 'all 0.1s ease',
  },
  leftSide: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden',
  },
  sphereContainer: {
    position: 'relative',
    width: '400px',
    height: '400px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sphereRing1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    border: '2px solid rgba(102, 126, 234, 0.4)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  sphereRing2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    border: '1px solid rgba(118, 75, 162, 0.3)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  sphereRing3: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    border: '1px solid rgba(240, 147, 251, 0.2)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  sphere: {
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'conic-gradient(from 0deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #667eea 100%)',
    filter: 'blur(1px)',
    boxShadow: '0 0 100px rgba(102, 126, 234, 0.6), inset 0 0 50px rgba(255, 255, 255, 0.2)',
    animation: 'sphereRotate 15s linear infinite, spherePulse 3s ease-in-out infinite',
  },
  sphereCore: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, transparent 70%)',
    filter: 'blur(2px)',
  },
  floatingElement1: {
    position: 'absolute',
    top: '20%',
    right: '10%',
    width: '20px',
    height: '20px',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    borderRadius: '50%',
    boxShadow: '0 0 20px rgba(102, 126, 234, 0.7)',
  },
  floatingElement2: {
    position: 'absolute',
    bottom: '30%',
    left: '15%',
    width: '15px',
    height: '15px',
    background: 'linear-gradient(45deg, #f093fb, #f5576c)',
    borderRadius: '50%',
    boxShadow: '0 0 15px rgba(240, 147, 251, 0.7)',
  },
  floatingElement3: {
    position: 'absolute',
    top: '60%',
    left: '20%',
    width: '25px',
    height: '25px',
    background: 'linear-gradient(45deg, #764ba2, #667eea)',
    borderRadius: '50%',
    boxShadow: '0 0 25px rgba(118, 75, 162, 0.7)',
  },
  rightSide: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 2,
  },
  formContainer: {
    background: 'rgba(255, 255, 255, 0.07)',
    borderRadius: '20px',
    padding: '40px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
  },
  title: {
    fontSize: '60px',
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: '2px',
    textShadow: '0 0 30px #667eea, 0 0 60px #764ba2',
    margin: 0,
  },
  titleUnderline: {
    height: '4px',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    borderRadius: '2px',
    marginBottom: '30px',
    width: '0%',
    animation: 'underlineGrow 2s ease-out 1s forwards',
  },
  subtitleContainer: {
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: 'Courier New, monospace',
    textAlign: 'center',
    minHeight: '30px',
  },
  cursorBlink: {
    color: '#8ab4f8',
    fontSize: '20px',
    marginLeft: '2px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    marginTop: '30px',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '15px',
    fontSize: '20px',
    zIndex: 3,
    color: '#ffffff',
  },
  input: {
    width: '100%',
    padding: '18px 18px 18px 50px',
    fontSize: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '2px solid rgba(255, 255, 255, 0.25)',
    borderRadius: '15px',
    color: '#ffffff',
    outline: 'none',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },
  inputLine: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    height: '2px',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    borderRadius: '1px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px',
  },
  primaryButton: {
    position: 'relative',
    padding: '18px 30px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '15px',
    border: 'none',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  btnGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    opacity: 0,
    borderRadius: '15px',
    pointerEvents: 'none',
  },
  secondaryButton: {
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: '500',
    borderRadius: '15px',
    border: '2px solid rgba(102, 126, 234, 0.6)',
    backgroundColor: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  },
  forgotPasswordButton: {
    marginTop: '10px',
    background: 'transparent',
    border: 'none',
    color: '#8ab4f8',
    textDecoration: 'underline',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'color 0.3s ease',
  },
  errorContainer: {
    marginTop: '20px',
    padding: '15px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    border: '1px solid rgba(255, 68, 68, 0.4)',
  },
  error: {
    color: '#ff4c4c',
    textAlign: 'center',
    margin: 0,
    fontSize: '14px',
    fontWeight: 'bold',
  },
  successContainer: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(0, 255, 0, 0.3)',
    color: 'green',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
  },
  resendButton: {
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '15px',
    border: 'none',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    cursor: 'pointer',
    width: '100%',
    marginBottom: '10px',
  },
  resendSuccessMessage: {
    marginTop: '10px',
    padding: '8px 12px',
    fontSize: '13px',
    color: '#69d27a',
    backgroundColor: 'rgba(105, 210, 122, 0.1)',
    borderRadius: '6px',
    border: '1px solid rgba(105, 210, 122, 0.2)',
    textAlign: 'center',
    fontWeight: '500',
    animation: 'fadeIn 0.3s ease-in',
  },
  signOutAllButton: {
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '15px',
    border: 'none',
    background: 'linear-gradient(45deg, #d63384, #c92a68)',
    color: 'white',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 5px 15px rgba(214, 51, 132, 0.4)',
    transition: 'all 0.3s ease',
  },
  logoutHint: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#ccc',
    marginTop: '30px',
  },
  logoutLink: {
    color: '#667eea',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  verificationSuccess: {
    marginTop: '20px',
    padding: '16px',
    fontSize: '15px',
    color: '#69d27a',
    backgroundColor: 'rgba(105, 210, 122, 0.15)',
    borderRadius: '10px',
    border: '1px solid rgba(105, 210, 122, 0.3)',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: '1.6',
    animation: 'fadeIn 0.4s ease-in',
  },
};

export default Login;
