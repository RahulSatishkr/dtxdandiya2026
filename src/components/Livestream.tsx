import React from 'react';
import { motion } from 'framer-motion';

export default function Livestream() {
  return (
    <div className="bg-[#050507] relative overflow-hidden py-16 upside-down-section">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#050507]">
          {/*[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#183331] via-[#183331] to-[#183331]*/}
          <div className="absolute inset-0" 
            style={{
              background: `
                radial-gradient(circle at 50% 30%, rgba(255, 255, 255, 0.05), transparent 20%),
                radial-gradient(circle at 50% 70%, rgba(255, 255, 255, 0.05), transparent 20%)
              `
            }}
          />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-4xl">
        {/* Title */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-6xl md:text-7xl font-edwardian text-center text-white mb-16 glow-text-intense mx-auto"
          style={{ wordSpacing: '0.1em' }}>            
          Live Stream
            <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-lg blur-lg -z-10"></div>
          </h2>
        </motion.div>

        {/* Video Container */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="bg-black/40  rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="space-y-6">
              {/* YouTube Embed */}
              <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg border border-white/20">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/live/M6yG0KuC7gw?si=5mOY4XecCcl2sc5j"
                  title="DTX Dandiya 2026 Livestream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>

          {/* Decorative Corner Elements */}
          <div className="absolute -inset-px pointer-events-none">
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-[#C5A572] rounded-tl-lg"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-[#C5A572] rounded-tr-lg"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-[#C5A572] rounded-bl-lg"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-[#C5A572] rounded-br-lg"></div>
          </div>
        </motion.div>
      </div>

      {/* Ambient Light Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(255, 255, 255, 0.05)_0%,_transparent_60%)]"></div>
        {/*[radial-gradient(circle_at_50%_120%,_rgba(220,38,38,0.1)_0%,_transparent_60%)]*/}
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-white/20 rounded-tl-lg"></div>
      <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-white/20 rounded-tr-lg"></div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-white/20 rounded-bl-lg"></div>
      <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-lg"></div>
    </div>
  );
} 
