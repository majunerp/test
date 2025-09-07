# Kai AI - 配置指南

## 1. 创建Supabase项目

1. 访问 [Supabase官网](https://app.supabase.com)
2. 创建新项目
3. 等待项目部署完成

## 2. 获取配置信息

### 获取项目URL和密钥：
1. 进入你的Supabase项目
2. 点击左侧菜单 "Settings" → "API"
3. 复制以下信息：
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public**: 公钥（以`eyJ`开头）

## 3. 配置环境变量

编辑 `.env.local` 文件：

```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. 配置Google OAuth

### 在Supabase中启用Google登录：
1. 进入Supabase项目
2. 点击左侧菜单 "Authentication" → "Providers"
3. 找到Google，点击启用
4. 设置重定向URL：`http://localhost:3000/auth/callback`

### 获取Google OAuth凭据（如果需要）：
1. 访问 [Google Cloud Console](https://console.cloud.google.com)
2. 创建新项目或选择现有项目
3. 启用Google+ API
4. 创建OAuth 2.0凭据
5. 设置授权重定向URI：`https://your-project.supabase.co/auth/v1/callback`

## 5. 配置完成后

1. 保存 `.env.local` 文件
2. 重启开发服务器：
   ```bash
   npm run dev
   ```
3. 访问 http://localhost:3000
4. 点击"使用Google登录"按钮

## 6. 测试登录流程

1. 点击Google登录按钮
2. 应该跳转到真实的Google授权页面
3. 授权后自动返回网站
4. 成功登录并显示用户信息

## 常见问题

### 问题："400: redirect_uri_mismatch"
**解决**：确保在Supabase的Google Provider设置中添加了正确的重定向URL

### 问题："Invalid client"
**解决**：检查Google OAuth凭据是否正确配置

### 问题："site URL not configured"
**解决**：在Supabase项目设置中添加网站URL