// src/components/Dashboard.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUserData, useSignOut } from '@nhost/react';
import { useQuery, useMutation, useSubscription, gql } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

function TypingAnimation() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', color: '#ff9800', fontWeight: 'bold', margin: '1rem 0 1rem 8px' }}>
      <span style={{ marginRight: 12 }}>Bot is typing</span>
      <span className="typing-dot" style={dotStyle}></span>
      <span className="typing-dot" style={{ ...dotStyle, animationDelay: '0.2s' }}></span>
      <span className="typing-dot" style={{ ...dotStyle, animationDelay: '0.4s' }}></span>
      <style>{`
        .typing-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: #ff9800;
          border-radius: 50%;
          margin-left: 4px;
          animation: bounce 1s infinite;
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const dotStyle = {
  display: 'inline-block',
  width: '10px',
  height: '10px',
  background: '#ff9800',
  borderRadius: '50%',
  marginLeft: '4px',
  animation: 'bounce 1s infinite'
};

// GraphQL definitions
const GET_CHATS = gql`
  query GetChats($userId: uuid!) {
    chats(where: { user_id: { _eq: $userId } }, order_by: { created_at: desc }) {
      id
      title
      created_at
    }
  }
`;

const CREATE_CHAT = gql`
  mutation CreateChat($title: String!, $userId: uuid!) {
    insert_chats_one(object: { title: $title, user_id: $userId }) {
      id
      title
      created_at
    }
  }
`;

const DELETE_CHAT = gql`
  mutation DeleteChat($chatId: uuid!) {
    delete_chats_by_pk(id: $chatId) {
      id
    }
  }
`;

const GET_MESSAGES_SUB = gql`
  subscription OnMessageAdded($chatId: uuid!) {
    messages(
      where: { chat_id: { _eq: $chatId } }
      order_by: { created_at: asc }
    ) {
      id
      user_id
      content
      created_at
      is_bot
    }
  }
`;

const SEND_MESSAGE = gql`
  mutation SendMessage($chatId: uuid!, $content: String!) {
    insert_messages_one(
      object: {
        chat_id: $chatId
        content: $content
        is_bot: false
      }
    ) {
      id
      content
      created_at
      is_bot
    }
  }
`;

const N8N_WEBHOOK_URL = 'https://sannidhay.app.n8n.cloud/webhook/73d68716-0d4f-488b-b03c-355b47c2badb';

export default function Dashboard() {
  const user = useUserData();
  const navigate = useNavigate();
  const { signOut } = useSignOut();

  const [selectedChat, setSelectedChat] = useState(null);
  const [chatTitle, setChatTitle] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [botLoading, setBotLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: chatData, loading: chatsLoading, error: chatsError, refetch: refetchChats } = useQuery(GET_CHATS, {
    variables: { userId: user?.id },
    skip: !user
  });

  const [createChat, { loading: createLoading }] = useMutation(CREATE_CHAT, {
    onCompleted: (data) => {
      setChatTitle('');
      refetchChats();
      if (data?.insert_chats_one?.id) setSelectedChat(data.insert_chats_one.id);
    }
  });

  const [deleteChat] = useMutation(DELETE_CHAT, {
    onCompleted: () => refetchChats()
  });

  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE);

  const { data: msgData, loading: msgsLoading, error: msgsError } = useSubscription(GET_MESSAGES_SUB, {
    variables: { chatId: selectedChat },
    skip: !selectedChat
  });

  const filteredChats = useMemo(() => {
    if (!chatData?.chats) return [];
    return chatData.chats.filter(chat => chat.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [chatData, searchTerm]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [msgData]);

  // Hide typing animation when bot reply arrives
  useEffect(() => {
    if (botLoading && msgData?.messages) {
      const lastBotMsg = msgData.messages.filter(m => m.is_bot).slice(-1)[0];
      if (lastBotMsg && new Date(lastBotMsg.created_at) > new Date(Date.now() - 5 * 60 * 1000)) {
        setBotLoading(false);
      }
    }
  }, [msgData, botLoading]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const createNewChat = () => {
    if (!chatTitle.trim()) return;
    createChat({ variables: { title: chatTitle, userId: user.id } });
  };

  const sendNewMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    await sendMessage({ variables: { chatId: selectedChat, content: message } });
    setMessage('');
    setBotLoading(true);

    fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-user-id': user.id
      },
      body: JSON.stringify({
        input: {
          chat_id: selectedChat,
          content: message
        }
      }),
    }).catch((err) => {
      console.error('Failed to trigger n8n bot:', err);
      setBotLoading(false);
    });
  };

  const handleDeleteChat = async (chatId) => {
    if (!window.confirm('Are you sure you want to delete this chat and all its messages?')) return;
    await deleteChat({ variables: { chatId } });
    const remainingChats = chatData?.chats.filter(c => c.id !== chatId) || [];
    setSelectedChat(remainingChats.length > 0 ? remainingChats[0].id : null);
  };

  return (
    <div style={{ height: '100vh', background: '#121212', color: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Top Bar */}
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'flex-end', background: '#15161a' }}>
        <button
          onClick={handleSignOut}
          style={{ background: '#ff4e50', border: 'none', padding: '8px 14px', color: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
        >
          🔒 Sign Out
        </button>
      </div>
      {/* Main Section */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: 250, borderRight: '1px solid #333', padding: 16, display: 'flex', flexDirection: 'column' }}>
          {/* Search */}
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ marginBottom: 12, padding: '0.5rem', borderRadius: 6, border: '1px solid #555', background: '#23243c', color: 'white', fontSize: 15 }}
          />
          {/* Chats List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {chatsLoading && <p>Loading chats...</p>}
            {chatsError && <p style={{ color: 'red' }}>Error loading chats</p>}
            {!chatsLoading && filteredChats.length === 0 && <p>No chats found</p>}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {filteredChats.map(chat => (
                <li
                  key={chat.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    background: selectedChat === chat.id ? '#333' : 'transparent',
                    borderRadius: 4,
                    cursor: 'pointer',
                    marginBottom: 4
                  }}
                >
                  <div onClick={() => setSelectedChat(chat.id)} style={{ flex: 1 }}>
                    {chat.title}
                  </div>
                  <button
                    onClick={() => handleDeleteChat(chat.id)}
                    title="Delete chat"
                    style={{ background: 'transparent', border: 'none', color: '#fb3640', cursor: 'pointer', fontSize: 16 }}
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Create Chat */}
          <input
            value={chatTitle}
            onChange={e => setChatTitle(e.target.value)}
            placeholder="New chat title"
            style={{ padding: '0.5rem', marginTop: 12, borderRadius: 6, border: '1px solid #555', background: '#23243c', color: 'white' }}
            onKeyDown={e => {
              if (e.key === 'Enter') createNewChat();
            }}
          />
          <button
            onClick={createNewChat}
            disabled={createLoading || !chatTitle.trim()}
            style={{ marginTop: 8, padding: '0.5rem', background: '#444', border: 'none', borderRadius: 6, color: 'white', fontWeight: 'bold', cursor: createLoading || !chatTitle.trim() ? 'not-allowed' : 'pointer' }}
          >
            {createLoading ? 'Creating...' : 'Create Chat'}
          </button>
        </div>
        {/* Chat Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 16 }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #333', borderRadius: 6, padding: '0.5rem' }}>
            {!selectedChat ? (
              <p style={{ color: '#aaa', textAlign: 'center' }}>Select a chat to start messaging</p>
            ) : (
              <>
                {msgsLoading && <p>Loading messages...</p>}
                {msgsError && <p style={{ color: 'red' }}>Error loading messages</p>}
                {msgData?.messages?.map(msg => (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.is_bot ? 'flex-start' : msg.user_id === user.id ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                    <div style={{ background: msg.is_bot ? '#ff9800' : msg.user_id === user.id ? '#4cafef' : '#555', color: 'white', padding: '0.4rem 0.6rem', borderRadius: 8, maxWidth: '60%', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    <small style={{ fontSize: '0.7rem', color: '#aaa' }}>{new Date(msg.created_at).toLocaleTimeString()}</small>
                  </div>
                ))}
                {botLoading && <TypingAnimation />}
                <div ref={messagesEndRef}></div>
              </>
            )}
          </div>
          {/* Message input */}
          <div style={{ display: 'flex', marginTop: 8 }}>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={selectedChat ? 'Type a message...' : 'Select a chat...'}
              disabled={!selectedChat}
              onKeyDown={e => {
                if (e.key === 'Enter' && selectedChat) sendNewMessage();
              }}
              style={{ flex: 1, padding: '0.5rem', borderRadius: 6, border: '1px solid #555', background: '#23243c', color: 'white', marginRight: 8 }}
            />
            <button
              onClick={sendNewMessage}
              disabled={sending || !selectedChat}
              style={{ padding: '0.5rem 1rem', background: '#4cafef', color: 'white', border: 'none', borderRadius: 6, cursor: sending || !selectedChat ? 'not-allowed' : 'pointer' }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
