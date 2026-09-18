import { useState, useEffect } from 'react';

// Import all images as URLs
const committees = [
  {
    name: 'Directors',
    image: "/assets/team/Directors-2027.jpeg",
    description: 'Leading the magic'
  },
  {
    name: 'Logistics',
    image: "/assets/team/Logistics-2027.jpg",
    description: 'Making it happen'
  },
  {
    name: 'Registration',
    image: "/assets/team/Registration-2027.jpeg",
    description: 'Managing participants'
  },
  {
    name: 'Head Liaison',
    image: "/assets/team/Head-Liaison-2027.jpeg",
    description: 'Team coordination'
  },
  {
    name: 'Tech',
    image: "/assets/team/Tech-2027.jpg",
    description: 'Technical support'
  },
  {
    name: 'Finance',
    image: "/assets/team/Finance-2027.jpg",
    description: 'Resource gathering'
  },
  {
    name: 'Hospitality',
    image: "/assets/team/Hospitality-2027.jpeg",
    description: 'Guest experience'
  },
  {
    name: 'Mixer',
    image: "/assets/team/Mixer-2027.jpeg",
    description: 'Event socializing'
  },
  {
    name: 'Advisors',
    image: "/assets/team/Advisors-2027.jpeg",
    description: 'Brand outreach'
  }
];

export default function CommitteeCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % committees.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-96 overflow-hidden rounded-lg">
      {committees.map((committee, index) => (
        <div
          key={committee.name}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentIndex ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              <img 
                src={committee.image} 
                alt={committee.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-orange/50 flex flex-col items-center justify-center">
                <h3 className="text-2xl font-bold text-amber-500 mb-2">{committee.name}</h3>
                <p className="text-gray-300">{committee.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {committees.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-amber-500' : 'bg-gray-500'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
