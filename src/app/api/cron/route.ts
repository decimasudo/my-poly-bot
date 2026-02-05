import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function GET() {
  try {
    console.log("[CRON] Starting Top 6 Scan...");
    
    // 1. Fetch Top 6 Active Events
    const polyRes = await fetch(
      'https://gamma-api.polymarket.com/events?limit=6&active=true&closed=false&order=volume&descending=true'
    );
    const polyData = await polyRes.json();

    if (!polyData || polyData.length === 0) {
      return NextResponse.json({ error: 'No events found' }, { status: 404 });
    }

    const results = [];

    for (const event of polyData) {
      const market = event.markets?.[0];
      if (!market) continue;

      let outcomes;
      try {
        outcomes = typeof market.outcomes === 'string' ? JSON.parse(market.outcomes) : market.outcomes;
      } catch (e) { outcomes = []; }

      if (!Array.isArray(outcomes) || outcomes.length !== 2) continue;

      // 2. CEK DUPLIKAT (LOGIKA BARU)
      // Cek apakah market ini sudah pernah di-post DALAM 12 JAM TERAKHIR?
      // Jika iya -> SKIP (biar gak spam kalau kamu klik regenerate berkali-kali dalam 1 jam)
      // Jika tidak -> INSERT (anggap sebagai update harian)
      
      const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
      
      const { data: recentLog } = await supabase
        .from('alpha_logs')
        .select('id')
        .eq('market_id', event.id)
        .gt('created_at', twelveHoursAgo) // Hanya cari yang dibuat > 12 jam lalu
        .single();

      if (recentLog) {
        console.log(`[SKIP] Market ${event.title} already posted recently.`);
        continue;
      }

      // --- LOGIC INSERT SAMA SEPERTI SEBELUMNYA ---
      const title = event.title;
      const currentPrice = market.outcomePrices ? JSON.parse(market.outcomePrices)[0] : 0.5;
      const probYes = Math.round(currentPrice * 100);

      console.log(`[AI] Analyzing: ${title}`);
      let chillAnalysis = "market looks volatile.";

      if (process.env.OPENROUTER_API_KEY) {
          try {
              const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                  method: "POST",
                  headers: {
                      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                      "Content-Type": "application/json",
                      "HTTP-Referer": "https://polyxvote.com", 
                  },
                  body: JSON.stringify({
                      model: "mistralai/mistral-7b-instruct:free", 
                      messages: [
                          {
                              role: "system",
                              content: `You are a crypto degen.
                              Style: strict lowercase, no punctuation, minimal words, slang (mid, cap, alpha, rekt).
                              Constraint: MAX 15 WORDS. NO EMOJIS.
                              Task: Give a cynical take on these odds.`
                          },
                          {
                              role: "user",
                              content: `Market: "${title}". Odds: ${probYes}% Yes.`
                          }
                      ]
                  })
              });

              if (aiRes.ok) {
                  const aiJson = await aiRes.json();
                  const content = aiJson.choices?.[0]?.message?.content;
                  if (content) chillAnalysis = content.replace(/"/g, '').trim().toLowerCase();
              }
          } catch (e) { console.error(e); }
      }

      // Save to Supabase
      const { error } = await supabase.from('alpha_logs').insert({
          market_id: event.id,
          market_title: title,
          market_slug: event.slug,
          chill_analysis: chillAnalysis,
          odds: probYes
      });

      if (!error) results.push(title);
      await delay(2000); // Rate limit protection
    }

    return NextResponse.json({ success: true, processed: results.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}