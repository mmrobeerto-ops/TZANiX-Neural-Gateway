import React, { useEffect, useRef } from 'react';

const PurificationHologram = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // Malla 3D (Tensor Mesh)
    const cols = 120; 
    const rows = 60; 
    const spacingX = 25;
    const spacingZ = 25;

    let time = 0;

    const render = () => {
      if (!canvas.width || !canvas.height) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Velocidad ajustada para ser fluida y viva sin romper la vista
      time -= 0.35; 
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // El Gateway en el puro centro
      const laserCol = Math.floor(cols / 2);

      const projected = [];
      const swayY = Math.sin(time * 0.05) * 15; // Respiración vertical lenta

      // 1. Proyectar
      for (let c = 0; c < cols; c++) {
        projected[c] = [];
        for (let r = 0; r < rows; r++) {
          
          let y = 0;
          let isNoise = false;
          let isSevereNoise = false;

          // Izquierda (Caos)
          if (c < laserCol) {
            const dataPoint = c - time; 
            
            // Perfil de ruido estructural
            const noise = Math.sin(dataPoint * 0.7) * Math.cos(r * 1.2) + Math.sin(dataPoint * 1.8 + r * 0.6);
            
            if (noise > 1.2) {
               y = (noise - 1.2) * -120; // Picos agresivos
               isNoise = true;
               if (noise > 1.6) isSevereNoise = true;
            } else if (noise < -1.2) {
               y = (noise + 1.2) * -120; 
               isNoise = true;
               if (noise < -1.6) isSevereNoise = true;
            } else {
               y = Math.sin(dataPoint * 0.3 + r * 0.2) * 10; // Vibración base
            }

            // Glitch aleatorio
            if (Math.random() < 0.015) {
               y += (Math.random() - 0.5) * 60;
               isSevereNoise = true;
               isNoise = true;
            }

          } else if (c === laserCol) {
             y = 0; 
          } else {
             // Derecha (Purificado) - Flujo laminar vivo y dinámico (Ondas armónicas perfectas)
             const dataPoint = c - time;
             y = Math.sin(dataPoint * 0.25 + r * 0.15) * 12 + Math.cos(dataPoint * 0.1) * 6; 
          }

          const x_3d = (c - cols / 2) * spacingX;
          const z_3d = (r - rows / 2) * spacingZ;
          const y_3d = y;

          // Inclinación
          const rotX = 1.05; // Pitch down para ver la malla desde arriba
          const rotZ = Math.sin(time * 0.02) * 0.02; // Sway sutil
          
          let x1 = x_3d * Math.cos(rotZ) - y_3d * Math.sin(rotZ);
          let y1 = x_3d * Math.sin(rotZ) + y_3d * Math.cos(rotZ);
          
          let y2 = y1 * Math.cos(rotX) - z_3d * Math.sin(rotX);
          let z2 = y1 * Math.sin(rotX) + z_3d * Math.cos(rotX);

          // Proyección (Distance DEBE ser grande para que z2 + distance NUNCA sea <= 0)
          const fov = 1000;
          const distance = 1200; // Incrementado drásticamente para evitar la inversión detrás de la cámara
          
          // Prevenir error de división por cero o negativo (glitches gigantes de la captura anterior)
          const zScale = (z2 + distance) > 10 ? (z2 + distance) : 10;
          const scale = fov / zScale;

          const px = cx + x1 * scale;
          const py = cy + y2 * scale + swayY; 

          projected[c][r] = { x: px, y: py, z: z2, isNoise, isSevereNoise, c };
        }
      }

      ctx.globalCompositeOperation = "screen";

      // 2. Dibujar Malla
      for (let c = 0; c < cols - 1; c++) {
        for (let r = 0; r < rows - 1; r++) {
          const p1 = projected[c][r];
          const p2 = projected[c+1][r];
          const p3 = projected[c][r+1];

          let color = '';
          let lineWidth = 1;

          if (c >= laserCol) {
            // Brillo pulsante armónico
            const dataPoint = c - time;
            const pulse = Math.sin(dataPoint * 0.3) * 0.2;
            color = `rgba(0, 240, 255, ${0.4 + pulse + (c - laserCol)*0.005})`;
            lineWidth = 1.8;
          } else if (p1.isNoise || p2.isNoise || p3.isNoise) {
            color = p1.isSevereNoise ? 'rgba(255, 0, 85, 0.9)' : 'rgba(255, 0, 85, 0.5)';
            lineWidth = p1.isSevereNoise ? 2.5 : 1.5;
          } else {
            color = 'rgba(100, 116, 139, 0.3)'; 
            lineWidth = 1.0;
          }

          // Atenuación en los bordes para que no se corte feo
          const distToCenterZ = Math.abs(r - rows/2) / (rows/2); 
          const fog = Math.max(0.05, 1 - Math.pow(distToCenterZ, 2)); // Suavizado cuadrático
          
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

      // Haz central inmenso
      ctx.beginPath();
      ctx.moveTo(laserCenter.x, laserTop.y - 1500);
      ctx.lineTo(laserCenter.x, laserBot.y + 1500);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#00f0ff';
      ctx.stroke();

      // Línea de corte sobre la malla
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
         const p = projected[laserCol][r];
         if (r === 0) ctx.moveTo(p.x, p.y);
         else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Chispas de destrucción de ruido
      for (let i = 0; i < 15; i++) {
        const sparkY = laserTop.y + Math.random() * (laserBot.y - laserTop.y);
        ctx.beginPath();
        ctx.arc(laserCenter.x + (Math.random() * 30 - 15), sparkY, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 15;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";

      animationFrameId = requestAnimationFrame(render);
    };

    setTimeout(resize, 100);
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000000', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', top: '24px', left: '24px', color: '#64748b', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em', fontWeight: 'bold', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px', border: '1px solid #333' }}>
        <span>[INPUT_LAYER]</span>
        <span style={{ color: '#ff0055', letterSpacing: 'normal' }}>STRUCTURAL NOISE DETECTED</span>
      </div>
      
      <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', color: '#00f0ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em', fontWeight: 'bold', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px', border: '1px solid #00f0ff' }}>
        [MAD_PRUNING_ENGINE_ACTIVE]
      </div>
      
      <div style={{ position: 'absolute', top: '24px', right: '24px', color: '#64748b', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em', fontWeight: 'bold', zIndex: 10, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px', border: '1px solid #333' }}>
        <span>[OUTPUT_TENSOR]</span>
        <span style={{ color: '#00f0ff', letterSpacing: 'normal' }}>PURE HOMOGENEOUS DATA</span>
      </div>

      <canvas 
        ref={canvasRef} 
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'block' }} 
      />
    </div>
  );
};

export default PurificationHologram;
