import React, { useState, useRef, useEffect } from 'react';
import { Send, ChevronDown, ChevronUp, AlertCircle, Layers } from 'lucide-react';
import { chat } from '../api';

const ChatBox = ({ sessionId, uploadedFiles, fetchTickets }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading || isEnded) return;

        const userQueryLower = input.trim().toLowerCase();
        const endingPhrases = ['exit', 'quit', 'thank you', 'thanks', 'bye', 'goodbye', 'stop'];

        if (endingPhrases.some(phrase => userQueryLower.includes(phrase))) {
            const userQuery = input.trim();
            setInput('');
            setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    role: 'assistant', 
                    content: 'Thank you for using Nexus AI! Have a great day. \n*(You can click "Clear Workspace" to start a new session)*'
                }]);
                setIsEnded(true);
            }, 500);
            return;
        }

        const userQuery = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
        setIsLoading(true);

        try {
            const data = await chat(sessionId, userQuery, uploadedFiles);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: data.response,
                sources: data.sources,
                intent: data.intent,
                escalation: data.escalation_required
            }]);
            if (data.escalation_required) {
                fetchTickets();
            }
        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the server.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="main-content">
            <div className="chat-history">
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', color: 'var(--text-secondary)', animation: 'fadeUp 0.5s ease forwards' }}>
                        <div style={{ 
                            background: 'rgba(99, 102, 241, 0.1)', 
                            width: '64px', height: '64px', 
                            borderRadius: '16px', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 24px auto',
                            color: 'var(--accent-color)',
                            boxShadow: '0 0 30px var(--blue-glow)'
                        }}>
                            <Layers size={32} />
                        </div>
                        <h2 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.5rem', marginBottom: '8px' }}>How can I help you today?</h2>
                        <p style={{ maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>Upload your PDF documents to the workspace and ask questions to extract insights dynamically.</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-message ${msg.role}`}>
                        <div className="message-bubble">
                            <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                            
                            {msg.escalation && (
                                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', fontSize: '0.85rem', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={16} /> <span>An escalation ticket has been created for human review.</span>
                                </div>
                            )}

                            {msg.sources && msg.sources.length > 0 && (
                                <SourcesDropdown sources={msg.sources} />
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="chat-message assistant">
                        <div className="message-bubble" style={{ display: 'inline-flex', alignItems: 'center', background: 'transparent', border: '1px solid var(--glass-border)', boxShadow: 'none' }}>
                            <div className="typing-indicator">
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                                <div className="typing-dot"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="chat-input-container">
                <div className="chat-input-wrapper">
                    <input
                        type="text"
                        className="chat-input"
                        placeholder={isEnded ? "Session ended. Please clear workspace." : "Message Nexus AI..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading || isEnded}
                    />
                    <button type="submit" className="chat-submit-btn" disabled={!input.trim() || isLoading || isEnded}>
                        <Send size={18} />
                    </button>
                </div>
            </form>
        </div>
    );
};

const SourcesDropdown = ({ sources }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="sources-dropdown">
            <button className="sources-btn" onClick={() => setIsOpen(!isOpen)}>
                <span>View {sources.length} {sources.length === 1 ? 'Source' : 'Sources'}</span>
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isOpen && (
                <div className="sources-list">
                    <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {sources.map((s, idx) => (
                            <li key={idx} style={{ lineHeight: 1.4 }}>{s}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ChatBox;
