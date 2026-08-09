"use client";

import { useEffect, useRef } from "react";

export default function SignalChart({ type = "financial", liveData = null, simStartTime = null }) {
  const canvasRef = useRef(null);
  const amplitudeRef = useRef(null);
  const corePulseRef = useRef(1.0); // Factor de escala para el pulso del núcleo
  
  const liveDataRef = useRef(liveData);
  const simStartTimeRef = useRef(simStartTime);

  useEffect(() => {
    liveDataRef.current = liveData;
    simStartTimeRef.current = simStartTime;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let offset = 0;
    
    // Lista de partículas para el sistema de flujo
    let particles = [];

    // Vértices del núcleo 3D (Icosaedro unitario)
    const t = (1 + Math.sqrt(5)) / 2;
    const rawVertices = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]
    ];
    
    // Normalizar vértices
    const vertices = rawVertices.map(v => {
      const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
      return [v[0]/len, v[1]/len, v[2]/len];
    });

    // Encontrar aristas basadas en distancia
    const edges = [];
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const dx = vertices[i][0] - vertices[j][0];
        const dy = vertices[i][1] - vertices[j][1];
        const dz = vertices[i][2] - vertices[j][2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 1.1) { // Límite de distancia para conectar aristas de icosaedro
          edges.push([i, j]);
        }
      }
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;
      
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      
      const currentLiveData = liveDataRef.current;
      const currentSimStartTime = simStartTimeRef.current;
      const hasActiveData = (currentLiveData !== null) || (currentSimStartTime !== null);

      if (amplitudeRef.current === null) {
        amplitudeRef.current = height * 0.22;
      }

      // --- 1. CUADRÍCULA TECNOLÓGICA DE FONDO (Gris Metálico #21262D) ---
      ctx.beginPath();
      ctx.strokeStyle = "rgba(33, 38, 45, 0.4)"; 
      ctx.lineWidth = 0.8;
      
      const gridSpacingX = 35;
      for (let x = 0; x <= width; x += gridSpacingX) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      const gridSpacingY = 30;
      for (let y = 0; y <= height; y += gridSpacingY) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Puntos de intersección cian tenues
      ctx.fillStyle = "rgba(0, 229, 255, 0.05)";
      for (let x = gridSpacingX; x < width; x += gridSpacingX) {
        for (let y = gridSpacingY; y < height; y += gridSpacingY) {
          ctx.beginPath();
          ctx.arc(x, y, 1.0, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // --- 2. SISTEMA DE PARTÍCULAS: FLUJO DE ENTRADA Y SALIDA ---
      if (hasActiveData) {
        // Modulación de la amplitud de onda por datos reales
        let targetAmplitude = height * 0.22;
        if (currentLiveData && currentLiveData.purified_data && currentLiveData.purified_data.length > 0) {
          const pur = currentLiveData.purified_data;
          const range = Math.max(...pur) - Math.min(...pur) || 1;
          targetAmplitude = (height * 0.20) * Math.min(1.4, Math.max(0.6, range / 35.0));
        }
        amplitudeRef.current += (targetAmplitude - amplitudeRef.current) * 0.03;
        const currentAmplitude = amplitudeRef.current;

        // Spawn de nuevas partículas en la izquierda
        if (particles.length < 120 && Math.random() < 0.6) {
          particles.push({
            x: -10,
            y: centerY + (Math.random() - 0.5) * (height * 0.6),
            vx: 2.0 + Math.random() * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            state: "noise", // "noise" (entrada sucia) -> "purified" (salida limpia)
            phase: Math.random() * Math.PI * 2,
            size: 1.2 + Math.random() * 1.8,
            colorSeed: Math.random()
          });
        }

        // Actualizar y dibujar partículas
        particles.forEach((p, idx) => {
          // Movimiento hacia la derecha
          p.x += p.vx;

          if (p.state === "noise") {
            // Movimiento caótico de ruido
            p.y += p.vy + Math.sin(p.x * 0.08 + p.phase) * 1.0;
            
            // Jitter / estática aleatoria
            p.y += (Math.random() - 0.5) * 1.8;

            // Dibujar partícula ruidosa (roja/grisácea apagada)
            ctx.fillStyle = p.colorSeed > 0.6 ? "rgba(235, 87, 87, 0.75)" : "rgba(139, 148, 158, 0.6)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
            ctx.fill();

            // Cruce con el reactor central (centerX)
            if (p.x >= centerX - 25 && p.x <= centerX + 25) {
              // Gravedad hacia el centro del reactor
              const dy = centerY - p.y;
              p.y += dy * 0.15;
              
              // Al cruzar el núcleo, se purifica
              if (p.x >= centerX) {
                p.state = "purified";
                p.vx = 3.2 + Math.random() * 0.8; // Aumentar velocidad y alineación
                // Disparar pulso en el núcleo
                corePulseRef.current = 1.35;
              }
            }
          } else {
            // Partícula Purificada: Integrada a la doble onda senoidal armónica
            const verticalShift = Math.sin(offset * 0.6) * (height * 0.12);
            const waveY = (centerY + verticalShift) + Math.sin(p.x * 0.008 - offset * 1.2) * currentAmplitude + 
                          Math.sin(p.x * 0.0035 + offset * 0.5) * (height * 0.04);
            
            // Lerp rápido hacia la onda limpia para un acoplamiento perfecto
            p.y += (waveY - p.y) * 0.12;

            // Dibujar partícula purificada (Cian brillante con glow)
            ctx.fillStyle = "rgba(0, 229, 255, 0.9)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 1.1, 0, 2 * Math.PI);
            ctx.fill();
          }
        });

        // Limpiar partículas fuera de pantalla
        particles = particles.filter(p => p.x < width + 10);
      }

      // --- 3. NÚCLEO PROCESADOR 3D INTERACTIVO (Centro) ---
      // LERP de pulso de energía
      corePulseRef.current += (1.0 - corePulseRef.current) * 0.08;
      const currentPulse = corePulseRef.current;
      const scale3d = 46 * currentPulse; // Tamaño del núcleo

      // Ángulos de rotación en 3D
      const radY = offset * 0.7; // Rotación sobre eje vertical
      const radX = offset * 0.4; // Inclinación

      // Proyectar vértices 3D
      const projected = vertices.map(v => {
        // Rotación Y (guiñada)
        let x1 = v[0] * Math.cos(radY) - v[2] * Math.sin(radY);
        let z1 = v[0] * Math.sin(radY) + v[2] * Math.cos(radY);
        let y1 = v[1];

        // Rotación X (cabeceo)
        let y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
        let z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

        // Proyección Perspectiva
        const cameraDist = 6;
        const screenScale = scale3d * (cameraDist / (z2 + cameraDist));
        const px = centerX + x1 * screenScale;
        const py = centerY + y2 * screenScale;
        
        return { x: px, y: py, z: z2 };
      });

      // A. Dibujar la esfera de energía central pulsante (Brillo del reactor)
      const pulseRadius = 14 * currentPulse + Math.sin(offset * 5) * 2;
      const energyGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, pulseRadius);
      energyGrad.addColorStop(0, "rgba(0, 229, 255, 0.8)");
      energyGrad.addColorStop(0.5, "rgba(0, 229, 255, 0.35)");
      energyGrad.addColorStop(1, "rgba(0, 229, 255, 0.0)");
      ctx.fillStyle = energyGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, 2 * Math.PI);
      ctx.fill();

      // B. Trazar aristas del núcleo (Wireframe 3D)
      ctx.lineWidth = 1.0;
      edges.forEach(([u, v]) => {
        const p1 = projected[u];
        const p2 = projected[v];
        
        // Color por profundidad (Z) para simular espacio 3D
        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.1, Math.min(0.75, 1 - (avgZ + 1.2) / 2.4));
        
        ctx.strokeStyle = `rgba(0, 229, 255, ${alpha * (hasActiveData ? 1.0 : 0.45)})`;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // C. Dibujar los vértices (Nodos holográficos del reactor)
      projected.forEach(p => {
        const alpha = Math.max(0.12, Math.min(0.9, 1 - (p.z + 1.2) / 2.4));
        ctx.fillStyle = `rgba(0, 229, 255, ${alpha * (hasActiveData ? 1.0 : 0.55)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Pequeño halo luminoso por nodo si hay datos activos
        if (hasActiveData && p.z < 0) {
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha * 0.45})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4.5, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });

      // Incrementar offset
      if (hasActiveData) {
        offset += 0.022;
      } else {
        offset = 0.8;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [type]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
