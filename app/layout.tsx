import type React from "react"
import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "Kai - AI 伴侣",
  description: "一个专注倾听与情感支持的AI聊天伴侣",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${nunito.variable} antialiased`}>
      <body className="font-nunito">{children}</body>
    </html>
  )
}
