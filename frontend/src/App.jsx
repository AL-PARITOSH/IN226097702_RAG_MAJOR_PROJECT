import React, { useState, useEffect } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ChatBox from './components/ChatBox';
import { getTickets } from './api';
import './index.css';

function App() {
  const [sessionId, setSessionId] = useState(crypto.randomUUID());
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const fetchTickets = async () => {
    try {
      const pendingTickets = await getTickets();
      setTickets(pendingTickets);
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Sparkles size={18} />
          </div>
          Nexus AI
        </div>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu size={20} />
        </button>
      </header>

      <div className="app-container">
        <Sidebar 
          sessionId={sessionId} 
          setSessionId={setSessionId}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          tickets={tickets}
          fetchTickets={fetchTickets}
          isOpen={isSidebarOpen}
          closeSidebar={() => setIsSidebarOpen(false)}
        />
        <ChatBox 
          key={sessionId}
          sessionId={sessionId}
          uploadedFiles={uploadedFiles}
          fetchTickets={fetchTickets}
        />
      </div>
    </>
  );
}

export default App;
