import { useState } from 'react';
import { motion } from 'framer-motion';

interface ScheduleItem {
  what: string;
  where: string;
  when: string;
}

const fridaySchedule: ScheduleItem[] = [
  { what: "Registration", where: "Hotel Lobby", when: "12:00 PM" },
  { what: "Dinner", where: "Hotel Lobby", when: "4:30 PM" },
  { what: "Mixer", where: "Hotel Ballroom", when: "5:15 PM" },
  { what: "Captains Meeting", where: "Boardroom", when: "6:45 PM" },
  { what: "Practice", where: "Hotel Ballroom", when: "7:30 PM" },
];

const saturdaySchedule: ScheduleItem[] = [
  { what: "Props", where: "Marshall Center", when: "5:00 AM" },
  { what: "Tech Time", where: "Marshall Center", when: "8:35 AM" },
  { what: "Photoshoot", where: "Marshall Center", when: "3:50 PM" },
  { what: "Doors Open", where: "Marshall Center", when: "5:00 PM" },
  { what: "Showtime", where: "Marshall Center", when: "5:30 PM" },
  { what: "Awards", where: "Marshall Center", when: "9:00 PM" },
  { what: "Afterparty", where: "The Reserve", when: "10:00 PM" },
];

export default function Schedule() {
  const [activeDay, setActiveDay] = useState<'friday' | 'saturday'>('friday');

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      {/* Content */}
      <div className="relative z-20">
        {/* Tabs */}
        <div className="flex justify-center gap-8 mb-8">
          {['friday', 'saturday'].map((day) => (
            <motion.button
              key={day}
              onClick={() => setActiveDay(day as 'friday' | 'saturday')}
              className={`
                relative px-6 py-1 text-3xl font-cormorant tracking-wider
                transition-all duration-500
                ${activeDay === day 
                  ? 'text-[#C5A572] glow-text scale-110' 
                  : 'text-white/70 hover:text-[#C5A572] hover:glow-text'}
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {day}
            </motion.button>
          ))}
        </div>

        {/* Schedule Table */}
        <div className="overflow-hidden px-4 md:px-[200px]">
          <table className="w-full">
            {/* Column Headers */}
            <thead>
              <tr className="border-spacing-0">
                <th className="text-center pb-4 w-1/3">
                  <motion.span 
                    className="font-cormorant text-2xl text-[#C5A572] tracking-wider"
                    whileHover={{ scale: 1.1 }}
                  >
                    WHAT
                  </motion.span>
                </th>
                <th className="text-center pb-4 w-1/3">
                  <motion.span 
                    className="font-cormorant text-2xl text-[#C5A572] tracking-wider"
                    whileHover={{ scale: 1.1 }}
                  >
                    WHERE
                  </motion.span>
                </th>
                <th className="text-center pb-4 w-1/3">
                  <motion.span 
                    className="font-cormorant text-2xl text-[#C5A572] tracking-wider"
                    whileHover={{ scale: 1.1 }}
                  >
                    WHEN
                  </motion.span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(activeDay === 'friday' ? fridaySchedule : saturdaySchedule).map((item, index) => (
                <motion.tr 
                  key={index}
                  className="group transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td className="py-[2px] text-center w-1/3">
                    <span className="font-cormorant text-xl text-white group-hover:glow-text transition-all duration-300">
                      {item.what}
                    </span>
                  </td>
                  <td className="py-[2px] text-center w-1/3">
                    <span className="font-cormorant text-lg text-white group-hover:glow-text transition-all duration-300">
                      {item.where}
                    </span>
                  </td>
                  <td className="py-[2px] text-center w-1/3">
                    <span className="font-cormorant text-lg text-white group-hover:glow-text transition-all duration-300">
                      {item.when}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
