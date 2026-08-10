import { useEffect, useState } from 'react';
import { EVENT_DATE } from '../config/event';

function calculateTimeLeft() {
  const difference = Math.max(0, EVENT_DATE.getTime() - Date.now());

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextTimeLeft = calculateTimeLeft();
      setTimeLeft(nextTimeLeft);

      if (Object.values(nextTimeLeft).every((value) => value === 0)) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const countdownUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hrs', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-7 text-center text-white">
      {countdownUnits.map(({ label, value }) => (
        <div key={label} className="flex min-w-14 sm:min-w-20 flex-col items-center">
          <div className="text-4xl sm:text-5xl font-light glow-text tabular-nums tracking-wider">
            {value.toString().padStart(2, '0')}
          </div>
          <div className="mt-2 text-[0.65rem] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.35em] text-white/80 font-roca">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
