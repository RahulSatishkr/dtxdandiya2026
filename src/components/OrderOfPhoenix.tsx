import React, { useState, useEffect } from 'react';

interface Committee {
  name: string;
  image: string;
  title: string;
}

const committees: Committee[] = [
  { name: "Directors", image: "/assets/team/Directors-2027.jpeg", title: "Commanding the Mission" },
  { name: "Logistics", image: "/assets/team/Logistics-2027.jpg", title: "Keeping the Gate Contained" },
  { name: "Registration", image: "/assets/team/Registration-2027.jpeg", title: "Clearance to Enter" },
  { name: "Head Liaison", image: "/assets/team/Head-Liaison-2027.jpeg", title: "Keeping the Party Connected" },
  { name: "Tech", image: "/assets/team/Tech-2027.jpg", title: "Tuning the Signal" },
  { name: "Finance", image: "/assets/team/Finance-2027.jpg", title: "Powering the Operation" },
  { name: "Hospitality", image: "/assets/team/Hospitality-2027.jpeg", title: "Safe Haven from the Upside Down" },
  { name: "Mixer", image: "/assets/team/Mixer-2027.jpeg", title: "Gathering the Party" },
  { name: "Advisors", image: "/assets/team/Advisors-2027.jpeg", title: "Guidance from the Other Side" },
];

export default function OrderOfPhoenix() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let fadeTimer: ReturnType<typeof setTimeout> | undefined;
    const nextIndex = (activeIndex + 1) % committees.length;
    const nextImage = new Image();
    nextImage.src = committees[nextIndex].image;
    // Start loading immediately and handle failures before the display timer fires.
    const imageReady = nextImage.decode().then(() => true, () => false);

    const timer = setTimeout(async () => {
      const ready = await imageReady;
      if (cancelled || !ready) return;

      setIsTransitioning(true);
      fadeTimer = setTimeout(() => {
        if (cancelled) return;
        setActiveIndex(nextIndex);
        setIsTransitioning(false);
      }, 300);
    }, 1700);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(fadeTimer);
    };
  }, [activeIndex]);

  return (
    <div className="homepage-section relative overflow-hidden bg-[#050507]">
      {/* Background Effects */}
      {/*<div className="absolute inset-0">
        <div className="absolute inset-0 bg-radial-glow from-orange-500/20 via-orange-700/10 to transparent"></div>
      </div>*/}
      
      <div className="relative z-10">
        {/* Title with Phoenix Wings */}
        <header className="homepage-section-header max-w-7xl mx-auto px-5 sm:px-8">
          <p>Meet the organizers</p>
          <h2>The Party</h2>
        </header>

        {/* Committee Display */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative">
            {/* Content Container */}
            <div className="party-feature relative overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Image Display */}
                <div className="relative w-full md:w-2/3 order-1 md:order-2">
                  <div className={`transform transition-all duration-300 
                    ${isTransitioning ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
                  >
                    {/* Image Container with Dynamic Aspect Ratio */}
                    <div className="relative pt-[100%] md:pt-[75%]">
                      <img 
                        src={committees[activeIndex].image}
                        alt={committees[activeIndex].name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {/* Image Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                    </div>
                  </div>
                </div>

                {/* Committee Info */}
                <div className="relative w-full md:w-1/3 min-w-0 overflow-hidden p-7 md:p-10 flex flex-col justify-center order-2 md:order-1 bg-[#0b0b0d]">
                  <div className={`transform transition-all duration-300 ${isTransitioning ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
                    <p className="party-index">{String(activeIndex + 1).padStart(2, '0')} / {String(committees.length).padStart(2, '0')}</p>
                    <h3 className="committee-title font-cormorant text-white mb-4">
                      {committees[activeIndex].name}
                    </h3>
                    <p className="text-base xl:text-lg leading-snug text-white/60 font-sans">
                      {committees[activeIndex].title}
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 border border-white/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Ambient Light Effect 
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(251,146,60,0.15)_0%,_transparent_60%)]"></div>
      </div>*/}
    </div>
  );
} 
