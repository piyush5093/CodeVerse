import React, { useState } from "react";
import { useLocation } from "react-router-dom";

export default function DsaVisualizer() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const [loading, setLoading] = useState(true);

  return (
    <div className={`w-full ${isDashboard ? "p-6" : "mx-auto w-11/12 max-w-maxContent py-12"} text-white flex flex-col gap-6`}>
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-semibold text-richblack-5">
          DSA Interactive Visualizer
        </h1>
        <p className="text-richblack-300 mt-2 text-sm max-w-[800px]">
          Visualize algorithms in real-time, trace code execution steps, and master data structures (Sorting, Pathfinding, Graphs, Trees) using our interactive visual sandbox.
        </p>
      </div>

      {/* Embedded Visualizer Iframe */}
      <div className="relative w-full rounded-2xl border border-richblack-700 bg-richblack-900 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] h-[750px] transition-all">
        {loading && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-richblack-950/90 z-10 gap-4">
            <div className="spinner"></div>
            <p className="text-richblack-200 text-sm font-semibold tracking-wide animate-pulse">
              Initializing DSA Visualizer...
            </p>
          </div>
        )}
        <iframe
          src="https://algo-ai-rosy.vercel.app/"
          title="DSA Visualizer"
          className="w-full h-full border-none"
          onLoad={() => setLoading(false)}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
