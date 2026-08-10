import React from 'react';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaExternalLinkAlt } from 'react-icons/fa';

const locations = [
  {
    name: "Holiday Inn Express & Suites North Dallas at Preston by IHG",
    description: "The home base for teams as the weekend unfolds",
    address: "6055 Lyndon B Johnson Fwy, Dallas, TX 75240",
    mapsUrl: "https://maps.app.goo.gl/C4Rw2hLF91FLFSSK6",
    type: "Hotel & Registration"
  },
  {
    name: "Marshall Family Performing Arts Center",
    description: "Where the competition unfolds",
    address: "4141 Spring Valley Rd, Addison, TX 75001",
    mapsUrl: "https://maps.app.goo.gl/TooUxNAjwDPthVBKA",
    type: "Main Event"
  },
  {
    name: "The Reserve",
    description: "Where the weekend's celebrations come alive",
    address: "1310 Chisholm Trail #100, Euless, TX 76039 ",
    mapsUrl: "https://maps.app.goo.gl/tPEBYUMJPpPZqi168",
    type: "Afterparty"
  }
];

export default function Locations() {
  return (
    <div className="bg-[#050507] relative overflow-hidden py-16 upside-down-section">
      {/* Title */}
      <h2 className="text-6xl md:text-7xl font-edwardian text-center text-white mb-16 glow-text-intense mx-auto"
          style={{ wordSpacing: '0.1em' }}>        
          Premier Venues
      </h2>

      {/* Grid Container */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {/* Card */}
              <div className="bg-[#ffb1ba]/40 backdrop-blur-sm rounded-xl p-6 border border-[#ffb1ba]/20 h-full
                            transform transition-transform duration-500 hover:scale-[1.02]">
                {/* Location Type Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-[#ffb1ba]/100 rounded-full text-sm font-cormorant text-black/100">
                    {location.type}
                  </span>
                </div>

                {/* Content */}
                <div className="mt-4 space-y-4">
                  <h3 className="text-2xl font-cormorant text-white text-center">
                    {location.name}
                  </h3>
                  
                  <p className="text-sm font-cormorant text-[#ffb1ba]-200/70 text-center">
                    {location.description}
                  </p>

                  <div className="flex items-center justify-center space-x-2 text-white/80">
                    <FaMapMarkerAlt className="text-[#ffb1ba]" />
                    <span className="text-sm">{location.address}</span>
                  </div>

                  {/* Map Link */}
                  <div className="text-center">
                    <a
                      href={location.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-[#ffb1ba]-900/30 rounded-lg
                               hover:bg-[#ffb1ba]-900/50 transition-colors duration-300 text-white/90
                               border border-[#ffb1ba]/80 hover:border-[#ffb1ba]-500/50"
                    >
                      <span className="font-cormorant">View on Map</span>
                      <FaExternalLinkAlt className="text-[#ffb1ba]" />
                    </a>
                  </div>
                </div>

                {/* Decorative Corner Elements */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-[#ffb1ba]-500/100 rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-[#ffb1ba]-500/100 rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-[#ffb1ba]-500/100 rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-[#ffb1ba]-500/100 rounded-br-lg"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ambient Light Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-"></div>
        {/*[radial-gradient(circle_at_50%_120%,_rgba(147,51,234,0.1)_0%,_transparent_60%)]*/}
      </div>
    </div>
  );
} 
