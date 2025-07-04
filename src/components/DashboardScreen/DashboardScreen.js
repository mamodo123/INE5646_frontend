import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosInstance';
import './DashboardScreen.css';
import MessageBubble from '../MessageBubble/MessageBubble';

const DashboardScreen = () => {
    // Hooks de navegação e autenticação
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Estados para gerenciar a UI e os dados
    const [userName, setUserName] = useState('Usuário'); // Nome do usuário logado
    const [chats, setChats] = useState([]); // Lista de conversas do usuário
    const [activeChatId, setActiveChatId] = useState(null); // ID da conversa ativa
    const [messageInput, setMessageInput] = useState(''); // Valor do input de mensagem
    const [messages, setMessages] = useState([]); // Mensagens da conversa ativa
    const [aiQueue, setAiQueue] = useState([]); // Fila de respostas da IA para simular digitação
    const [loadingChats, setLoadingChats] = useState(true); // Indica se os chats estão sendo carregados
    const [loadingMessages, setLoadingMessages] = useState(false); // Indica se as mensagens estão sendo carregadas
    const [error, setError] = useState(''); // Mensagens de erro gerais

    // Estados para a funcionalidade de compartilhamento de chat
    const [shareFeedback, setShareFeedback] = useState(''); // Feedback após tentar compartilhar
    const [shareSuccess, setShareSuccess] = useState(false); // Indica sucesso no compartilhamento
    const [shareError, setShareError] = useState(null); // Detalhes do erro de compartilhamento
    const [isShareModalOpen, setIsShareModalOpen] = useState(false); // Controla a visibilidade do modal de compartilhamento
    const [shareEmail, setShareEmail] = useState(''); // Email para compartilhar o chat

    // Ref para rolagem automática das mensagens
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Determina se a IA está "digitando" uma resposta
    const isWaiting = aiQueue.length > 0;

    // Efeito para rolar automaticamente para a última mensagem
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Efeito para simular a resposta da IA sendo "digitada"
    useEffect(() => {
        if (isWaiting) {
            const [next, ...rest] = aiQueue;
            const timer = setTimeout(() => {
                setMessages(prev => [...prev, { sender: 'ai', text: next, id: `ai-${Date.now()}` }]);
                setAiQueue(rest);
            }, 1000); // Adiciona a próxima parte da resposta a cada 1 segundo
            return () => clearTimeout(timer);
        }
    }, [aiQueue]);

    // Função para buscar a lista de chats do usuário
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

    // Função para buscar as mensagens de um chat específico
    const fetchMessages = useCallback(async (chatId) => {
        if (!chatId) return setMessages([]); // Limpa mensagens se não houver chat ativo
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

    // Inicializa o dashboard: busca o nome do usuário e os chats
    const initDashboard = async () => {
        try {
            const { data } = await API.get('/profile');
            if (data?.user?.name) setUserName(data.user.name);
        } catch {} // Ignora erro, o nome de usuário pode não ser essencial
        await fetchChats();
    };

    // Executa a inicialização do dashboard ao montar o componente
    useEffect(() => {
        initDashboard();
    }, []);

    // Atualiza as mensagens sempre que o chat ativo mudar
    useEffect(() => {
        fetchMessages(activeChatId);
    }, [activeChatId, fetchMessages]);

    // Lida com o envio de mensagens
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || isWaiting) return; // Não envia mensagens vazias ou enquanto a IA responde

        const userMessage = { sender: 'user', text: messageInput, id: `user-${Date.now()}` };
        setMessages(prev => [...prev, userMessage]); // Adiciona a mensagem do usuário imediatamente
        setMessageInput('');
        setError('');
        setShareFeedback('');

        try {
            if (!activeChatId) {
                // Se não houver chat ativo, cria um novo chat
                const res = await API.post('/chats', {
                    name: messageInput.slice(0, 30), // Usa as primeiras 30 letras da mensagem como nome do chat
                    initialMessage: messageInput
                });
                const newChat = res.data.chat;
                setChats(prev => [newChat, ...prev]); // Adiciona o novo chat à lista
                setActiveChatId(newChat._id); // Define o novo chat como ativo
                setMessages(prev => [
                    ...prev,
                    ...(res.data.aiResponses || []).map(text => ({ // Adiciona respostas iniciais da IA
                        sender: 'ai',
                        text,
                        id: `ai-${Date.now()}-${Math.random()}`
                    }))
                ]);
            } else {
                // Se houver chat ativo, envia a mensagem para o chat existente
                const res = await API.post(`/chats/${activeChatId}/messages`, userMessage);
                setAiQueue(res.data.aiResponses || []); // Coloca as respostas da IA na fila
            }
        } catch {
            setError('Erro ao enviar mensagem.');
            setMessages(prev => prev.filter(msg => msg.id !== userMessage.id)); // Remove a mensagem do usuário se houver erro
        }
    };

    // Inicia uma nova conversa
    const handleNewChat = () => {
        setActiveChatId(null); // Desativa o chat atual
        setMessages([]); // Limpa as mensagens
        setMessageInput(''); // Limpa o input
        setAiQueue([]); // Limpa a fila da IA
        setShareFeedback(''); // Limpa feedback de compartilhamento
    };

    // Lida com a exclusão de um chat
    const handleDeleteChat = async (chatId, e) => {
        e.stopPropagation(); // Previne que o clique ative o chat
        if (!window.confirm('Excluir esta conversa?')) return;
        try {
            await API.delete(`/chats/${chatId}`);
            const updated = chats.filter(c => c._id !== chatId); // Remove o chat da lista
            setChats(updated);
            if (chatId === activeChatId) {
                // Se o chat ativo for excluído, seleciona o próximo ou nenhum
                setActiveChatId(updated[0]?._id || null);
            }
        } catch {
            setError('Erro ao excluir conversa.');
        }
    };

    // Abre o modal de compartilhamento
    const handleShareChat = () => {
        setShareEmail(''); // Limpa o email para compartilhamento
        setShareFeedback(''); // Limpa qualquer feedback anterior
        setIsShareModalOpen(true); // Abre o modal
    };

    // Confirma o compartilhamento do chat
    const confirmShareChat = async () => {
        if (!activeChatId || !shareEmail) return; // Requer chat ativo e email

        try {
            const res = await API.post(`/chats/${activeChatId}/share`, { email: shareEmail });
            setShareSuccess(true);
            setShareError(null);
            setShareFeedback(res.data.message || 'Compartilhado com sucesso!');
        } catch (err) {
            const msg = err.response?.data?.message || 'Erro ao compartilhar o chat.';
            setShareError(msg);
            setShareSuccess(false);
            setShareFeedback(msg);
        }
    };

    // Determina o título do chat exibido
    const chatTitle = activeChatId
        ? chats.find(c => c._id === activeChatId)?.name || 'Conversa'
        : 'Nova Conversa';

    return (
        <div className="dashboard-container">
            {/* Cabeçalho do Dashboard */}
            <header className="dashboard-header">
                <h2>Olá, {userName.split(' ')[0]}!</h2>
                <div>
                    <button onClick={() => navigate('/profile')}>Meu Perfil</button>
                    <button onClick={() => navigate('/shared')}>Compartilhado comigo</button>
                    <button onClick={logout}>Sair</button>
                </div>
            </header>

            {/* Conteúdo Principal: Sidebar e Área de Chat */}
            <div className="dashboard-main">
                {/* Sidebar com a lista de chats */}
                <aside className="dashboard-sidebar">
                    <h3>Chats</h3>
                    <button onClick={handleNewChat}>+ Novo Chat</button>
                    <ul>
                        {loadingChats ? <li>Carregando...</li> : null}
                        {activeChatId === null && <li className="active">Nova Conversa</li>}
                        {chats.map(chat => (
                            <li
                                key={chat._id}
                                style={{ maxHeight: "20px" }} // Limita a altura do item da lista
                                className={activeChatId === chat._id ? 'active' : ''}
                                onClick={() => {
                                    setActiveChatId(chat._id); // Ativa o chat selecionado
                                    setAiQueue([]); // Limpa qualquer resposta da IA em andamento
                                    setShareFeedback(''); // Limpa feedback de compartilhamento
                                }}
                            >
                                <span className="chat-name-text">{chat.name}</span>
                                <span
                                    className="delete-chat-button"
                                    onClick={(e) => handleDeleteChat(chat._id, e)} // Botão para deletar chat
                                    aria-label="Excluir conversa"
                                >
                                    ×
                                </span>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Área Principal do Chat */}
                <section className="dashboard-chat-area">
                    {/* Cabeçalho da Área de Chat */}
                    <div className="chat-area-header">
                        <h3 className="chat-area-title">{chatTitle}</h3>
                        {activeChatId && (
                            <button onClick={handleShareChat} className="share-chat-button">
                                Compartilhar
                            </button>
                        )}
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {/* Exibição das Mensagens */}
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
                        <div ref={messagesEndRef} /> {/* Referência para rolagem automática */}
                    </div>
                    {/* Formulário de Input de Mensagens */}
                    <form onSubmit={handleSendMessage} className="chat-input-form">
                        <input
                            value={messageInput}
                            onChange={e => setMessageInput(e.target.value)}
                            disabled={isWaiting} // Desabilita input enquanto a IA responde
                            placeholder="Digite uma mensagem..."
                        />
                        <button type="submit" className={isWaiting ? 'disabled-button' : ''} disabled={isWaiting}>
                            {isWaiting ? "Recebendo..." : "Enviar"}
                        </button>
                    </form>
                </section>
            </div>

            {/* Modal de Compartilhamento de Chat */}
            {isShareModalOpen && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        <h4>Compartilhar Chat</h4>
                        <input
                            type="email"
                            placeholder="Digite o email do usuário"
                            value={shareEmail}
                            onChange={(e) => setShareEmail(e.target.value)}
                        />
                        {shareFeedback && (
                            <div style={{ color: shareSuccess ? 'green' : 'red', margin: '10px' }}>
                                {shareFeedback}
                            </div>
                        )}
                        <div className="modal-buttons">
                            <button onClick={confirmShareChat}>Compartilhar</button>
                            <button className="cancel-button" onClick={() => setIsShareModalOpen(false)}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardScreen;