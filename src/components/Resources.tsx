import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaTicketAlt, FaMusic } from 'react-icons/fa';

interface Contact {
  position: string;
  name: string;
  phone: string;
}

const contacts: Contact[] = [
  // Directors (alphabetical by first name)
  { position: "Director", name: "Aaryaa Kabira", phone: "(972) 510-7918" },
  { position: "Director", name: "Isha Patel", phone: "(203) 565-8211" },
  { position: "Director", name: "Rishil Uppaluru", phone: "(512) 521-9355" },
  
  // Logistics (alphabetical by first name)
  { position: "Logistics", name: "Ahimsa Yukta", phone: "(832) 323-3820" },
  { position: "Logistics", name: "Siya Patel", phone: "(580) 374-2404" },
  
  // Head Liasons (alphabetical by first name)
  { position: "Head Liason", name: "Adrian Gaspar", phone: "(732) 668-1820" },
  { position: "Head Liason", name: "Hima Patel", phone: "(214) 995-4423" },

  // Tech (alphabetical by first name)
  { position: "Tech", name: "Manav Gandhi", phone: "(832) 829-5730" },
  { position: "Tech", name: "Samarth Bikki", phone: "(512) 917-8857" },
];

export default function Resources() {
  return (
    <div className="homepage-section relative overflow-hidden bg-[#050507]">
      {/* Background Effects */}
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Title */}
        <header className="homepage-section-header">
          <p>Weekend essentials</p>
          <h2>Concierge Desk</h2>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Quick Contact Section */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="resource-panel">
              {/* Section Title */}
              <h3 className="resource-panel-title">
                Quick Contact
              </h3>

              {/* Contact Table */}
              <div className="space-y-4">
                {contacts.map((contact, index) => (
                  <motion.div
                    key={index}
                    className="group relative flex items-center justify-between py-2 px-4 rounded-lg hover:bg-[#ffb1ba]-900/10 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex-1 min-w-[120px]">
                      <span className="text-[#ffb1ba]/80 font-cormorant text-lg">
                        {contact.position}
                      </span>
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-[#ffb1ba]/90 font-cormorant text-lg">
                        {contact.name}
                      </span>
                    </div>
                    <div className="flex-1 text-right">
                      <a 
                        href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                        className="text-[#ffb1ba]/70 font-cormorant group-hover:text-[#ffb1ba]-400 transition-colors duration-300 text-lg"
                      >
                        {contact.phone}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Event Information Section */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="resource-panel">
              <h3 className="resource-panel-title">
                Afterparty Details
              </h3>

              <div className="space-y-8">
                {/* Location */}
                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-lg bg-[#ffb1ba]-900/5"
                  whileHover={{ scale: 1.02 }}
                >
                  <FaMapMarkerAlt className="text-[#ffb1ba] text-2xl mt-1" />
                  <div>
                    <h4 className="text-[#ffb1ba] font-cormorant text-xl mb-2">Location</h4>
                    <p className="text-[#ffb1ba]/80 font-cormorant">
                      The Reserve
                      <br />
                      1310 Chisholm Trail #100, Euless, TX 76039
                    </p>
                  </div>
                </motion.div>

                {/* Required Items */}
                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-lg bg-[#ffb1ba]-900/5"
                  whileHover={{ scale: 1.02 }}
                >
                  <FaTicketAlt className="text-[#ffb1ba] text-2xl mt-1" />
                  <div>
                    <h4 className="text-[#ffb1ba] font-cormorant text-xl mb-2">Required to Bring</h4>
                    <p className="text-[#ffb1ba]/80 font-cormorant">
                      NFC Bands (Admission)
                      <br />
                      IDs to drink
                    </p>
                  </div>
                </motion.div>

                {/* Dance Moves */}
                <motion.div 
                  className="flex items-start space-x-4 p-4 rounded-lg bg-[#ffb1ba]-900/5"
                  whileHover={{ scale: 1.02 }}
                >
                  <FaMusic className="text-[#ffb1ba] text-2xl mt-1" />
                  <div>
                    <h4 className="text-[#ffb1ba] font-cormorant text-xl mb-2">Don't Forget</h4>
                    <p className="text-[#ffb1ba]/80 font-cormorant">
                      Your best dance moves
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ambient Light Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(16,185,129,0.1)_0%,_transparent_60%)]"></div>
      </div>

      {/* Decorative Owl 
      <motion.div 
        className="absolute -bottom-4 right-[15%] pointer-events-none z-20 hidden lg:block"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, 0, -5, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <GiOwl className="text-emerald-400/60 w-32 h-32 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
        </motion.div>
      </motion.div>*/}
    </div>
  );
} 
