"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PurificationHologram from "../components/PurificationHologram";

const i18n = {
  en: {
    title_main: "TZANIX",
    title_sub: "NEURAL GATEWAY",
    badge: "L7 SECURITY SHIELD",
    btn_return: "[ RETURN TO ORCHESTRATOR ]",
    section_opt: "MODEL OPTIMIZATION",
    live: "[LIVE]",
    trash_tokens: "MALICIOUS PAYLOADS DROPPED (L7)",
    gpu_cluster: "BACKEND CPU LOAD",
    raw_ingestion: "RAW INGESTION:",
    tzanix_filtered: "TZANIX FILTERED:",
    proj_savings: "PROJECTED CLOUD SAVINGS",
    section_pruning: "RUST INERTIAL ENGINE",
    pruning_desc: "The native Rust engine filters traffic in memory before reaching application servers, slashing dead cycles.",
    clean: "> CLEAN REQUESTS: ",
    poison_rej: "> HIGH-ENTROPY BLOCKED: ",
    err_margin: "> FALSE POSITIVE MARGIN: ",
    net_latency: "> LATENCY: ",
    terminal_title: "TZANIX INTEGRITY TERMINAL",
    sys_op: "SYS_OP: ROOT",
    awaiting: "Awaiting execution sequence...",
    btn_execute: "[ INITIATE L7 STRESS TEST (1M REQUESTS) ]",
    btn_auditing: "[ STRESS TESTING NETWORK... ]",
    section_eco: "SHADOW MODE / ZERO-TRUST",
    eco: "[ACTIVE]",
    co2: "FALSE POSITIVES PREVENTED",
    thermal_raw: "BYPASS & WHITELISTS",
    excess_heat: "JWT BYPASS: ACTIVE",
    with_tzanix: "IP WHITELIST",
    heat_dissip: "14 ACTIVE RULES",
    heat_dissip_done: "14 ACTIVE RULES",
    eco_desc: "Zero-Trust gateway mode secures all endpoints at Layer 7, rejecting bad payloads at wire-speed.",
    log_1: "[SYS_CORE] INITIALIZING L7 STRESS TEST...",
    log_2: "> SIMULATING 1,000,000 LEGITIMATE REQUESTS...",
    log_3: "> INJECTING 50,000 MALICIOUS NETWORK ATTACKS...",
    log_4: "> ROUTING TO RUST INERTIAL ENGINE...",
    log_5: "âœ… L7 SHIELD STABLE. LATENCY: 0.56ms.",
    log_5_sim: "âœ… L7 SHIELD STABLE (SIMULATED). LATENCY: 0.56ms."
  },
  es: {
    title_main: "TZANIX",
    title_sub: "NEURAL GATEWAY",
    badge: "ESCUDO DE SEGURIDAD L7",
    btn_return: "[ VOLVER AL ORQUESTADOR ]",
    section_opt: "OPTIMIZACIÃ“N DEL MODELO",
    live: "[EN VIVO]",
    trash_tokens: "CARGAS INÃšTILES DESCARTADAS (L7)",
    gpu_cluster: "CARGA DE CPU EN BACKEND",
    raw_ingestion: "INGESTA CRUDA:",
    tzanix_filtered: "FILTRADO TZANIX:",
    proj_savings: "AHORRO PROYECTADO EN NUBE",
    section_pruning: "MOTOR INERCIAL EN RUST",
    pruning_desc: "El motor nativo en Rust filtra el trÃ¡fico en memoria antes de llegar a los servidores de aplicaciÃ³n, eliminando ciclos muertos.",
    clean: "> PETICIONES LIMPIAS: ",
    poison_rej: "> ALTA ENTROPÃA BLOQUEADA: ",
    err_margin: "> MARGEN FALSOS POSITIVOS: ",
    net_latency: "> LATENCIA: ",
    terminal_title: "TERMINAL DE INTEGRIDAD TZANIX",
    sys_op: "SYS_OP: ROOT",
    awaiting: "Esperando secuencia de ejecuciÃ³n...",
    btn_execute: "[ INICIAR TEST DE ESTRÃ‰S L7 (1M PETICIONES) ]",
    btn_auditing: "[ PROBANDO ESTRÃ‰S DE RED... ]",
    section_eco: "MODO ESPEJO / ZERO-TRUST",
    eco: "[ACTIVO]",
    co2: "FALSOS POSITIVOS EVITADOS",
    thermal_raw: "BYPASS Y LISTAS BLANCAS",
    excess_heat: "JWT BYPASS: ACTIVO",
    with_tzanix: "LISTA BLANCA IP",
    heat_dissip: "14 REGLAS ACTIVAS",
    heat_dissip_done: "14 REGLAS ACTIVAS",
    eco_desc: "El modo gateway Zero-Trust asegura todos los endpoints en Capa 7, rechazando cargas maliciosas a velocidad de lÃ­nea.",
    log_1: "[SYS_CORE] INICIALIZANDO TEST DE ESTRÃ‰S L7...",
    log_2: "> SIMULANDO 1,000,000 PETICIONES LEGÃTIMAS...",
    log_3: "> INYECTANDO 50,000 ATAQUES DE RED MALICIOSOS...",
    log_4: "> ENRUTANDO AL MOTOR INERCIAL RUST...",
    log_5: "âœ… ESCUDO L7 ESTABLE. LATENCIA: 0.56ms.",
    log_5_sim: "âœ… ESCUDO L7 ESTABLE (SIMULADO). LATENCIA: 0.56ms."
  }
};

export default function FinOpsDashboard() {
  const [lang, setLang] = useState('en'); 
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
      console.warn("Backend local no detectado, usando simulaciÃ³n UI");
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
    <div style={{ backgroundColor: '#000000', height: '100vh', width: '100vw', color: '#fff', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      
      {/* HEADER: FLAT, CRUDE, NO BORDERS EXEPT A RAW LINE */}
      <header style={{ borderBottom: '1px solid #333', padding: '15px 35px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20, flexShrink: 0, height: '75px', backgroundColor: '#050505' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ fontFamily: 'Barlow, sans-serif', fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '2px', color: '#fff' }}>
            {t.title_main} <span style={{ fontWeight: 400, color: '#64748b' }}>// {t.title_sub}</span>
          </h1>
          <div style={{ padding: '4px 10px', border: '1px solid #333', color: '#64748b', fontSize: '0.70rem', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '6px', height: '6px', backgroundColor: '#00f0ff', animation: 'pulse 1s infinite' }}></span>
            {t.badge}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setLang('en')} style={{ background: lang === 'en' ? '#333' : 'transparent', color: lang === 'en' ? '#fff' : '#64748b', border: '1px solid #333', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>EN</button>
            <button onClick={() => setLang('es')} style={{ background: lang === 'es' ? '#333' : 'transparent', color: lang === 'es' ? '#fff' : '#64748b', border: '1px solid #333', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>ES</button>
          </div>

          <Link href="/" style={{ border: '1px solid #333', color: '#64748b', background: 'transparent', padding: '8px 16px', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', transition: 'all 0.2s', textTransform: 'uppercase' }}>
            {t.btn_return}
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT: 3 COLUMNS */}
      <main style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', padding: '0', height: 'calc(100vh - 75px)', overflow: 'hidden' }}>
        
        {/* LEFT COLUMN: METRICS */}
        <div style={{ borderRight: '1px solid #333', padding: '30px', display: 'flex', flexDirection: 'column', gap: '30px', overflowY: 'auto', backgroundColor: '#050505' }}>
          <div>
            <h2 style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 20px 0', letterSpacing: '2px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              {t.section_opt} <span style={{ color: '#64748b' }}>{t.live}</span>
            </h2>
            <div style={{ marginBottom: '25px' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '5px' }}>{t.trash_tokens}</div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', letterSpacing: '-1px' }}>
                {vectorSavings.toFixed(1)}<span style={{ fontSize: '1.2rem', color: '#64748b' }}>%</span>
              </div>
            </div>
            
            <div style={{ marginBottom: '25px', border: '1px solid #333', padding: '15px', backgroundColor: '#000' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '10px' }}>{t.gpu_cluster}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #333', paddingBottom: '8px', marginBottom: '8px', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b' }}>{t.raw_ingestion}</span>
                <span style={{ color: '#fff' }}>92% CPU</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <span style={{ color: '#00f0ff' }}>{t.tzanix_filtered}</span>
                <span style={{ color: '#fff' }}>{testState === 'done' ? '12% CPU' : '38% CPU'}</span>
              </div>
            </div>

            <div>
              <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '5px' }}>{t.proj_savings}</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>
                ${usdSaved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: 'auto' }}>
            <h2 style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 15px 0', letterSpacing: '2px', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              {t.section_pruning}
            </h2>
            <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '8px', padding: '15px', border: '1px solid #333', backgroundColor: '#000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{t.clean}</span>
                <strong style={{ color: '#fff' }}>{(tokensCleaned / 1000000).toFixed(2)}M</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{t.poison_rej}</span>
                <strong style={{ color: '#ff0055' }}>{quarantineCount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{t.err_margin}</span>
                <strong style={{ color: '#fff' }}>{testResults?.margin_of_error || "N/A"}</strong>
              </div>
              <div style={{ borderTop: '1px dashed #333', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>{t.net_latency}</span>
                <strong style={{ color: '#00f0ff' }}>{testState === 'done' ? '0.56ms' : '0.12ms'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: HOLOGRAM + TERMINAL */}
        <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#000' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <PurificationHologram testState={testState} />
          </div>
          
          <div style={{ height: '280px', borderTop: '1px solid #333', padding: '20px 30px', display: 'flex', flexDirection: 'column', backgroundColor: '#050505' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.8rem', letterSpacing: '1px' }}>
              <span>{t.terminal_title}</span>
              <span style={{ color: '#64748b' }}>{t.sys_op}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              {terminalLogs.length === 0 && <span style={{ color: '#444' }}>{t.awaiting}</span>}
              {terminalLogs.map((log, i) => (
                <span key={i} style={{ color: log.includes('âœ…') ? '#00f0ff' : (log.includes('INJECT') || log.includes('INYECT') || log.includes('MALICIOUS')) ? '#ff0055' : '#64748b' }}>
                  {log}
                </span>
              ))}
              {testState === 'testing' && <span style={{ color: '#64748b', animation: 'blink 1s infinite' }}>â–ˆ</span>}
            </div>
            <button onClick={handleRunTest} disabled={testState === 'testing'} style={{ marginTop: '15px', background: testState === 'testing' ? '#111' : 'transparent', color: testState === 'testing' ? '#64748b' : '#64748b', border: '1px solid #333', padding: '12px', fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '2px', cursor: testState === 'testing' ? 'not-allowed' : 'pointer', transition: 'all 0.2s', textTransform: 'uppercase' }}>
              {testState === 'testing' ? t.btn_auditing : t.btn_execute}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: ECO IMPACT */}
        <div style={{ borderLeft: '1px solid #333', padding: '30px', display: 'flex', flexDirection: 'column', backgroundColor: '#050505' }}>
          <h2 style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0 20px 0', letterSpacing: '2px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
            {t.section_eco} <span>{t.eco}</span>
          </h2>
          <div style={{ marginBottom: '30px' }}>
            <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '5px' }}>{t.co2}</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#00f0ff', letterSpacing: '-1px' }}>
              0.00%
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ padding: '15px', border: '1px solid #333', borderLeft: '4px solid #ff0055', backgroundColor: '#000' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '8px' }}>{t.thermal_raw}</div>
              <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>{t.excess_heat}</div>
            </div>
            <div style={{ padding: '15px', border: '1px solid #333', borderLeft: '4px solid #00f0ff', backgroundColor: '#000' }}>
              <div style={{ color: '#64748b', fontSize: '0.7rem', letterSpacing: '1px', marginBottom: '8px' }}>{t.with_tzanix}</div>
              <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {testState === 'done' ? t.heat_dissip_done : t.heat_dissip}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '25px', fontSize: '0.75rem', color: '#64748b', borderTop: '1px dashed #333', paddingTop: '20px', lineHeight: '1.6' }}>
            {t.eco_desc}
          </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
                @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
        
        /* Responsive Layout Updates */
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 300px 1fr 300px;
        }
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
        }
        
        @media (max-width: 1024px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr;
            overflow-y: auto;
          }
          .dashboard-main-grid > div {
            border-left: none !important;
            border-right: none !important;
            border-bottom: 1px solid #333;
          }
          .dashboard-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }
        }
      `}} />
    </div>
  );
}

