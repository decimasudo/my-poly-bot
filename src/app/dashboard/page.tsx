"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PixelBackground from '@/components/PixelBackground';
import { 
  Terminal, 
  ExternalLink, 
  ArrowLeft, 
  BarChart2,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AlphaLog {
  id: number;
  market_title: string;
  market_slug: string;
  chill_analysis: string;
  odds: number;
  created_at: string;
}

export default function DashboardPage() {
  const [logs, setLogs] = useState<AlphaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  
  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Menampilkan 6 kartu per halaman

  // State untuk Countdown Reset
  const [timeLeft, setTimeLeft] = useState("CALCULATING...");

  // Fetch Feed Logic (Ambil SEMUA data, biar frontend yang paginasi)
  // Note: Kalau data sudah ribuan, sebaiknya pagination di sisi database (range). 
  // Untuk MVP < 1000 items, fetch all client-side is fine.
  const fetchFeed = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('alpha_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100); // Ambil 100 item terakhir untuk history

    if (data) setLogs(data);
    setLoading(false);
  };

  // --- MANUAL REGENERATE ---
  const handleRegenerate = async () => {
    setScanning(true);
    try {
        // Panggil API Cron secara manual
        await fetch('/api/cron');
        // Refresh feed agar data baru muncul di Page 1
        await fetchFeed();
        // Reset ke halaman 1
        setCurrentPage(1);
    } catch (e) {
        console.error(e);
    }
    setScanning(false);
  };

  useEffect(() => { 
    fetchFeed(); 
    
    // Countdown Timer Logic
    const updateCountdown = () => {
      const now = new Date();
      const target = new Date(now);
      target.setUTCHours(24, 0, 0, 0); 
      const diff = target.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft("NOW");
      } else {
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}H ${minutes}M`);
      }
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  // --- LOGIC PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  const handlePageChange = (page: number) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-black font-mono selection:bg-blue-200 relative overflow-x-hidden">
      <PixelBackground /> 

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-4 border-black px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
             <button className="w-10 h-10 bg-gray-100 flex items-center justify-center border-2 border-black shadow-hard-sm hover:translate-y-1 hover:shadow-none transition-none">
                <ArrowLeft size={20} />
             </button>
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 border-2 border-black flex items-center justify-center text-white animate-pulse">
                <Terminal size={20} />
             </div>
             <div>
                <h1 className="text-xl font-bold uppercase tracking-tighter hidden md:block">
                  Poly<span className="text-blue-600">Feed</span>
                </h1>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status Cron */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 border-2 border-black text-gray-500">
             <Clock size={14} />
             <span className="text-[10px] font-bold uppercase">
                NEXT AUTO: {timeLeft}
             </span>
          </div>

          {/* BUTTON REGENERATE (NEW) */}
          <button 
            onClick={handleRegenerate} 
            disabled={scanning}
            className="px-4 py-2 bg-black text-white border-2 border-black shadow-hard-sm hover:translate-y-1 hover:shadow-none disabled:opacity-50 font-bold text-xs uppercase flex gap-2 items-center transition-all"
          >
            <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
            {scanning ? "GENERATING..." : "REGENERATE"}
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Banner Info */}
        <div className="mb-8 flex items-center justify-between">
           <div className="p-2 bg-blue-50 border-2 border-black shadow-hard-sm">
              <p className="text-[10px] font-bold uppercase text-blue-800">
                 PAGE {currentPage} OF {totalPages || 1}
              </p>
           </div>
        </div>

        {/* Loading State */}
        {loading && logs.length === 0 && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map((i) => (
                <div key={i} className="h-64 bg-white border-4 border-black shadow-hard animate-pulse flex items-center justify-center">
                    <span className="text-xs font-bold">`{'>'}` LOADING FEED...</span>
                </div>
              ))}
           </div>
        )}

        {/* FEED GRID (6 Items per Page) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentLogs.map((log) => (
            <article key={log.id} className="flex flex-col bg-white border-4 border-black shadow-hard hover:-translate-y-2 transition-transform duration-200 h-full">
              
              {/* CARD HEADER */}
              <div className="p-5 border-b-2 border-black bg-blue-50 flex-grow">
                 <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-[10px] font-bold text-blue-600 uppercase border border-blue-200 bg-white px-2 py-1">
                       Alpha Signal #{log.id}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                       {new Date(log.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </span>
                 </div>
                 
                 <a href={`https://polymarket.com/event/${log.market_slug}`} target="_blank" className="group">
                    <h3 className="font-bold text-lg leading-tight uppercase group-hover:text-blue-600 transition-colors line-clamp-3">
                       {log.market_title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-500 group-hover:underline">
                       <BarChart2 size={12} />
                       Source
                    </div>
                 </a>
              </div>

              {/* CARD BODY */}
              <div className="p-5 flex flex-col gap-4">
                 <div className="w-full h-7 flex border-2 border-black text-[10px] font-bold uppercase leading-none shadow-[2px_2px_0_0_#000]">
                     <div 
                        className="bg-blue-600 text-white h-full flex items-center pl-2 overflow-hidden whitespace-nowrap"
                        style={{ width: `${log.odds}%`, borderRight: log.odds < 100 ? '2px solid black' : 'none' }}
                     >
                        {log.odds > 15 && `YES ${log.odds}%`}
                     </div>
                     <div className="bg-red-500 text-white flex-1 h-full flex items-center justify-end pr-2 overflow-hidden whitespace-nowrap">
                        {100 - log.odds > 15 && `NO ${100 - log.odds}%`}
                     </div>
                 </div>

                 <div className="bg-gray-100 p-3 border-2 border-black text-xs leading-relaxed font-bold text-gray-800 lowercase">
                    <span className="text-blue-600 mr-2">`{'>'}`</span>
                    {log.chill_analysis}
                 </div>
              </div>

              {/* CARD FOOTER */}
              <div className="p-4 border-t-2 border-black bg-gray-50 mt-auto">
                 <a 
                    href="https://x.com/polyxvote" 
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-black text-white text-xs font-bold uppercase border-2 border-black shadow-hard-sm hover:bg-blue-600 hover:shadow-none hover:translate-y-1 transition-all"
                 >
                    <ExternalLink size={14} /> Vote on X
                 </a>
              </div>
            </article>
          ))}
        </div>

        {/* --- PAGINATION CONTROLS --- */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 bg-white border-2 border-black shadow-hard-sm hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-hard-sm transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-4">
                 PAGE {currentPage} / {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 bg-white border-2 border-black shadow-hard-sm hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:translate-y-0 disabled:shadow-hard-sm transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        
      </main>
    </div>
  );
}