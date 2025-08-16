import React, { useState, useEffect } from 'react';
import {
  useSignUpEmailPassword,
  useSignInEmailPassword,
  useSignOut,
  useAuthenticationStatus,
  useResetPassword
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

  const { signUpEmailPassword, isLoading: signUpLoading } = useSignUpEmailPassword();
  const { signInEmailPassword, isLoading: signInLoading } = useSignInEmailPassword();
  const { signOut } = useSignOut();
  const { isAuthenticated } = useAuthenticationStatus();
  const { resetPassword, isLoading: resetLoading } = useResetPassword();

  const navigate = useNavigate();

  // Redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Mouse cursor glow effect tracking
  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Typing animation subtitle effect
  useEffect(() => {
    const messages = [
      'await chatbot.connect()',
      'initializing neural networks...',
      'establishing secure connection...',
      'ready for conversation ✨'
    ];
    let messageIndex = 0;
    let charIndex = 0;

    const typeMessage = () => {
      const currentMessage = messages[messageIndex];
      setDisplayText(currentMessage.slice(0, charIndex));
      charIndex++;
      if (charIndex > currentMessage.length) {
        setTimeout(() => {
          charIndex = 0;
          messageIndex = (messageIndex + 1) % messages.length;
        }, 2000);
      }
    };

    const interval = setInterval(typeMessage, 100);
    return () => clearInterval(interval);
  }, []);

  // Sign up/sign in handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setCustomError(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        const { data, error } = await signUpEmailPassword(email, password);
        if (error) {
          setCustomError(`${error.message} (Code: ${error.status || 'N/A'})`);
          return;
        }
        if (data?.user) {
          setSuccessMessage('✅ Sign up successful! Redirecting...');
          navigate('/dashboard');
        }
      } else {
        const { data, error } = await signInEmailPassword(email, password);
        if (error) {
          setCustomError(`${error.message} (Code: ${error.status || 'N/A'})`);
          return;
        }
        if (data?.user) {
          setSuccessMessage('✅ Sign in successful! Redirecting...');
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setCustomError(`${err.message || 'Unknown error'}${err.status ? ` (Code: ${err.status})` : ''}`);
    }
  };

  // Forgot password handler
  const handleForgotPassword = async () => {
    setCustomError(null);
    setSuccessMessage(null);
    if (!email) {
      setCustomError('Please enter your email to reset password.');
      return;
    }
    try {
      await resetPassword(email, {
        redirectTo: window.location.origin + '/change-password'
      });
      setSuccessMessage('📩 Password reset link sent! Check your email.');
    } catch (err) {
      console.error('Password reset error:', err);
      setCustomError(err.message || 'Error sending password reset email.');
    }
  };

  // Sign out of all devices handler
  const signOutAllDevices = async () => {
    try {
      await signOut();
      await nhost.auth.signOut({ all: true });
      setCustomError(null);
      setSuccessMessage('✅ Signed out of all devices.');
      navigate('/login');
    } catch (error) {
      setCustomError(`Sign out failed: ${error.message || 'Unknown error'}`);
    }
  };

  // Particles generation
  const particles = Array.from({ length: 50 }, (_, i) => (
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

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div className="bg-animation" style={styles.bgAnimation} />
      {/* Floating particles */}
      <div className="particles-container" style={styles.particlesContainer}>
        {particles}
      </div>
      {/* Cursor glow */}
      <div
        className="cursor-glow"
        style={{
          ...styles.cursorGlow,
          left: mousePosition.x - 100,
          top: mousePosition.y - 100,
        }}
      />

      {/* Left side: sphere + floating elements */}
      <div style={styles.leftSide}>
        <div className="sphere-container" style={styles.sphereContainer}>
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

      {/* Right side: auth form */}
      <div style={styles.rightSide}>
        <div className="form-container" style={styles.formContainer}>
          {/* Title */}
          <div className="title-container">
            <h1 style={styles.title}>
              {'CHATBOT'.split('').map((char, i) => (
                <span key={i} className="title-char" style={{ animationDelay: `${i * 0.1}s` }}>
                  {char}
                </span>
              ))}
            </h1>
            <div className="title-underline" style={styles.titleUnderline} />
          </div>

          {/* Subtitle */}
          <div className="subtitle-container" style={styles.subtitleContainer}>
            <p style={styles.subtitle}>
              {displayText}
              <span className="cursor-blink" style={styles.cursorBlink}>|</span>
            </p>
          </div>

          {/* Auth form */}
          <form onSubmit={handleSubmit} style={styles.form} className="login-form">
            {/* Email input */}
            <div className="input-container" style={styles.inputContainer}>
              <div className="input-icon" style={styles.inputIcon}>📧</div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                className="animated-input"
                autoComplete="username"
              />
              <div className="input-line" style={styles.inputLine} />
            </div>

            {/* Password input */}
            <div className="input-container" style={styles.inputContainer}>
              <div className="input-icon" style={styles.inputIcon}>🔐</div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={styles.input}
                className="animated-input"
                autoComplete={isSignUp ? "new-password" : "current-password"}
              />
              <div className="input-line" style={styles.inputLine} />
            </div>

            {/* Submit + toggle buttons */}
            <div className="button-container" style={styles.buttonContainer}>
              <button
                type="submit"
                disabled={signUpLoading || signInLoading}
                style={styles.primaryButton}
                className="primary-btn"
              >
                {signUpLoading || signInLoading ? 'Loading...' : isSignUp ? 'Create Account' : 'Launch Chat'}
                <div className="btn-glow" style={styles.btnGlow} />
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setCustomError(null);
                  setSuccessMessage(null);
                }}
                style={styles.secondaryButton}
                className="secondary-btn"
              >
                {isSignUp ? '← Sign In Instead' : '✨ New User? Sign Up'}
              </button>
            </div>
          </form>

          {/* Forgot Password Button */}
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            style={{
              marginTop: '10px',
              background: 'transparent',
              border: 'none',
              color: '#8ab4f8',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {resetLoading ? 'Sending reset...' : 'Forgot Password?'}
          </button>

          {/* Error message */}
          {customError && (
            <div className="error-container" style={styles.errorContainer}>
              <p style={styles.error}>⚠️ {customError}</p>
            </div>
          )}

          {/* Success message */}
          {successMessage && (
            <div style={styles.successContainer}>
              {successMessage}
            </div>
          )}

          {/* Sign out all devices */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={signOutAllDevices}
              style={styles.signOutButton}
            >
              🔒 Sign Out of All Devices
            </button>
          )}
        </div>
      </div>

      {/* Styled JSX with all your animations */}
      <style jsx>{`
        .bg-animation {
          animation: bgShift 20s ease-in-out infinite;
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 20% 50%, #181b20 0%, #0f0f0f 50%, #16213e 100%);
          z-index: 0;
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
          z-index: 1;
        }
        @keyframes float {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }
        .sphere {
          position: relative;
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: conic-gradient(from 0deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #667eea 100%);
          filter: blur(1px);
          box-shadow: 0 0 100px rgba(102, 126, 234, 0.6), inset 0 0 50px rgba(255, 255, 255, 0.2);
          animation: sphereRotate 15s linear infinite, spherePulse 3s ease-in-out infinite;
          margin: auto;
          z-index: 2;
        }
        @keyframes sphereRotate { from { transform: rotate(0deg);} to {transform: rotate(360deg);} }
        @keyframes spherePulse { 0%,100%{transform: scale(1); filter: brightness(1);} 50% {transform: scale(1.05); filter: brightness(1.2);} }
        .sphere-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid rgba(102, 126, 234, 0.4);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: ringRotate 10s linear infinite;
          pointer-events: none;
          z-index: 1;
        }
        .ring-1 { width: 300px; height: 300px; }
        .ring-2 {
          width: 350px;
          height: 350px;
          border-color: rgba(118, 75, 162, 0.3);
          animation-duration: 15s;
          animation-direction: reverse;
        }
        .ring-3 {
          width: 400px;
          height: 400px;
          border-color: rgba(240, 147, 251, 0.2);
          animation-duration: 20s;
        }
        @keyframes ringRotate { from { transform: rotate(0deg) scale(1);} to { transform: rotate(360deg) scale(1.1);} }
        .floating-element {
          position: absolute;
          border-radius: 50%;
          box-shadow: 0 0 20px #667eea;
          animation: float-random 8s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        .elem-1 {
          width: 20px;
          height: 20px;
          top: 20%;
          right: 10%;
          background: linear-gradient(45deg, #667eea, #764ba2);
          animation-delay: 0s;
        }
        .elem-2 {
          width: 15px;
          height: 15px;
          bottom: 30%;
          left: 15%;
          background: linear-gradient(45deg, #f093fb, #f5576c);
          animation-delay: -2s;
          animation-duration: 10s;
        }
        .elem-3 {
          width: 25px;
          height: 25px;
          top: 60%;
          left: 20%;
          background: linear-gradient(45deg, #764ba2, #667eea);
          animation-delay: -4s;
          animation-duration: 12s;
        }
        @keyframes float-random {
          0%, 100% { transform: translateY(0px) rotate(0deg);}
          33% { transform: translateY(-20px) rotate(120deg);}
          66% { transform: translateY(10px) rotate(240deg);}
        }
        .title-char {
          display: inline-block;
          animation: titleBounce 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(30px);
        }
        @keyframes titleBounce {
          to { opacity: 1; transform: translateY(0px); }
        }
        .title-underline {
          height: 4px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-radius: 2px;
          margin-bottom: 30px;
          width: 0%;
          animation: underlineGrow 2s ease-out 1s forwards;
        }
        @keyframes underlineGrow { from { width: 0;} to { width: 100%;} }
        .cursor-blink {
          animation: blink 1s infinite;
          color: #8ab4f8;
          font-size: 20px;
          margin-left: 2px;
        }
        @keyframes blink {
          0%,50% { opacity: 1;}
          51%,100% { opacity: 0;}
        }
        .login-form {
          animation: formSlideIn 1s ease-out 0.5s both;
        }
        @keyframes formSlideIn {
          from { transform: translateX(50px); opacity: 0;}
          to { transform: translateX(0); opacity: 1;}
        }
        .animated-input:focus + .input-line {
          animation: inputLineFocus 0.3s ease-out forwards;
        }
        @keyframes inputLineFocus {
          from { transform: scaleX(0);}
          to { transform: scaleX(1);}
        }
        .primary-btn:hover .btn-glow {
          animation: btnGlowPulse 1.5s ease-in-out infinite;
        }
        @keyframes btnGlowPulse {
          0%, 100% { opacity: 0.5; transform: scale(1);}
          50% { opacity: 1; transform: scale(1.05);}
        }
        .secondary-btn:hover {
          animation: btnShake 0.5s ease-in-out;
        }
        @keyframes btnShake {
          0%, 100% { transform: translateX(0);}
          25% { transform: translateX(-5px);}
          75% { transform: translateX(5px);}
        }
        .error-container {
          animation: errorSlideIn 0.5s ease-out;
        }
        @keyframes errorSlideIn {
          from { transform: translateY(-20px); opacity: 0;}
          to { transform: translateY(0); opacity: 1;}
        }
        .btn-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, #667eea, #764ba2);
          opacity: 0;
          border-radius: 15px;
        }
        .error {
          color: #ff4c4c;
          text-align: center;
          margin: 0;
          font-size: 14px;
          font-weight: bold;
        }
        .success-container {
          margin-top: 20px;
          padding: 15px;
          background-color: rgba(0, 255, 0, 0.1);
          border-radius: 10px;
          border: 1px solid rgba(0, 255, 0, 0.3);
          color: green;
          text-align: center;
          font-weight: bold;
          font-size: 16px;
        }
        .signOutButton {
          margin-top: 15px;
          padding: 12px 20px;
          border-radius: 25px;
          border: none;
          background: linear-gradient(45deg, #ff4e50, #f9d423);
          color: white;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          width: 100%;
          font-size: 16px;
          user-select: none;
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#181b20',
    color: '#fafafa',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  bgAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0
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
  cursorGlow: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: 1,
    transition: 'all 0.1s ease'
  },
  leftSide: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden'
  },
  sphereContainer: {
    position: 'relative',
    width: '400px',
    height: '400px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  sphereRing1: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    border: '2px solid rgba(102, 126, 234, 0.4)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  sphereRing2: {
    position: 'absolute',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    border: '1px solid rgba(118, 75, 162, 0.3)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  sphereRing3: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    border: '1px solid rgba(240, 147, 251, 0.2)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  },
  sphere: {
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    background: 'conic-gradient(from 0deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #667eea 100%)',
    position: 'relative',
    filter: 'blur(1px)',
    boxShadow: '0 0 100px rgba(102, 126, 234, 0.6), inset 0 0 50px rgba(255, 255, 255, 0.2)',
    animation: 'sphereRotate 15s linear infinite, spherePulse 3s ease-in-out infinite'
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
    filter: 'blur(2px)'
  },
  floatingElement1: {
    position: 'absolute',
    top: '20%',
    right: '10%',
    width: '20px',
    height: '20px',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    borderRadius: '50%',
    boxShadow: '0 0 20px rgba(102, 126, 234, 0.7)'
  },
  floatingElement2: {
    position: 'absolute',
    bottom: '30%',
    left: '15%',
    width: '15px',
    height: '15px',
    background: 'linear-gradient(45deg, #f093fb, #f5576c)',
    borderRadius: '50%',
    boxShadow: '0 0 15px rgba(240, 147, 251, 0.7)'
  },
  floatingElement3: {
    position: 'absolute',
    top: '60%',
    left: '20%',
    width: '25px',
    height: '25px',
    background: 'linear-gradient(45deg, #764ba2, #667eea)',
    borderRadius: '50%',
    boxShadow: '0 0 25px rgba(118, 75, 162, 0.7)'
  },
  rightSide: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '40px',
    maxWidth: '600px',
    position: 'relative',
    zIndex: 2
  },
  formContainer: {
    background: 'rgba(255, 255, 255, 0.07)',
    borderRadius: '20px',
    padding: '40px',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
  },
  title: {
    fontSize: '60px',
    fontWeight: '800',
    marginBottom: '10px',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: '2px',
    textShadow: '0 0 30px #667eea, 0 0 60px #764ba2'
  },
  titleUnderline: {
    height: '4px',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    borderRadius: '2px',
    marginBottom: '30px',
    width: '0%',
    animation: 'underlineGrow 2s ease-out 1s forwards'
  },
  subtitleContainer: {
    minHeight: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  subtitle: {
    fontSize: '20px',
    color: '#ffffff',
    fontFamily: "'Courier New', monospace",
    textAlign: 'center',
    minHeight: '30px'
  },
  cursorBlink: {
    color: '#8ab4f8',
    fontSize: '20px',
    marginLeft: '2px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    marginTop: '30px'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '15px',
    fontSize: '20px',
    zIndex: 3,
    color: '#ffffff'
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
    backdropFilter: 'blur(10px)'
  },
  inputLine: {
    position: 'absolute',
    bottom: '0',
    left: '0',
    height: '2px',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    borderRadius: '1px'
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginTop: '20px'
  },
  primaryButton: {
    position: 'relative',
    padding: '18px 30px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '15px',
    border: 'none',
    cursor: 'pointer',
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    color: 'white',
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
  },
  btnGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, #667eea, #764ba2)',
    opacity: 0,
    borderRadius: '15px'
  },
  secondaryButton: {
    padding: '15px 30px',
    fontSize: '16px',
    fontWeight: '500',
    borderRadius: '15px',
    border: '2px solid rgba(102, 126, 234, 0.6)',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    color: '#fff',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },
  errorContainer: {
    marginTop: '20px',
    padding: '15px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 68, 68, 0.15)',
    border: '1px solid rgba(255, 68, 68, 0.4)'
  },
  error: {
    color: '#ff4c4c',
    textAlign: 'center',
    margin: 0,
    fontSize: '14px',
    fontWeight: 'bold'
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
    fontSize: '16px'
  },
  signOutButton: {
    marginTop: '15px',
    padding: '12px 20px',
    borderRadius: '25px',
    border: 'none',
    background: 'linear-gradient(45deg, #ff4e50, #f9d423)',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    width: '100%',
    fontSize: '16px',
    userSelect: 'none'
  }
};

export default Login;
