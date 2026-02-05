"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PixelBackground from '@/components/PixelBackground';
import { 
  Terminal, 
  ExternalLink, 
  RefreshCw, 
  ArrowLeft, 
  BarChart2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// --- TYPES ---
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
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Fetch Feed
  const fetchFeed = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('alpha_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setLogs(data);
    setLoading(false);
  };

  const triggerScan = async () => {
    setScanning(true);
    try { 
      await fetch('/api/cron'); 
      await fetchFeed(); 
    } catch (e) {
      console.error(e);
    }
    setScanning(false);
  };

  useEffect(() => { fetchFeed(); }, []);

  // --- PAGINATION LOGIC ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = logs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
             <h1 className="text-xl font-bold uppercase tracking-tighter hidden md:block">
               Poly<span className="text-blue-600">Feed</span>
             </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex text-[10px] font-bold bg-gray-100 border-2 border-black px-3 py-2 uppercase gap-2">
             <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
             <span>System Online</span>
          </div>
          <button 
            onClick={triggerScan} 
            disabled={scanning}
            className="px-4 py-2 bg-black text-white border-2 border-black shadow-hard-sm hover:translate-y-1 hover:shadow-none disabled:opacity-50 font-bold text-xs uppercase flex gap-2 items-center transition-all"
          >
            <RefreshCw size={14} className={scanning ? "animate-spin" : ""} />
            {scanning ? "SCANNING..." : "REFRESH"}
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT (HORIZONTAL GRID) --- */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Loading State */}
        {loading && logs.length === 0 && (
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1,2,3].map((i) => (
                <div key={i} className="h-64 bg-white border-4 border-black shadow-hard animate-pulse flex items-center justify-center">
                    <span className="text-xs font-bold">`{'>'}` LOADING DATA...</span>
                </div>
              ))}
           </div>
        )}

        {/* FEED GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentLogs.map((log) => (
            <article key={log.id} className="flex flex-col bg-white border-4 border-black shadow-hard hover:-translate-y-2 transition-transform duration-200 h-full">
              
              {/* CARD HEADER: Market Question */}
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
                    <h3 className="font-bold text-lg leading-tight uppercase group-hover:text-blue-600 transition-colors">
                       {log.market_title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-500 group-hover:underline">
                       <BarChart2 size={12} />
                       View Market Source
                    </div>
                 </a>
              </div>

              {/* CARD BODY: Odds & Analysis */}
              <div className="p-5 flex flex-col gap-4">
                 
                 {/* ODDS BAR (SPLIT YES/NO) */}
                 <div className="w-full h-7 flex border-2 border-black text-[10px] font-bold uppercase leading-none shadow-[2px_2px_0_0_#000]">
                     {/* YES Section */}
                     <div 
                        className="bg-blue-600 text-white h-full flex items-center pl-2 overflow-hidden whitespace-nowrap transition-all duration-500"
                        style={{ width: `${log.odds}%`, borderRight: log.odds < 100 ? '2px solid black' : 'none' }}
                     >
                        {log.odds > 15 && `YES ${log.odds}%`}
                     </div>
                     
                     {/* NO Section */}
                     <div className="bg-red-500 text-white flex-1 h-full flex items-center justify-end pr-2 overflow-hidden whitespace-nowrap">
                        {100 - log.odds > 15 && `NO ${100 - log.odds}%`}
                     </div>
                 </div>

                 {/* Chill Analysis */}
                 <div className="bg-gray-100 p-3 border-2 border-black text-xs leading-relaxed font-bold text-gray-800 lowercase">
                    <span className="text-blue-600 mr-2">`{'>'}`</span>
                    {log.chill_analysis}
                 </div>
              </div>

              {/* CARD FOOTER: Actions */}
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
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`w-10 h-10 border-2 border-black font-bold text-xs transition-all ${
                    currentPage === number
                      ? "bg-blue-600 text-white shadow-none translate-y-1"
                      : "bg-white text-black shadow-hard-sm hover:translate-y-1 hover:shadow-none"
                  }`}
                >
                  {number}
                </button>
              ))}
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