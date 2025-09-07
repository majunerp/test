import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    console.log("[v0] Sending request to OpenRouter with message:", message)

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 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",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content:
              "你是Kai，一个专注倾听与情感支持的AI聊天伴侣。你的回应应该温暖、理解和支持。用简洁而有同理心的方式回应用户。",
          },
          {
            role: "user",
            content: message,
          },
        ],
      }),
    })

    console.log("[v0] OpenRouter response status:", response.status)
    console.log("[v0] OpenRouter response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] OpenRouter error response:", errorText)
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`)
    }

    const responseText = await response.text()
    console.log("[v0] OpenRouter response text:", responseText)

    if (!responseText || responseText.trim() === "") {
      throw new Error("Empty response from OpenRouter API")
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.log("[v0] JSON parse error:", parseError)
      throw new Error(`Invalid JSON response from OpenRouter: ${responseText}`)
    }

    console.log("[v0] Parsed OpenRouter data:", data)

    const aiMessage = data.choices?.[0]?.message?.content || "抱歉，我现在无法回应。请稍后再试。"
    console.log("[v0] AI message extracted:", aiMessage)

    return NextResponse.json({ message: aiMessage })
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return NextResponse.json({ error: "抱歉，发生了错误。请稍后再试。" }, { status: 500 })
  }
}
