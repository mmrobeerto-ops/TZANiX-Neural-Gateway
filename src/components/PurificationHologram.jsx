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
        this.speed = Math.random() * 2 + 1.5;
        this.color = '#00f0ff'; // Todo cyan como en tu foto
        this.size = Math.random() * 1.5 + 0.5;
      }
      update() {
        if (!this.isPurified) {
          // Fase 1: Succión hacia el Gateway
          const dx = gatewayX - this.x;
          const dy = gatewayY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Movimiento orgánico (curvas)
          this.x += (dx / distance) * this.speed * 2;
          this.y += (dy / distance) * this.speed * 2;
          this.y += (Math.random() - 0.5) * 4; // Un poco de vibración
          // Si llega al centro, se purifica
          if (distance < 10) {
            this.isPurified = true;
            this.y = gatewayY + (Math.random() - 0.5) * 10; // Salen muy juntas
          }
        } else {
          // Fase 2: Flujo purificado (Líneas rectas a la derecha)
          this.x += this.speed * 4; // Aceleran
          this.y += (Math.random() - 0.5) * 0.5; // Vibración mínima
        }
        // Guardar historial para dibujar la "cola" o línea
        this.history.push({x: this.x, y: this.y});
        if (this.history.length > 20) {
          this.history.shift(); // Mantener la cola de un tamaño fijo
        }
        // Si sale de la pantalla, reiniciar
        if (this.x > canvas.width) {
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
        
        ctx.strokeStyle = `rgba(0, 240, 255, ${this.isPurified ? 0.8 : 0.2})`;
        ctx.lineWidth = this.isPurified ? 1.5 : 0.5;
        ctx.stroke();
        // Dibujar la cabeza (el punto luminoso)
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f0ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      }
    }
    // Inicializar partículas
    for (let i = 0; i < 150; i++) {
      particles.push(new OrganicParticle());
    }
    const render = () => {
      // Fondo para dejar rastro de desvanecimiento
      ctx.fillStyle = 'rgba(5, 7, 10, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Dibujar la Singularidad / Núcleo central
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(gatewayX, gatewayY, 0, gatewayX, gatewayY, 50);
      gradient.addColorStop(0, 'rgba(0, 240, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(0, 240, 255, 0.5)');
      gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.arc(gatewayX, gatewayY, 50, 0, Math.PI * 2);
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
    <div className="w-full h-80 relative bg-[#05070a] border border-white/5 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};
export default PurificationHologram;
