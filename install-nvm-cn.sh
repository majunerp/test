#!/usr/bin/env bash

# NVM 完整国内镜像安装脚本
# 使用 Gitee 镜像源，避免 githubusercontent.com 访问问题

set -e

NVM_VERSION="v0.40.3"
GITEE_MIRROR="https://gitee.com/mirrors/nvm"

echo "========================================="
echo "NVM ${NVM_VERSION} 国内镜像安装脚本"
echo "========================================="
echo ""

# 设置 NVM 目录
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

# 清理旧版本（可选）
if [ -d "$NVM_DIR" ]; then
    echo "⚠️  检测到已存在的 NVM 目录: $NVM_DIR"
    read -p "是否删除旧版本并重新安装？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$NVM_DIR"
        echo "✓ 已删除旧版本"
    else
        echo "✓ 保留旧版本，继续安装"
    fi
fi

# 创建 NVM 目录
mkdir -p "$NVM_DIR"

# 方法1：使用 git clone（推荐）
if command -v git &> /dev/null; then
    echo "📦 使用 Git 克隆 NVM..."
    git clone --depth=1 --branch "$NVM_VERSION" "$GITEE_MIRROR.git" "$NVM_DIR" 2>/dev/null || {
        echo "Git 克隆失败，尝试其他方法..."
        METHOD="TAR"
    }
    METHOD=${METHOD:-"GIT"}
else
    METHOD="TAR"
fi

# 方法2：下载压缩包
if [ "$METHOD" = "TAR" ]; then
    echo "📦 下载 NVM 压缩包..."
    
    # 尝试不同的下载源
    DOWNLOAD_URLS=(
        "${GITEE_MIRROR}/repository/archive/${NVM_VERSION}.tar.gz"
        "https://github.com/nvm-sh/nvm/archive/${NVM_VERSION}.tar.gz"
        "https://ghproxy.com/https://github.com/nvm-sh/nvm/archive/${NVM_VERSION}.tar.gz"
    )
    
    DOWNLOAD_SUCCESS=false
    for URL in "${DOWNLOAD_URLS[@]}"; do
        echo "尝试: $URL"
        if command -v curl &> /dev/null; then
            if curl -fsSL "$URL" | tar -xz -C "$NVM_DIR" --strip-components=1 2>/dev/null; then
                DOWNLOAD_SUCCESS=true
                break
            fi
        elif command -v wget &> /dev/null; then
            if wget -qO- "$URL" | tar -xz -C "$NVM_DIR" --strip-components=1 2>/dev/null; then
                DOWNLOAD_SUCCESS=true
                break
            fi
        fi
    done
    
    if [ "$DOWNLOAD_SUCCESS" = false ]; then
        echo "❌ 错误：无法下载 NVM"
        exit 1
    fi
fi

echo "✓ NVM 文件下载完成"

# 配置 Shell 环境
configure_shell() {
    local profile="$1"
    local shell_name="$2"
    
    if [ -f "$profile" ]; then
        # 备份原配置
        cp "$profile" "${profile}.backup.$(date +%Y%m%d%H%M%S)"
        
        # 检查是否已有 NVM 配置
        if grep -q "NVM_DIR" "$profile" 2>/dev/null; then
            echo "✓ $shell_name 已包含 NVM 配置"
        else
            cat >> "$profile" << 'EOF'

# NVM (Node Version Manager)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

# NVM 国内镜像配置
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node
export NVM_IOJS_ORG_MIRROR=https://npmmirror.com/mirrors/iojs
EOF
            echo "✓ 已配置 $shell_name"
        fi
    fi
}

# 检测当前 Shell
echo ""
echo "🔧 配置 Shell 环境..."

# Bash 配置
if [ -n "$BASH_VERSION" ]; then
    configure_shell "$HOME/.bashrc" "Bash"
    [ -f "$HOME/.bash_profile" ] && configure_shell "$HOME/.bash_profile" "Bash Profile"
fi

# Zsh 配置
if [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
    configure_shell "$HOME/.zshrc" "Zsh"
fi

# Fish 配置
if [ -d "$HOME/.config/fish" ]; then
    FISH_CONFIG="$HOME/.config/fish/config.fish"
    if [ -f "$FISH_CONFIG" ]; then
        if ! grep -q "nvm.fish" "$FISH_CONFIG" 2>/dev/null; then
            echo "" >> "$FISH_CONFIG"
            echo "# NVM for Fish Shell" >> "$FISH_CONFIG"
            echo "set -x NVM_DIR \$HOME/.nvm" >> "$FISH_CONFIG"
            echo "set -x NVM_NODEJS_ORG_MIRROR https://npmmirror.com/mirrors/node" >> "$FISH_CONFIG"
            echo "✓ 已配置 Fish Shell"
        fi
    fi
fi

# 创建镜像配置文件
cat > "$NVM_DIR/.nvmrc_mirrors" << 'EOF'
# NVM 镜像源配置
# 这个文件包含了国内可用的镜像源

# Node.js 镜像
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node

# io.js 镜像
export NVM_IOJS_ORG_MIRROR=https://npmmirror.com/mirrors/iojs

# NPM 镜像
export NPM_CONFIG_REGISTRY=https://registry.npmmirror.com

# 其他可选镜像源：
# 淘宝镜像: https://npmmirror.com/mirrors/node
# 华为云镜像: https://mirrors.huaweicloud.com/nodejs
# 腾讯云镜像: https://mirrors.cloud.tencent.com/nodejs
EOF

echo ""
echo "========================================="
echo "✅ NVM ${NVM_VERSION} 安装成功！"
echo "========================================="
echo ""
echo "📌 已配置国内镜像源："
echo "   • Node.js: https://npmmirror.com/mirrors/node"
echo "   • NPM: https://registry.npmmirror.com"
echo ""
echo "🚀 激活 NVM 请运行："
echo ""
if [ -n "$BASH_VERSION" ]; then
    echo "   source ~/.bashrc"
elif [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
    echo "   source ~/.zshrc"
else
    echo "   source ~/.bashrc  # 或 source ~/.zshrc"
fi
echo ""
echo "📝 常用命令："
echo "   nvm install node     # 安装最新版 Node.js"
echo "   nvm install 18       # 安装 Node.js 18"
echo "   nvm use 18           # 切换到 Node.js 18"
echo "   nvm ls               # 查看已安装版本"
echo "   nvm ls-remote        # 查看可安装版本"
echo ""
echo "💡 提示：镜像配置已保存到 $NVM_DIR/.nvmrc_mirrors"
echo "========================================="