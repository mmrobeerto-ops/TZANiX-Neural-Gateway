"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

function DataPurificationHologram() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let animId;
    let time = 0;

    const particles = [];
    const numParticles = 300;
    
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        idx: i,
        x: -300 + Math.random() * 250,
        y: (Math.random() - 0.5) * 200,
        z: (Math.random() - 0.5) * 200,
        speed: 1 + Math.random() * 2,
        state: 'noisy'
      });
    }

    const draw = () => {
      const width = canvas.width = canvas.parentElement.clientWidth;
      const height = canvas.height = canvas.parentElement.clientHeight;
      
      ctx.clearRect(0, 0, width, height);
      
      // Grid
      ctx.strokeStyle = "rgba(0, 229, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 50) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 50) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }

      time += 0.01;
      const cx = width / 2;
      const cy = height / 2;

      ctx.save();
      ctx.translate(cx, cy);
      const rotRing = time * 0.5;
      
      for (let r = 0; r < 3; r++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, 40 + r * 15, 120 + r * 20, rotRing + r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.8 - r * 0.2})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 10;
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.moveTo(0, -150);
      ctx.lineTo(0, 150);
      ctx.strokeStyle = "rgba(0, 229, 255, 0.8)";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      const projected = [];
      const rotY = Math.sin(time * 0.2) * 0.2;
      const rotX = Math.cos(time * 0.3) * 0.1;

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];
        p.x += p.speed;
        
        if (p.x < -20) {
          p.state = 'noisy';
          p.y += (Math.random() - 0.5) * 8;
          p.z += (Math.random() - 0.5) * 8;
        } else if (p.x >= -20 && p.x <= 20) {
          p.state = 'filtering';
          p.y += (Math.round(p.y / 20) * 20 - p.y) * 0.1;
          p.z += (Math.round(p.z / 20) * 20 - p.z) * 0.1;
        } else {
          p.state = 'pure';
          p.y += (Math.round(p.y / 30) * 30 - p.y) * 0.1;
          p.z += (Math.round(p.z / 30) * 30 - p.z) * 0.1;
          p.x += 0.5;
        }

        if (p.x > 300) {
          p.x = -300 - Math.random() * 50;
          p.y = (Math.random() - 0.5) * 200;
          p.z = (Math.random() - 0.5) * 200;
        }

        let x1 = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
        let z1 = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
        let y1 = p.y;
        let y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

        const scale = 500 / (500 + z2);
        const px = cx + x1 * scale;
        const py = cy + y2 * scale;

        projected.push({ x: px, y: py, z: z2, state: p.state, origY: p.y, origZ: p.z });
      }

      projected.sort((a, b) => b.z - a.z);

      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i++) {
        const p1 = projected[i];
        
        ctx.beginPath();
        const nodeSize = p1.state === 'filtering' ? 4 : 2;
        const radius = nodeSize * (500 / (500 + p1.z));
        ctx.arc(p1.x, p1.y, radius > 0 ? radius : 0, 0, Math.PI * 2);
        
        if (p1.state === 'noisy') {
          ctx.fillStyle = `rgba(255, 0, 85, ${0.8 - (p1.z+200)/400})`;
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 5;
        } else if (p1.state === 'pure') {
          ctx.fillStyle = `rgba(0, 229, 255, ${0.9 - (p1.z+200)/400})`;
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 15;
        }
        ctx.fill();

        for (let j = i + 1; j < projected.length; j++) {
          const p2 = projected[j];
          if (p1.state === p2.state) {
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
            if (p1.state === 'noisy' && dist < 40) {
              ctx.strokeStyle = `rgba(255, 0, 85, ${0.2 * (1 - dist/40)})`;
              ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
            } else if (p1.state === 'pure' && dist < 50) {
              const alignDist = Math.abs(p1.origY - p2.origY) + Math.abs(p1.origZ - p2.origZ);
              if (alignDist < 35) {
                ctx.strokeStyle = `rgba(0, 229, 255, ${0.4 * (1 - dist/50)})`;
                ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
              }
            }
          }
        }
      }

      ctx.fillStyle = "rgba(255, 0, 85, 0.7)";
      ctx.font = "12px monospace";
      ctx.fillText("VECTORES BASURA (ENTROPÍA ALTA)", cx - 280, cy - 200);
      
      ctx.fillStyle = "rgba(0, 229, 255, 0.9)";
      ctx.fillText("DATASET PURIFICADO (ALINEADO)", cx + 80, cy - 200);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

export default function FinOpsDashboard() {
  const [vectorSavings, setVectorSavings] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [usdSaved, setUsdSaved] = useState(0);
  const [tokensCleaned, setTokensCleaned] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVectorSavings((prev) => prev < 42 ? prev + 0.9 : 42 + Math.random() * 1.5);
      setCo2Saved((prev) => prev + 18.5 + Math.random() * 5);
      setUsdSaved((prev) => prev + 0.12);
      setTokensCleaned((prev) => prev + 14500 + Math.random() * 2000);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-color, #0D1117)', height: '100vh', width: '100vw', color: '#fff', fontFamily: 'Inter, sans-serif', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <header style={{ borderBottom: '1px solid var(--border-color, rgba(255,255,255,0.1))', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20, position: 'relative', background: 'rgba(13,17,23,0.8)', backdropFilter: 'blur(10px)', flexShrink: 0, height: '70px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--gold-primary, #00E5FF)' }}>
            TZANIX <span style={{ fontWeight: 300, color: '#fff' }}>AI FINOPS</span>
          </h1>
          <div style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(0,229,255,0.3)', backgroundColor: 'rgba(0,229,255,0.1)', color: '#00E5FF', fontSize: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00E5FF', boxShadow: '0 0 8px #00E5FF' }}></span>
            Purificación Vectorial Activa
          </div>
        </div>
        <Link href="/" style={{ padding: '8px 16px', border: '1px solid rgba(0,229,255,0.5)', borderRadius: '4px', backgroundColor: 'rgba(0,229,255,0.1)', color: '#00E5FF', textDecoration: 'none', fontSize: '0.85rem', fontFamily: 'Roboto Mono, monospace', transition: 'all 0.3s' }}>
          VOLVER AL ORQUESTADOR
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, position: 'relative', display: 'grid', gridTemplateColumns: '350px 1fr 350px', padding: '25px', gap: '25px', height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
        
        {/* Hologram Canvas (Background) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, opacity: 0.8, pointerEvents: 'none' }}>
          <DataPurificationHologram />
        </div>

        {/* Left Panel */}
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
          
          <div style={{ backgroundColor: 'var(--panel-bg, #161B22)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '8px', padding: '20px', boxShadow: '0 0 20px rgba(0,229,255,0.05)', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ color: '#00E5FF', fontFamily: 'Roboto Mono, monospace', fontSize: '0.85rem', margin: '0 0 20px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>Optimización de Modelos</h2>
            
            <div style={{ marginBottom: '25px' }}>
              <div style={{ color: '#8B949E', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px' }}>Reducción de Tokens Basura</div>
              <div style={{ fontSize: '3rem', fontWeight: 700, display: 'flex', alignItems: 'baseline', gap: '5px', margin: 0 }}>
                {vectorSavings.toFixed(1)}<span style={{ fontSize: '1.5rem', color: '#00E5FF' }}>%</span>
              </div>
              <div style={{ width: '100%', height: '4px', backgroundColor: '#333', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.min(vectorSavings, 100)}%`, background: 'linear-gradient(90deg, #ff0055, #a855f7, #00E5FF)' }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <div style={{ color: '#8B949E', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '10px' }}>Clústers GPU (NVIDIA H100)</div>
              <div style={{ fontSize: '0.85rem', fontFamily: 'Roboto Mono, monospace', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
                  <span style={{ color: '#ff0055' }}>Crudo (Sin TZANiX):</span>
                  <span style={{ fontWeight: 'bold' }}>64x GPUs</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00E5FF' }}>
                  <span>Purificado (TZANiX):</span>
                  <span style={{ fontWeight: 'bold' }}>38x GPUs</span>
                </div>
              </div>
            </div>

            <div>
              <div style={{ color: '#8B949E', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px' }}>Ahorro AWS/GCP (Proyectado)</div>
              <div style={{ fontSize: '2rem', fontWeight: 300, color: '#22c55e', fontFamily: 'Roboto Mono, monospace', margin: 0 }}>
                ${usdSaved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--panel-bg, #161B22)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '8px', padding: '20px', boxShadow: '0 0 20px rgba(168,85,247,0.05)', backdropFilter: 'blur(10px)' }}>
             <h2 style={{ color: '#a855f7', fontFamily: 'Roboto Mono, monospace', fontSize: '0.85rem', margin: '0 0 15px 0', letterSpacing: '1px' }}>Corte Neuronal (Rust Core)</h2>
             <p style={{ color: '#8B949E', fontSize: '0.8rem', lineHeight: '1.5', margin: '0 0 15px 0' }}>
               El filtro bloquea vectores antes de la GPU, cortando ciclos muertos.
             </p>
             <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '0.75rem', color: '#00E5FF', backgroundColor: 'rgba(0,229,255,0.05)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(0,229,255,0.2)' }}>
               <div style={{ marginBottom: '5px' }}>&gt; LIMPIOS: <strong style={{ color: '#fff' }}>{(tokensCleaned / 1000000).toFixed(2)}M</strong></div>
               <div style={{ marginBottom: '5px' }}>&gt; OVERHEAD: <strong style={{ color: '#22c55e' }}>Cero</strong></div>
               <div>&gt; LATENCIA: <strong style={{ color: '#00E5FF' }}>0.38ms</strong></div>
             </div>
          </div>
        </div>

        {/* Center Space */}
        <div style={{ zIndex: 5 }}></div>

        {/* Right Panel */}
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'var(--panel-bg, #161B22)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '20px', boxShadow: '0 0 20px rgba(34,197,94,0.05)', backdropFilter: 'blur(10px)' }}>
            <h2 style={{ color: '#22c55e', fontFamily: 'Roboto Mono, monospace', fontSize: '0.85rem', margin: '0 0 20px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>Impacto Termal / ESG</h2>
            
            <div style={{ marginBottom: '25px' }}>
              <div style={{ color: '#8B949E', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '5px' }}>Mitigación de CO2 (Gramos)</div>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: '#22c55e', margin: 0 }}>
                {co2Saved.toLocaleString('en-US', {maximumFractionDigits: 0})}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '4px', border: '1px solid #333' }}>
                <div style={{ color: '#8B949E', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '5px' }}>Carga Térmica (Data Center Crudo)</div>
                <div style={{ color: '#ff0055', fontFamily: 'Roboto Mono, monospace', fontSize: '0.9rem', margin: 0 }}>Exceso de TFLOPS</div>
              </div>
              <div style={{ backgroundColor: 'rgba(34,197,94,0.05)', padding: '10px', borderRadius: '4px', border: '1px solid rgba(34,197,94,0.3)' }}>
                <div style={{ color: '#22c55e', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '5px' }}>Con TZANiX AI</div>
                <div style={{ color: '#4ade80', fontFamily: 'Roboto Mono, monospace', fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>-42% Disipación de Calor</div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', fontSize: '0.75rem', color: '#8B949E', borderTop: '1px solid #333', paddingTop: '15px', lineHeight: '1.5', margin: '20px 0 0 0' }}>
              Al evitar que la red neuronal procese vectores inútiles, el motor nativo mitiga directamente el desperdicio térmico masivo de las GPUs, logrando un entrenamiento Zero-Carbon.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
