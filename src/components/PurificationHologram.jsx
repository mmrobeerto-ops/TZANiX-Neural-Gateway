import React, { useEffect, useRef } from 'react';

const PurificationHologram = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      // Usamos el tamaño del contenedor padre
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // Malla 3D (Tensor Mesh)
    // Para que se vea inmensa y llena de datos
    const cols = 150; 
    const rows = 80; 
    const spacingX = 18;
    const spacingZ = 18;

    let time = 0;

    const render = () => {
      if (!canvas.width || !canvas.height) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // VELOCIDAD EXTREMA - Procesando millones de datos
      time -= 0.6; 
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // El Gateway (Línea MAD) al 45%
      const laserCol = Math.floor(cols * 0.45);

      const projected = [];
      
      // Vibración constante del núcleo
      const swayY = Math.sin(time * 0.1) * 10;

      // 1. Proyectar
      for (let c = 0; c < cols; c++) {
        projected[c] = [];
        for (let r = 0; r < rows; r++) {
          
          let y = 0;
          let isNoise = false;
          let isSevereNoise = false;

          // Zona caótica (Izquierda)
          if (c < laserCol) {
            const dataPoint = c - time; 
            
            // Ruido caótico, vibrando rápido
            const noise = Math.sin(dataPoint * 0.8) * Math.cos(r * 1.5) + Math.sin(dataPoint * 2.5 + r * 0.8);
            
            if (noise > 1.0) {
               y = (noise - 1.0) * -150; 
               isNoise = true;
               if (noise > 1.5) isSevereNoise = true;
            } else if (noise < -1.0) {
               y = (noise + 1.0) * -150; 
               isNoise = true;
               if (noise < -1.5) isSevereNoise = true;
            } else {
               // Ruido de fondo rápido
               y = Math.sin(dataPoint * 0.5 + r * 0.3) * 15; 
            }

            // Glitch ultra rápido
            if (Math.random() < 0.02) {
               y += (Math.random() - 0.5) * 80;
               isSevereNoise = true;
               isNoise = true;
            }

          } else if (c === laserCol) {
             y = 0; 
          } else {
             // Zona purificada (Derecha)
             const dataPoint = c - time;
             y = Math.sin(dataPoint * 0.1) * 2; // Súper liso
          }

          const x_3d = (c - cols / 2) * spacingX;
          const z_3d = (r - rows / 2) * spacingZ;
          const y_3d = y;

          // Rotación Biométrica
          const rotX = 1.1; 
          const rotZ = Math.sin(time * 0.02) * 0.03; 
          
          let x1 = x_3d * Math.cos(rotZ) - y_3d * Math.sin(rotZ);
          let y1 = x_3d * Math.sin(rotZ) + y_3d * Math.cos(rotZ);
          
          let y2 = y1 * Math.cos(rotX) - z_3d * Math.sin(rotX);
          let z2 = y1 * Math.sin(rotX) + z_3d * Math.cos(rotX);

          // Proyección
          const fov = 800;
          const distance = 300;
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
            color = `rgba(0, 240, 255, ${0.2 + (c - laserCol)*0.02})`;
            lineWidth = 1.5;
          } else if (p1.isNoise || p2.isNoise || p3.isNoise) {
            color = p1.isSevereNoise ? 'rgba(255, 0, 85, 1)' : 'rgba(255, 0, 85, 0.6)';
            lineWidth = p1.isSevereNoise ? 2.5 : 1.5;
          } else {
            color = 'rgba(100, 116, 139, 0.3)'; 
            lineWidth = 1.0;
          }

          const distToCenterZ = Math.abs(r - rows/2) / (rows/2); 
          const fog = Math.max(0.15, 1 - distToCenterZ);
          
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

      // Rayo láser vertical inmenso
      ctx.beginPath();
      ctx.moveTo(laserCenter.x, laserTop.y - 800);
      ctx.lineTo(laserCenter.x, laserBot.y + 800);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 6;
      ctx.shadowBlur = 40;
      ctx.shadowColor = '#00f0ff';
      ctx.stroke();

      // Línea de corte
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
         const p = projected[laserCol][r];
         if (r === 0) ctx.moveTo(p.x, p.y);
         else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Millones de chispas rojas rechazadas
      for (let i = 0; i < 25; i++) {
        const sparkY = laserTop.y + Math.random() * (laserBot.y - laserTop.y);
        ctx.beginPath();
        ctx.arc(laserCenter.x + (Math.random() * 40 - 20), sparkY, Math.random() * 4 + 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 20;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";

      animationFrameId = requestAnimationFrame(render);
    };

    // Darle un pequeño delay al inicio para asegurar que el contenedor se mida correctamente
    setTimeout(resize, 100);
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // SIN TAILWIND - USAMOS ESTILOS INLINE PARA GARANTIZAR QUE TOME EL 100%
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#000000', overflow: 'hidden' }}>
      
      {/* HUD Descriptivo interno */}
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
