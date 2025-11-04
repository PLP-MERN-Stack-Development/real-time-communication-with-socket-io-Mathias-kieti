import { useState } from 'react';
import LoginPage from '../pages/LoginPage';
import ChatPage from '../pages/ChatPage';
import '../styles/chat.css';

function App() {
  const [username, setUsername] = useState('');

  const handleLogin = (name) => {
    setUsername(name);
  };

  const handleLogout = () => {
    setUsername('');
  };

  return username ? (
    <ChatPage username={username} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  );
}

export default App;
