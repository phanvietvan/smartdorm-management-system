import { useEffect, useState, useRef } from 'react'
import { messagesApi, type ChatItem, type Message } from '../api/messages'
import { useAuth } from '../context/AuthContext'

export default function Messages() {
  const [chatList, setChatList] = useState<ChatItem[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const loadChatList = () => {
    return messagesApi.getChatList().then((r) => setChatList(r.data)).catch(() => {})
  }

  useEffect(() => {
    loadChatList().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedUserId) { setMessages([]); return }
    messagesApi.getConversation(selectedUserId).then((r) => {
      setMessages(r.data)
      scrollToBottom()
    }).catch(() => {})
    messagesApi.markRead(selectedUserId).catch(() => {})
  }, [selectedUserId])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId || !content.trim()) return
    
    setSending(true)
    messagesApi.send({ receiverId: selectedUserId, content: content.trim() })
      .then(() => {
        messagesApi.getConversation(selectedUserId).then((r) => {
          setMessages(r.data)
          scrollToBottom()
        })
        loadChatList()
        setContent('')
      })
      .finally(() => setSending(false))
  }

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const selectedUser = chatList.find(c => c.userId === selectedUserId)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col -m-6 sm:-m-8 bg-slate-50">
      {/* Header spanning both columns on mobile or full width on desktop */}
      <div className="px-6 py-4 bg-white border-b border-slate-200 shadow-sm flex-shrink-0 z-10 hidden md:block">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tin nhắn nội bộ</h1>
        <p className="text-sm text-slate-500 font-medium">Trao đổi thông tin giữa ban quản lý và cư dân</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all ${selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 flex-shrink-0 block md:hidden">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Tin nhắn</h1>
          </div>
          
          <div className="p-4 relative flex-shrink-0">
            <svg className="w-5 h-5 absolute left-7 top-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm cuộc thoại..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
            {chatList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                </div>
                <p className="text-sm font-medium text-slate-500">Chưa có tin nhắn nào</p>
              </div>
            ) : (
              chatList.map((c) => (
                <button
                  key={c.userId}
                  onClick={() => setSelectedUserId(c.userId)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-4 ${
                    selectedUserId === c.userId 
                      ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-white border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-sm flex-shrink-0">
                      {c.fullName.charAt(0).toUpperCase()}
                    </div>
                    {/* Active indicator dot placeholder */}
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`font-bold truncate pr-2 ${selectedUserId === c.userId ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {c.fullName}
                      </h3>
                      <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                        12:30 {/* Placeholder time */}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${selectedUserId === c.userId ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}>
                      {c.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-slate-50 relative ${!selectedUserId ? 'hidden md:flex' : 'flex'}`}>
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-center gap-4 flex-shrink-0 z-10 shadow-sm">
                <button 
                  onClick={() => setSelectedUserId(null)}
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:text-indigo-600 bg-slate-50 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-sm">
                  {selectedUser?.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 tracking-tight">{selectedUser?.fullName}</h2>
                  <p className="text-xs text-emerald-500 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    Đang hoạt động
                  </p>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
                <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
                  {messages.map((m, index) => {
                    const senderId = typeof m.senderId === 'object' && m.senderId ? (m.senderId as { _id?: string })._id : m.senderId
                    const isMe = senderId === user?.id
                    
                    // Logic for grouping messages could go here
                    const showAvatar = !isMe && (index === messages.length - 1 || messages[index + 1]?.senderId !== m.senderId)

                    return (
                      <div key={m._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                        {!isMe && (
                          <div className={`w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-slate-600 text-xs font-bold ${!showAvatar && 'opacity-0'}`}>
                            {selectedUser?.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          <div 
                            className={`px-4 py-2.5 rounded-2xl shadow-sm text-[15px] leading-relaxed ${
                              isMe 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            {m.content}
                          </div>
                          <span className="text-[11px] font-medium text-slate-400 mt-1.5 px-1">
                            {new Date(m.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 sm:p-6 bg-white border-t border-slate-200 flex-shrink-0 z-10">
                <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-3 relative">
                  <button type="button" className="p-3 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-50 hover:bg-indigo-50 rounded-full flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                  </button>
                  
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)} 
                      placeholder="Nhập tin nhắn của bạn..." 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm font-medium pr-12"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={!content.trim() || sending}
                    className="absolute right-3 top-1.5 bottom-1.5 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:hover:bg-indigo-600"
                  >
                    {sending ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path></svg>
                    ) : (
                      <svg className="w-4 h-4 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              <div className="w-24 h-24 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">Chào mừng đến với hệ thống tin nhắn</h2>
              <p className="text-slate-500 max-w-sm mx-auto font-medium">Chọn một cuộc hội thoại từ danh sách bên trái hoặc bắt đầu cuộc trò chuyện mới để liên lạc với ban quản lý.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
