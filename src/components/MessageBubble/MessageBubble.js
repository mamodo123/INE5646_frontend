// src/components/MessageBubble.js
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './MessageBubble.css';

const MessageBubble = ({ sender, text }) => {
  const isCode = text.startsWith('```python') && text.endsWith('```end');

  if (isCode) {
    const codeContent = text
      .replace(/^```python\s*/, '') // remove ```python
      .replace(/```end\s*$/, '');   // remove ```end

    return (
      <div className={`message-bubble ${sender}`}>
        <SyntaxHighlighter language="python" style={vscDarkPlus} customStyle={{ padding: '1em', borderRadius: '8px' }}>
          {codeContent}
        </SyntaxHighlighter>
      </div>
    );
  }

  return <div className={`message-bubble ${sender}`}>{text}</div>;
};

export default MessageBubble;
