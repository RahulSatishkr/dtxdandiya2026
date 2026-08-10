import { motion } from 'framer-motion';
import { FaInstagram, FaTiktok } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="w-full bg-black/40 backdrop-blur-sm border-t border-[#C5A572]/20">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Left Side - Creator credit */}
          <motion.div 
            className="text-white/80 font-cormorant tracking-wider"
            whileHover={{ scale: 1.05 }}
          >
            Made with strange signals by R
          </motion.div>

          {/* Middle - Copyright */}
          <div className="text-white/60 font-cormorant tracking-wide text-sm">
            Copyright © 2027 DTX Dandiya
          </div>

          {/* Right Side - Social Links */}
          <div className="flex items-center gap-4">
            <motion.a
              href="https://www.instagram.com/dtx.dandiya/?hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-[#C5A572] transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaInstagram className="w-6 h-6" />
            </motion.a>
            <motion.a
              href="https://www.tiktok.com/@dtx.dandiya"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 hover:text-[#C5A572] transition-colors duration-300"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTiktok className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
} 
