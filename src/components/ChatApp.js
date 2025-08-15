import React from 'react';
import { useSignOut, useUserData } from '@nhost/react';

function ChatApp() {
  const user = useUserData();
  const { signOut } = useSignOut();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Chatbot App</h1>
        <div>
          <span>Welcome, {user?.email}!</span>
          <button onClick={signOut} style={{ marginLeft: '10px', padding: '8px 15px' }}>
            Sign Out
          </button>
        </div>
      </div>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>Chat functionality coming soon...</h3>
        <p>Authentication is working! ✅</p>
        <p>User ID: {user?.id}</p>
      </div>
    </div>
  );
}

export default ChatApp;
