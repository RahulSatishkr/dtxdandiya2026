import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from "react-icons/io5";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050507] flex items-center justify-center bg-cover bg-center relative overflow-hidden stranger-portal-bg">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      <div className="relative z-10 max-w-2xl mx-4 text-center">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-8 px-4 py-2 text-white/80 font-edwardian text-lg
                   hover:text-white transition-colors duration-300 flex items-center
                   group mx-auto"
        >
          <IoArrowBack className="mr-2 text-xl transition-transform duration-300 
                                group-hover:-translate-x-1" />
          Return to Platform 9¾
        </button>

        <div className="bg-[#183331]/40 backdrop-blur-lg p-8 rounded-lg border border-white/10">
          <h1 className="text-6xl md:text-7xl font-edwardian text-white mb-6 glow-text">
            404
          </h1>
          
          <h2 className="text-6xl md:text-7xl font-edwardian text-center text-white mb-16 glow-text-intense mx-auto"
          style={{ wordSpacing: '0.1em' }}>
          Page Not Found
          </h2>

          <p className="text-white/60 font-edwardian text-lg mb-8">
            This page has vanished. Even the Marauder's Map couldn't locate it!
            <br />
            
          </p>

          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 text-xl text-white font-edwardian 
                     bg-[#183331]/40 border border-white/20 rounded-lg
                     hover:bg-white/10 transition-colors duration-300
                     magical-border"
          >
            Lumos
          </button>

          {/* Decorative Corner Elements */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-lg"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-lg"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl-lg"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-lg"></div>
        </div>
      </div>
    </div>
  );
} 
