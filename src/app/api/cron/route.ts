import { NextResponse } from 'next/server';
import { rwClient } from '@/lib/twitter';
import { supabase } from '@/lib/supabase';
import { generateFunFact } from '@/lib/ai';

// Agar route ini selalu dinamis (tidak dicache)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log("[DEBUG] 1. Starting Fetching Polymarket...");
    
    // Fetch Top 10 Trending
    const polyRes = await fetch(
      'https://gamma-api.polymarket.com/events?limit=10&active=true&closed=false&order=volume&descending=true'
    );
    const polyData = await polyRes.json();

    if (!polyData || polyData.length === 0) {
      console.log("[ERROR] No events found from Polymarket API");
      return NextResponse.json({ error: 'No events found' }, { status: 404 });
    }

    console.log(`[DEBUG] Got ${polyData.length} events. Checking filters...`);

    let targetEvent = null;
    let marketDetails = null;

    // Loop debug untuk melihat kenapa event di-skip
    for (const event of polyData) {
      const { data: existing } = await supabase
        .from('posted_events')
        .select('id')
        .eq('event_id', event.id)
        .single();

      if (existing) {
        console.log(`[SKIP] "${event.title}" (Reason: Already in DB)`);
        continue;
      }

      // Cek Struktur Market
      const market = event.markets?.[0];
      if (!market) {
        console.log(`[SKIP] "${event.title}" (Reason: No market data)`);
        continue;
      }

      // PERBAIKAN BUG: Parse outcome prices/outcomes dengan aman
      let outcomes;
      try {
        // Polymarket kadang kirim string JSON, kadang array langsung
        outcomes = typeof market.outcomes === 'string' ? JSON.parse(market.outcomes) : market.outcomes;
      } catch (e) {
        outcomes = [];
      }

      // Kita cari yang opsinya cuma 2 ("Yes", "No")
      if (!Array.isArray(outcomes) || outcomes.length !== 2) {
        const count = Array.isArray(outcomes) ? outcomes.length : 'Unknown';
        console.log(`[SKIP] "${event.title}" (Reason: Outcomes count is ${count}, need 2)`);
        continue;
      }

      // KETEMU!
      console.log(`[SUCCESS] FOUND TARGET: "${event.title}"`);
      targetEvent = event;
      marketDetails = market;
      break; 
    }

    if (!targetEvent || !marketDetails) {
      console.log("[RESULT] No suitable event found to post.");
      return NextResponse.json({ message: 'All top events skipped (checked logs).' });
    }

    // --- PROSES POSTING ---
    const title = targetEvent.title;
    
    // Parsing harga outcome
    let outcomePrices;
    try {
        outcomePrices = typeof marketDetails.outcomePrices === 'string' 
            ? JSON.parse(marketDetails.outcomePrices) 
            : marketDetails.outcomePrices;
    } catch (e) {
        console.log("[ERROR] Failed to parse prices");
        return NextResponse.json({ error: "Price parse error" }, { status: 500 });
    }

    const probYes = Math.round(outcomePrices[0] * 100); 
    
    console.log("[DEBUG] Generating AI Fact...");
    const funFact = await generateFunFact(title);

    // Format Tweet TANPA Emoticon
    const tweetText = `TRENDING: ${title}\n\nFACT: ${funFact}\n\nMARKET ODDS: ${probYes}% Chance\n\nWhat do you think? Vote below!`;

    console.log("[DEBUG] Posting to X...");
    const tweet = await rwClient.v2.tweet({
      text: tweetText,
      poll: {
        options: ["Yes", "No"],
        duration_minutes: 1440 
      }
    });
    console.log("[SUCCESS] Tweet Posted! ID:", tweet.data.id);

    // Simpan ke DB
    await supabase.from('posted_events').insert({
      event_id: targetEvent.id,
      title: title
    });

    return NextResponse.json({ 
      success: true, 
      posted: title, 
      tweet_id: tweet.data.id 
    });

  } catch (error: any) {
    console.error("[FATAL ERROR]", error); 
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}