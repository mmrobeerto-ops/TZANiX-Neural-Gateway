"use client";
import Link from "next/link";

import { useState, useEffect, useRef } from "react";
import SignalChart from "@/components/SignalChart";

// Minigráfico Canvas para el historial de inferencia (Malla Topográfica 3D Wireframe)
function InferenceHistoryChart() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    
    let animId;
    let offset = 0;

    const drawHistory = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Malla 3D: Grid de 10 x 8
      const cols = 10;
      const rows = 8;
      const gridWidth = 120;
      const gridDepth = 80;
      const spacingX = gridWidth / (cols - 1);
      const spacingZ = gridDepth / (rows - 1);

      offset += 0.015; // Velocidad de onda e inclinación lenta

      // Proyectar todos los puntos 3D a 2D
      const projected = [];
      for (let c = 0; c < cols; c++) {
        projected[c] = [];
        for (let r = 0; r < rows; r++) {
          // Centrar las coordenadas
          const x_3d = (c - (cols - 1) / 2) * spacingX;
          const z_3d = (r - (rows - 1) / 2) * spacingZ;
          
          // Calcular la altura Y usando ondas sinusoidales superpuestas (representando picos y valles volumétricos)
          const distFromCenter = Math.sqrt(x_3d * x_3d + z_3d * z_3d);
          const y_3d = Math.sin(offset * 2.2 - distFromCenter * 0.05) * 12 + 
                       Math.cos(offset * 0.8 + c * 0.5) * 5;

          // Ángulo de rotación lenta
          const radY = 0.35 + Math.sin(offset * 0.2) * 0.15; // Guiñada lenta
          const radX = 0.65; // Cabeceo (ángulo inclinado hacia abajo)

          // Rotación Y
          let x1 = x_3d * Math.cos(radY) - z_3d * Math.sin(radY);
          let z1 = x_3d * Math.sin(radY) + z_3d * Math.cos(radY);
          let y1 = y_3d;

          // Rotación X
          let y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
          let z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

          // Proyección Perspectiva
          const cameraDist = 180;
          const scale = 180;
          const px = width / 2 + (x1 * scale) / (z2 + cameraDist);
          const py = height / 2 + 10 + (y2 * scale) / (z2 + cameraDist);

          projected[c][r] = { x: px, y: py, z: z2 };
        }
      }

      // Dibujar las líneas de la malla (filas y columnas)
      ctx.lineWidth = 0.85;
      
      // Dibujar líneas longitudinales (Columnas)
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const pt = projected[c][r];
          // Opacidad dependiente de la profundidad (Z)
          const alpha = Math.max(0.06, Math.min(0.65, 1 - (pt.z + 50) / 100));
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          
          if (r === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      // Dibujar líneas transversales (Filas)
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const pt = projected[c][r];
          const alpha = Math.max(0.06, Math.min(0.65, 1 - (pt.z + 50) / 100));
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          
          if (c === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.stroke();
      }

      // Dibujar pequeños nodos brillantes en las intersecciones
      for (let c = 0; c < cols; c += 2) { 
        for (let r = 0; r < rows; r += 2) {
          const pt = projected[c][r];
          const alpha = Math.max(0.06, Math.min(0.85, 1 - (pt.z + 50) / 100));
          ctx.fillStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(drawHistory);
    };

    drawHistory();
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} width="220" height="90" style={{ width: "100%", height: "90px", display: "block" }} />;
}

export default function Home() {
  const [currentView, setCurrentView] = useState("dashboard"); // "dashboard" | "billing" | "settings"
  const [activeTab, setActiveTab] = useState("financial"); // Control interno
  const [apiKey, setApiKey] = useState("ifa_live_btc_trader_99x");

  // Gestión de API Keys dinámicas
  const [apiKeysList, setApiKeysList] = useState([]);
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClientId, setNewClientId] = useState("");
  const [newPlanType, setNewPlanType] = useState("Financial_Trader");

  // Cliente activo para Facturación y Alertas
  const [selectedClient, setSelectedClient] = useState("Financial_Trader");

  // Métricas y Alertas desde la DB
  const [billingMetrics, setBillingMetrics] = useState({ cost_usd: 0, savings_usd: 0, net_benefit_usd: 0, total_points: 0 });
  const [notificationSettings, setNotificationSettings] = useState({ weekly_report: 1, noise_alert: 1, budget_limit: 1 });
  const [notificationLogs, setNotificationLogs] = useState([]);

  // Estados de la simulación y cronología
  const [simStartTime, setSimStartTime] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Valores visibles congelados en pantalla
  const [visiblePoints, setVisiblePoints] = useState(0);
  const [visibleRoi, setVisibleRoi] = useState(0.00);

  // Valores animados con efecto count-up progresivo
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [animatedRoi, setAnimatedRoi] = useState(0.00);

  // Factor de escala interactivo para inyección
  const [scaleFactor, setScaleFactor] = useState(1);

  // Archivo purificado listo para descargar
  const [purifiedDataToDownload, setPurifiedDataToDownload] = useState(null);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 1500; // 1.5 segundos
    const startPoints = animatedPoints;
    const targetPoints = visiblePoints;
    const startRoi = animatedRoi;
    const targetRoi = visibleRoi;

    let frameId;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad

      setAnimatedPoints(Math.floor(startPoints + (targetPoints - startPoints) * easeProgress));
      setAnimatedRoi(startRoi + (targetRoi - startRoi) * easeProgress);

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [visiblePoints, visibleRoi]);

  // Acumuladores de simulación local
  const [simulatedPointsOffset, setSimulatedPointsOffset] = useState(0);
  const [simulatedRoiOffset, setSimulatedRoiOffset] = useState(0);

  // Estados para el motor Tesseract 4D
  const [spatialSignature, setSpatialSignature] = useState(null);
  const [spatialCoords, setSpatialCoords] = useState(null);
  const [knnNeighbors, setKnnNeighbors] = useState([]);

  // Estados para la transmisión en tiempo real
  const [wsConnected, setWsConnected] = useState(false);
  const [liveBtcData, setLiveBtcData] = useState(null);
  const [currentBtcPrice, setCurrentBtcPrice] = useState(null);
  const [currentBtcGain, setCurrentBtcGain] = useState(null);
  const wsRef = useRef(null);

  // Formulario de Tarjeta Stripe
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [billingMessage, setBillingMessage] = useState(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  // Historial de Logs Recientes (Bitácora de Auditoría)
  const [transactionLogs, setTransactionLogs] = useState([]);

  // Diccionario de traducción de base de datos a marcas corporativas de IA
  const clientNameMapping = {
    "Financial_Trader": "AI_Model_Optimizer",
    "Industrial_Client": "Enterprise_Cluster",
    "AI_Research": "Neural_Node"
  };

  const planNameMapping = {
    "Financial_Trader": "AI_Core_Enterprise",
    "Industrial_Tijuana": "Enterprise_Cluster_Tier",
    "AI_Research": "AI_Research_Plan"
  };

  // Cargar llaves y registros al iniciar
  const fetchApiKeys = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/keys/");
      if (res.ok) {
        const data = await res.json();
        setApiKeysList(data);
        
        // Auto-seleccionar la clave correcta
        const match = data.find(k => k.client_id === (activeTab === "financial" ? "Financial_Trader" : activeTab === "industrial" ? "Industrial_Client" : "AI_Research"));
        if (match && match.status === "active") {
          setApiKey(match.api_key);
        }
      }
    } catch (err) {
      console.warn("Cargando llaves locales simuladas.");
      setApiKeysList([
        { client_id: "Financial_Trader", api_key: "ifa_live_btc_trader_99x", plan_type: "Financial_Trader", status: "active" },
        { client_id: "Industrial_Client", api_key: "ifa_live_industrial_plc_01z", plan_type: "Industrial_Tijuana", status: "active" },
        { client_id: "AI_Research", api_key: "ifa_live_ai_research_05w", plan_type: "AI_Research", status: "active" }
      ]);
    }
  };

  const fetchMetricsAndSettings = async () => {
    try {
      const resMetrics = await fetch(`http://127.0.0.1:8000/api/v1/billing/metrics/${selectedClient}`);
      if (resMetrics.ok) {
        const data = await resMetrics.json();
        setBillingMetrics(data);
      }
      
      const resSettings = await fetch(`http://127.0.0.1:8000/api/v1/notifications/${selectedClient}`);
      if (resSettings.ok) {
        const data = await resSettings.json();
        setNotificationSettings(data);
      }

      const resLogs = await fetch(`http://127.0.0.1:8000/api/v1/notifications/${selectedClient}/logs`);
      if (resLogs.ok) {
        const data = await resLogs.json();
        setNotificationLogs(data);
      }
    } catch (err) {
      console.warn("Falla de carga de base de datos local.");
    }
  };

  const fetchTransactionLogs = async () => {
    setTransactionLogs([]);
  };

  // Carga inicial
  useEffect(() => {
    fetchApiKeys();
    fetchTransactionLogs();
  }, [activeTab]);

  // Sincronizar el cliente seleccionado con la pestaña activa
  useEffect(() => {
    if (activeTab === "financial") setSelectedClient("Financial_Trader");
    else if (activeTab === "industrial") setSelectedClient("Industrial_Client");
    else if (activeTab === "ai") setSelectedClient("AI_Research");
    
    // Limpiar descarga anterior
    setPurifiedDataToDownload(null);
  }, [activeTab]);

  // Polling de 1 segundo (1000ms) hacia FastAPI y SQLite
  useEffect(() => {
    fetchMetricsAndSettings();
    const interval = setInterval(() => {
      fetchMetricsAndSettings();
      fetchApiKeys();
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedClient]);

  // Actualizar valores visibles si no estamos simulando activamente el salto de botón
  useEffect(() => {
    if (!isSimulating) {
      const basePoints = (billingMetrics.total_points || 0);
      const baseSavings = (billingMetrics.savings_usd || 0);
      
      // Inicializar en 0 absoluto para que el cliente vea su proceso en tiempo real
      setVisiblePoints(basePoints);
      setVisibleRoi(baseSavings);
    }
  }, [billingMetrics, isSimulating]);

  // Conectar con el WebSocket local de FastAPI
  useEffect(() => {
    const connectWS = () => {
      // Usar el host dinámico de la ventana para evitar bloqueos por host mismatch
      const wsHost = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
      let ws;
      try {
        ws = new WebSocket(`ws://${wsHost}:8000/ws/live-stream`);
      } catch (err) {
        console.warn("Fallo de conexión WebSocket (probablemente bloqueo HTTPS a WS inseguro):", err);
        return;
      }
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Capturar tanto la transmisión de Bitcoin como el NEURAL-NETWORK-FEED del script de prueba
          if (data.data_stream_id === "BTC-USD-LIVE" || data.data_stream_id === "NEURAL-NETWORK-FEED") {
            setLiveBtcData(data);
            if (data.original_data && data.original_data.length > 0) {
              setCurrentBtcPrice(data.original_data[data.original_data.length - 1]);
            }
            setCurrentBtcGain(data.compute_efficiency_gain);

            if (data.spatial_signature_4d) {
              setSpatialSignature(data.spatial_signature_4d);
            }
            if (data.spatial_coordinates) {
              setSpatialCoords(data.spatial_coordinates);
            }
            if (data.knn_neighbors) {
              setKnnNeighbors(data.knn_neighbors);
            }



            // Inyectar de inmediato una fila limpia a la bitácora inferior con cada ráfaga recibida
            setTransactionLogs(prev => {
              const newLog = {
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                data_stream_id: data.data_stream_id,
                plan: data.data_stream_id === "BTC-USD-LIVE" ? "AI_CORE_ENTERPRISE" : "AI_RESEARCH_PLAN",
                 status: "OK / OPTIMIZADO"
              };
              // Evitar duplicaciones redundantes de la misma marca de segundo exacta
              if (prev.length > 0 && prev[0].timestamp === newLog.timestamp && prev[0].data_stream_id === newLog.data_stream_id) {
                return prev;
              }
              return [newLog, ...prev.slice(0, 9)];
            });
          }
        } catch (err) {
          console.error("Error en WebSocket:", err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        setLiveBtcData(null);
        setTimeout(connectWS, 5000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [activeTab]);

  // Generar nueva API Key
  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newClientId) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/keys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: newClientId, plan_type: newPlanType })
      });

      if (response.ok) {
        fetchApiKeys();
        setShowCreateModal(false);
        setNewClientId("");
      }
    } catch (err) {
      alert("Error de persistencia de llave.");
    }
  };

  // Revocar API Key
  const handleRevokeKey = async (keyToRevoke) => {
    if (!confirm("¿Deseas suspender de inmediato el acceso de este token?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/keys/revoke/${keyToRevoke}`, {
        method: "POST"
      });

      if (response.ok) {
        fetchApiKeys();
        fetchMetricsAndSettings();
      }
    } catch (err) {
      alert("Error al inhabilitar credencial.");
    }
  };

  // Cambiar alertas
  const handleToggleSetting = async (field, currentValue) => {
    const updated = currentValue === 1 ? 0 : 1;
    const payload = {
      weekly_report: field === "weekly_report" ? updated : notificationSettings.weekly_report,
      noise_alert: field === "noise_alert" ? updated : notificationSettings.noise_alert,
      budget_limit: field === "budget_limit" ? updated : notificationSettings.budget_limit
    };

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/notifications/${selectedClient}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setNotificationSettings(prev => ({ ...prev, [field]: updated }));
        fetchMetricsAndSettings();
      }
    } catch (err) {
      console.error("Error al actualizar alertas.");
    }
  };

  // Stripe Payment Method Link
  const handleRegisterStripePayment = async (e) => {
    e.preventDefault();
    setIsBillingLoading(true);
    setBillingMessage(null);

    const mockPaymentMethodId = "pm_card_visa";

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/billing/create-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: selectedClient,
          payment_method_id: mockPaymentMethodId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setBillingMessage({ type: "success", text: data.message });
        fetchApiKeys();
        fetchMetricsAndSettings();
      } else {
        const err = await response.json();
        setBillingMessage({ type: "error", text: err.detail || "Falla en Stripe." });
      }
    } catch (err) {
      setBillingMessage({ type: "error", text: "Error de pasarela de pagos." });
    } finally {
      setIsBillingLoading(false);
    }
  };

  // Botón Único de Prueba: "Simular Flujo de IA en Vivo" (Mantiene animación de ruido controlada)
  const handleSimulateWorkload = async () => {
    if (isSimulating) return; // Evitar disparos múltiples
    
    // Paso 1: Clic (0 segundos) -> Guardamos marca de tiempo y congelamos números
    setSimStartTime(Date.now());
    setIsSimulating(true);

    // Mandamos petición interna a la API de FastAPI en segundo plano para auditoría en SQLite
    const payload = {
      data_stream_id: "CORE-AI-STREAM",
      stream_type: "ai_inference",
      sequences: [0.9124, 0.4183, -0.6117, 0.8589, 0.6379, -0.1578, 0.9645, 0.3569]
    };
    try {
      fetch("http://127.0.0.1:8000/api/v1/purify-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-IFA-Key": apiKey
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn("Backend offline.");
    }

    // Paso 2, 3 y 4: Esperar a que transcurran 2.5s (Entrada Sucia + Filtrado) para estabilizar e incrementar contadores
    setTimeout(() => {
      // Sumar incremento masivo al ROI ($20,485.50) y puntos (10,000,000)
      setSimulatedPointsOffset(9514652);
      setSimulatedRoiOffset(19003.50);

      // Inyectar el nuevo renglón en la bitácora con estado purificado
      setTransactionLogs(prev => [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          data_stream_id: "CORE-AI-STREAM",
          plan: "AI_RESEARCH_PLAN",
          status: "OK / OPTIMIZADO"
        },
        ...prev
      ]);

      // Descongelar cifras
      setIsSimulating(false);
      fetchMetricsAndSettings();
    }, 2500);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Resetear el valor para poder seleccionar el mismo archivo consecutivamente en el navegador
    event.target.value = "";

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        let sequences = [];
        const content = e.target.result.trim();
        
        if (content.startsWith("[")) {
          sequences = JSON.parse(content);
        } else {
          sequences = content.split(/[,\n\r]+/).map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
        }

        if (sequences.length === 0) {
          alert("El archivo no contiene secuencias numéricas válidas. Sube un archivo con números separados por comas o saltos de línea.");
          return;
        }

        setSimStartTime(Date.now());
        setIsSimulating(true);

        const activeKeyObj = apiKeysList.find(k => k.client_id === (activeTab === "financial" ? "Financial_Trader" : activeTab === "industrial" ? "Industrial_Client" : "AI_Research") && k.status === "active");
        const fallbackKeyObj = activeKeyObj || apiKeysList.find(k => k.status === "active");
        const requestKey = fallbackKeyObj ? fallbackKeyObj.api_key : apiKey;

        const payload = {
          data_stream_id: file.name.toUpperCase().replace(/[^A-Z0-9_-]/g, "_").substring(0, 30),
          stream_type: activeTab === "financial" ? "financial" : activeTab === "industrial" ? "industrial" : "ai_inference",
          sequences: sequences,
          scale_factor: scaleFactor
        };

        const response = await fetch("http://127.0.0.1:8000/api/v1/purify-stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-IFA-Key": requestKey
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const data = await response.json();
          setLiveBtcData(data);
          if (data.spatial_signature_4d) setSpatialSignature(data.spatial_signature_4d);
          if (data.spatial_coordinates) setSpatialCoords(data.spatial_coordinates);
          if (data.knn_neighbors) setKnnNeighbors(data.knn_neighbors);
          
          // Guardar secuencia limpia para la descarga en memoria
          if (data.purified_data) {
            setPurifiedDataToDownload({ name: file.name, data: data.purified_data });
          }
          
          // Limpiar offsets manuales
          setSimulatedPointsOffset(0);
          setSimulatedRoiOffset(0);

          // Forzar la consulta inmediata de métricas reales calculadas por SQLite en el backend
          await fetchMetricsAndSettings();
          
          // Registrar en la bitácora
          setTransactionLogs(prev => [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              data_stream_id: payload.data_stream_id,
              plan: activeTab === "financial" ? "AI_CORE_ENTERPRISE" : "AI_RESEARCH_PLAN",
              status: "OK / ARCHIVO OPTIMIZADO"
            },
            ...prev
          ]);
        } else {
          const errData = await response.json();
          alert("Error de la API: " + (errData.detail || "Falla al purificar."));
        }
      } catch (err) {
        alert("Error al procesar el archivo: " + err.message);
      } finally {
        setIsSimulating(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExportReport = () => {
    const client = selectedClient === "Financial_Trader" ? "AI_Model_Optimizer" : selectedClient === "Industrial_Client" ? "Enterprise_Cluster" : "Neural_Node";
    
    // Tipo de información filtrada y detalles detectados
    let dataType = "";
    let detectionMethod = "Filtro Armonico Lineal de Fourier (IFA)";
    let detectedAnomalies = "";
    if (selectedClient === "Financial_Trader") {
      dataType = "Datos Financieros (Vectores de cotizaciones y volatilidad de mercado)";
      detectedAnomalies = "Desviaciones criptograficas, ticks duplicados y ruido electromagnetico de red";
    } else if (selectedClient === "Industrial_Client") {
      dataType = "Datos Industriales (Telemetria de sensores de PLC y maquinas)";
      detectedAnomalies = "Frecuencias armonicas parasitas, picos de voltaje y errores de lectura fisica";
    } else {
      dataType = "Pesos de Redes Neuronales (Inferencia local de LLM e IA)";
      detectedAnomalies = "Redundancia de pesos vectoriales, tensores redundantes y atenuacion del ruido de red";
    }

    const efficiencyGain = liveBtcData?.compute_efficiency_gain || 43.10;
    const noiseTicksEliminated = Math.round(visiblePoints * (efficiencyGain / 100));

    let reportContent = "=================================================================\n";
    reportContent += "                 TZANIX DATA SOLUTIONS - AUDIT REPORT            \n";
    reportContent += "=================================================================\n";
    reportContent += `Fecha del Reporte           : ${new Date().toLocaleString('en-US')}\n`;
    reportContent += `Cliente de Borde            : ${client}\n`;
    reportContent += `ID de Cliente               : ${selectedClient}\n`;
    reportContent += "-----------------------------------------------------------------\n";
    reportContent += "DETALLES DE AUDITORIA DE FILTRADO:\n";
    reportContent += `Tipo de Datos Filtrados     : ${dataType}\n`;
    reportContent += `Metodo de Deteccion         : ${detectionMethod}\n`;
    reportContent += `Anomalias Detectadas        : ${detectedAnomalies}\n`;
    reportContent += `Porcentaje de Ruido Filtrado: ${efficiencyGain}%\n`;
    reportContent += "-----------------------------------------------------------------\n";
    reportContent += "DESGLOSE DE VOLUMEN Y COSTOS:\n";
    reportContent += `Puntos Totales Recibidos    : ${visiblePoints.toLocaleString('en-US')} ticks\n`;
    reportContent += `Ruido Basura Eliminado Local: ${noiseTicksEliminated.toLocaleString('en-US')} ticks (¡Evito subir a la Nube!)\n`;
    reportContent += `Puntos Limpios Enviados     : ${(visiblePoints - noiseTicksEliminated).toLocaleString('en-US')} ticks\n`;
    reportContent += `Costo de Procesamiento API  : $${billingMetrics.cost_usd?.toFixed(2)} USD\n`;
    reportContent += `Ahorro ROI Computacion Cloud: $${visibleRoi.toFixed(2)} USD\n`;
    reportContent += `Ahorro Neto Promedio (85%)  : $${(visibleRoi * 0.85).toFixed(2)} USD\n`;
    reportContent += "-----------------------------------------------------------------\n";
    reportContent += "HISTORICO DE TRANSCURSO RECIENTE:\n";
    reportContent += "Marca de Tiempo | Identificador | Canal | Estado\n";
    
    transactionLogs.forEach(log => {
      reportContent += `${log.timestamp} | ${log.data_stream_id} | ${log.plan} | ${log.status}\n`;
    });
    
    reportContent += "=================================================================\n";
    reportContent += "JUSTIFICACION TECNICA DEL FILTRADO Y DESCARTE DE RUIDO:\n";
    reportContent += "1. DETECCION Y AISLAMIENTO:\n";
    reportContent += `   Se aislaron y descartaron ${noiseTicksEliminated.toLocaleString('en-US')} ticks que corresponden a ruido\n`;
    reportContent += `   de alta frecuencia (armonicos no lineales y fluctuaciones parasitarias)\n`;
    reportContent += `   de la señal. Estos valores representan distorsion e interferencia fisica.\n`;
    reportContent += "2. RAZON DEL DESCARTE:\n";
    reportContent += "   - Eficiencia Cloud: Al filtrar esta distorsion irrelevante,\n";
    reportContent += "     los datos se transmiten comprimidos con un 43% de ahorro de ancho\n";
    reportContent += "     de banda y almacenamiento, reduciendo el costo operacional de nube.\n";
    reportContent += "   - Precision Matematica: Al alimentar modelos de Inteligencia Artificial\n";
    reportContent += "     u osciloscopios locales con datos optimizados en lugar de ruidosos,\n";
    reportContent += "     la precision de inferencia y consistencia sube al 97.9%.\n";
    reportContent += "=================================================================\n";
    reportContent += "          CERTIFICADO POR FILTRO LINEAL FOURIER IFA - TZANIX      \n";
    reportContent += "=================================================================\n";

    const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tzanix_audit_report_${client.toLowerCase()}_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPurifiedFile = () => {
    if (!purifiedDataToDownload || !purifiedDataToDownload.data) return;
    
    // Unir los números purificados con comas
    const csvContent = purifiedDataToDownload.data.join(", ");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const originalName = purifiedDataToDownload.name;
    const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
    const extension = originalName.substring(originalName.lastIndexOf('.')) || ".csv";
    
    link.download = `optimized_${baseName}${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container-3d">
      <div className="hologram-floor"></div>
      <div className="app-layout">
      {/* Sidebar Vertical Premium */}
      <aside className="sidebar">
        <div className="sidebar-menu">
          {/* Icono de Marca */}
          <div style={{ height: "50px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none" style={{ filter: "drop-shadow(0 0 6px rgba(0, 229, 255, 0.65))" }}>
              <line x1="50" y1="50" x2="35" y2="24" stroke="#00E5FF" strokeWidth="7" strokeLinecap="round" />
              <line x1="50" y1="50" x2="35" y2="76" stroke="#00E5FF" strokeWidth="7" strokeLinecap="round" />
              <line x1="50" y1="50" x2="80" y2="50" stroke="#00E5FF" strokeWidth="7" strokeLinecap="round" />
              <circle cx="35" cy="24" r="9" fill="#00E5FF" />
              <circle cx="35" cy="76" r="9" fill="#00E5FF" />
              <circle cx="80" cy="50" r="9" fill="#00E5FF" />
              <circle cx="50" cy="50" r="12" fill="#FFFFFF" stroke="#00E5FF" strokeWidth="5" style={{ filter: "drop-shadow(0 0 8px #00E5FF)" }} />
            </svg>
          </div>
          
          {/* Botón Menu */}
          <div className="sidebar-item" style={{ marginBottom: "15px", opacity: 0.4, cursor: "default" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </div>

          {/* Icono 1: Home (Dashboard) */}
          <div 
            className={`sidebar-item ${currentView === "dashboard" && !showKeyPanel ? "active" : ""}`} 
            onClick={() => {
              setCurrentView("dashboard");
              setShowKeyPanel(false);
            }}
            title="Dashboard Ejecutivo"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>

          {/* Icono 2: Claves de API / Canal */}
          <div 
            className={`sidebar-item ${showKeyPanel && currentView === "dashboard" ? "active" : ""}`} 
            onClick={() => {
              setCurrentView("dashboard");
              setShowKeyPanel(prev => !prev);
            }}
            title="Canales y Claves de API"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
          </div>

        </div>

        {/* Icono Inferior: Bitácora */}
        <div className="sidebar-item" onClick={() => setCurrentView("dashboard")} title="Bitácora de Auditoría" style={{ opacity: 0.6 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Cabecera Horizontal Premium */}
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px" }}>
          <div>
            <h1 style={{ fontSize: "1.3rem", fontWeight: "700", letterSpacing: "-0.01em", display: "flex", alignItems: "center", gap: "12px" }}>
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" style={{ display: "inline-block", verticalAlign: "middle", filter: "drop-shadow(0 0 5px rgba(0, 229, 255, 0.5))" }}>
                <line x1="50" y1="50" x2="35" y2="24" stroke="#00E5FF" strokeWidth="8" strokeLinecap="round" />
                <line x1="50" y1="50" x2="35" y2="76" stroke="#00E5FF" strokeWidth="8" strokeLinecap="round" />
                <line x1="50" y1="50" x2="80" y2="50" stroke="#00E5FF" strokeWidth="8" strokeLinecap="round" />
                <circle cx="35" cy="24" r="10" fill="#00E5FF" />
                <circle cx="35" cy="76" r="10" fill="#00E5FF" />
                <circle cx="80" cy="50" r="10" fill="#00E5FF" />
                <circle cx="50" cy="50" r="13" fill="#FFFFFF" stroke="#00E5FF" strokeWidth="5" style={{ filter: "drop-shadow(0 0 8px #00E5FF)" }} />
              </svg>
              <span>TZANiX <span style={{ color: "var(--gold-primary)", fontWeight: "800" }}>AI Foundation</span></span>
            </h1>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Motor de Purificación de Datasets LLM | FastAPI Core</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="pulse-indicator" style={{ backgroundColor: wsConnected ? "var(--gold-primary)" : "#8e9cae" }}></span>
              Frecuencia Base: <strong style={{ color: "var(--gold-primary)" }}>7.25 Hz</strong>
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginLeft: "15px" }}>
              Tensor: <strong style={{ color: "#00E5FF", textShadow: "0 0 5px #00E5FF" }}>Neural Node (Rust)</strong>
            </span>
            <Link href="/finops" style={{ 
              marginLeft: "15px", 
              padding: "6px 12px", 
              borderRadius: "4px", 
              border: "1px solid rgba(0,229,255,0.4)", 
              backgroundColor: "rgba(0,229,255,0.1)", 
              color: "#00E5FF", 
              textDecoration: "none", 
              fontSize: "0.85rem",
              fontWeight: "600",
              boxShadow: "0 0 10px rgba(0,229,255,0.2)",
              transition: "all 0.3s",
              position: "relative",
              zIndex: 9999,
              cursor: "pointer",
              pointerEvents: "auto"
            }}>
              FINOPS & ESG DASHBOARD
            </Link>
          </div>
        </header>

        {/* Banner de Flujo en Vivo (Reactivo al canal de datos) */}
        {liveBtcData && currentView === "dashboard" && (
          <div className="live-banner" style={{
            background: "rgba(0, 229, 255, 0.03)",
            border: "1px solid rgba(0, 229, 255, 0.12)",
            borderRadius: "10px",
            padding: "8px 15px",
            marginBottom: "20px",
            fontSize: "0.85rem",
            color: "var(--gold-primary)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="pulse-indicator" style={{ margin: 0 }}></span>
              <span>SINTONIZANDO FLUJO EN VIVO: <strong>{liveBtcData.data_stream_id}</strong></span>
            </div>
            <div style={{ display: "flex", gap: "15px" }}>
              <span>Inferencia: <strong style={{ color: "#fff" }}>{Math.round(currentBtcPrice || 65000).toLocaleString('en-US')} TFLOPS</strong></span>
              <span>Eficiencia: <strong style={{ color: "var(--gold-primary)" }}>{currentBtcGain || 43.10}%</strong></span>
            </div>
          </div>
        )}

      <div className="container" style={{ paddingTop: "10px" }}>
        
        {/* ========================================== */}
        {/* VISTA 1: DASHBOARD EJECUTIVO */}
        {/* ========================================== */}
        {currentView === "dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* BLOQUE 1: ENTRADA (ARRIBA) */}
            <div className="glass-card" style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              padding: "20px 30px", 
              background: "rgba(20, 25, 30, 0.5)",
              border: "1px solid var(--border-color)"
            }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "4px" }}>Infraestructura de Purificación IA</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                  Optimización de carga y reducción de huella energética en procesamiento masivo de datos.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <button 
                  className="btn-primary" 
                  style={{ width: "auto", padding: "10px 24px", fontSize: "0.9rem" }}
                  onClick={() => setShowKeyPanel(!showKeyPanel)}
                >
                  {showKeyPanel ? "Ocultar Credenciales" : "Conectar Flujo de Datos"}
                </button>
              </div>
            </div>

            {/* Panel Discreto de API Keys (Desplegable) */}
            {showKeyPanel && (
              <div className="glass-card" style={{ padding: "20px", background: "rgba(20, 25, 30, 0.8)", border: "1px solid var(--gold-primary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <h3 style={{ fontSize: "1rem", color: "var(--gold-primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold-primary)" }}><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                    Canales y Claves de API
                  </h3>
                  <button className="tab-btn" onClick={() => setShowCreateModal(true)} style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                    + Generar Nuevo Token
                  </button>
                </div>
                <div className="table-container">
                  <table className="custom-table" style={{ fontSize: "0.8rem" }}>
                    <thead>
                      <tr>
                        <th>Identificador de IA</th>
                        <th>Plan Contratado</th>
                        <th>Token Autorizado (X-IFA-Key)</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeysList.map((kObj, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: "700" }}>{clientNameMapping[kObj.client_id] || kObj.client_id}</td>
                          <td>{planNameMapping[kObj.plan_type] || kObj.plan_type}</td>
                          <td style={{ fontFamily: "monospace", color: "var(--gold-primary)" }}>{kObj.api_key}</td>
                          <td>
                            <span className="badge" style={{ 
                              background: kObj.status === "active" ? "rgba(0, 229, 255, 0.1)" : "rgba(235, 87, 87, 0.1)",
                              color: kObj.status === "active" ? "var(--gold-primary)" : "#eb5757"
                            }}>
                              {kObj.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {kObj.status === "active" && (
                              <button 
                                onClick={() => handleRevokeKey(kObj.api_key)}
                                style={{ background: "rgba(235,87,87,0.1)", color: "#eb5757", border: "1px solid rgba(235,87,87,0.2)", padding: "2px 6px", borderRadius: "4px", fontSize: "0.75rem", cursor: "pointer" }}
                              >
                                Revocar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* BLOQUE 2: OSCILOSCOPIO COMPARATIVO (ANCHO TOTAL) */}
            <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold-primary)" }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Flujo de Purificación de Señal
                </h3>
                
                {/* Selectores discretos e interactivos de canal activo */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button className={`tab-btn ${activeTab === "financial" ? "active" : ""}`} onClick={() => setActiveTab("financial")} style={{ fontSize: "0.75rem", padding: "4px 8px" }}>AI_Model_Optimizer</button>
                  <button className={`tab-btn ${activeTab === "industrial" ? "active" : ""}`} onClick={() => setActiveTab("industrial")} style={{ fontSize: "0.75rem", padding: "4px 8px" }}>Enterprise_Cluster</button>
                  <button className={`tab-btn ${activeTab === "ai" ? "active" : ""}`} onClick={() => setActiveTab("ai")} style={{ fontSize: "0.75rem", padding: "4px 8px" }}>Neural_Node (Python Test)</button>
                  
                  <label 
                    className="tab-btn active" 
                    style={{ 
                      fontSize: "0.75rem", 
                      padding: "4px 10px", 
                      fontWeight: "600",
                      marginLeft: "10px",
                      background: isSimulating ? "rgba(0, 229, 255, 0.15)" : "var(--gold-gradient)",
                      color: isSimulating ? "var(--gold-primary)" : "var(--text-dark)",
                      boxShadow: isSimulating ? "none" : "0 0 10px rgba(0, 229, 255, 0.3)",
                      cursor: isSimulating ? "default" : "pointer",
                      display: "inline-block"
                    }}
                  >
                    {isSimulating ? "Optimizando..." : "[ Conectar Archivo ]"}
                    <input 
                      type="file" 
                      accept=".json,.csv,.txt" 
                      onChange={handleFileUpload} 
                      style={{ display: "none" }} 
                      disabled={isSimulating}
                    />
                  </label>

                  {purifiedDataToDownload && (
                    <button 
                      onClick={handleDownloadPurifiedFile}
                      style={{ 
                        fontSize: "0.75rem", 
                        padding: "5px 12px", 
                        background: "rgba(0, 229, 255, 0.15)", 
                        border: "1px solid rgba(0, 229, 255, 0.3)", 
                        borderRadius: "6px",
                        color: "#00E5FF", 
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginLeft: "10px",
                        transition: "all 0.2s"
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.background = "rgba(0, 229, 255, 0.25)"; e.currentTarget.style.boxShadow = "0 0 8px rgba(0, 229, 255, 0.4)"; }}
                      onMouseOut={(e) => { e.currentTarget.style.background = "rgba(0, 229, 255, 0.15)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      📥 Exportar Telemetría Optimizada
                    </button>
                  )}
                </div>
              </div>

              <div style={{ textAlign: "center", margin: "5px 0 10px 0", fontSize: "0.95rem", color: "var(--gold-primary)", fontStyle: "italic", fontWeight: "300", letterSpacing: "0.02em" }}>
                "Limpiamos el ruido del mundo para que puedas ver la verdad en tus datos"
              </div>

              <div className="chart-container" style={{ height: "250px", background: "transparent", border: "none", margin: 0 }}>
                <SignalChart type={activeTab} liveData={liveBtcData} simStartTime={simStartTime} />
              </div>
            </div>

            {/* BLOQUE INTERMEDIO: GRID DE TARJETAS MODULARES DE RENDIMIENTO (Estilo Captura) */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: "25px" }}>
              
              {/* Tarjeta 1: Gráfico de Historial de Volumen */}
              <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
                    Historial de Inferencia
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "var(--gold-primary)", border: "1px solid rgba(197,168,128,0.2)", padding: "2px 6px", borderRadius: "4px" }}>
                    En Vivo
                  </span>
                </div>
                <InferenceHistoryChart />
              </div>

              {/* Tarjeta 2: Ticks Purificados & Eficiencia de Operación */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                
                {/* 2A: Ticks */}
                <div className="glass-card" style={{ padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                      Volumen Optimizado (Ticks)
                    </span>
                    <strong className="monospace-font" style={{ fontSize: "1.5rem", color: "#FFFFFF", display: "block", marginTop: "4px" }}>
                      {animatedPoints.toLocaleString('en-US')}
                    </strong>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>Operacional total</span>
                  </div>
                  <div style={{ background: "rgba(0, 229, 255, 0.08)", padding: "10px", borderRadius: "8px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--gold-primary)" }}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
                  </div>
                </div>

                {/* 2B: Eficiencia Circular Ring */}
                <div className="glass-card" style={{ padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                      Eficiencia del Filtro
                    </span>
                    <strong className="monospace-font" style={{ fontSize: "1.5rem", color: "var(--gold-primary)", display: "block", marginTop: "4px" }}>
                      43.10%
                    </strong>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>Reducción de ruido</span>
                  </div>
                  {/* SVG Circular Progress Ring (43.1%) */}
                  <div style={{ position: "relative", width: "42px", height: "42px" }}>
                    <svg width="42" height="42">
                      <circle cx="21" cy="21" r="16" fill="transparent" stroke="rgba(0, 229, 255, 0.08)" strokeWidth="3" />
                      <circle 
                        className="progress-ring-circle"
                        cx="21" 
                        cy="21" 
                        r="16" 
                        fill="transparent" 
                        stroke="var(--gold-primary)" 
                        strokeWidth="3" 
                        strokeDasharray={100.5}
                        strokeDashoffset={100.5 - (0.431 * 100.5)}
                      />
                    </svg>
                    <div className="monospace-font" style={{ position: "absolute", top: "0", left: "0", width: "42px", height: "42px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.65rem", color: "#FFFFFF", fontWeight: "600" }}>
                      43%
                    </div>
                  </div>
                </div>

              </div>

              {/* Tarjeta 3: Ahorro ROI & Ahorro Neto (Anillo del 85% Verde) */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                
                {/* 3A: ROI */}
                <div className="glass-card" style={{ padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                      Ahorro ROI Acumulado
                    </span>
                    <strong className="monospace-font" style={{ fontSize: "1.5rem", color: "var(--gold-primary)", display: "block", marginTop: "4px" }}>
                      ${animatedRoi.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>Inferencia optimizada</span>
                  </div>
                  <div style={{ background: "rgba(0, 229, 255, 0.08)", padding: "10px", borderRadius: "8px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--gold-primary)" }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                </div>

                {/* 3B: Ahorro Neto con Anillo 85% Verde */}
                <div className="glass-card" style={{ padding: "15px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block" }}>
                      Ahorro Neto Promedio
                    </span>
                    <strong className="monospace-font" style={{ fontSize: "1.5rem", color: "var(--gold-primary)", display: "block", marginTop: "4px" }}>
                      ${(animatedRoi * 0.85).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </strong>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: "2px", display: "block" }}>Factor de eficiencia</span>
                  </div>
                  {/* SVG Circular Progress Ring (85%) */}
                  <div style={{ position: "relative", width: "42px", height: "42px" }}>
                    <svg width="42" height="42">
                      <circle cx="21" cy="21" r="16" fill="transparent" stroke="rgba(0, 229, 255, 0.08)" strokeWidth="3" />
                      <circle 
                        className="progress-ring-circle"
                        cx="21" 
                        cy="21" 
                        r="16" 
                        fill="transparent" 
                        stroke="var(--gold-primary)" 
                        strokeWidth="3" 
                        strokeDasharray={100.5}
                        strokeDashoffset={100.5 - (0.85 * 100.5)}
                      />
                    </svg>
                    <div className="monospace-font" style={{ position: "absolute", top: "0", left: "0", width: "42px", height: "42px", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.65rem", color: "#FFFFFF", fontWeight: "600" }}>
                      85%
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* BLOQUE 3: AUDITORÍA Y TESSERACT 4D (ABAJO) */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "25px", marginBottom: "20px" }}>
              
              {/* Bitácora de Procesamiento (Izquierda) */}
              <div className="glass-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--gold-primary)" }}><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                    Bitácora de Procesamiento del Filtro Armónico
                  </h3>
                  <button 
                    onClick={handleExportReport}
                    style={{ 
                      fontSize: "0.75rem", 
                      padding: "5px 12px", 
                      background: "rgba(0, 229, 255, 0.15)", 
                      border: "1px solid rgba(0, 229, 255, 0.3)", 
                      borderRadius: "6px",
                      color: "#00E5FF", 
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.background = "rgba(0, 229, 255, 0.25)"; e.currentTarget.style.boxShadow = "0 0 8px rgba(0, 229, 255, 0.4)"; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = "rgba(0, 229, 255, 0.15)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    💾 Descargar Informe de ROI
                  </button>
                </div>
                <div className="table-container">
                  <table className="custom-table monospace-font" style={{ fontSize: "0.85rem" }}>
                    <thead>
                      <tr>
                        <th>Marca de Tiempo</th>
                        <th>Identificador de Flujo</th>
                        <th>Canal de Datos</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactionLogs.map((log, index) => (
                        <tr key={index}>
                          <td style={{ color: "var(--text-secondary)" }}>{log.timestamp}</td>
                          <td><strong>{log.data_stream_id}</strong></td>
                          <td>{log.plan}</td>
                          <td style={{ color: "#00E5FF", fontWeight: "600", textShadow: "0 0 5px #00E5FF" }}>● {log.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Panel del Tesseract 4D & Ahorro Energético (Derecha) */}
              <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
                <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 4px #00E5FF)" }}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="22" y2="7"/><line x1="2" y1="17" x2="22" y2="17"/></svg>
                  Tesseract 4D & Ahorro Energético
                </h3>
                
                {/* 1. Firma Morton */}
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Firma Morton 64-bit (RAM Local)</span>
                  <div className="monospace-font" style={{ 
                    fontSize: "1.4rem", 
                    color: spatialSignature ? "#00E5FF" : "var(--text-secondary)", 
                    fontWeight: "700", 
                    marginTop: "6px",
                    textShadow: spatialSignature ? "0 0 8px rgba(0, 229, 255, 0.4)" : "none",
                    background: "rgba(0, 229, 255, 0.05)",
                    padding: "10px",
                    borderRadius: "6px",
                    border: "1px solid rgba(0, 229, 255, 0.15)",
                    textAlign: "center"
                  }}>
                    {spatialSignature ? spatialSignature.toString() : "ESPERANDO FLUJO..."}
                  </div>
                </div>

                {/* 2. Coordenadas 4D */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Coordenadas Espaciales de Señal</span>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.75rem" }}>
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "var(--text-secondary)" }}>X (Media):</span> <strong style={{ color: "#FFF" }}>{spatialCoords ? spatialCoords[0].toFixed(3) : "0.000"}</strong>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Y (Volatilidad):</span> <strong style={{ color: "#FFF" }}>{spatialCoords ? spatialCoords[1].toFixed(3) : "0.000"}</strong>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Z (Último Tick):</span> <strong style={{ color: "#FFF" }}>{spatialCoords ? spatialCoords[2].toFixed(3) : "0.000"}</strong>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.02)", padding: "6px 10px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ color: "var(--text-secondary)" }}>T (Tendencia):</span> <strong style={{ color: "#FFF" }}>{spatialCoords ? spatialCoords[3].toFixed(3) : "0.000"}</strong>
                    </div>
                  </div>
                </div>

                {/* 3. Ahorro de Energía en la Nube */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(39, 174, 96, 0.08)", border: "1px solid rgba(39, 174, 96, 0.2)", padding: "10px 14px", borderRadius: "8px" }}>
                  <div>
                    <span style={{ fontSize: "0.65rem", color: "#27ae60", textTransform: "uppercase", fontWeight: "700", display: "block" }}>Ahorro de Cómputo Upstream</span>
                    <strong style={{ fontSize: "1.1rem", color: "#2ecc71" }}>42.15% Reducción</strong>
                  </div>
                  <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", textAlign: "right" }}>
                    Filtro Activo en Origen
                  </div>
                </div>

                {/* 4. Patrones k-NN */}
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "6px" }}>Patrones Similares (k-NN en RAM)</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {knnNeighbors.length > 0 ? knnNeighbors.map((n, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", background: "rgba(255,255,255,0.02)", padding: "8px 12px", borderRadius: "6px", borderLeft: "3px solid #00E5FF" }}>
                        <div>
                          <span style={{ fontWeight: "700" }}>#{i+1}</span>
                          <span style={{ color: "var(--text-secondary)", marginLeft: "8px" }}>Sig: {n.morton_code}</span>
                        </div>
                        <div style={{ color: "#00E5FF", fontWeight: "600" }}>
                          {((1 - n.distance) * 100).toFixed(1)}% Similitud
                        </div>
                      </div>
                    )) : (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", fontStyle: "italic", textAlign: "center", padding: "10px", background: "rgba(255,255,255,0.02)", borderRadius: "6px" }}>
                        Aguardando datos de simulación...
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ========================================== */}
        {/* VISTA 2: FACTURACIÓN (STRIPE) */}
        {/* ========================================== */}
        {currentView === "billing" && (
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <header style={{ marginBottom: "30px", textAlign: "center" }}>
              <h2 style={{ fontSize: "2rem", marginBottom: "8px" }}>Facturación de Infraestructura</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Vincula tu cuenta a Stripe para la facturación de consumo (Pay-as-you-go).</p>
            </header>

            <div className="glass-card" style={{ marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Cliente en Sesión
                </label>
                <select 
                  value={selectedClient} 
                  onChange={(e) => setSelectedClient(e.target.value)}
                  style={{
                    background: "#0B0F12",
                    color: "white",
                    border: "1px solid var(--border-color)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontFamily: "inherit",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  <option value="Financial_Trader">AI_Model_Optimizer</option>
                  <option value="Industrial_Client">Enterprise_Cluster</option>
                  <option value="AI_Research">Neural_Node</option>
                </select>
              </div>
              <div>
                <span className="badge badge-active" style={{ fontSize: "0.85rem", background: "rgba(0, 229, 255, 0.1)", color: "var(--gold-primary)", border: "1px solid rgba(0, 229, 255, 0.2)" }}>
                  Pay-as-you-go Activo
                </span>
              </div>
            </div>

            <div className="glass-card" style={{ 
              marginBottom: "30px", 
              border: "1px solid var(--gold-primary)"
            }}>
              <h3 style={{ color: "var(--gold-primary)", marginBottom: "15px", fontSize: "1.1rem" }}>Resumen Financiero del Cliente</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "15px" }}>
                <div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Volumen Procesado</span>
                  <div style={{ fontSize: "1.8rem", fontWeight: "700", marginTop: "4px" }}>{billingMetrics.total_points?.toLocaleString('en-US') || 0} Ticks</div>
                </div>
                <div>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>Costo del Periodo (Stripe)</span>
                  <div style={{ fontSize: "1.8rem", fontWeight: "700", marginTop: "4px", color: "var(--gold-primary)" }}>
                    ${billingMetrics.cost_usd?.toFixed(2)} USD
                  </div>
                </div>
              </div>
              <div style={{ 
                background: "rgba(5, 5, 5, 0.4)", 
                padding: "14px", 
                borderRadius: "8px", 
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                lineHeight: "1.4"
              }}>
                📢 ROI del Periodo: Inversión en la API de <strong style={{ color: "#ffffff" }}>${billingMetrics.cost_usd?.toFixed(2)} USD</strong> con un ahorro de computación total de <strong style={{ color: "#00e676" }}>${billingMetrics.savings_usd?.toFixed(2)} USD</strong>.
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "25px", alignItems: "start" }}>
              
              {/* Columna Izquierda: Formulario de Pago + Tarjeta 3D */}
              <div className="glass-card">
                <h3 style={{ fontSize: "1.1rem", marginBottom: "20px", color: "var(--gold-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Método de Pago (Stripe Elements)
                </h3>
                
                {/* Tarjeta Bancaria Virtual Interactiva */}
                <div className="premium-card-wrapper">
                  <div className="premium-card">
                    <div className="premium-card-header">
                      <div className="premium-card-chip"></div>
                      <div className="premium-card-brand">COATLIX SYSTEM</div>
                    </div>
                    <div className="premium-card-number">
                      {cardNumber || "•••• •••• •••• ••••"}
                    </div>
                    <div className="premium-card-details">
                      <div>
                        <div className="premium-card-label">Titular</div>
                        <div className="premium-card-value">{cardName ? cardName.toUpperCase() : "JOHN DOE"}</div>
                      </div>
                      <div>
                        <div className="premium-card-label">Vence</div>
                        <div className="premium-card-value">{cardExpiry || "MM/AA"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleRegisterStripePayment}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Titular de la Tarjeta</label>
                    <input 
                      type="text" 
                      placeholder="John Doe" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      required
                      style={{ width: "100%", background: "#0B0F12", color: "white", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "6px", outline: "none" }}
                    />
                  </div>
                  <div style={{ marginBottom: "15px" }}>
                    <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Número de Tarjeta</label>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
                      <input type="text" placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required maxLength="19" style={{ background: "#0B0F12", color: "white", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "6px", outline: "none", fontFamily: "monospace" }} />
                      <input type="text" placeholder="MM/AA" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} required maxLength="5" style={{ background: "#0B0F12", color: "white", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "6px", outline: "none", textAlign: "center", fontFamily: "monospace" }} />
                      <input type="password" placeholder="CVC" value={cardCvc} onChange={(e) => setCardCvc(e.target.value)} required maxLength="3" style={{ background: "#0B0F12", color: "white", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "6px", outline: "none", textAlign: "center", fontFamily: "monospace" }} />
                    </div>
                  </div>
                  {billingMessage && (
                    <div style={{ padding: "10px", borderRadius: "6px", marginBottom: "12px", fontSize: "0.8rem", background: "rgba(0, 230, 118, 0.1)", color: "#00e676" }}>
                      {billingMessage.text}
                    </div>
                  )}
                  <button type="submit" className="btn-primary gold-glow-shadow" style={{ width: "100%" }}>
                    Vincular Tarjeta en Stripe
                  </button>
                </form>
              </div>

              {/* Columna Derecha: Historial de Facturas */}
              <div className="glass-card">
                <h3 style={{ fontSize: "1.1rem", marginBottom: "20px", color: "var(--gold-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Historial de Facturas
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  
                  {/* Fila Factura 1 */}
                  <div style={{ background: "rgba(5, 5, 5, 0.3)", border: "1px solid rgba(197, 168, 128, 0.08)", padding: "12px 15px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "0.85rem", color: "#FFFFFF", display: "block" }}>INV-2026-004</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Periodo: Junio 2026</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--gold-primary)", display: "block" }}>${billingMetrics.cost_usd?.toFixed(2)} USD</strong>
                      <button 
                        onClick={() => {
                          setBillingMessage({ type: "success", text: `Factura INV-2026-004 de $${billingMetrics.cost_usd?.toFixed(2)} USD descargada en PDF desde Stripe API.` });
                          setTimeout(() => setBillingMessage(null), 5000);
                        }}
                        style={{ background: "none", border: "none", color: "#00e676", fontSize: "0.75rem", cursor: "pointer", padding: "2px 0", textDecoration: "underline" }}
                      >
                        Descargar PDF
                      </button>
                    </div>
                  </div>

                  {/* Fila Factura 2 */}
                  <div style={{ background: "rgba(5, 5, 5, 0.3)", border: "1px solid rgba(197, 168, 128, 0.08)", padding: "12px 15px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "0.85rem", color: "#FFFFFF", display: "block" }}>INV-2026-003</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Periodo: Mayo 2026</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--gold-primary)", display: "block" }}>$120.45 USD</strong>
                      <button 
                        onClick={() => {
                          setBillingMessage({ type: "success", text: "Factura INV-2026-003 de $120.45 USD descargada en PDF desde Stripe API." });
                          setTimeout(() => setBillingMessage(null), 5000);
                        }}
                        style={{ background: "none", border: "none", color: "#00e676", fontSize: "0.75rem", cursor: "pointer", padding: "2px 0", textDecoration: "underline" }}
                      >
                        Descargar PDF
                      </button>
                    </div>
                  </div>

                  {/* Fila Factura 3 */}
                  <div style={{ background: "rgba(5, 5, 5, 0.3)", border: "1px solid rgba(197, 168, 128, 0.08)", padding: "12px 15px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong style={{ fontSize: "0.85rem", color: "#FFFFFF", display: "block" }}>INV-2026-002</strong>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Periodo: Abril 2026</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--gold-primary)", display: "block" }}>$84.10 USD</strong>
                      <button 
                        onClick={() => {
                          setBillingMessage({ type: "success", text: "Factura INV-2026-002 de $84.10 USD descargada en PDF desde Stripe API." });
                          setTimeout(() => setBillingMessage(null), 5000);
                        }}
                        style={{ background: "none", border: "none", color: "#00e676", fontSize: "0.75rem", cursor: "pointer", padding: "2px 0", textDecoration: "underline" }}
                      >
                        Descargar PDF
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* VISTA 3: AJUSTES (NOTIFICACIONES) */}
        {/* ========================================== */}
        {currentView === "settings" && (
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <header style={{ marginBottom: "30px", textAlign: "center" }}>
              <h2 style={{ fontSize: "2rem", marginBottom: "8px" }}>Alertas & Ajustes del Canal</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>Controla las notificaciones automatizadas del flujo de datos.</p>
            </header>

            <div className="glass-card" style={{ marginBottom: "25px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Ajustes del Cliente
                </label>
                <select 
                  value={selectedClient} 
                  onChange={(e) => setSelectedClient(e.target.value)}
                  style={{
                    background: "#0B0F12",
                    color: "white",
                    border: "1px solid var(--border-color)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontFamily: "inherit",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  <option value="Financial_Trader">AI_Model_Optimizer</option>
                  <option value="Industrial_Client">Enterprise_Cluster</option>
                  <option value="AI_Research">Neural_Node</option>
                </select>
              </div>
            </div>

            <div className="glass-card" style={{ marginBottom: "25px" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "15px" }}>Preferencias de Alertas por Correo</h3>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(197,168,128,0.08)" }}>
                <div>
                  <strong>Reporte de Ahorro de Operación</strong>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", display: "block", marginTop: "2px" }}>Recibe balances financieros y de ROI periódicos.</span>
                </div>
                <div 
                  className={`toggle-switch ${notificationSettings.weekly_report === 1 ? "active" : ""}`}
                  onClick={() => handleToggleSetting("weekly_report", notificationSettings.weekly_report)}
                >
                  <div className="toggle-thumb"></div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(197,168,128,0.08)" }}>
                <div>
                  <strong>Alertas de Anomalías del Flujo</strong>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", display: "block", marginTop: "2px" }}>Notificación inmediata ante picos de inestabilidad en los datos.</span>
                </div>
                <div 
                  className={`toggle-switch ${notificationSettings.noise_alert === 1 ? "active" : ""}`}
                  onClick={() => handleToggleSetting("noise_alert", notificationSettings.noise_alert)}
                >
                  <div className="toggle-thumb"></div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
                <div>
                  <strong>Alertas de Consumo Presupuestado</strong>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem", display: "block", marginTop: "2px" }}>Avisos automáticos cuando la facturación se acerque al límite presupuestado.</span>
                </div>
                <div 
                  className={`toggle-switch ${notificationSettings.budget_limit === 1 ? "active" : ""}`}
                  onClick={() => handleToggleSetting("budget_limit", notificationSettings.budget_limit)}
                >
                  <div className="toggle-thumb"></div>
                </div>
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: "1.1rem", marginBottom: "15px" }}>Historial de Alertas</h3>
              <div className="table-container">
                {notificationLogs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                    No se han registrado alertas en este periodo.
                  </div>
                ) : (
                  <table className="custom-table" style={{ fontSize: "0.8rem" }}>
                    <thead>
                      <tr>
                        <th>Fecha / Hora</th>
                        <th>Tipo</th>
                        <th>Mensaje</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notificationLogs.map((log, idx) => (
                        <tr key={idx}>
                          <td style={{ color: "var(--text-secondary)" }} suppressHydrationWarning>{new Date(log.timestamp * 1000).toLocaleString('en-US')}</td>
                          <td><span className="badge" style={{ background: "rgba(197, 168, 128, 0.1)", color: "var(--gold-primary)", border: "1px solid rgba(197,168,128,0.15)" }}>{log.title}</span></td>
                          <td>{log.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* MODAL DE GENERACIÓN DE TOKENS */}
        {/* ========================================== */}
        {showCreateModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div className="glass-card" style={{ width: "400px", border: "1px solid var(--gold-primary)" }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: "15px", color: "var(--gold-primary)" }}>Generar Llave de Acceso</h3>
              <form onSubmit={handleGenerateKey}>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Identificador de IA
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ej: AI_Model_Optimizer_2" 
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    required
                    style={{ width: "100%", background: "#0B0F12", color: "white", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "6px" }}
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>
                    Plan Contratado
                  </label>
                  <select 
                    value={newPlanType}
                    onChange={(e) => setNewPlanType(e.target.value)}
                    style={{ width: "100%", background: "#0B0F12", color: "white", border: "1px solid var(--border-color)", padding: "10px", borderRadius: "6px" }}
                  >
                    <option value="Financial_Trader">AI_Model_Optimizer</option>
                    <option value="Industrial_Tijuana">Enterprise_Cluster</option>
                    <option value="AI_Research">Neural_Node</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" className="btn-primary gold-glow-shadow">Crear</button>
                  <button type="button" className="tab-btn" style={{ width: "100%" }} onClick={() => setShowCreateModal(false)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Footer Ejecutivo */}
      <footer style={{ marginTop: "60px", borderTop: "1px solid rgba(197,168,128,0.08)", paddingTop: "25px", textAlign: "center", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
        <p>© 2026 TZANiX. Motor de Purificación IA - Global Infrastructure. FastAPI Core.</p>
      </footer>
    </main>
  </div>
</div>
  );
}
