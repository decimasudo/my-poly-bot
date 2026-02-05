import { NextResponse } from 'next/server';
import { rwClient } from '@/lib/twitter';
import { supabase } from '@/lib/supabase';
import { generateFunFact } from '@/lib/ai';

// Agar route ini selalu dinamis (tidak dicache)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Ambil Event Trending dari Polymarket (Top Volume)
    // Mengambil event yang aktif, belum tutup, diurutkan berdasarkan volume
    const polyRes = await fetch(
      'https://gamma-api.polymarket.com/events?limit=10&active=true&closed=false&order=volume&descending=true'
    );
    const polyData = await polyRes.json();

    if (!polyData || polyData.length === 0) {
      return NextResponse.json({ error: 'No events found' }, { status: 404 });
    }

    // Loop untuk mencari 1 event yang BELUM pernah diposting
    let targetEvent = null;
    let marketDetails = null;

    for (const event of polyData) {
      // Cek database: Apakah ID ini sudah ada?
      const { data: existing } = await supabase
        .from('posted_events')
        .select('id')
        .eq('event_id', event.id)
        .single();

      if (!existing) {
        // Jika belum ada, cek apakah dia punya Market "Yes/No"
        const market = event.markets?.[0]; // Ambil market pertama
        if (market && market.outcomes?.length === 2) { 
            // Pastikan cuma 2 opsi (Yes/No) untuk Poll
            targetEvent = event;
            marketDetails = market;
            break; // Ketemu! Berhenti mencari.
        }
      }
    }

    if (!targetEvent || !marketDetails) {
      return NextResponse.json({ message: 'All top events already posted today.' });
    }

    // 2. Siapkan Data Tweet
    const title = targetEvent.title;
    const outcomeYes = JSON.parse(marketDetails.outcomePrices)[0]; // Harga "Yes"
    const probYes = Math.round(outcomeYes * 100); // Ubah jadi persen (0.65 -> 65)
    
    // 3. Generate AI Context (Fun Fact)
    const funFact = await generateFunFact(title);

    // 4. Susun Teks Tweet
    // Format: Judul + Fact + Odds + Link
    const tweetText = `🔥 TRENDING: ${title}\n\n💡 ${funFact}\n\n📊 Market Odds: ${probYes}% Chance\n👇 What do you think? Vote below!`;

    // 5. Post ke X dengan Polling
    const tweet = await rwClient.v2.tweet({
      text: tweetText,
      poll: {
        options: ["Yes", "No"],
        duration_minutes: 1440 // 24 Jam
      }
    });

    // 6. Simpan ke Database (Tandai sudah diposting)
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
    console.error("Bot Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}