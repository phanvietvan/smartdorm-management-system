import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  X, 
  MessageSquare, 
  Minus, 
  PlusCircle, 
  Bot, 
  User,
  Sparkles,
  Paperclip,
} from 'lucide-react'
import { cn } from '../lib/utils'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  timestamp: Date
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Chào bạn! 👋 Tôi là SmartBot AI - Trợ lý thông minh tại SmartDorm. Tôi có thể giúp gì cho trải nghiệm sống của bạn hôm nay?',
      sender: 'ai',
      timestamp: new Date()
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
    }
  }, [messages, isOpen, isMinimized, isLoading])

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userText = inputValue;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Prepare history for Gemini
      const history = messages
        .filter(m => m.id !== '1')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))

      const { aiApi } = await import('../api/ai')
      const response = await aiApi.chat(userText, history)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.message || 'Tôi xin lỗi, tôi gặp chút trục trặc khi suy nghĩ.',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (err: any) {
      console.error('AI Chat Error:', err)
      
      // Get error message from server if available
      const serverError = err.response?.data?.error || err.response?.data?.message;
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: serverError 
          ? `Lỗi hệ thống: ${serverError}` 
          : 'Rất tiếc, tôi đang mất kết nối với máy chủ AI. Bạn vui lòng kiểm tra KEY AI trong .env backend nhé!',
        sender: 'ai',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-8 right-8 z-[60] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              filter: 'blur(0px)',
              height: isMinimized ? '72px' : '550px',
              width: isMinimized ? '280px' : '380px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 30, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              "bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.18)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/40 dark:border-slate-800/50",
              "ring-1 ring-black/5 dark:ring-white/5"
            )}
          >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 p-5 flex items-center justify-between text-white shrink-0 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                 <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl"></div>
               </div>
               
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative group">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/20 backdrop-blur-xl group-hover:scale-110 transition-transform duration-500 shadow-xl">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-indigo-600 rounded-full animate-bounce"></div>
                </div>
                <div>
                  <h3 className="text-base font-black leading-tight font-display tracking-tight uppercase">Smart Assistant</h3>
                  <p className="text-[10px] text-white/80 font-black tracking-widest flex items-center gap-1.5 px-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                    Hệ thống đã sẵn sàng
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 relative z-10">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                  {isMinimized ? <PlusCircle className="w-5 h-5 shadow-sm" /> : <Minus className="w-5 h-5 shadow-sm" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all active:scale-90"
                >
                  <X className="w-5 h-5 shadow-sm" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Conversations */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30 dark:bg-slate-900/10 scrollbar-hide font-sans">
                  <div className="flex justify-center mb-2">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] px-4 py-1.5 bg-white/60 dark:bg-slate-800/40 rounded-full shadow-sm border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
                      Tiến trình AI
                    </span>
                  </div>

                  {messages.map((msg, idx) => (
                    <motion.div 
                      key={msg.id} 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={cn(
                        "flex gap-3 max-w-[90%] items-end",
                        msg.sender === 'user' ? "flex-row-reverse ml-auto" : ""
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg border-2 border-white dark:border-slate-800",
                        msg.sender === 'ai' ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-indigo-600"
                      )}>
                        {msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex flex-col gap-1.5 group">
                        <div className={cn(
                          "p-4 text-xs font-semibold leading-[1.6] shadow-xl transition-all",
                          msg.sender === 'ai' 
                            ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-[1.5rem] rounded-bl-none border border-slate-100 dark:border-slate-800 hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10" 
                            : "bg-indigo-600 text-white rounded-[1.5rem] rounded-br-none shadow-indigo-200 dark:shadow-none"
                        )}>
                          <p>{msg.text}</p>
                        </div>
                        <span className={cn(
                          "text-[9px] text-slate-400 font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity",
                          msg.sender === 'user' ? "text-right" : "text-left"
                        )}>
                          Sent at {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 max-w-[90%] items-end"
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg border-2 border-white dark:border-slate-800 bg-indigo-600 text-white">
                        <Sparkles className="w-4 h-4 animate-spin text-white" />
                      </div>
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-[1.5rem] rounded-bl-none border border-slate-100 dark:border-slate-800 shadow-xl">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-5 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 relative z-10 transition-all">
                  <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 rounded-3xl px-5 py-3.5 border border-slate-100 dark:border-slate-800/50 shadow-inner group focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
                    <button className="text-slate-300 hover:text-indigo-600 transition-colors">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <input 
                      disabled={isLoading}
                      className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 font-bold tracking-tight disabled:opacity-50" 
                      placeholder="Viết yêu cầu của bạn..." 
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    
                    <motion.button 
                      whileHover={{ scale: 1.1, rotate: -15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSend}
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-xl",
                        inputValue.trim() && !isLoading ? "bg-indigo-600 text-white shadow-indigo-200" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                      )}
                    >
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Action Bubble */}
      <motion.button
        layoutId="chat-bubble"
        whileHover={{ scale: 1.1, y: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
            setIsOpen(!isOpen);
            if (isMinimized) setIsMinimized(false);
        }}
        className={cn(
          "w-20 h-20 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_50px_rgba(79,70,229,0.3)] relative group overflow-hidden border-4 border-white dark:border-slate-900 transition-all duration-500",
          isOpen && "rotate-12 scale-90"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-700 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {isOpen ? <Sparkles className="w-8 h-8 relative z-10" /> : <MessageSquare className="w-8 h-8 relative z-10" />}
        
        {/* Unread Badge with Glow */}
        {!isOpen && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <span className="text-[10px] font-black text-white">1</span>
            <div className="absolute inset-0 bg-rose-500 rounded-full animate-ping opacity-40"></div>
          </div>
        )}
      </motion.button>
    </div>
  )
}
