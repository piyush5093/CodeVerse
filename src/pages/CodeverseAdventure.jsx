import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { VscScreenFull } from "react-icons/vsc";

export default function CodeverseAdventure() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) { /* Safari */
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) { /* IE11 */
        containerRef.current.msRequestFullscreen();
      }
    }
  };

  return (
    <div 
      className={`w-full flex flex-col gap-4 text-white overflow-hidden ${
        isDashboard 
          ? "h-[calc(100vh-3.5rem-5.5rem)]" 
          : "mx-auto w-11/12 max-w-maxContent h-[calc(100vh-3.5rem-3.5rem)] py-4"
      }`}
    >
      {/* Header Info Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-50 to-yellow-200 bg-clip-text text-transparent">
            Codeverse Adventure
          </h1>
          <p className="text-richblack-300 text-xs mt-0.5">
            Play the interactive programming adventure game. Use your keyboard to solve code challenges!
          </p>
        </div>
        
        {/* Fullscreen control */}
        <button
          onClick={handleFullscreen}
          className="self-start sm:self-center flex items-center gap-2 px-3 py-1.5 rounded-lg border border-yellow-50/30 bg-richblack-800 text-yellow-50 text-xs font-semibold hover:bg-yellow-50 hover:text-richblack-900 hover:border-yellow-50 transition-all duration-300 shadow-[0_0_10px_rgba(255,214,10,0.1)] hover:shadow-[0_0_15px_rgba(255,214,10,0.3)]"
          title="Play Fullscreen"
        >
          <VscScreenFull className="text-sm font-bold" />
          <span>Fullscreen Mode</span>
        </button>
      </div>

      {/* Embedded Game Iframe Container */}
      <div 
        ref={containerRef}
        className="relative flex-1 w-full rounded-xl border border-richblack-700 bg-richblack-950 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
      >
        {loading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-richblack-950/90 z-10 gap-4">
            <div className="spinner"></div>
            <p className="text-richblack-200 text-sm font-semibold tracking-wide animate-pulse">
              Connecting Codeverse Adventure...
            </p>
          </div>
        )}
        <iframe
          src="https://codeverse-adventure.vercel.app"
          title="Codeverse Adventure"
          className="w-full h-full border-none"
          onLoad={() => setLoading(false)}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
