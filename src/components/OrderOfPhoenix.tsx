import React, { useState, useEffect } from 'react';

interface Committee {
  name: string;
  image: string;
  title: string;
}

const committees: Committee[] = [
  { name: "Directors", image: "/assets/team/Directors.jpg", title: "Commanding the Mission" },
  { name: "Logistics", image: "/assets/team/Logistics.jpeg", title: "Keeping the Gate Contained" },
  { name: "Registration", image: "/assets/team/Registration.jpg", title: "Clearance to Enter" },
  { name: "Head Liaison", image: "/assets/team/HeadLiaisons.jpg", title: "Keeping the Party Connected" },
  { name: "Tech/External", image: "/assets/team/Tech.jpg", title: "Tuning the Signal" },
  { name: "Fundraising", image: "/assets/team/Fundraising.jpeg", title: "Powering the Operation" },
  { name: "Hospitality", image: "/assets/team/Hospitality.jpeg", title: "Safe Haven from the Upside Down" },
  { name: "Mixer/Social", image: "/assets/team/Mixer.jpeg", title: "Gathering the Party" },
  { name: "Advisors", image: "/assets/team/Advisors.jpg", title: "Guidance from the Other Side" },
  { name: "Afterparty", image: "/assets/team/Afterparty.jpeg", title: "After Curfew" },
];

export default function OrderOfPhoenix() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % committees.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

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
                  <div className={`transform transition-all duration-500 
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
                  <div className={`transform transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
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
