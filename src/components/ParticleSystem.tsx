
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  direction: number;
}

export const ParticleSystem = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const colors = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#10b981", // green
    "#f59e0b", // amber
  ];

  const createParticle = (id: number): Particle => ({
    id,
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    size: Math.random() * 4 + 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: Math.random() * 2 + 1,
    direction: Math.random() * Math.PI * 2,
  });

  useEffect(() => {
    // Initialize particles
    const initialParticles = Array.from({ length: 20 }, (_, i) => createParticle(i));
    setParticles(initialParticles);

    const animateParticles = () => {
      setParticles(prevParticles =>
        prevParticles.map(particle => {
          let newX = particle.x + Math.cos(particle.direction) * particle.speed;
          let newY = particle.y + Math.sin(particle.direction) * particle.speed;

          // Wrap around screen edges
          if (newX < 0) newX = window.innerWidth;
          if (newX > window.innerWidth) newX = 0;
          if (newY < 0) newY = window.innerHeight;
          if (newY > window.innerHeight) newY = 0;

          return {
            ...particle,
            x: newX,
            y: newY,
          };
        })
      );
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="particles-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="particle animate-particle"
          style={{
            left: `${particle.x}px`,
            top: `${particle.y}px`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
          }}
        />
      ))}
    </div>
  );
};
