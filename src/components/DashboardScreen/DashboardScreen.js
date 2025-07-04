import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosInstance';
import './DashboardScreen.css';
import MessageBubble from '../MessageBubble/MessageBubble';

const DashboardScreen = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const [userName, setUserName] = useState('Usuário');
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [aiQueue, setAiQueue] = useState([]);
    const [loadingChats, setLoadingChats] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [error, setError] = useState('');

    const messagesEndRef = useRef(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    const isWaiting = aiQueue.length > 0;

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isWaiting) {
            const [next, ...rest] = aiQueue;
            const timer = setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'ai', text: next, id: `ai-${Date.now()}` }]);
                setAiQueue(rest);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [aiQueue]);

    const fetchChats = useCallback(async () => {
        setLoadingChats(true);
        try {
            const res = await API.get('/chats');
            setChats(res.data.chats || []);
        } catch {
            setError('Erro ao carregar chats.');
        } finally {
            setLoadingChats(false);
        }
    }, []);

    const fetchMessages = useCallback(async (chatId) => {
        if (!chatId) return setMessages([]);
        setLoadingMessages(true);
        try {
            const res = await API.get(`/chats/${chatId}/messages`);
            setMessages(res.data.messages || []);
        } catch {
            setError('Erro ao carregar mensagens.');
        } finally {
            setLoadingMessages(false);
        }
    }, []);

    const initDashboard = async () => {
        try {
            const { data } = await API.get('/profile');
            if (data?.user?.name) setUserName(data.user.name);
        } catch {}
        await fetchChats();
    };

    useEffect(() => {
        initDashboard();
    }, []);

    useEffect(() => {
        fetchMessages(activeChatId);
    }, [activeChatId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || isWaiting) return;

        const userMessage = { sender: 'user', text: messageInput, id: `user-${Date.now()}` };
        setMessages(prev => [...prev, userMessage]);
        setMessageInput('');
        setError('');

        try {
            if (!activeChatId) {
            const res = await API.post('/chats', {
                name: messageInput.slice(0, 30),
                initialMessage: messageInput
            });
            const newChat = res.data.chat;
            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChat._id);
            // EM VEZ DE usar setAiQueue:
            setMessages(prev => [
                ...prev,
                ...(res.data.aiResponses || []).map(text => ({
                    sender: 'ai',
                    text,
                    id: `ai-${Date.now()}-${Math.random()}`
                }))
            ]);
        } else {
            const res = await API.post(`/chats/${activeChatId}/messages`, userMessage);
            setAiQueue(res.data.aiResponses || []);
        }

        } catch {
            setError('Erro ao enviar mensagem.');
            setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
        }
    };

    const handleNewChat = () => {
        setActiveChatId(null);
        setMessages([]);
        setMessageInput('');
        setAiQueue([]);
    };

    const handleDeleteChat = async (chatId, e) => {
        e.stopPropagation();
        if (!window.confirm('Excluir esta conversa?')) return;
        try {
            await API.delete(`/chats/${chatId}`);
            const updated = chats.filter(c => c._id !== chatId);
            setChats(updated);
            if (chatId === activeChatId) {
                setActiveChatId(updated[0]?._id || null);
            }
        } catch {
            setError('Erro ao excluir conversa.');
        }
    };

    const chatTitle = activeChatId
        ? chats.find(c => c._id === activeChatId)?.name || 'Conversa'
        : 'Nova Conversa';

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Olá, {userName.split(' ')[0]}!</h2>
                <div>
                    <button onClick={() => navigate('/profile')}>Meu Perfil</button>
                    <button onClick={logout}>Sair</button>
                </div>
            </header>

            <div className="dashboard-main">
                <aside className="dashboard-sidebar">
                    <h3>Chats</h3>
                    <button onClick={handleNewChat}>+ Novo Chat</button>
                    <ul>
                        {loadingChats ? <li>Carregando...</li> : null}
                        {activeChatId === null && <li className="active">Nova Conversa</li>}
                        {chats.map(chat => (
                            <li
                                key={chat._id}
                                style={{ maxHeight: "20px" }}
                                className={activeChatId === chat._id ? 'active' : ''}
                                onClick={() => {
                                    setActiveChatId(chat._id);
                                    setAiQueue([]);
                                }}
                            >
                                <span className="chat-name-text">{chat.name}</span>
                                <span
                                    className="delete-chat-button"
                                    onClick={(e) => handleDeleteChat(chat._id, e)}
                                    aria-label="Excluir conversa"
                                >
                                    ×
                                </span>
                            </li>
                        ))}
                    </ul>
                </aside>

                <section className="dashboard-chat-area">
                    <h3 className="chat-area-title">{chatTitle}</h3>
                    {error && <p className="error-message">{error}</p>}
                    <div className="chat-messages-display">
                        {loadingMessages ? (
                            <div className="message-bubble ai">Carregando mensagens...</div>
                        ) : messages.length === 0 ? (
                            <div className="message-bubble ai">Comece uma nova conversa.</div>
                        ) : (
                            messages.map(msg => (
                                <MessageBubble key={msg.id || msg._id} sender={msg.sender} text={msg.text} />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="chat-input-form">
                        <input
                            value={messageInput}
                            onChange={e => setMessageInput(e.target.value)}
                            disabled={isWaiting}
                            placeholder="Digite uma mensagem..."
                        />
                        <button type="submit" className={isWaiting ? 'disabled-button' : ''} disabled={isWaiting}>
                            {isWaiting ? "Recebendo..." : "Enviar"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default DashboardScreen;
