import { useState, useEffect } from 'react';
import { Send, Plus, MessageSquare, Settings, User, Bot, Sparkles, Loader2, Trash2, GraduationCap, ChefHat, Code2 } from 'lucide-react';

const PERSONAS = {
  ramah: { 
    label: "Asisten Ramah", 
    icon: <Bot size={16} />, 
    prompt: "Kamu adalah asisten AI yang ramah, santai, dan suka bercanda." 
  },
  guru: { 
    label: "Guru Matematika", 
    icon: <GraduationCap size={16} />, 
    prompt: "Kamu adalah guru matematika yang sabar. Jelaskan konsep dengan langkah-langkah sederhana." 
  },
  koki: { 
    label: "Koki Profesional", 
    icon: <ChefHat size={16} />, 
    prompt: "Kamu adalah koki profesional. Bantu user dengan resep dan tips memasak." 
  },
  programmer: { 
    label: "Programmer Expert", 
    icon: <Code2 size={16} />, 
    prompt: "Kamu adalah senior programmer. Bantu user debugging dan jelaskan kode dengan mudah." 
  },
};

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [
      { id: 1, role: 'ai', text: 'Halo! Saya AI Assistant. Ada yang bisa saya bantu hari ini?' }
    ];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [persona, setPersona] = useState(() => {
    return localStorage.getItem('chatPersona') || 'ramah';
  });

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatPersona', persona);
  }, [persona]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMsg = { id: Date.now(), role: 'user', text: input };
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.text,
      }));

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          messages: [
            { role: 'system', content: PERSONAS[persona].prompt },
            ...apiMessages
          ],
        }),
      });

      const data = await response.json();
      
      if (data.choices && data.choices[0]) {
        const aiReply = data.choices[0].message.content;
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: 'ai', text: aiReply }
        ]);
      } else {
        throw new Error('Respons AI tidak valid');
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: 'Maaf, terjadi kesalahan saat menghubungi AI.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Yakin mau hapus semua chat?")) {
      const defaultMsg = [{ id: 1, role: 'ai', text: 'Halo! Saya AI Assistant. Ada yang bisa saya bantu hari ini?' }];
      setMessages(defaultMsg);
      localStorage.setItem('chatHistory', JSON.stringify(defaultMsg));
    }
  };

  const changePersona = (newPersona) => {
    setPersona(newPersona);
    // Reset chat biar AI langsung pake kepribadian baru
    const welcomeMsg = [{ id: Date.now(), role: 'ai', text: `Halo! Sekarang saya adalah ${PERSONAS[newPersona].label}. Ada yang bisa dibantu?` }];
    setMessages(welcomeMsg);
  };

  return (
    <div className="flex h-screen bg-darkBg text-gray-200">
      
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-panelBg border-r border-gray-800 flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8 text-neonGlow">
          <Sparkles size={24} />
          <h1 className="text-xl font-bold tracking-wide">AI Chat</h1>
        </div>

        <button 
          onClick={handleClearChat}
          className="flex items-center gap-3 bg-neonPurple hover:bg-neonGlow transition-colors text-white p-3 rounded-xl mb-6 shadow-lg shadow-neonPurple/30"
        >
          <Plus size={18} />
          <span className="font-semibold text-sm">Chat Baru</span>
        </button>

        <div className="flex flex-col gap-2 flex-grow">
          <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Pilih Kepribadian</p>
          {Object.entries(PERSONAS).map(([key, value]) => (
            <button
              key={key}
              onClick={() => changePersona(key)}
              className={`flex items-center gap-3 p-3 rounded-lg text-sm cursor-pointer transition-all ${
                persona === key ? 'bg-neonPurple/20 text-neonGlow border border-neonPurple/50' : 'hover:bg-gray-800/50 text-gray-400'
              }`}
            >
              {value.icon} {value.label}
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-gray-800 pt-4 flex flex-col gap-2">
          <button 
            onClick={handleClearChat}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-red-500/20 text-red-400 cursor-pointer text-sm w-full text-left transition-colors"
          >
            <Trash2 size={18} /> Hapus Chat
          </button>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-neonPurple flex items-center justify-center">
              <User size={16} />
            </div>
            <div>
              <p className="text-xs font-bold">Revaldi</p>
              <p className="text-[10px] text-gray-400">Premium</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ===== AREA CHAT ===== */}
      <main className="flex-1 flex flex-col relative">
        <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-darkBg/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="font-bold text-lg">{PERSONAS[persona].label}</h2>
            <p className="text-xs text-gray-400">Tanya apa saja, kapan saja!</p>
          </div>
          <div className="flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/20">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Online
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-neonPurple flex items-center justify-center mr-3 shadow-lg shadow-neonPurple/30 shrink-0">
                  <Bot size={20} className="text-white" />
                </div>
              )}

              <div className={`max-w-[75%] p-4 text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-neonPurple to-neonGlow text-white rounded-2xl rounded-tr-sm shadow-lg shadow-neonPurple/20' 
                  : 'bg-panelBg border border-gray-700/50 text-gray-200 rounded-2xl rounded-tl-sm'
              }`}>
                {msg.text}
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center ml-3 shadow-lg shrink-0">
                  <User size={20} className="text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="w-10 h-10 rounded-full bg-neonPurple flex items-center justify-center mr-3 shadow-lg shadow-neonPurple/30 shrink-0">
                <Bot size={20} className="text-white" />
              </div>
              <div className="bg-panelBg border border-gray-700/50 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-neonGlow" />
                <span className="text-sm text-gray-400">AI sedang berpikir...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800 bg-darkBg">
          <form onSubmit={handleSend} className="relative flex items-center max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan Anda di sini..."
              className="w-full bg-panelBg border border-gray-700 text-white rounded-full py-4 pl-6 pr-16 focus:outline-none focus:border-neonPurple focus:ring-1 focus:ring-neonPurple transition-all"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="absolute right-2 p-3 bg-neonPurple hover:bg-neonGlow rounded-full text-white transition-all shadow-lg shadow-neonPurple/30 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-center text-xs text-gray-500 mt-3">AI dapat membuat kesalahan. Selalu periksa informasi penting.</p>
        </div>
      </main>

    </div>
  );
}

export default App;