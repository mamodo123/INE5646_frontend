// src/components/MessageBubble.js
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './MessageBubble.css';

// Componente funcional MessageBubble para exibir mensagens de chat
// Ele renderiza mensagens de usuário ou de IA, com suporte para destaque de código Python.
const MessageBubble = ({ sender, text }) => {
  // Verifica se o texto da mensagem é um bloco de código Python
  // A mensagem é considerada código se começar com '```python' e terminar com '```end'.
  const isCode = text.startsWith('```python') && (text.endsWith('```end') || text.endsWith('```'));

  // Se a mensagem for um bloco de código, renderiza-o usando SyntaxHighlighter
  if (isCode) {
    // Extrai o conteúdo do código, removendo os delimitadores '```python' e '```end'
    const codeContent = text
      .replace(/^```python\s*/, '') // Remove o marcador de início de código
      .replace(/```end\s*$/, '').replace(/```\s*$/, '');    // Remove o marcador de fim de código

    return (
      // Aplica as classes CSS 'message-bubble' e a classe específica do remetente ('user' ou 'ai')
      <div className={`message-bubble ${sender}`}>
        {/* Componente para destaque de sintaxe do código */}
        <SyntaxHighlighter
          language="python" // Define a linguagem como Python
          style={vscDarkPlus} // Aplica o tema de estilo 'vscDarkPlus'
          customStyle={{ padding: '1em', borderRadius: '8px' }} // Estilos personalizados para o bloco de código
        >
          {codeContent} {/* O conteúdo do código a ser destacado */}
        </SyntaxHighlighter>
      </div>
    );
  }

  // Se a mensagem não for um bloco de código, renderiza-a como texto simples
  return <div className={`message-bubble ${sender}`}>{text}</div>;
};

export default MessageBubble;
