export async function generateFunFact(eventTitle: string): Promise<string> {
  if (!process.env.OPENROUTER_API_KEY) return ""; // Skip kalau gak ada key

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://polymarket-bot.vercel.app", 
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-lite-preview-02-05:free", // Model Gratis & Cepat
        messages: [
          {
            role: "system",
            content: "You are a trivia bot. Given a market event title, provide ONE short, interesting, and neutral fun fact or context related to the topic. Max 100 characters. No hashtags. No intro."
          },
          {
            role: "user",
            content: `Topic: ${eventTitle}`
          }
        ]
      })
    });

    const data = await response.json();
    const fact = data.choices?.[0]?.message?.content || "";
    return fact.replace(/"/g, '').trim(); // Bersihkan tanda kutip
  } catch (error) {
    console.error("AI Error:", error);
    return ""; // Kalau error, kembalikan string kosong (bot tetap jalan)
  }
}