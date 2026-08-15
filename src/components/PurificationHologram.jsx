import React, { useEffect, useRef } from 'react';

const PurificationHologram = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Malla 3D (Tensor Mesh) expandida
    const cols = 90; // Mucho más ancha para cubrir los bordes
    const rows = 45; // Mucho más profunda
    const spacingX = 25;
    const spacingZ = 20;

    let time = 0;

    const render = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time -= 0.18; // Flujo más rápido, se siente más "vivo"
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // El Gateway (Línea MAD) - 45%
      const laserCol = Math.floor(cols * 0.45);

      const projected = [];
      
      // Animación suave de cabeceo (Sway)
      const swayY = Math.sin(time * 0.2) * 20;

      // 1. Proyectar
      for (let c = 0; c < cols; c++) {
        projected[c] = [];
        for (let r = 0; r < rows; r++) {
          
          let y = 0;
          let isNoise = false;
          let isSevereNoise = false;

          if (c < laserCol) {
            const dataPoint = c - time; 
            
            // Picos más agresivos
            const noise = Math.sin(dataPoint * 0.6) * Math.cos(r * 1.1) + Math.sin(dataPoint * 1.5 + r * 0.5);
            
            if (noise > 1.0) {
               y = (noise - 1.0) * -120; // Picos inmensos
               isNoise = true;
               if (noise > 1.4) isSevereNoise = true;
            } else if (noise < -1.0) {
               y = (noise + 1.0) * -120; 
               isNoise = true;
               if (noise < -1.4) isSevereNoise = true;
            } else {
               y = Math.sin(dataPoint * 0.15 + r * 0.3) * 8; 
            }

            // Glitch aleatorio
            if (Math.random() < 0.005) {
               y += (Math.random() - 0.5) * 50;
               isSevereNoise = true;
               isNoise = true;
            }

          } else if (c === laserCol) {
             y = 0; 
          } else {
             const dataPoint = c - time;
             y = Math.sin(dataPoint * 0.08) * 3; // Liso
          }

          // Posición extendida para cubrir pantalla completa
          const x_3d = (c - cols / 2) * spacingX;
          const z_3d = (r - rows / 2) * spacingZ;
          const y_3d = y;

          // Rotación
          const rotX = 1.0; 
          const rotZ = Math.sin(time * 0.05) * 0.05; // Oscilación sutil de toda la malla
          
          let x1 = x_3d * Math.cos(rotZ) - y_3d * Math.sin(rotZ);
          let y1 = x_3d * Math.sin(rotZ) + y_3d * Math.cos(rotZ);
          
          let y2 = y1 * Math.cos(rotX) - z_3d * Math.sin(rotX);
          let z2 = y1 * Math.sin(rotX) + z_3d * Math.cos(rotX);

          // Proyección
          const fov = 700;
          const distance = 350;
          const scale = fov / (z2 + distance);

          const px = cx + x1 * scale;
          const py = cy + y2 * scale + swayY; 

          projected[c][r] = { x: px, y: py, z: z2, isNoise, isSevereNoise, c };
        }
      }

      // 2. Dibujar Malla
      ctx.globalCompositeOperation = "screen";

      for (let c = 0; c < cols - 1; c++) {
        for (let r = 0; r < rows - 1; r++) {
          const p1 = projected[c][r];
          const p2 = projected[c+1][r];
          const p3 = projected[c][r+1];

          let color = '';
          let lineWidth = 1;

          if (c >= laserCol) {
            color = `rgba(0, 240, 255, ${0.15 + (c - laserCol)*0.03})`;
            lineWidth = 1.5;
          } else if (p1.isNoise || p2.isNoise || p3.isNoise) {
            color = p1.isSevereNoise ? 'rgba(255, 0, 85, 0.95)' : 'rgba(255, 0, 85, 0.5)';
            lineWidth = p1.isSevereNoise ? 2.5 : 1.5;
          } else {
            color = 'rgba(100, 116, 139, 0.25)'; 
            lineWidth = 1.0;
          }

          // Atenuación menor para que llegue a los bordes
          const distToCenterZ = Math.abs(r - rows/2) / (rows/2); 
          const fog = Math.max(0.1, 1 - distToCenterZ); // Nunca se vuelve 0 del todo
          
          ctx.globalAlpha = fog;
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.stroke();
        }
      }

      // 3. Dibujar Láser MAD
      ctx.globalAlpha = 1;
      const laserTop = projected[laserCol][0];
      const laserBot = projected[laserCol][rows - 1];
      const laserCenter = projected[laserCol][Math.floor(rows/2)];

      ctx.beginPath();
      ctx.moveTo(laserCenter.x, laserTop.y - 400);
      ctx.lineTo(laserCenter.x, laserBot.y + 400);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 5;
      ctx.shadowBlur = 30;
      ctx.shadowColor = '#00f0ff';
      ctx.stroke();

      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
         const p = projected[laserCol][r];
         if (r === 0) ctx.moveTo(p.x, p.y);
         else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Chispas violentas
      for (let i = 0; i < 12; i++) {
        const sparkY = laserTop.y + Math.random() * (laserBot.y - laserTop.y);
        ctx.beginPath();
        ctx.arc(laserCenter.x + (Math.random() * 20 - 10), sparkY, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 15;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[450px] relative bg-[#000] overflow-hidden flex items-center justify-center m-0 p-0">
      {/* HUD Descriptivo interno - movido ligeramente adentro para que no se corte */}
      <div className="absolute top-6 left-6 text-[#64748b] font-mono text-[10px] tracking-[0.2em] font-bold z-10 flex flex-col gap-1 bg-black/50 p-2 rounded">
        <span>[INPUT_LAYER]</span>
        <span className="text-[#ff0055] tracking-normal">STRUCTURAL NOISE DETECTED</span>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#00f0ff] font-mono text-[10px] tracking-[0.2em] font-bold z-10 bg-black/50 p-2 rounded">
        [MAD_PRUNING_ENGINE_ACTIVE]
      </div>
      <div className="absolute top-6 right-6 text-[#64748b] font-mono text-[10px] tracking-[0.2em] font-bold z-10 text-right flex flex-col gap-1 bg-black/50 p-2 rounded">
        <span>[OUTPUT_TENSOR]</span>
        <span className="text-[#00f0ff] tracking-normal">PURE HOMOGENEOUS DATA</span>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default PurificationHologram;
