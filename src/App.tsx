import { BrowserRouter as Router, NavLink, Routes, Route } from 'react-router-dom';
import CountdownTimer from './components/CountdownTimer';
import AboutUs from './components/AboutUs';
import OrderOfPhoenix from './components/OrderOfPhoenix';
import Sponsors from './components/Sponsors';
import Resources from './components/Resources';
import Footer from './components/Footer';
import Login from './components/TeamPortal/Login';
import Dashboard from './components/TeamPortal/Dashboard';
import NotFound from './components/NotFound';
import AdminDashboard from './components/TeamPortal/AdminDashboard';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

const navigationItems = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'The Board', href: '/board' },
  { label: 'Sponsors', href: '/sponsors' },
];

function SiteTabs() {
  return (
    <nav className="site-tabs" aria-label="Main navigation">
      <div className="site-tabs-track">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) => isActive ? 'site-tab is-active' : 'site-tab'}
          >
            {item.label}
          </NavLink>
        ))}
        <NavLink to="/team-portal/login" className="site-tab portal-tab">Team Portal</NavLink>
      </div>
    </nav>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 });

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

function ScrollReveal({ children, className = '', id }: { children: ReactNode; className?: string; id?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      id={id}
      className={className}
      initial={reduceMotion ? false : {
        opacity: 0,
        y: 28,
        scale: 0.995,
        filter: 'blur(2px)',
      }}
      whileInView={reduceMotion ? undefined : {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      viewport={{ once: true, amount: 0.1, margin: '0px 0px -8% 0px' }}
      transition={{
        opacity: { duration: 0.55, ease: 'easeOut' },
        filter: { duration: 0.55, ease: 'easeOut' },
        y: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
        scale: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
      }}
    >
      {children}
    </motion.div>
  );
}

function HomePage() {
  const reduceMotion = useReducedMotion();
  const storyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: storyProgress } = useScroll({
    target: storyRef,
    offset: ['start start', 'end end'],
  });
  const heroBackgroundY = useTransform(storyProgress, [0, 1], ['0%', reduceMotion ? '0%' : '10%']);
  const heroScale = useTransform(storyProgress, [0, 1], [1, reduceMotion ? 1 : 1.055]);
  const contentScale = useTransform(storyProgress, [0, 1], [1, reduceMotion ? 1 : 0.96]);
  const contentY = useTransform(storyProgress, [0, 1], [0, reduceMotion ? 0 : -36]);
  const contentOpacity = useTransform(storyProgress, [0, 0.78, 1], [1, 1, reduceMotion ? 1 : 0.72]);

  return (
    <div className="min-h-screen bg-[#050507] stranger-site">
      <ScrollProgress />
      <SiteTabs />
      {/* Hero Section */}
      <div ref={storyRef} id="home" className="apple-scroll-story">
        <motion.div
          className="apple-sticky-stage stranger-hero flex flex-col items-center bg-cover bg-center bg-no-repeat"
          style={{ backgroundPositionY: heroBackgroundY, scale: heroScale }}
        >
          <div className="hero-spores" aria-hidden="true" />

          <motion.div
            className="story-stage"
            style={{ opacity: contentOpacity, scale: contentScale, y: contentY }}
          >
            <h1 className="stranger-title" aria-label="DTX Dandiya">
              <span>DTX</span>
              <span>Dandiya</span>
            </h1>
            <p className="signal-lockup">The Signal Is Live</p>
            <p className="story-eyebrow">February 5, 2027</p>
            <p className="hero-subtitle">One night. Eight teams. A world turned upside down.</p>
            <div className="mb-6"><CountdownTimer /></div>
            <div className="scroll-cue">
              <span>Enter the Upside Down</span>
              <i />
            </div>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-7 lg:gap-9">
            <a 
              href="https://doorlist.app/e/xl892gr?s=yY0Md9POzG" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="
                relative px-6 lg:px-10 py-3 sm:py-4 text-lg lg:text-xl text-white uppercase tracking-[0.2em]
                before:content-[''] before:absolute before:-inset-1
                before:border before:border-white/30 before:rounded-lg
                after:content-[''] after:absolute after:-inset-2
                after:border after:border-white/20 after:rounded-lg
                hover:before:border-white/50 hover:after:border-white/30
                before:transition-colors after:transition-colors
                glow-text hover:glow-text-intense
                magical-border transform hover:scale-105 transition-transform
                stranger-button bg-black/40 backdrop-blur-sm
              "
            >
              Buy Tickets
            </a>

            <a 
              href="/team-portal/login"
              className="
                relative px-6 lg:px-10 py-3 sm:py-4 text-lg lg:text-xl text-white uppercase tracking-[0.2em]
                before:content-[''] before:absolute before:-inset-1
                before:border before:border-white/30 before:rounded-lg
                after:content-[''] after:absolute after:-inset-2
                after:border after:border-white/20 after:rounded-lg
                hover:before:border-white/50 hover:after:border-white/30
                before:transition-colors after:transition-colors
                glow-text hover:glow-text-intense
                magical-border transform hover:scale-105 transition-transform
                stranger-button bg-black/40 backdrop-blur-sm
              "
            >
              Team Portal
            </a>

            <a
              href="https://youtube.com/live/RpKZXHUP-sM?feature=share"
              target="_blank"
              rel="noopener noreferrer"
              className="
                relative px-6 lg:px-10 py-3 sm:py-4 text-lg lg:text-xl text-white uppercase tracking-[0.2em]
                before:content-[''] before:absolute before:-inset-1
                before:border before:border-white/30 before:rounded-lg
                after:content-[''] after:absolute after:-inset-2
                after:border after:border-white/20 after:rounded-lg
                hover:before:border-white/50 hover:after:border-white/30
                before:transition-colors after:transition-colors
                glow-text hover:glow-text-intense
                magical-border transform hover:scale-105 transition-transform
                stranger-button bg-black/40 backdrop-blur-sm
              "
            >
              Watch Live
            </a>
          </div>
          </motion.div>
        </motion.div>
      </div>

      <ScrollReveal><Footer /></ScrollReveal>
    </div>
  );
}

function ContentPage({ children }: { children: ReactNode }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] stranger-site content-page">
      <SiteTabs />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<ContentPage><AboutUs /></ContentPage>} />
        <Route path="/board" element={<ContentPage><OrderOfPhoenix /></ContentPage>} />
        <Route path="/quick-info" element={<ContentPage><Resources /></ContentPage>} />
        <Route path="/sponsors" element={<ContentPage><Sponsors /></ContentPage>} />
        <Route path="/team-portal/login" element={<Login />} />
        <Route path="/team-portal/dashboard" element={<Dashboard />} />
        <Route path="/team-portal/admin" element={<AdminDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
