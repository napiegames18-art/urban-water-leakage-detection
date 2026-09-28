import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  HelpCircle, 
  Zap, 
  Activity, 
  ShieldAlert, 
  Droplet,
  Minimize2
} from 'lucide-react';

export default function AICopilotDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `👋 **Hello Operator! I'm AquaIntel AI**, your Chief Water Operations & Hydraulic Diagnostics Copilot.\n\nI have live telemetry feeds from all 4 DMA sectors, acoustic hydrophones, transient pressure sensors, and smart AMI meters. How can I assist your network optimization today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const userMsg = {
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
      .then(res => res.json())
      .then(data => {
        setIsTyping(false);
        const aiMsg = {
          sender: 'ai',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiMsg]);
      })
      .catch(err => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: '⚠️ Network connection to hydraulic simulation engine timed out. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="copilot-drawer glass-panel slide-left">
      <div className="copilot-header">
        <div className="copilot-title">
          <div className="bot-avatar">
            <Bot size={20} className="text-cyan" />
          </div>
          <div>
            <h3>AquaIntel Operations Copilot</h3>
            <span className="copilot-status">
              <span className="pulse-dot"></span> Live Telemetry Connected
            </span>
          </div>
        </div>
        <button className="btn-icon" onClick={onClose}>
          <Minimize2 size={16} />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="quick-prompts-bar">
        <button 
          className="prompt-pill" 
          onClick={() => handleSend("What is our current Non-Revenue Water (NRW) and financial deficit?")}
        >
          <Droplet size={12} /> Audit City NRW
        </button>
        <button 
          className="prompt-pill" 
          onClick={() => handleSend("Are there any active pipe bursts or uncontained leaks?")}
        >
          <Activity size={12} /> Check Active Leaks
        </button>
        <button 
          className="prompt-pill" 
          onClick={() => handleSend("Which pipes have the highest deterioration risk score?")}
        >
          <ShieldAlert size={12} /> Highest Risk Pipes
        </button>
        <button 
          className="prompt-pill" 
          onClick={() => handleSend("Explain anomalous consumption on consumer smart meters.")}
        >
          <Sparkles size={12} /> AMI Anomaly Check
        </button>
      </div>

      {/* Chat Messages */}
      <div className="copilot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.sender}`}>
            <div className="message-bubble">
              <div className="message-content" dangerouslySetInnerHTML={{ 
                __html: msg.text
                  .replace(/\n\n/g, '<br/><br/>')
                  .replace(/\n/g, '<br/>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/`(.*?)`/g, '<code>$1</code>')
              }}></div>
              <span className="msg-timestamp">{msg.timestamp}</span>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message ai">
            <div className="message-bubble typing">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <div className="copilot-input-area">
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AquaIntel about leaks, pressure transients, valve isolation..."
          rows={1}
        />
        <button 
          className="btn-send"
          onClick={() => handleSend()}
          disabled={!inputValue.trim() || isTyping}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
