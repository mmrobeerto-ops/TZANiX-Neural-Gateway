import React, { useEffect, useRef } from 'react';

const PurificationHologram = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Centro gravitacional (El Gateway) - 70% a la derecha
    const gatewayX = canvas.width * 0.7;
    const gatewayY = canvas.height / 2;

    class OrganicParticle {
      constructor() {
        this.reset();
      }

      reset() {
        // Nacen muy dispersas a la izquierda
        this.x = 0;
        this.y = (Math.random() * canvas.height * 1.5) - (canvas.height * 0.25);
        this.history = [{x: this.x, y: this.y}]; // Guardamos el rastro
        
        this.isPurified = false;
        this.isRejected = false;
        this.speed = Math.random() * 2 + 1.5;
        this.size = Math.random() * 1.5 + 0.5;

        // 15% probability of being noise/trash
        this.isNoise = Math.random() > 0.85; 
        
        if (this.isNoise) {
          this.color = '#ff0055'; // Rojo para basura
        } else {
          this.color = '#00f0ff'; // Cyan para datos buenos
        }
      }

      update() {
        if (!this.isPurified && !this.isRejected) {
          // Fase 1: Succión hacia el Gateway
          const dx = gatewayX - this.x;
          const dy = gatewayY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Movimiento orgánico (curvas)
          this.x += (dx / distance) * this.speed * 2;
          this.y += (dy / distance) * this.speed * 2;
          this.y += (Math.random() - 0.5) * (this.isNoise ? 8 : 4); // El ruido vibra mucho más
          
          // Si llega al centro (Singularidad)
          if (distance < 15) {
            if (this.isNoise) {
              // El ruido es rechazado violentamente hacia abajo y dispersado
              this.isRejected = true;
              this.rejectSpeedX = (Math.random() - 0.5) * 5 - 2; // Rebote hacia atrás a veces
              this.rejectSpeedY = Math.random() * 5 + 5; // Cae hacia la "zona de cuarentena"
            } else {
              // El dato puro es purificado y alineado
              this.isPurified = true;
              this.y = gatewayY + (Math.random() - 0.5) * 10; // Salen muy juntas
            }
          }
        } else if (this.isPurified) {
          // Fase 2: Flujo purificado (Líneas rectas a la derecha)
          this.x += this.speed * 4; // Aceleran
          this.y += (Math.random() - 0.5) * 0.5; // Vibración mínima
        } else if (this.isRejected) {
          // Caída a zona de cuarentena
          this.x += this.rejectSpeedX;
          this.y += this.rejectSpeedY;
          this.size *= 0.95; // Se desintegra rápidamente
        }

        // Guardar historial para dibujar la "cola" o línea
        this.history.push({x: this.x, y: this.y});
        if (this.history.length > 20) {
          this.history.shift(); // Mantener la cola de un tamaño fijo
        }

        // Si sale de la pantalla o se desintegra por completo, reiniciar
        if (this.x > canvas.width || this.y > canvas.height || this.size < 0.1) {
          this.reset();
        }
      }

      draw() {
        if (this.history.length < 2) return;
        
        // Dibujar el rastro (la línea orgánica)
        ctx.beginPath();
        ctx.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 1; i < this.history.length; i++) {
          // Curva suave
          ctx.lineTo(this.history[i].x, this.history[i].y);
        }
        
        // El ruido tiene un stroke diferente
        if (this.isNoise) {
          ctx.strokeStyle = `rgba(255, 0, 85, ${this.isRejected ? 0.8 : 0.4})`;
          ctx.lineWidth = this.isRejected ? 2 : 1;
        } else {
          ctx.strokeStyle = `rgba(0, 240, 255, ${this.isPurified ? 0.8 : 0.2})`;
          ctx.lineWidth = this.isPurified ? 1.5 : 0.5;
        }
        ctx.stroke();

        // Dibujar la cabeza (el punto luminoso)
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }

    // Inicializar partículas (Aumentamos a 250 para que se vea más impresionante y grande)
    for (let i = 0; i < 250; i++) {
      particles.push(new OrganicParticle());
    }

    const render = () => {
      // Fondo para dejar rastro de desvanecimiento
      ctx.fillStyle = 'rgba(5, 7, 10, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Dibujar la Singularidad / Núcleo central
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(gatewayX, gatewayY, 0, gatewayX, gatewayY, 60); // Más grande
      gradient.addColorStop(0, 'rgba(0, 240, 255, 1)');
      gradient.addColorStop(0.1, 'rgba(0, 240, 255, 0.6)');
      gradient.addColorStop(0.3, 'rgba(0, 240, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(gatewayX, gatewayY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Zona de Cuarentena (Abajo del gateway)
      ctx.beginPath();
      const redGradient = ctx.createRadialGradient(gatewayX, canvas.height, 0, gatewayX, canvas.height, 100);
      redGradient.addColorStop(0, 'rgba(255, 0, 85, 0.15)');
      redGradient.addColorStop(1, 'rgba(255, 0, 85, 0)');
      ctx.fillStyle = redGradient;
      ctx.arc(gatewayX, canvas.height, 100, 0, Math.PI * 2);
      ctx.fill();

      // Dibujar partículas
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
    <div className="w-full h-full min-h-[450px] relative bg-[#05070a] border border-white/5 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default PurificationHologram;
