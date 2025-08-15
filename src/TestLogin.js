import React, { useEffect, useState } from 'react';
import { NhostClient } from '@nhost/nhost-js';

function TestLogin() {
  // Change this to your actual Nhost backend URL
  const nhost = new NhostClient({
    subdomain: 'fbjlcpshkpbwfdhhosrh',
    region: 'ap-south-1'
  });

  const [status, setStatus] = useState('Starting test...');

  useEffect(() => {
    const runTest = async () => {
      setStatus('Attempting login...');
      console.log('🔄 Trying to sign in...');

      try {
        const res = await nhost.auth.signIn({
          email: 'sannidhay2004@gmail.com',
          password: 'Golu@12345+'
        });

        console.log('📦 Raw response:', res);

        if (res.error) {
          console.error('❌ Login failed:', res.error);
          setStatus(`❌ Login failed: ${res.error.message} (Code: ${res.error.status || 'N/A'})`);
        } else {
          console.log('✅ Login success:', res.session);
          setStatus(`✅ Login success! User ID: ${res.session.user.id}`);
        }
      } catch (err) {
        console.error('🔥 Unexpected error:', err);
        setStatus(`🔥 Unexpected error: ${err.message}`);
      }
    };

    runTest();
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', color: 'white', background: '#222', height: '100vh' }}>
      <h1>Nhost Login Test</h1>
      <p>{status}</p>
      <p>Open the browser console for full details.</p>
    </div>
  );
}

export default TestLogin;
