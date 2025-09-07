# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概览
Kai AI - 中文 AI 聊天伴侣应用，基于 Next.js 15、React 19 和 TypeScript 构建。具有赛博朋克风格界面，支持 Google OAuth 登录和访客模式。通过 v0.app 构建，自动部署在 Vercel。

## 技术架构
- **框架**: Next.js 15 (App Router) + React 19 + TypeScript
- **样式**: Tailwind CSS v4 + shadcn/ui 组件库
- **认证**: Supabase (Google OAuth)
- **AI API**: OpenRouter (DeepSeek Chat v3 模型)
- **部署**: Vercel (通过 v0.app 自动同步)

## 开发命令
```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 生产构建
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 高层架构

### 认证流程
1. **登录入口**: `app/page.tsx` 检查 Supabase 配置并显示登录按钮
2. **OAuth 流程**: 
   - `/api/auth/login` - 生成 Google OAuth URL
   - `/auth/callback` - 处理 OAuth 回调，交换 code 获取 session
   - `/api/auth/user` - 获取当前用户信息
   - `/api/auth/logout` - 登出用户
3. **访客模式**: 未配置 Supabase 时可以访客身份使用

### AI 对话系统
- **API 端点**: `/api/chat` 
- **模型**: DeepSeek Chat v3 (通过 OpenRouter)
- **消息处理**: 客户端管理消息状态，包含打字指示器
- **注意**: API 密钥当前硬编码在 `app/api/chat/route.ts`

### 样式系统
- **赛博朋克主题**: 自定义 CSS 变量配置暗色科技风格
- **响应式设计**: 移动端优先，使用 Tailwind 响应式类
- **组件库**: shadcn/ui 提供基础组件，覆盖默认样式

## 环境配置
需要在 `.env.local` 配置以下变量以启用完整功能：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 项目特点
- **双模式运行**: 支持认证模式和访客模式
- **实时反馈**: 打字指示器和加载状态
- **优雅降级**: Supabase 未配置时自动切换到访客模式
- **v0.app 集成**: 代码自动从 v0.app 同步

## 当前限制
- OpenRouter API 密钥硬编码（需移至环境变量）
- 无消息持久化
- 无多轮对话上下文
- 单用户会话