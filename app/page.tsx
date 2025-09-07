"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Info, Send, LogIn, LogOut, User } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "kai"
  timestamp: Date
}

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export default function KaiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "你好，我是Kai。很高兴认识你，随时都可以和我聊聊。",
      sender: "kai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check auth status on component mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/user')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else if (response.status === 500) {
        // Supabase not configured, allow demo mode
        console.warn('Supabase not configured, using demo mode')
        setUser({ id: 'demo', email: 'demo@example.com', user_metadata: { full_name: 'Demo User' } })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleGoogleLogin = async () => {
    console.log('Google登录按钮被点击')
    try {
      console.log('正在请求登录API...')
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider: 'google' }),
      })

      const data = await response.json()
      console.log('API响应:', data)
      
      if (data.url) {
        console.log('正在跳转到:', data.url)
        window.location.href = data.url
      } else {
        console.error('登录错误:', data.error)
      }
    } catch (error) {
      console.error('登录错误:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      setUser(null)
      setMessages([
        {
          id: "1",
          content: "你好，我是Kai。很高兴认识你，随时都可以和我聊聊。",
          sender: "kai",
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, newMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: currentInput }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "API request failed")
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        sender: "kai",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiResponse])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "抱歉，我现在无法回应。请检查网络连接后再试。",
        sender: "kai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleSendMessage()
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="kai-bg min-h-screen flex items-center justify-center relative">
        <div className="cyber-grid"></div>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 kai-text text-lg">正在验证身份...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const isConfigured = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')

    return (
      <div className="kai-bg min-h-screen flex flex-col items-center justify-center relative">
        <div className="cyber-grid"></div>
        <div className="text-center space-y-8 max-w-md w-full px-6">
          <div>
            <Avatar className="w-24 h-24 mx-auto mb-6">
              <AvatarFallback className="kai-ai-bubble kai-text text-3xl font-medium glow-text">K</AvatarFallback>
            </Avatar>
            <h1 className="kai-text text-4xl font-bold mb-4 glow-text">Kai AI</h1>
            <p className="kai-text text-lg text-primary/80">
              欢迎来到Kai的世界，让我们一起探索AI的无限可能
            </p>
          </div>
          
          <div className="space-y-4">
            {isConfigured ? (
              <Button
                onClick={handleGoogleLogin}
                className="w-full h-14 rounded-2xl holographic-btn text-white font-medium text-lg"
              >
                <LogIn className="w-5 h-5 mr-2" />
                使用 Google 登录
              </Button>
            ) : (
              <div className="space-y-4 p-6 border border-yellow-500/30 rounded-xl bg-yellow-500/10"
              >
                <h3 className="kai-text text-lg font-medium text-yellow-300">配置提示</h3>
                <p className="kai-text text-sm text-yellow-200/80">
                  请在 .env.local 文件中配置 Supabase 环境变量：
                </p>
                <pre className="text-xs bg-black/50 p-3 rounded text-green-300 overflow-x-auto"
                >
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
                </pre>
                <p className="kai-text text-xs text-yellow-200/60">
                  配置完成后重启开发服务器即可使用登录功能
                </p>
              </div>
            )}
            
            {!isConfigured && (
              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full h-12 rounded-xl bg-green-600/20 border border-green-500/50 text-green-300 hover:bg-green-600/30"
                >
                  我已配置完成，重新加载
                </Button>
                
                <Button
                  onClick={() => {
                    setUser({ 
                      id: 'guest', 
                      email: 'guest@example.com', 
                      user_metadata: { full_name: '访客用户' } 
                    })
                  }}
                  variant="outline"
                  className="w-full h-12 rounded-xl border border-primary/30 text-primary hover:bg-primary/10"
                >
                  先以访客身份体验
                </Button>
              </div>
            )}
            
            <p className="kai-text text-xs text-primary/60 text-center"
            >
              {isConfigured ? '登录后即可开始与Kai对话' : '完成配置后重启服务器即可使用完整功能'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kai-bg min-h-screen flex flex-col relative">
      {/* Cyber Grid Background */}
      <div className="cyber-grid"></div>
      
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-gray-200 backdrop-blur-sm bg-background/80">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="kai-ai-bubble kai-text font-medium glow-text">K</AvatarFallback>
          </Avatar>
          <h1 className="kai-text text-xl font-medium glow-text">Kai</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user.user_metadata?.avatar_url && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.user_metadata.avatar_url} />
                <AvatarFallback>
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            )}
            <span className="kai-text text-sm hidden sm:block">
              {user.user_metadata?.full_name || user.email}
            </span>
          </div>
          
          <Button 
            onClick={handleLogout} 
            variant="ghost" 
            size="icon" 
            className="kai-text hover:bg-primary/20"
            title="退出登录"
          >
            <LogOut className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="kai-text hover:bg-primary/20">
            <Info className="w-5 h-5 glow-text" />
          </Button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-3xl kai-text glow-text ${
                message.sender === "user" ? "kai-user-bubble neon-border" : "kai-ai-bubble neon-border"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="kai-ai-bubble px-4 py-3 rounded-3xl flex items-center gap-2 neon-border">
              <div className="typing-dot w-2 h-2 rounded-full"></div>
              <div className="typing-dot w-2 h-2 rounded-full"></div>
              <div className="typing-dot w-2 h-2 rounded-full"></div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200 backdrop-blur-sm bg-background/80">
        <div className="flex items-center gap-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息... 连接神经网络..."
            disabled={isLoading}
            className="flex-1 rounded-3xl border border-primary/30 kai-text px-6 py-3 text-base bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50 neon-border"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="w-12 h-12 rounded-full holographic-btn hover:opacity-90 transition-all disabled:opacity-50"
            size="icon"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  )
}
