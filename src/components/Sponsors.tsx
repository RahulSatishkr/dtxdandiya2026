import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';

// Sponsors in alphabetical order
const SPONSORS = [
  {
    name: "Best Western",
    logo: "/assets/sponsors/best_western.png",
    url: "https://www.bestwestern.com/en_US.html"
  },
  {
    name: "Canes",
    logo: "/assets/sponsors/canes.png",
    url: "https://www.raisingcanes.com/"
  },
  {
    name: "Good Molecules",
    logo: "/assets/sponsors/good_molecules.png",
    url: "https://www.goodmolecules.com/"
  },
  {
    name: "India Bazaar",
    logo: "/assets/sponsors/india_bazaar.png",
    url: "https://www.indiabazaardfw.com/"
  },
  {
    name: "Kayura",
    logo: "/assets/sponsors/kayura.png",
    url: "https://kayuraeffect.com/"
  },
  {
    name: "LMNT",
    logo: "/assets/sponsors/LMNT.png",
    url: "https://drinklmnt.com/"
  },
  {
    name: "Milaana Dance",
    logo: "/assets/sponsors/milaana.png",
    url: "https://milaanadance.com/"
  },
  {
    name: "Red Bull",
    logo: "/assets/sponsors/red_bull.png",
    url: "https://www.redbull.com/us-en"
  },
];

const CARD_ROTATIONS = [-2.4, 1.8, -1.2, 2.6, 1.1, -2, 2.2, -1.6];

export default function Sponsors() {
  return (
    <div className="homepage-section relative overflow-hidden bg-[#050507]">
      {/* Magical Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[#050507]">
          {/* Ambient Light Effect */}
          {/*<div className="absolute inset-0 opacity-40"
            style={{
              background: `
                radial-gradient(circle at 20% 30%, rgba(29, 78, 216, 0.15), transparent 70%),
                radial-gradient(circle at 80% 70%, rgba(29, 78, 216, 0.15), transparent 70%)
              `
            }}
          />*/}
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl">
        {/* Title */}
        <motion.div 
          className="homepage-section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p>With support from</p>
          <h2>Sponsors</h2>
        </motion.div>

        {/* Investigation-style partner board */}
        <div className="partner-pinboard">
          <div className="evidence-thread thread-one" aria-hidden="true" />
          <div className="evidence-thread thread-two" aria-hidden="true" />
          <div className="evidence-thread thread-three" aria-hidden="true" />
          <div className="pinboard-label" aria-hidden="true">Friends of DTX · 2027</div>
          <div className="partner-grid">
          {SPONSORS.map((sponsor, index) => (
            <motion.div
              key={sponsor.name}
              className="partner-card-wrap group"
              style={{ rotate: `${CARD_ROTATIONS[index]}deg` }}
              initial={{ opacity: 0, y: 28, rotate: CARD_ROTATIONS[index] * 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: CARD_ROTATIONS[index] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <span className="pushpin" aria-hidden="true" />
              <a
                href={sponsor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="partner-paper"
              >
                <div className="partner-logo-area">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="partner-logo"
                  />
                  <FaExternalLinkAlt className="partner-external-icon" />
                </div>
                <span className="partner-name">{sponsor.name}</span>
              </a>
            </motion.div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
