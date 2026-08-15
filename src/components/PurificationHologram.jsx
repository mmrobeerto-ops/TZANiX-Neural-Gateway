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

    // Malla 3D (Tensor Mesh)
    const cols = 55;
    const rows = 28;
    const spacingX = 22;
    const spacingZ = 22;

    let time = 0;

    const render = () => {
      // Limpiar con negro puro (aeroespacial)
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      time -= 0.12; // Velocidad del flujo de datos (de izquierda a derecha)
      
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // El Gateway (Línea MAD) - Ubicado al 45% del ancho
      const laserCol = Math.floor(cols * 0.45);

      const projected = [];
      
      // 1. Proyectar todos los puntos 3D a 2D
      for (let c = 0; c < cols; c++) {
        projected[c] = [];
        for (let r = 0; r < rows; r++) {
          
          let y = 0;
          let isNoise = false;
          let isSevereNoise = false;

          // Fase 1: Antes del Láser (Caos, Ingesta Cruda)
          if (c < laserCol) {
            // El desplazamiento simula que la data viaja hacia la derecha
            const dataPoint = c - time; 
            
            // Función matemática para generar picos caóticos (Spikes)
            const noise = Math.sin(dataPoint * 0.5) * Math.cos(r * 0.8) + Math.sin(dataPoint * 1.2 + r);
            
            if (noise > 1.1) {
               y = (noise - 1.1) * -80; // Pico brutal hacia arriba
               isNoise = true;
               if (noise > 1.5) isSevereNoise = true;
            } else if (noise < -1.1) {
               y = (noise + 1.1) * -80; // Pico brutal hacia abajo (eje Y invertido en canvas)
               isNoise = true;
               if (noise < -1.5) isSevereNoise = true;
            } else {
               y = Math.sin(dataPoint * 0.1 + r * 0.2) * 5; // Vibración base leve
            }
          } 
          // Fase 2: Exactamente en el Láser
          else if (c === laserCol) {
             y = 0; // Se aplana instantáneamente (Purificación quirúrgica)
          } 
          // Fase 3: Después del Láser (Tensor Purificado)
          else {
             const dataPoint = c - time;
             y = Math.sin(dataPoint * 0.05) * 2; // Ondulación casi perfecta y suave
          }

          // Coordenadas 3D locales
          const x_3d = (c - cols / 2) * spacingX;
          const z_3d = (r - rows / 2) * spacingZ;
          const y_3d = y;

          // Rotación Biométrica (Isometrica/Inclinada)
          const rotX = 1.1; // Inclinación hacia adelante
          const rotY = 0.0; // Sin rotación lateral para mantener flujo lineal
          const rotZ = 0.05; // Ligera inclinación para darle perspectiva premium
          
          let x1 = x_3d * Math.cos(rotZ) - y_3d * Math.sin(rotZ);
          let y1 = x_3d * Math.sin(rotZ) + y_3d * Math.cos(rotZ);
          
          let y2 = y1 * Math.cos(rotX) - z_3d * Math.sin(rotX);
          let z2 = y1 * Math.sin(rotX) + z_3d * Math.cos(rotX);

          // Proyección Perspectiva
          const fov = 600;
          const distance = 400;
          const scale = fov / (z2 + distance);

          const px = cx + x1 * scale;
          const py = cy + y2 * scale + 60; // Bajar un poco la malla

          projected[c][r] = { x: px, y: py, z: z2, isNoise, isSevereNoise, c };
        }
      }

      // 2. Dibujar la Malla (Líneas)
      // Dibujamos de atrás hacia adelante para la profundidad no es tan crítica en wireframe, pero lo hacemos por columnas
      ctx.globalCompositeOperation = "screen";

      for (let c = 0; c < cols - 1; c++) {
        for (let r = 0; r < rows - 1; r++) {
          const p1 = projected[c][r];
          const p2 = projected[c+1][r];
          const p3 = projected[c][r+1];

          // Determinar el color de la celda de la malla
          let color = '';
          let lineWidth = 1;

          // Si estamos en la zona purificada
          if (c >= laserCol) {
            color = `rgba(0, 240, 255, ${0.1 + (c - laserCol)*0.03})`; // Se ilumina progresivamente en Cyan
            lineWidth = 1.2;
          } 
          // Si es ruido peligroso
          else if (p1.isNoise || p2.isNoise || p3.isNoise) {
            color = p1.isSevereNoise ? 'rgba(255, 0, 85, 0.9)' : 'rgba(255, 0, 85, 0.4)';
            lineWidth = p1.isSevereNoise ? 2 : 1.5;
          } 
          // Datos crudos normales
          else {
            color = 'rgba(100, 116, 139, 0.2)'; // Slate gray tenue
            lineWidth = 0.8;
          }

          // Aplicar atenuación en los bordes (Niebla/Fog)
          const distToCenterZ = Math.abs(r - rows/2) / (rows/2); // 0 en centro, 1 en bordes
          const distToEdgeX = Math.min(c, cols - c) / 10;
          const fog = Math.max(0, 1 - distToCenterZ) * Math.min(1, distToEdgeX);
          
          ctx.globalAlpha = fog;
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;

          // Dibujar Arista Horizontal
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();

          // Dibujar Arista Vertical
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.stroke();
        }
      }

      // 3. Dibujar la "Guillotina" o Láser MAD (El Filtro)
      ctx.globalAlpha = 1;
      const laserTop = projected[laserCol][0];
      const laserBot = projected[laserCol][rows - 1];
      const laserCenter = projected[laserCol][Math.floor(rows/2)];

      // Rayo vertical principal
      ctx.beginPath();
      ctx.moveTo(laserCenter.x, laserTop.y - 200);
      ctx.lineTo(laserCenter.x, laserBot.y + 100);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f0ff';
      ctx.stroke();

      // Línea de corte sobre la malla (La cuchilla)
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
         const p = projected[laserCol][r];
         if (r === 0) ctx.moveTo(p.x, p.y);
         else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Efecto de chispas o partículas cortadas en el láser (Rechazo)
      for (let i = 0; i < 5; i++) {
        const sparkY = laserTop.y + Math.random() * (laserBot.y - laserTop.y);
        ctx.beginPath();
        ctx.arc(laserCenter.x, sparkY, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ff0055';
        ctx.shadowColor = '#ff0055';
        ctx.shadowBlur = 10;
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
    <div className="w-full h-full min-h-[450px] relative bg-[#000] overflow-hidden flex items-center justify-center">
      {/* HUD Descriptivo interno */}
      <div className="absolute top-6 left-6 text-[#64748b] font-mono text-[10px] tracking-[0.2em] font-bold z-10 flex flex-col gap-1">
        <span>[INPUT_LAYER]</span>
        <span className="text-[#ff0055] tracking-normal">STRUCTURAL NOISE DETECTED</span>
      </div>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[#00f0ff] font-mono text-[10px] tracking-[0.2em] font-bold z-10">
        [MAD_PRUNING_ENGINE_ACTIVE]
      </div>
      <div className="absolute top-6 right-6 text-[#64748b] font-mono text-[10px] tracking-[0.2em] font-bold z-10 text-right flex flex-col gap-1">
        <span>[OUTPUT_TENSOR]</span>
        <span className="text-[#00f0ff] tracking-normal">PURE HOMOGENEOUS DATA</span>
      </div>

      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full" />
    </div>
  );
};

export default PurificationHologram;
