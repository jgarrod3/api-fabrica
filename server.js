const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());
// Panel de control web — sirve index.html en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ─────────────────────────────────────────────
// Estado inicial de la fábrica
// Modifica estos valores para probar diferentes estados
// ─────────────────────────────────────────────
let estadoFabrica = {
  modoFabrica: "AUTOMATICO",   // "AUTOMATICO" | "MANUAL" | "EMERGENCIA"
  alarma: false,
  nivelEnergia: 72,            // 0-100 (%)

  puerta: {
    estado: "CERRADA",         // "ABIERTA" | "CERRADA" | "BLOQUEADA"
    ultimoAcceso: "RFID"       // "RFID" | "PANEL" | "TRIGGER"
  },

  prensa: {
    nombre: "Prensa industrial",
    estado: "TRABAJANDO",      // "APAGADA" | "ENCENDIDA" | "TRABAJANDO" | "ERROR" | "MANTENIMIENTO"
    ciclos: 24,
    error: false
  },

  generador: {
    estado: "NORMAL",          // "NORMAL" | "BAJO_CONSUMO" | "CRITICO"
    consumo: 35                // kW
  }
};

// ─────────────────────────────────────────────
// GET /fabrica  → estado completo
// ─────────────────────────────────────────────
app.get('/fabrica', (req, res) => {
  res.json(estadoFabrica);
});

// ─────────────────────────────────────────────
// GET /prensa   → solo datos de la prensa
// ─────────────────────────────────────────────
app.get('/prensa', (req, res) => {
  res.json(estadoFabrica.prensa);
});

// ─────────────────────────────────────────────
// GET /generador → solo datos del generador
// ─────────────────────────────────────────────
app.get('/generador', (req, res) => {
  res.json(estadoFabrica.generador);
});

// ─────────────────────────────────────────────
// GET /puerta   → solo datos de la puerta
// ─────────────────────────────────────────────
app.get('/puerta', (req, res) => {
  res.json(estadoFabrica.puerta);
});

// ─────────────────────────────────────────────
// PUT /fabrica  → actualizar estado completo
// Útil para simular cambios durante la demo
// Ejemplo: PUT /fabrica  body: { "alarma": true }
// ─────────────────────────────────────────────
app.put('/fabrica', (req, res) => {
  estadoFabrica = Object.assign({}, estadoFabrica, req.body);
  res.json({ ok: true, estado: estadoFabrica });
});

// ─────────────────────────────────────────────
// PUT /prensa   → actualizar solo prensa
// Ejemplo: PUT /prensa  body: { "estado": "ERROR", "error": true }
// ─────────────────────────────────────────────
app.put('/prensa', (req, res) => {
  estadoFabrica.prensa = Object.assign({}, estadoFabrica.prensa, req.body);
  if (req.body.estado === 'TRABAJANDO') estadoFabrica.prensa.ciclos++;
  res.json({ ok: true, prensa: estadoFabrica.prensa });
});

// ─────────────────────────────────────────────
// PUT /generador → actualizar solo generador
// Ejemplo: PUT /generador  body: { "estado": "CRITICO" }
// ─────────────────────────────────────────────
app.put('/generador', (req, res) => {
  estadoFabrica.generador = Object.assign({}, estadoFabrica.generador, req.body);

  // Actualizar nivelEnergia según estado automáticamente
  if (req.body.estado === 'CRITICO') estadoFabrica.nivelEnergia = 15;
  if (req.body.estado === 'BAJO_CONSUMO') estadoFabrica.nivelEnergia = 38;
  if (req.body.estado === 'NORMAL') estadoFabrica.nivelEnergia = 72;

  res.json({ ok: true, generador: estadoFabrica.generador });
});

// ─────────────────────────────────────────────
// PUT /alarma   → activar/desactivar alarma
// Ejemplo: PUT /alarma  body: { "activa": true }
// ─────────────────────────────────────────────
app.put('/alarma', (req, res) => {
  estadoFabrica.alarma = req.body.activa === true;
  if (estadoFabrica.alarma) {
    estadoFabrica.puerta.estado = 'BLOQUEADA';
  }
  res.json({ ok: true, alarma: estadoFabrica.alarma });
});

// ─────────────────────────────────────────────
// GET /health   → salud del servidor (para checks)
// ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ ok: true, uptime: process.uptime() });
});

// ─────────────────────────────────────────────
// Auto-incremento de ciclos mientras la prensa trabaja
// ─────────────────────────────────────────────
setInterval(() => {
  if (estadoFabrica.prensa.estado === 'TRABAJANDO' && !estadoFabrica.prensa.error) {
    estadoFabrica.prensa.ciclos++;
  }
}, 5000); // +1 ciclo cada 5 segundos

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Fabrica corriendo en puerto ${PORT}`);
  console.log(`Visita: http://localhost:${PORT}/fabrica`);
});
