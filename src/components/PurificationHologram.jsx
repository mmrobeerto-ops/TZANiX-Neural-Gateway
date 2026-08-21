import React, { useEffect, useRef } from 'react';

const PurificationHologram = ({ testState }) => {
  const canvasRef = useRef(null);
  const testStateRef = useRef(testState);

  // Mantener el estado actualizado para el loop de animación sin reiniciar useEffect
  useEffect(() => {
    testStateRef.current = testState;
  }, [testState]);

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

      // Velocidad de simulación
      time -= 0.35; 
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // El Gateway en el centro
      const laserCol = Math.floor(cols / 2);

      const projected = [];
      const swayY = Math.sin(time * 0.05) * 15; // Respiración vertical lenta

      const isTesting = testStateRef.current === 'testing';

      // 1. Proyectar
      for (let c = 0; c < cols; c++) {
        projected[c] = [];
        for (let r = 0; r < rows; r++) {
          
          let y = 0;
          let isNoise = false;
          let isSevereNoise = false;

          // Izquierda (Caos / Tráfico Crudo)
          if (c < laserCol) {
            const dataPoint = c - time; 
            const noiseScale = isTesting ? 2.5 : 1.0;
            
            // Perfil de ruido estructural
            const noise = Math.sin(dataPoint * 0.7) * Math.cos(r * 1.2) + Math.sin(dataPoint * 1.8 + r * 0.6);
            
            if (noise > 1.2) {
               y = (noise - 1.2) * -120 * noiseScale; // Picos agresivos
               isNoise = true;
               if (noise > 1.6 || isTesting) isSevereNoise = true;
            } else if (noise < -1.2) {
               y = (noise + 1.2) * -120 * noiseScale; 
               isNoise = true;
               if (noise < -1.6 || isTesting) isSevereNoise = true;
            } else {
               y = Math.sin(dataPoint * 0.3 + r * 0.2) * (isTesting ? 30 : 10); // Vibración base
            }

            // Glitch aleatorio/Ataques de Red
            const glitchChance = isTesting ? 0.09 : 0.015;
            const glitchSize = isTesting ? 180 : 60;
            if (Math.random() < glitchChance) {
               y += (Math.random() - 0.5) * glitchSize;
               isSevereNoise = true;
               isNoise = true;
            }

          } else if (c === laserCol) {
             y = 0; 
          } else {
             // Derecha (Purificado / Carga Limpia)
             const dataPoint = c - time;
             // Si está en test, hay un flujo laminar de mayor velocidad y perfecta regularidad
             const waveMultiplier = isTesting ? 0.5 : 1.0;
             y = Math.sin(dataPoint * 0.25 + r * 0.15) * (12 * waveMultiplier) + Math.cos(dataPoint * 0.1) * (6 * waveMultiplier); 
          }

          const x_3d = (c - cols / 2) * spacingX;
          const z_3d = (r - rows / 2) * spacingZ;
          const y_3d = y;

          // Inclinación 3D
          const rotX = 1.05; 
          const rotZ = Math.sin(time * 0.02) * 0.02; // Sway sutil
          
          let x1 = x_3d * Math.cos(rotZ) - y_3d * Math.sin(rotZ);
          let y1 = x_3d * Math.sin(rotZ) + y_3d * Math.cos(rotZ);
          
          let y2 = y1 * Math.cos(rotX) - z_3d * Math.sin(rotX);
          let z2 = y1 * Math.sin(rotX) + z_3d * Math.cos(rotX);

          // Proyección
          const fov = 1000;
          const distance = 1200; 
          
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
            // Lado derecho (Purificado): Azul brillante
            const dataPoint = c - time;
            const pulse = Math.sin(dataPoint * 0.3) * 0.2;
            color = `rgba(0, 240, 255, ${0.4 + pulse + (c - laserCol)*0.005})`;
            lineWidth = 1.8;
          } else if (p1.isNoise || p2.isNoise || p3.isNoise) {
            // Lado izquierdo (Caos): Rojo agresivo en ataque
            color = p1.isSevereNoise ? 'rgba(255, 0, 85, 0.9)' : 'rgba(255, 0, 85, 0.5)';
            lineWidth = p1.isSevereNoise ? 2.5 : 1.5;
          } else {
            color = 'rgba(100, 116, 139, 0.3)'; 
            lineWidth = 1.0;
          }

          // Atenuación en los bordes
          const distToCenterZ = Math.abs(r - rows/2) / (rows/2); 
          const fog = Math.max(0.05, 1 - Math.pow(distToCenterZ, 2)); 
          
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

      // 3. Dibujar Escudo de Seguridad L7 (Láser de Purificación)
      ctx.globalAlpha = 1;
      const laserTop = projected[laserCol][0];
      const laserBot = projected[laserCol][rows - 1];
      const laserCenter = projected[laserCol][Math.floor(rows/2)];

      // Haz central
      ctx.beginPath();
      ctx.moveTo(laserCenter.x, laserTop.y - 1500);
      ctx.lineTo(laserCenter.x, laserBot.y + 1500);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = isTesting ? 8 + Math.sin(time) * 4 : 4;
      ctx.shadowBlur = isTesting ? 45 : 25;
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
      ctx.lineWidth = isTesting ? 5 : 3;
      ctx.stroke();

      // Chispas de destrucción de ruido
      const sparkCount = isTesting ? 45 : 15;
      const sparkSpread = isTesting ? 60 : 15;
      for (let i = 0; i < sparkCount; i++) {
        const sparkY = laserTop.y + Math.random() * (laserBot.y - laserTop.y);
        ctx.beginPath();
        ctx.arc(laserCenter.x + (Math.random() * (sparkSpread * 2) - sparkSpread), sparkY, Math.random() * (isTesting ? 5 : 3) + 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = isTesting ? 25 : 15;
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
        <span>[RAW_NETWORK_TRAFFIC]</span>
        <span style={{ color: '#ff0055', letterSpacing: 'normal' }}>STRUCTURAL NOISE DETECTED</span>
      </div>
      
      <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', color: '#00f0ff', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em', fontWeight: 'bold', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px', border: '1px solid #00f0ff' }}>
        [MAD_PRUNING_ENGINE_ACTIVE]
      </div>
      
      <div style={{ position: 'absolute', top: '24px', right: '24px', color: '#64748b', fontFamily: 'monospace', fontSize: '10px', letterSpacing: '0.2em', fontWeight: 'bold', zIndex: 10, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'rgba(0,0,0,0.6)', padding: '8px', border: '1px solid #333' }}>
        <span>[PURIFIED_PAYLOADS]</span>
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
