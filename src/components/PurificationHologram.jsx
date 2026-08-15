"use client";
import React, { useEffect, useRef } from 'react';

const PurificationHologram = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Ajustar tamaño del canvas
    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Clase Partícula
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = 0; // Nacen a la izquierda
        this.y = (Math.random() * canvas.height * 0.6) + (canvas.height * 0.2); // Nacen dispersas
        this.speedX = Math.random() * 2 + 1;
        this.speedY = (Math.random() - 0.5) * 4; // Movimiento errático (ruido)
        this.isPurified = false;
        this.color = '#ff0055'; // Rojo (Trash vector)
        this.size = Math.random() * 2 + 1;
        this.opacity = 1;
      }

      update() {
        this.x += this.speedX;
        
        // ZONA DE CAOS (Izquierda)
        if (this.x < canvas.width / 2) {
          this.y += this.speedY + (Math.random() - 0.5) * 2; // Mucha vibración
        } 
        
        // EL FILTRO (Centro del Canvas)
        else if (!this.isPurified) {
          // El 80% de los datos (ruido) muere aquí (simula la optimización)
          if (Math.random() > 0.2) {
            this.opacity -= 0.1; // Se desintegran
            if (this.opacity <= 0) this.reset();
          } else {
            // El 20% sobrevive y se purifica
            this.isPurified = true;
            this.color = '#00f0ff'; // Cyan (Data pura)
            this.speedY = 0; // Pierden el caos, viajan en línea recta
            this.speedX = 4; // Aceleran hacia las GPUs
          }
        }

        // Si salen de la pantalla, vuelven a nacer
        if (this.x > canvas.width) {
          this.reset();
        }
      }

      draw() {
        if (this.opacity <= 0) return;
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        
        // Brillo holográfico
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1; // reset
        ctx.shadowBlur = 0;
      }
    }

    // Inicializar 300 partículas
    for (let i = 0; i < 300; i++) {
      particles.push(new Particle());
    }

    // Ciclo de animación
    const render = () => {
      // Fondo negro translúcido para dejar rastro (efecto movimiento)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dibujar la "Barrera Neural" en el centro
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      // Actualizar y dibujar partículas
      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-64 md:h-96 relative bg-[#0a0a0a] border border-[#333] overflow-hidden rounded-md shadow-[0_0_15px_rgba(0,240,255,0.1)]">
      {/* Textos descriptivos flotantes */}
      <div className="absolute top-4 left-4 text-[#ff0055] font-mono text-[10px] tracking-widest z-10 font-bold">
        [ INGESTIÓN RAW / RUIDO ]
      </div>
      <div className="absolute top-4 right-4 text-[#00f0ff] font-mono text-[10px] tracking-widest z-10 text-right font-bold">
        [ TZANIX STREAM PURIFICADO ]
      </div>
      
      {/* El Canvas donde ocurre la magia */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default PurificationHologram;
