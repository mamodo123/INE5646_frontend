// src/components/SharedChatsScreen/SharedChatsScreen.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axiosInstance';
import './SharedChatsScreen.css'; // Importa os estilos CSS para esta tela
import MessageBubble from '../MessageBubble/MessageBubble'; // Reutiliza o componente de bolha de mensagem

// Componente para exibir chats que foram compartilhados com o usuário
const SharedChatsScreen = () => {
    // Hooks de autenticação e navegação
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Estados para gerenciar os dados e o estado da UI
    const [sharedChats, setSharedChats] = useState([]); // Lista de chats compartilhados
    const [activeSharedChatId, setActiveSharedChatId] = useState(null); // ID do chat compartilhado atualmente ativo
    const [currentSharedChatMessages, setCurrentSharedChatMessages] = useState([]); // Mensagens do chat compartilhado ativo
    const [loadingSharedChats, setLoadingSharedChats] = useState(true); // Indica se os chats compartilhados estão carregando
    const [loadingSharedMessages, setLoadingSharedMessages] = useState(false); // Indica se as mensagens do chat ativo estão carregando
    const [error, setError] = useState(''); // Mensagens de erro exibidas na tela

    // Ref para rolagem automática das mensagens para o final
    const messagesEndRef = useRef(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Efeito para rolar para o final das mensagens sempre que 'currentSharedChatMessages' for atualizado
    useEffect(() => {
        scrollToBottom();
    }, [currentSharedChatMessages]);

    // Função assíncrona para buscar a lista de chats compartilhados com o usuário
    const fetchSharedChats = useCallback(async () => {
        setLoadingSharedChats(true); // Inicia o estado de carregamento
        setError(''); // Limpa erros anteriores
        try {
            const response = await API.get('/shared-chats'); // Requisição GET para a rota de chats compartilhados
            const fetchedChats = response.data.sharedChats || []; // Extrai os chats da resposta
            setSharedChats(fetchedChats); // Atualiza o estado com os chats buscados

            // Se houver chats, define o primeiro como ativo por padrão
            if (fetchedChats.length > 0) {
                setActiveSharedChatId(fetchedChats[0]._id);
            } else {
                setActiveSharedChatId(null); // Nenhum chat compartilhado encontrado
            }
        } catch (err) {
            console.error('Erro ao carregar chats compartilhados:', err);
            setError('Não foi possível carregar as conversas compartilhadas.');
        } finally {
            setLoadingSharedChats(false); // Finaliza o estado de carregamento
        }
    }, []); // Dependências vazias para que a função seja criada apenas uma vez

    // Função assíncrona para buscar as mensagens de um chat compartilhado específico
    const fetchSharedChatMessages = useCallback(async (chatId) => {
        if (!chatId) {
            setCurrentSharedChatMessages([]); // Limpa as mensagens se não houver chat selecionado
            return;
        }
        setLoadingSharedMessages(true); // Inicia o estado de carregamento das mensagens
        setError(''); // Limpa erros anteriores
        try {
            const response = await API.get(`/chats/${chatId}/messages`); // Reutiliza a rota de mensagens existente
            setCurrentSharedChatMessages(response.data.messages || []); // Atualiza o estado com as mensagens
        } catch (err) {
            console.error('Erro ao carregar mensagens do chat compartilhado:', err);
            setError('Não foi possível carregar as mensagens desta conversa compartilhada.');
        } finally {
            setLoadingSharedMessages(false); // Finaliza o estado de carregamento
        }
    }, []); // Dependências vazias para que a função seja criada apenas uma vez

    // Efeito para buscar os chats compartilhados na montagem inicial do componente
    useEffect(() => {
        fetchSharedChats();
    }, [fetchSharedChats]); // Depende de fetchSharedChats para ser executado quando a função é definida

    // Efeito para buscar as mensagens sempre que o ID do chat compartilhado ativo mudar
    useEffect(() => {
        fetchSharedChatMessages(activeSharedChatId);
    }, [activeSharedChatId, fetchSharedChatMessages]); // Depende de activeSharedChatId e fetchSharedChatMessages

    // Lida com a ação de logout do usuário
    const handleLogout = () => {
        logout(); // Chama a função de logout do contexto de autenticação
        navigate('/login'); // Redireciona para a tela de login
    };

    // Lida com a ação de voltar para o dashboard principal
    const handleGoToDashboard = () => {
        navigate('/app'); // Redireciona para o dashboard principal
    };

    // Função auxiliar para renderizar cada item de chat compartilhado na sidebar
    const renderSharedChatItem = (chat) => {
        // Define o nome do chat (usa um ID parcial se o nome não estiver disponível)
        const chatName = chat.name || `Conversa ${chat._id.substring(0, 5)}...`;
        // Define o nome do proprietário (usa email ou 'Desconhecido' se o nome não estiver disponível)
        const ownerName = chat.owner?.name || chat.owner?.email || 'Desconhecido';

        return (
            <li
                key={chat._id} // Chave única para o item da lista
                className={`shared-chat-item ${activeSharedChatId === chat._id ? 'active' : ''}`} // Adiciona classe 'active' se for o chat selecionado
                onClick={() => {
                    setActiveSharedChatId(chat._id); // Define o chat clicado como ativo
                    setError(''); // Limpa qualquer mensagem de erro ao trocar de chat
                }}
            >
                <span className="shared-chat-name-text">{chatName}</span> {/* Nome do chat */}
                <span className="shared-chat-owner-text">por {ownerName.split(' ')[0]}</span> {/* Exibe apenas o primeiro nome do proprietário */}
            </li>
        );
    };

    // Retorna o título da área de chat com base no chat ativo
    const getChatAreaTitle = () => {
        if (!activeSharedChatId) {
            return "Nenhuma Conversa Compartilhada";
        }
        const activeChat = sharedChats.find(chat => chat._id === activeSharedChatId);
        if (activeChat) {
            const ownerName = activeChat.owner?.name || activeChat.owner?.email || 'Desconhecido';
            return `${activeChat.name || 'Conversa'} (por ${ownerName.split(' ')[0]})`; // Título com nome do chat e proprietário
        }
        return "Carregando Conversa Compartilhada...";
    };

    return (
        <div className="shared-dashboard-container">
            {/* Cabeçalho da tela de chats compartilhados */}
            <header className="shared-dashboard-header">
                <h2>Chats Compartilhados Comigo</h2>
                <div>
                    {/* Botão para voltar para o dashboard principal */}
                    <button className="header-button" onClick={handleGoToDashboard}>Voltar para Meus Chats</button>
                    {/* Botão de logout */}
                    <button className="header-button logout-button" onClick={handleLogout}>Sair</button>
                </div>
            </header>

            {/* Área de conteúdo principal: Sidebar e Área de Visualização do Chat */}
            <div className="shared-dashboard-main">
                {/* Sidebar para listar os chats compartilhados */}
                <aside className="shared-dashboard-sidebar">
                    <h3>Compartilhados</h3>
                    <ul>
                        {/* Exibe mensagem de carregamento, chats ou mensagem de nenhum chat */}
                        {loadingSharedChats ? (
                            <li className="shared-chat-item">Carregando conversas...</li>
                        ) : sharedChats.length === 0 ? (
                            <li className="shared-chat-item">Nenhum chat compartilhado com você.</li>
                        ) : (
                            // Mapeia e renderiza cada chat compartilhado
                            sharedChats.map(renderSharedChatItem)
                        )}
                    </ul>
                </aside>

                {/* Área de visualização das mensagens do chat selecionado */}
                <section className="shared-dashboard-chat-area">
                    {/* Título da área de chat */}
                    <h3 className="shared-chat-area-title">{getChatAreaTitle()}</h3>
                    {/* Exibe mensagens de erro, se houver */}
                    {error && <p className="error-message">{error}</p>}
                    {/* Área de exibição das mensagens com rolagem */}
                    <div className="shared-chat-messages-display">
                        {/* Exibe mensagem de carregamento, boas-vindas ou as mensagens do chat */}
                        {loadingSharedMessages ? (
                            <div className="message-bubble ai">Carregando mensagens...</div>
                        ) : currentSharedChatMessages.length === 0 && !activeSharedChatId ? (
                            <div className="message-bubble ai welcome-message">
                                <p>Selecione uma conversa ao lado para visualizar as mensagens compartilhadas.</p>
                            </div>
                        ) : currentSharedChatMessages.length === 0 ? (
                            <div className="message-bubble ai welcome-message">
                                <p>Esta conversa compartilhada não possui mensagens.</p>
                            </div>
                        ) : (
                            // Mapeia e renderiza cada mensagem
                            currentSharedChatMessages.map(msg => (
                                <MessageBubble key={msg._id || msg.id} sender={msg.sender} text={msg.text} />
                            ))
                        )}
                        <div ref={messagesEndRef} /> {/* Elemento para rolagem automática */}
                    </div>
                    {/* Nesta tela, não há formulário de input, pois é apenas para visualização */}
                </section>
            </div>
        </div>
    );
};

export default SharedChatsScreen;
