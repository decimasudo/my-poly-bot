"use client";

import Link from 'next/link';
import PixelBackground from '@/components/PixelBackground';
import { 
  Terminal, 
  TrendingUp, 
  ArrowRight, 
  MessageSquare, 
  Globe 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen text-black font-mono selection:bg-blue-200 flex flex-col relative overflow-hidden">
      
      {/* 1. Background Animasi */}
      <PixelBackground />

      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b-4 border-black px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Logo Box */}
          <div className="w-10 h-10 bg-blue-600 border-2 border-black shadow-hard-sm flex items-center justify-center text-white animate-bounce">
            <Terminal size={20} />
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase hidden md:inline">
            Poly<span className="text-blue-600">x</span>Vote
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-xs font-bold uppercase">
          <a href="#features" className="hover:underline decoration-2 underline-offset-4 hidden sm:block">Features</a>
          <a href="/how-it-works" className="hover:underline decoration-2 underline-offset-4 hidden sm:block">Protocol</a>
          <Link href="/dashboard">
            <button className="px-6 py-3 bg-black text-white text-[10px] md:text-xs font-bold uppercase shadow-hard hover:translate-y-1 hover:shadow-none transition-none border-2 border-transparent hover:border-black">
              Launch Terminal
            </button>
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      {/* Note: Menghapus gradient background lama agar PixelBackground terlihat */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          
          <div className="inline-block bg-blue-100 border-2 border-black px-4 py-2 mb-8 shadow-hard-sm transform -rotate-2">
            <span className="text-[10px] font-bold uppercase text-blue-800">
               ★ V 1.0 PUBLIC BETA IS LIVE
            </span>
          </div>

          <h1 className="text-2xl md:text-5xl font-black tracking-tighter text-black mb-8 max-w-4xl mx-auto leading-normal uppercase drop-shadow-[4px_4px_0_rgba(255,255,255,1)]">
            The Bloomberg Terminal for <br/>
            <span className="text-white bg-blue-600 px-4 border-2 border-black shadow-hard inline-block transform rotate-1 mt-2">
              X Shitposting
            </span>
          </h1>
          
          <p className="text-xs md:text-sm text-gray-800 mb-12 max-w-2xl mx-auto leading-loose bg-white/80 p-4 border-2 border-black shadow-hard-sm backdrop-blur-sm">
            `{'>'}` SCAN POLYMARKET ODDS.<br/>
            `{'>'}` GENERATE "CHILL" ALPHA WITH AI.<br/>
            `{'>'}` COPY-PASTE TO X & FARM ENGAGEMENT.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link href="/dashboard">
              <button className="group px-8 py-4 bg-blue-600 text-white text-xs md:text-sm font-bold uppercase border-4 border-black shadow-hard hover:translate-y-1 hover:shadow-none transition-none flex items-center gap-3">
                Start Generating
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <a href="https://polymarket.com" target="_blank" className="px-8 py-4 bg-white text-black text-xs md:text-sm font-bold uppercase border-4 border-black shadow-hard hover:translate-y-1 hover:shadow-none transition-none">
              View Source Data
            </a>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-white/95 border-b-4 border-black backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-xl md:text-2xl font-bold text-black uppercase mb-4 decoration-4 underline underline-offset-8 decoration-blue-600">
              Terminal Modules
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-[10px] md:text-xs mt-4">
              TOOLS BUILT FOR THE MODERN DEGEN.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-black" />}
              title="Market Truth"
              desc="We don't trust news. We trust odds. Real-time probability feeds directly from Polymarket volumes."
            />
            <FeatureCard 
              icon={<MessageSquare className="w-8 h-8 text-blue-600" />}
              title="Chill AI Analysis"
              desc="Our Mistral-7B model reads the charts and gives you a 'Chill Mate' take. No robot speak. Just alpha."
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8 text-green-600" />}
              title="Community Consensus"
              desc="Vote directly on X. We turn prediction markets into social sentiment battles."
            />
          </div>
        </div>
      </section>

      {/* --- SOCIAL PROOF / STATS --- */}
      <section className="py-24 bg-blue-50 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6">
           <div className="flex flex-col md:flex-row gap-12 items-center justify-center">
              <StatBox label="MARKETS SCANNED" value="24/7" />
              <StatBox label="AI MODEL" value="Claude" />
              <StatBox label="COST TO USE" value="$0.00" />
           </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-black text-white mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-[10px] font-bold uppercase">
          <p>© 2026 POLYXVOTE. OPEN SOURCE INTEL.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
             <span className="flex items-center gap-2 text-green-400">
               <span className="w-2 h-2 bg-green-400 animate-pulse"/> SYSTEMS ONLINE
             </span>
             <a href="https://github.com/decimasudo" className="hover:underline hover:text-blue-400">GitHub</a>
             <a href="https://x.com/polyxvote" className="hover:underline hover:text-blue-400">Twitter</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

// --- SUB COMPONENTS ---

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 bg-white border-4 border-black shadow-hard hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000] transition-all group">
      <div className="mb-6 bg-gray-100 w-16 h-16 flex items-center justify-center border-2 border-black shadow-hard-sm group-hover:bg-blue-100 transition-colors">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-black mb-3 uppercase">{title}</h3>
      <p className="text-gray-600 text-[10px] md:text-xs leading-loose">{desc}</p>
    </div>
  );
}

function StatBox({ label, value }: { label: string, value: string }) {
   return (
      <div className="bg-white p-6 border-4 border-black shadow-hard text-center w-full md:w-64 transform hover:rotate-2 transition-transform">
         <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">{label}</div>
         <div className="text-2xl md:text-3xl font-black text-blue-600">{value}</div>
      </div>
   );
}