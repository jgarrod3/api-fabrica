const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Estado inicial de la fábrica (puedes modificarlo para probar)
let estadoFabrica = {
    modoFabrica: "AUTOMATICO",
    alarma: true,
    nivelEnergia: 20,
    puerta: {
        estado: "CERRADA",
        ultimoAcceso: "RFID"
    },
    prensa: {
        estado: "TRABAJANDO",
        ciclos: 24,
        error: false
    },
    generador: {
        estado: "NORMAL",
        consumo: 35
    }
};

// GET /fabrica → devuelve todo el estado
app.get('/fabrica', (req, res) => {
    res.json(estadoFabrica);
});

// GET /prensa → solo datos de la prensa
app.get('/prensa', (req, res) => {
    res.json(estadoFabrica.prensa);
});

// GET /generador → solo datos del generador
app.get('/generador', (req, res) => {
    res.json(estadoFabrica.generador);
});

// PUT /fabrica → actualizar estado (útil para demos)
app.put('/fabrica', (req, res) => {
    estadoFabrica = { ...estadoFabrica, ...req.body };
    res.json({ ok: true, estado: estadoFabrica });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));