import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../../services/socket';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Send, MessageCircle } from 'lucide-react';

interface ChatMessage {
  orderId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string;
}

interface ChatModalProps {
  orderId: string;
  recipientName: string;
  recipientRole: string;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  orderId,
  recipientName,
  recipientRole,
  onClose,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    // Join order chat room
    socket.emit('join:order', orderId);

    const handleNewMessage = (msg: ChatMessage) => {
      if (msg.orderId === orderId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('order:chat:message', handleNewMessage);

    // Initial greeting preset
    setMessages([
      {
        orderId,
        senderId: 'system',
        senderName: 'هاتلي',
        senderRole: 'SYSTEM',
        message:
          language === 'ar'
            ? `مرحباً بك! هذه محادثة مباشرة خاصة بالطلب #${orderId.slice(0, 8)}`
            : `Welcome! Live order chat for #${orderId.slice(0, 8)}`,
        timestamp: new Date().toISOString(),
      },
    ]);

    return () => {
      socket.off('order:chat:message', handleNewMessage);
    };
  }, [orderId, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const payload = {
      orderId,
      senderId: user?.id || 'guest',
      senderName: user?.name || 'مستخدم',
      senderRole: user?.role || 'CUSTOMER',
      message: inputText.trim(),
    };

    socket.emit('order:chat:send', payload);
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col h-[520px] overflow-hidden">
        {/* Header */}
        <div className="bg-[#1B1464] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#E70209] flex items-center justify-center text-white shadow-md shadow-red-600/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm">{recipientName}</p>
              <p className="text-[11px] text-gray-300 capitalize">{recipientRole}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50/80">
          {messages.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            const isSystem = msg.senderRole === 'SYSTEM';

            if (isSystem) {
              return (
                <div key={idx} className="text-center my-2">
                  <span className="text-[10px] bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                    {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm shadow-sm ${
                    isMe
                      ? 'bg-[#E70209] text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  <p>{msg.message}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Egyptian phrases pills */}
        <div className="px-3 py-1.5 bg-gray-100 flex gap-2 overflow-x-auto text-[11px] whitespace-nowrap">
          <button
            onClick={() => setInputText(language === 'ar' ? 'أنا في انتظارك في المكان المحدد' : "I'm waiting at the pickup spot")}
            className="px-2.5 py-1 bg-white hover:bg-red-50 border border-gray-200 rounded-full text-gray-700"
          >
            {language === 'ar' ? 'أنا في انتظارك' : "I'm waiting"}
          </button>
          <button
            onClick={() => setInputText(language === 'ar' ? 'أنا على بعد دقيقتين' : '2 minutes away')}
            className="px-2.5 py-1 bg-white hover:bg-red-50 border border-gray-200 rounded-full text-gray-700"
          >
            {language === 'ar' ? 'دقيقتين وأكون عندك' : '2 mins away'}
          </button>
          <button
            onClick={() => setInputText(language === 'ar' ? 'تمام شكراً جزيلاً' : 'Thank you!')}
            className="px-2.5 py-1 bg-white hover:bg-red-50 border border-gray-200 rounded-full text-gray-700"
          >
            {language === 'ar' ? 'تمام شكراً' : 'Thanks'}
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type a message...'}
            className="flex-1 px-4 py-2.5 bg-gray-100 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E70209]"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-2xl bg-[#E70209] hover:bg-[#CC0006] disabled:opacity-40 text-white flex items-center justify-center transition shadow-md shadow-red-600/20"
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
