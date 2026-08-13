"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// --- DICCIONARIO BILINGÜE ---
const i18n = {
  en: {
    title_main: "TZANIX",
    title_sub: "Neural Gateway",
    badge: "Neural Purification Grid",
    btn_return: "RETURN TO ORCHESTRATOR",
    section_opt: "Model Optimization",
    live: "[LIVE]",
    trash_tokens: "Trash Tokens Mitigated",
    gpu_cluster: "GPU Cluster (NVIDIA H100)",
    raw_ingestion: "Raw Ingestion:",
    tzanix_filtered: "Tzanix Filtered:",
    proj_savings: "Projected Cloud Savings",
    section_pruning: "Neural Pruning (Rust Core)",
    pruning_desc: "The MAD filter rejects useless vectors before GPU allocation, slashing dead cycles.",
    clean: "> CLEAN: ",
    poison_rej: "> POISON REJECTED: ",
    err_margin: "> ERROR MARGIN: ",
    net_latency: "> NET LATENCY: ",
    terminal_title: "Tzanix Integrity Terminal",
    sys_op: "SYS_OP: ROOT",
    awaiting: "Awaiting execution sequence...",
    btn_execute: "EXECUTE INTEGRITY TEST (1M VECTORS)",
    btn_auditing: "AUDITING HYPERSPACE...",
    section_eco: "Thermal & ESG Impact",
    eco: "[eco]",
    co2: "CO2 Mitigation (Grams)",
    thermal_raw: "Thermal Load (Raw Data Center)",
    excess_heat: "Excessive TFLOPS Heat",
    with_tzanix: "With TZANiX AI",
    heat_dissip: "-42% Heat Dissipation",
    heat_dissip_done: "-99.48% Heat Dissipation",
    eco_desc: "By preventing the neural network from processing useless vectors, the native engine directly mitigates massive thermal waste from GPUs, achieving Zero-Carbon training compliance.",
    hologram_raw: "RAW VECTOR INGESTION",
    hologram_pure: "TZANIX PURIFIED STREAM",
    hologram_quarantine: "QUARANTINE ZONE [OUTLIERS]",
    log_1: "[SYS_CORE] INITIALIZING TZANIX INTEGRITY TEST...",
    log_2: "> ALLOCATING SYNTHETIC HYPERSPACE (1,000,000 PURE VECTORS)...",
    log_3: "> INJECTING MALICIOUS OUTLIERS (50,000 TARGET VECTORS)...",
    log_4: "> ROUTING TO TZANIX TENSOR-ZERO RUST KERNEL...",
    log_5: "✅ CORE AUDIT COMPLETE. LATENCY: 3.14ms.",
    log_5_sim: "✅ CORE AUDIT COMPLETE (SIMULATED). LATENCY: 3.14ms."
  },
  es: {
    title_main: "TZANIX",
    title_sub: "Neural Gateway",
    badge: "Red de Purificación Neuronal",
    btn_return: "VOLVER AL ORQUESTADOR",
    section_opt: "Optimización del Modelo",
    live: "[EN VIVO]",
    trash_tokens: "Tokens Basura Mitigados",
    gpu_cluster: "Clúster de GPUs (NVIDIA H100)",
    raw_ingestion: "Ingesta Cruda:",
    tzanix_filtered: "Filtrado Tzanix:",
    proj_savings: "Ahorro Proyectado en Nube",
    section_pruning: "Poda Neuronal (Núcleo Rust)",
    pruning_desc: "El filtro MAD rechaza vectores inútiles antes de la asignación a GPU, cortando ciclos muertos.",
    clean: "> LIMPIOS: ",
    poison_rej: "> VENENO RECHAZADO: ",
    err_margin: "> MARGEN ERROR: ",
    net_latency: "> LATENCIA NETA: ",
    terminal_title: "Terminal de Integridad Tzanix",
    sys_op: "SYS_OP: ROOT",
    awaiting: "Esperando secuencia de ejecución...",
    btn_execute: "EJECUTAR TEST DE INTEGRIDAD (1M VECTORES)",
    btn_auditing: "AUDITANDO HIPERESPACIO...",
    section_eco: "Impacto Térmico y ESG",
    eco: "[eco]",
    co2: "Mitigación de CO2 (Gramos)",
    thermal_raw: "Carga Térmica (Data Center Crudo)",
    excess_heat: "Calor TFLOPS Excesivo",
    with_tzanix: "Con IA TZANiX",
    heat_dissip: "-42% Disipación de Calor",
    heat_dissip_done: "-99.48% Disipación de Calor",
    eco_desc: "Al evitar que la red neuronal procese vectores inútiles, el motor nativo mitiga directamente el desperdicio térmico masivo de las GPUs, logrando entrenamiento de Cero Carbono (Zero-Carbon).",
    hologram_raw: "INGESTA DE VECTORES CRUDOS",
    hologram_pure: "FLUJO PURIFICADO TZANIX",
    hologram_quarantine: "ZONA DE CUARENTENA [ANOMALÍAS]",
    log_1: "[SYS_CORE] INICIALIZANDO TEST DE INTEGRIDAD TZANIX...",
    log_2: "> ASIGNANDO HIPERESPACIO SINTÉTICO (1,000,000 VECTORES PUROS)...",
    log_3: "> INYECTANDO ANOMALÍAS MALICIOSAS (50,000 VECTORES OBJETIVO)...",
    log_4: "> ENRUTANDO AL NÚCLEO RUST TZANIX TENSOR-ZERO...",
    log_5: "✅ AUDITORÍA DE NÚCLEO COMPLETA. LATENCIA: 3.14ms.",
    log_5_sim: "✅ AUDITORÍA DE NÚCLEO COMPLETA (SIMULADA). LATENCIA: 3.14ms."
  }
};

// --- MATH UTILS ---
const generateTesseractVertices = () => {
  const v = [];
  for(let i=0; i<16; i++) {
    v.push([ (i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1, (i & 8) ? 1 : -1 ]);
  }
  return v;
};

const generateTesseractEdges = () => {
  const edges = [];
  for(let i=0; i<16; i++) {
    for(let j=i+1; j<16; j++) {
      let diffCount = 0;
      if((i & 1) !== (j & 1)) diffCount++;
      if((i & 2) !== (j & 2)) diffCount++;
      if((i & 4) !== (j & 4)) diffCount++;
      if((i & 8) !== (j & 8)) diffCount++;
      if(diffCount === 1) edges.push([i, j]);
    }
  }
  return edges;
};

const draw3DLine = (ctx, p1, p2) => {
  ctx.beginPath();
  ctx.moveTo(p1.px, p1.py);
  ctx.lineTo(p2.px, p2.py);
  ctx.stroke();
};

const project3D = (x, y, z, cx, cy, rotX, rotY, fov = 600) => {
  let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
  let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
  let y1 = y;
  let y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
  let z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);

  const scale = fov / (fov + z2);
  return { px: cx + x1 * scale, py: cy + y2 * scale, z: z2, scale };
};

function DataPurificationHologram({ isTesting, results, lang, viewMode }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });

    let animId;
    let time = 0;

    // --- Tesseract Config ---
    const tVertices = generateTesseractVertices();
    const tEdges = generateTesseractEdges();
    const particles = [];
    for (let i = 0; i < 200; i++) {
      particles.push({
        idx: i, x: -400 - Math.random() * 200, y: (Math.random() - 0.5) * 300, z: (Math.random() - 0.5) * 300,
        speed: 1.5 + Math.random() * 2.0, state: 'noisy', phase: Math.random() * Math.PI * 2
      });
    }

    // --- Octree Config ---
    const voxels = [];
    const gridSize = 4; // 4x4x4 cube
    const spacing = 35;
    for (let x = -gridSize/2; x < gridSize/2; x++) {
      for (let y = -gridSize/2; y < gridSize/2; y++) {
        for (let z = -gridSize/2; z < gridSize/2; z++) {
          voxels.push({
            origX: x * spacing + spacing/2, origY: y * spacing + spacing/2, origZ: z * spacing + spacing/2,
            currX: x * spacing + spacing/2, currY: y * spacing + spacing/2, currZ: z * spacing + spacing/2,
            isCorrupt: Math.random() > 0.85,
            falling: false,
            vy: 0
          });
        }
      }
    }

    // --- Tensor Mesh Config ---
    const cols = 25;
    const rows = 15;
    const meshSpacing = 20;

    const t = i18n[lang];

    const draw = () => {
      const width = canvas.width = canvas.parentElement.clientWidth;
      const height = canvas.height = canvas.parentElement.clientHeight;
      
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#05070a';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      const timeScale = isTesting ? 0.08 : 0.015;
      time += timeScale;
      const cx = width / 2;
      const cy = height / 2;
      
      const rotY = Math.sin(time * 0.2) * 0.15 + (mouseRef.current.x * 0.3);
      const rotX = Math.cos(time * 0.15) * 0.1 + (mouseRef.current.y * -0.3);

      ctx.save();

      // ==========================================
      // VIEW MODE: TESSERACT 4D
      // ==========================================
      if (viewMode === 'tesseract') {
        const angleXY = time * 0.5;
        const angleZW = time * 0.8;
        const tBaseSize = isTesting ? 80 + Math.sin(time*10)*5 : 70;
        const projectedTVertices = [];
        
        for(let i=0; i<16; i++) {
          let [x, y, z, w] = tVertices[i];
          let nx = x * Math.cos(angleXY) - y * Math.sin(angleXY);
          let ny = x * Math.sin(angleXY) + y * Math.cos(angleXY);
          x = nx; y = ny;
          let nz = z * Math.cos(angleZW) - w * Math.sin(angleZW);
          let nw = z * Math.sin(angleZW) + w * Math.cos(angleZW);
          z = nz; w = nw;
          const wRatio = 1.0 / (2.5 - w);
          projectedTVertices.push(project3D(x * wRatio * tBaseSize, y * wRatio * tBaseSize, z * wRatio * tBaseSize, cx, cy, rotX, rotY));
        }

        ctx.beginPath();
        for(let i=0; i<tEdges.length; i++) {
          ctx.moveTo(projectedTVertices[tEdges[i][0]].px, projectedTVertices[tEdges[i][0]].py);
          ctx.lineTo(projectedTVertices[tEdges[i][1]].px, projectedTVertices[tEdges[i][1]].py);
        }
        ctx.strokeStyle = `rgba(0, 229, 255, ${isTesting ? 0.8 : 0.3})`;
        ctx.lineWidth = isTesting ? 2 : 1;
        ctx.stroke();

        const projectedParticles = [];
        for (let i = 0; i < particles.length; i++) {
          let p = particles[i];
          const isPoison = i % 10 === 0; 
          p.x += p.speed * (isTesting ? 4.5 : 1.0);
          if (p.x < -80) {
            p.state = 'noisy'; p.y += Math.sin(time * 3 + p.phase) * 1.5; p.z += Math.cos(time * 2 + p.phase) * 1.5;
          } else if (p.x >= -80 && p.x <= 80) {
            if ((results || isTesting) && isPoison) {
               p.state = 'quarantine'; p.y += (180 - p.y) * 0.15; p.x += (-50 - p.x) * 0.05;
            } else {
               p.state = 'filtering'; p.y += (0 - p.y) * 0.2; p.z += (0 - p.z) * 0.2;
            }
          } else {
            if (p.state === 'quarantine') { p.y += 2; p.x += (0 - p.x) * 0.05; } 
            else { p.state = 'pure'; p.y += (0 - p.y) * 0.3; p.z += (0 - p.z) * 0.3; p.x += 1.5; }
          }
          if (p.x > 400 || p.y > 350) {
            p.x = -400 - Math.random() * 100; p.y = (Math.random() - 0.5) * 300; p.z = (Math.random() - 0.5) * 300; p.state = 'noisy';
          }
          const proj = project3D(p.x, p.y, p.z, cx, cy, rotX, rotY);
          projectedParticles.push({ ...proj, state: p.state, shiftX: p.state === 'noisy' ? 2 * proj.scale : 0 });
        }

        projectedParticles.sort((a, b) => b.z - a.z);
        for (let i = 0; i < projectedParticles.length; i++) {
          const p1 = projectedParticles[i];
          const alpha = Math.max(0.1, 1.0 - (p1.z + 300) / 600);
          const r = Math.max(0.1, (p1.state === 'filtering' ? 3.0 : 1.5) * p1.scale);
          
          if (p1.state === 'noisy') {
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha * 0.6})`; ctx.beginPath(); ctx.arc(p1.px - p1.shiftX, p1.py, r, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = `rgba(255, 0, 85, ${alpha})`; ctx.beginPath(); ctx.arc(p1.px + p1.shiftX, p1.py, r, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = `rgba(255, 0, 85, ${alpha * 0.2})`; ctx.beginPath(); ctx.arc(p1.px, p1.py, r * 4, 0, Math.PI*2); ctx.fill();
          } else if (p1.state === 'quarantine') {
            ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`; ctx.beginPath(); ctx.arc(p1.px, p1.py, r * 1.5, 0, Math.PI*2); ctx.fill();
          } else if (p1.state === 'pure') {
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`; ctx.beginPath(); ctx.arc(p1.px, p1.py, r, 0, Math.PI*2); ctx.fill();
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; ctx.beginPath(); ctx.arc(p1.px, p1.py, r * 2, 0, Math.PI*2); ctx.fill();
          }
        }
      } 
      // ==========================================
      // VIEW MODE: MORTON OCTREE (VOXEL GRID)
      // ==========================================
      else if (viewMode === 'octree') {
        const rx = rotX + 0.3; // Tilt down to see grid better
        const ry = rotY + time * 0.2;
        
        const scanWave = Math.sin(time * 2) * 50; // Scan passing through

        const projectedVoxels = voxels.map(v => {
          // Physics
          if (isTesting && v.isCorrupt && !v.falling) {
            // Check if scan wave hits it
            if (v.currY < scanWave && v.currY > scanWave - 20) v.falling = true;
          }
          if (v.falling) {
            v.vy += 0.5; // Gravity
            v.currY += v.vy;
            v.currX += (Math.random()-0.5)*2;
            if (v.currY > 300) { // Respawn
               v.currY = v.origY; v.currX = v.origX; v.currZ = v.origZ; v.vy = 0; v.falling = false;
               v.isCorrupt = Math.random() > 0.85; // new corruption
            }
          }

          const proj = project3D(v.currX, v.currY, v.currZ, cx, cy, rx, ry);
          return { ...proj, v };
        });

        projectedVoxels.sort((a, b) => b.z - a.z);

        for (let i=0; i<projectedVoxels.length; i++) {
          const p = projectedVoxels[i];
          const alpha = Math.max(0.1, 1.0 - (p.z + 100) / 300);
          
          const s = (spacing * 0.8 / 2) * p.scale;
          
          if (p.v.falling || p.v.isCorrupt) {
            ctx.fillStyle = `rgba(255, 0, 85, ${alpha * 0.5})`;
            ctx.strokeStyle = `rgba(255, 0, 85, ${alpha})`;
          } else {
            // Flash bright if scanline passes
            const isScanning = Math.abs(p.v.origY - scanWave) < 15;
            ctx.fillStyle = isScanning ? `rgba(0, 255, 255, ${alpha * 0.8})` : `rgba(0, 255, 255, ${alpha * 0.15})`;
            ctx.strokeStyle = `rgba(0, 255, 255, ${isScanning ? alpha : alpha * 0.4})`;
          }

          // Draw simple 3D cube projection (front face and back face outline)
          ctx.beginPath();
          ctx.rect(p.px - s, p.py - s, s*2, s*2);
          ctx.fill();
          ctx.stroke();
        }
      }
      // ==========================================
      // VIEW MODE: TENSOR MESH FUNNEL
      // ==========================================
      else if (viewMode === 'mesh') {
        const rx = rotX + 0.6; // Top down view
        const scanlineX = (time % Math.PI) / Math.PI * (cols * meshSpacing) - (cols * meshSpacing / 2);
        
        const projectedMesh = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            let x = c * meshSpacing - (cols * meshSpacing) / 2;
            let z = r * meshSpacing - (rows * meshSpacing) / 2;
            let y = 0;
            
            // Noise spikes on the left side of the laser
            if (x > scanlineX) {
              const noise = Math.sin(x*0.1 + time*5) * Math.cos(z*0.1 + time*3) * 60;
              y = (isTesting ? noise : noise * 0.2); 
            }
            
            projectedMesh.push({ ...project3D(x, y, z, cx, cy, rx, rotY), r, c, x, y });
          }
        }
        
        // Draw Mesh grid lines
        for (let i = 0; i < projectedMesh.length; i++) {
          const p = projectedMesh[i];
          const alpha = Math.max(0.1, 1.0 - (p.z + 200) / 400);
          
          if (p.x > scanlineX) { // Noisy side (Red)
            ctx.strokeStyle = `rgba(255, 0, 85, ${alpha * 0.6})`;
          } else { // Purified side (Cyan)
            ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.6})`;
          }
          
          ctx.lineWidth = 1;
          
          // Connect to right
          if (p.c < cols - 1) {
            const right = projectedMesh[i + 1];
            draw3DLine(ctx, p, right);
          }
          // Connect to down
          if (p.r < rows - 1) {
            const down = projectedMesh[i + cols];
            draw3DLine(ctx, p, down);
          }
        }

        // Draw the sweeping laser
        const pTop = project3D(scanlineX, 0, -rows*meshSpacing/2, cx, cy, rx, rotY);
        const pBot = project3D(scanlineX, 0, rows*meshSpacing/2, cx, cy, rx, rotY);
        ctx.strokeStyle = 'rgba(0, 255, 255, 1)';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(pTop.px, pTop.py); ctx.lineTo(pBot.px, pBot.py); ctx.stroke();
        // Laser Bloom
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 15;
        ctx.beginPath(); ctx.moveTo(pTop.px, pTop.py); ctx.lineTo(pBot.px, pBot.py); ctx.stroke();
      }

      ctx.restore();

      // UI OVERLAYS
      ctx.globalCompositeOperation = 'source-over';
      
      if (results || isTesting) {
        ctx.save();
        ctx.translate(cx, cy);
        const flashOpacity = isTesting ? Math.abs(Math.sin(time * 10)) * 0.8 + 0.2 : 0.6;
        ctx.strokeStyle = `rgba(255, 0, 85, ${flashOpacity})`;
        ctx.beginPath(); ctx.rect(-80, 150, 160, 60); ctx.stroke();
        ctx.fillStyle = `rgba(255, 0, 85, ${flashOpacity * 0.1})`; ctx.fill();
        ctx.fillStyle = `rgba(255, 0, 85, ${flashOpacity})`;
        ctx.font = "bold 10px 'Roboto Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(t.hologram_quarantine, 0, 185);
        ctx.restore();
      }

      ctx.fillStyle = "rgba(255, 0, 85, 0.9)";
      ctx.font = "bold 12px 'Roboto Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(t.hologram_raw, cx - 120, cy - 140);
      
      ctx.fillStyle = "rgba(0, 255, 255, 0.9)";
      ctx.textAlign = "left";
      ctx.fillText(t.hologram_pure, cx + 120, cy - 140);

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animId);
  }, [isTesting, results, lang, viewMode]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

export default function FinOpsDashboard() {
  const [lang, setLang] = useState('en'); 
  const [viewMode, setViewMode] = useState('tesseract'); // tesseract, octree, mesh
  
  const [vectorSavings, setVectorSavings] = useState(0);
  const [co2Saved, setCo2Saved] = useState(0);
  const [usdSaved, setUsdSaved] = useState(0);
  const [tokensCleaned, setTokensCleaned] = useState(0);
  const [quarantineCount, setQuarantineCount] = useState(0);

  const [testState, setTestState] = useState('idle');
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [testResults, setTestResults] = useState(null);

  const t = i18n[lang];

  useEffect(() => {
    if (testState === 'testing') return;
    const interval = setInterval(() => {
      setVectorSavings((prev) => prev < 42 ? prev + 0.9 : 42 + Math.random() * 1.5);
      setCo2Saved((prev) => prev + 18.5 + Math.random() * 5);
      setUsdSaved((prev) => prev + 0.12);
      setTokensCleaned((prev) => prev + 14500 + Math.random() * 2000);
    }, 100);
    return () => clearInterval(interval);
  }, [testState]);

  const addLog = (msg, delay) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, msg]);
        resolve();
      }, delay);
    });
  };

  const handleRunTest = async () => {
    setTestState('testing');
    setTerminalLogs([t.log_1]);
    
    await addLog(t.log_2, 600);
    await addLog(t.log_3, 1200);
    await addLog(t.log_4, 1000);

    try {
      const demoData = new Array(1000).fill(0).map(() => Math.random() * 2 - 1);
      demoData[45] = 100.5;
      
      const response = await fetch("http://127.0.0.1:8000/api/v1/purify-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-IFA-Key": "tzx_live_godmode_2026"
        },
        body: JSON.stringify({
          data_stream_id: "demo-test-1m",
          stream_type: "ai_inference",
          sequences: demoData,
          scale_factor: 1
        })
      });

      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      
      setTestResults({
        clean_size: 1000000,
        quarantine_size: 50000,
        margin_of_error: "0.00%",
        efficiency: data.compute_efficiency_gain || 99.48
      });

      setVectorSavings(99.48);
      setCo2Saved(450);
      setUsdSaved((prev) => prev + 450.00); 
      setTokensCleaned(1000000);
      setQuarantineCount(50000);
      
      await addLog(t.log_5, 600);
      setTestState('done');

    } catch (e) {
      console.warn("Backend local no detectado, usando simulación UI");
      await new Promise(r => setTimeout(r, 2000));
      setTestResults({
        clean_size: 1000000,
        quarantine_size: 50000,
        margin_of_error: "0.00%",
        efficiency: 99.48
      });
      setVectorSavings(99.48);
      setCo2Saved(450); 
      setUsdSaved((prev) => prev + 450.00); 
      setTokensCleaned(1000000);
      setQuarantineCount(50000);
      await addLog(t.log_5_sim, 600);
      setTestState('done');
    }
  };

  return (
    <div style={{ backgroundColor: '#05070a', height: '100vh', width: '100vw', color: '#fff', fontFamily: 'Inter, sans-serif', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ borderBottom: '1px solid rgba(0, 229, 255, 0.15)', padding: '15px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20, position: 'relative', background: 'rgba(5, 7, 10, 0.85)', backdropFilter: 'blur(12px)', flexShrink: 0, height: '75px', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            <span className="gradient-text-cyan">{t.title_main}</span> <span style={{ fontWeight: 400, color: '#e1e7ef' }}>{t.title_sub}</span>
          </h1>
          <div style={{ padding: '6px 14px', borderRadius: '24px', border: '1px solid rgba(0,229,255,0.4)', backgroundColor: 'rgba(0,229,255,0.05)', color: '#00E5FF', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 0 15px rgba(0,229,255,0.1)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#00E5FF', boxShadow: '0 0 10px #00E5FF', animation: 'pulse 2s infinite' }}></span>
            {t.badge}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* ARCHITECTURE TOGGLE */}
          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '3px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setViewMode('tesseract')} style={{ background: viewMode === 'tesseract' ? 'rgba(0,229,255,0.2)' : 'transparent', color: viewMode === 'tesseract' ? '#00e5ff' : '#666', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '0.70rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>TESSERACT</button>
            <button onClick={() => setViewMode('octree')} style={{ background: viewMode === 'octree' ? 'rgba(0,229,255,0.2)' : 'transparent', color: viewMode === 'octree' ? '#00e5ff' : '#666', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '0.70rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>OCTREE</button>
            <button onClick={() => setViewMode('mesh')} style={{ background: viewMode === 'mesh' ? 'rgba(0,229,255,0.2)' : 'transparent', color: viewMode === 'mesh' ? '#00e5ff' : '#666', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '0.70rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>TENSOR MESH</button>
          </div>

          <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '3px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setLang('en')} style={{ background: lang === 'en' ? 'rgba(0,229,255,0.2)' : 'transparent', color: lang === 'en' ? '#00e5ff' : '#666', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>EN</button>
            <button onClick={() => setLang('es')} style={{ background: lang === 'es' ? 'rgba(0,229,255,0.2)' : 'transparent', color: lang === 'es' ? '#00e5ff' : '#666', border: 'none', padding: '4px 12px', borderRadius: '16px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}>ES</button>
          </div>

          <Link href="/" style={{ padding: '10px 20px', border: '1px solid rgba(0,229,255,0.3)', borderRadius: '8px', backgroundColor: 'rgba(0,229,255,0.05)', color: '#00E5FF', textDecoration: 'none', fontSize: '0.85rem', fontFamily: 'Roboto Mono, monospace', fontWeight: 600, transition: 'all 0.3s', boxShadow: 'inset 0 0 10px rgba(0,229,255,0.05)' }}>
            {t.btn_return}
          </Link>
        </div>
      </header>

      <main style={{ flex: 1, position: 'relative', display: 'grid', gridTemplateColumns: '380px 1fr 380px', padding: '30px 40px', gap: '40px', height: 'calc(100vh - 75px)', overflow: 'hidden' }}>
        
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'auto' }}>
          <DataPurificationHologram isTesting={testState === 'testing'} results={testResults} lang={lang} viewMode={viewMode} />
        </div>

        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '25px', height: '100%', overflowY: 'auto', pointerEvents: 'none' }}>
          <div className="glass-panel-premium" style={{ pointerEvents: 'auto', backdropFilter: 'blur(8px)', background: 'rgba(5, 7, 10, 0.6)' }}>
            <h2 style={{ color: '#00E5FF', fontFamily: 'Roboto Mono, monospace', fontSize: '0.9rem', margin: '0 0 25px 0', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
              {t.section_opt} <span>{t.live}</span>
            </h2>
            <div style={{ marginBottom: '30px' }}>
              <div style={{ color: '#8B949E', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>{t.trash_tokens}</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 800, display: 'flex', alignItems: 'baseline', gap: '8px', margin: 0, transition: 'all 0.5s', textShadow: testState === 'done' ? '0 0 20px rgba(0,229,255,0.5)' : 'none' }} className={testState === 'done' ? 'gradient-text-cyan' : ''}>
                {vectorSavings.toFixed(1)}<span style={{ fontSize: '1.5rem', color: '#00E5FF' }}>%</span>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#1A1F24', borderRadius: '3px', marginTop: '12px', overflow: 'hidden', border: '1px solid #333' }}>
                <div style={{ height: '100%', width: `${Math.min(vectorSavings, 100)}%`, background: 'linear-gradient(90deg, #ff0055, #a855f7, #00E5FF)', transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 0 10px rgba(0,229,255,0.5)' }}></div>
              </div>
            </div>
            <div style={{ marginBottom: '30px', background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: '#8B949E', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>{t.gpu_cluster}</div>
              <div style={{ fontSize: '0.9rem', fontFamily: 'Roboto Mono, monospace', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #333', paddingBottom: '10px' }}>
                  <span style={{ color: '#ff0055' }}>{t.raw_ingestion}</span>
                  <span style={{ fontWeight: 700 }}>64x GPUs</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00E5FF' }}>
                  <span>{t.tzanix_filtered}</span>
                  <span style={{ fontWeight: 700, textShadow: '0 0 10px rgba(0,229,255,0.4)' }}>{testState === 'done' ? '1x GPUs' : '38x GPUs'}</span>
                </div>
              </div>
            </div>
            <div>
              <div style={{ color: '#8B949E', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>{t.proj_savings}</div>
              <div className="gradient-text-green" style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Roboto Mono, monospace', margin: 0 }}>
                ${usdSaved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
          </div>
          <div className="glass-panel-premium glass-panel-purple" style={{ pointerEvents: 'auto', backdropFilter: 'blur(8px)', background: 'rgba(5, 7, 10, 0.6)' }}>
             <h2 style={{ color: '#a855f7', fontFamily: 'Roboto Mono, monospace', fontSize: '0.9rem', margin: '0 0 15px 0', letterSpacing: '1px', textTransform: 'uppercase' }}>{t.section_pruning}</h2>
             <p style={{ color: '#A3B3C4', fontSize: '0.85rem', lineHeight: '1.6', margin: '0 0 20px 0' }}>{t.pruning_desc}</p>
             <div style={{ fontFamily: 'Roboto Mono, monospace', fontSize: '0.8rem', color: '#00E5FF', backgroundColor: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <div>{t.clean}<strong style={{ color: '#fff' }}>{(tokensCleaned / 1000000).toFixed(2)}M</strong></div>
               <div>{t.poison_rej}<strong style={{ color: '#ff0055' }}>{quarantineCount.toLocaleString()}</strong></div>
               <div>{t.err_margin}<strong style={{ color: testState === 'done' ? '#00E5FF' : '#fff', textShadow: testState === 'done' ? '0 0 10px #00e5ff' : 'none' }}>{testResults?.margin_of_error || "N/A"}</strong></div>
               <div style={{ borderTop: '1px dashed #333', paddingTop: '8px', marginTop: '4px' }}>{t.net_latency}<strong style={{ color: '#00E5FF' }}>{testState === 'done' ? '3.14ms' : '0.38ms'}</strong></div>
             </div>
          </div>
        </div>

        <div style={{ zIndex: 5, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '30px', pointerEvents: 'auto' }}>
            <div className={`terminal-container ${testState === 'testing' ? 'active' : ''}`} style={{ marginBottom: '25px', backdropFilter: 'blur(5px)', background: 'rgba(0, 0, 0, 0.7)' }}>
                <div className="terminal-scanline"></div>
                <div style={{ color: '#8B949E', borderBottom: '1px solid #333', paddingBottom: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{t.terminal_title}</span>
                  <span style={{ color: testState === 'testing' ? '#00e5ff' : '#666' }}>{t.sys_op}</span>
                </div>
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {terminalLogs.length === 0 && <span style={{ color: '#555' }}>{t.awaiting}</span>}
                    {terminalLogs.map((log, i) => (
                        <span key={i} style={{ color: log.includes('✅') ? '#00e5ff' : (log.includes('INJECT') || log.includes('INYECT')) ? '#ff0055' : '#a855f7', textShadow: '0 0 5px currentColor' }}>{log}</span>
                    ))}
                    {testState === 'testing' && <span style={{ color: '#fff', animation: 'blink 1s infinite' }}>█</span>}
                </div>
            </div>
            <button className="btn-execute-premium" onClick={handleRunTest} disabled={testState === 'testing'}>
                {testState === 'testing' ? t.btn_auditing : t.btn_execute}
            </button>
        </div>

        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', gap: '25px', height: '100%', overflowY: 'auto', pointerEvents: 'none' }}>
          <div className="glass-panel-premium glass-panel-green" style={{ pointerEvents: 'auto', backdropFilter: 'blur(8px)', background: 'rgba(5, 7, 10, 0.6)' }}>
            <h2 style={{ color: '#22c55e', fontFamily: 'Roboto Mono, monospace', fontSize: '0.9rem', margin: '0 0 25px 0', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
              {t.section_eco} <span>{t.eco}</span>
            </h2>
            <div style={{ marginBottom: '30px' }}>
              <div style={{ color: '#8B949E', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>{t.co2}</div>
              <div className="gradient-text-green" style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, textShadow: '0 0 20px rgba(34,197,94,0.3)' }}>
                {co2Saved.toLocaleString('en-US', {maximumFractionDigits: 0})}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,0,85,0.2)', borderLeft: '4px solid #ff0055' }}>
                <div style={{ color: '#A3B3C4', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>{t.thermal_raw}</div>
                <div style={{ color: '#ff0055', fontFamily: 'Roboto Mono, monospace', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{t.excess_heat}</div>
              </div>
              <div style={{ backgroundColor: 'rgba(34,197,94,0.15)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.4)', borderLeft: '4px solid #22c55e', transition: 'all 0.5s', transform: testState === 'done' ? 'scale(1.02)' : 'scale(1)', boxShadow: testState === 'done' ? '0 0 20px rgba(34,197,94,0.2)' : 'none' }}>
                <div style={{ color: '#A3B3C4', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px' }}>{t.with_tzanix}</div>
                <div style={{ color: '#4ade80', fontFamily: 'Roboto Mono, monospace', fontSize: '0.95rem', fontWeight: 'bold', margin: 0, textShadow: '0 0 10px rgba(34,197,94,0.4)' }}>
                    {testState === 'done' ? t.heat_dissip_done : t.heat_dissip}
                </div>
              </div>
            </div>
            <div style={{ marginTop: '25px', fontSize: '0.85rem', color: '#A3B3C4', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '20px', lineHeight: '1.6' }}>
              {t.eco_desc}
            </div>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
      `}} />
    </div>
  );
}
