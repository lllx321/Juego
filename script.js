// ============================
// VARIABLES PRINCIPALES
// ============================
let clicks = 0;
let prestigios = 0;
let multiplicadorPrestigio = 1;

let bonusMejoras = 0;
let ruletaNivel = 0;

let inventarioMax = 50;
let inventario = [];
let equipadas = [];

let COSTO_RULETA = 100;

// ============================
// RAREZAS
// ============================
const rarezasBase = [
  { nombre: "Común", chance: 60, multMin: 1, multMax: 2 },
  { nombre: "Rara", chance: 25, multMin: 2, multMax: 5 },
  { nombre: "Épica", chance: 10, multMin: 5, multMax: 15 },
  { nombre: "Legendaria", chance: 4, multMin: 15, multMax: 30 },
  { nombre: "Celestial", chance: 1, multMin: 30, multMax: 50 }
];

// ============================
// ELEMENTOS HTML
// ============================
const clicksSpan = document.getElementById("clicks");
const multTotalSpan = document.getElementById("multTotal");
const btnClick = document.getElementById("btnClick");

const btnGirar1 = document.getElementById("btnGirar1");
const btnGirar10 = document.getElementById("btnGirar10");
const btnGirar50 = document.getElementById("btnGirar50");
const btnGirarMax = document.getElementById("btnGirarMax");

const invCountSpan = document.getElementById("invCount");
const invMaxSpan = document.getElementById("invMax");
const inventarioLista = document.getElementById("inventarioLista");

const btnEquiparMejores = document.getElementById("btnEquiparMejores");
const btnFusionarTodo = document.getElementById("btnFusionarTodo");

const anuncioMascota = document.getElementById("anuncioMascota");

const prestigiosSpan = document.getElementById("prestigios");
const prestigioCostoSpan = document.getElementById("prestigioCosto");
const btnPrestigio = document.getElementById("btnPrestigio");

const ruletaNivelSpan = document.getElementById("ruletaNivel");
const ruletaCostoSpan = document.getElementById("ruletaCosto");

const mejoraRuletaNivelSpan = document.getElementById("mejoraRuletaNivel");
const mejoraRuletaCostoSpan = document.getElementById("mejoraRuletaCosto");
const btnMejorarRuleta = document.getElementById("btnMejorarRuleta");

// ============================
// FUNCIONES BASE
// ============================
function calcularBonusMascotas() {
  let total = 0;
  equipadas.forEach(m => total += m.mult);
  return total;
}

function calcularMultiplicadorTotal() {
  const base = 1;
  const bonusMascotas = calcularBonusMascotas();
  const total = (base + bonusMascotas + bonusMejoras) * multiplicadorPrestigio;
  return total;
}

function actualizarUI() {
  clicksSpan.textContent = Math.floor(clicks);
  multTotalSpan.textContent = calcularMultiplicadorTotal().toFixed(2);

  invCountSpan.textContent = inventario.length;
  invMaxSpan.textContent = inventarioMax;

  prestigiosSpan.textContent = prestigios;
  prestigioCostoSpan.textContent = 250 * (prestigios + 1);

  ruletaNivelSpan.textContent = ruletaNivel;
  ruletaCostoSpan.textContent = COSTO_RULETA;

  mejoraRuletaNivelSpan.textContent = ruletaNivel;
  mejoraRuletaCostoSpan.textContent = 1000 * (ruletaNivel + 1);

  renderInventario();
  guardar();
}

btnClick.addEventListener("click", () => {
  clicks += calcularMultiplicadorTotal();
  actualizarUI();
});

// ============================
// RULETA
// ============================
function tirarRuleta(veces) {
  let espacioDisponible = inventarioMax - inventario.length;
  if (espacioDisponible <= 0) {
    alert("Inventario lleno!");
    return;
  }

  let maxTiradas = Math.min(veces, espacioDisponible);
  let costoTotal = maxTiradas * COSTO_RULETA;

  if (clicks < costoTotal) {
    alert("No tienes suficientes clicks");
    return;
  }

  clicks -= costoTotal;

  for (let i = 0; i < maxTiradas; i++) {
    const mascota = generarMascota();
    inventario.push(mascota);
    anuncioMascota.textContent = `Obtuviste: ${mascota.rareza} x${mascota.mult.toFixed(2)}`;
  }

  actualizarUI();
}

function generarMascota() {
  // Mejora de ruleta: aumenta un poco las chances buenas
  const rarezas = rarezasBase.map(r => ({ ...r }));
  if (ruletaNivel > 0) {
    rarezas[0].chance -= ruletaNivel * 2; // baja comunes
    rarezas[4].chance += ruletaNivel * 0.5; // sube celestiales un poco
  }

  let roll = Math.random() * 100;
  let acumulado = 0;

  for (let r of rarezas) {
    acumulado += r.chance;
    if (roll <= acumulado) {
      let mult = r.multMin + Math.random() * (r.multMax - r.multMin);
      return {
        rareza: r.nombre,
        mult: parseFloat(mult.toFixed(2))
      };
    }
  }

  return { rareza: "Común", mult: 1 };
}

btnGirar1.addEventListener("click", () => tirarRuleta(1));
btnGirar10.addEventListener("click", () => tirarRuleta(10));
btnGirar50.addEventListener("click", () => tirarRuleta(50));
btnGirarMax.addEventListener("click", () => tirarRuleta(inventarioMax));

// ============================
// INVENTARIO
// ============================
function renderInventario() {
  inventarioLista.innerHTML = "";

  inventario.forEach((m) => {
    const div = document.createElement("div");
    div.className = "mascota rareza-" + m.rareza + (equipadas.includes(m) ? " equipada" : "");

    const info = document.createElement("span");
    info.textContent = `${m.rareza} | x${m.mult}`;

    const btn = document.createElement("button");
    const equipada = equipadas.includes(m);
    btn.textContent = equipada ? "Quitar" : "Equipar";

    btn.addEventListener("click", () => {
      if (equipada) {
        equipadas = equipadas.filter(e => e !== m);
      } else {
        if (equipadas.length >= 3) {
          alert("Solo puedes equipar 3 mascotas");
          return;
        }
        equipadas.push(m);
      }
      actualizarUI();
    });

    div.appendChild(info);
    div.appendChild(btn);
    inventarioLista.appendChild(div);
  });
}

// ============================
// EQUIPAR MEJORES
// ============================
btnEquiparMejores.addEventListener("click", () => {
  equipadas = [];
  const ordenadas = [...inventario].sort((a, b) => b.mult - a.mult);
  for (let i = 0; i < Math.min(3, ordenadas.length); i++) {
    equipadas.push(ordenadas[i]);
  }
  actualizarUI();
});

// ============================
// FUSIÓN
// ============================
btnFusionarTodo.addEventListener("click", () => {
  if (inventario.length < 2) {
    alert("Necesitas al menos 2 mascotas para fusionar");
    return;
  }

  let suma = 0;
  inventario.forEach(m => suma += m.mult);

  let nueva = {
    rareza: "Fusionada",
    mult: parseFloat((suma * 0.6).toFixed(2))
  };

  inventario = [nueva];
  equipadas = [];
  actualizarUI();
});

// ============================
// MEJORA RULETA
// ============================
btnMejorarRuleta.addEventListener("click", () => {
  if (ruletaNivel >= 5) {
    alert("La ruleta ya está al máximo nivel");
    return;
  }
  const costo = 1000 * (ruletaNivel + 1);
  if (clicks < costo) {
    alert("No tienes suficientes clicks");
    return;
  }
  clicks -= costo;
  ruletaNivel++;
  actualizarUI();
});

// ============================
// PRESTIGIO
// ============================
btnPrestigio.addEventListener("click", () => {
  const costo = 250 * (prestigios + 1);
  if (clicks < costo) {
    alert("No tienes suficientes clicks para renacer");
    return;
  }

  clicks = 0;
  prestigios++;
  multiplicadorPrestigio = 1 + prestigios * 0.5;

  inventario = [];
  equipadas = [];

  actualizarUI();
});

// ============================
// GUARDADO
// ============================
function guardar() {
  const data = {
    clicks,
    prestigios,
    multiplicadorPrestigio,
    inventario,
    equipadas,
    inventarioMax,
    ruletaNivel
  };
  localStorage.setItem("clickerSave", JSON.stringify(data));
}

function cargar() {
  const data = JSON.parse(localStorage.getItem("clickerSave"));
  if (!data) return;

  clicks = data.clicks || 0;
  prestigios = data.prestigios || 0;
  multiplicadorPrestigio = data.multiplicadorPrestigio || 1;
  inventario = data.inventario || [];
  equipadas = data.equipadas || [];
  inventarioMax = data.inventarioMax || 50;
  ruletaNivel = data.ruletaNivel || 0;
}

// ============================
// INICIO
// ============================
cargar();
actualizarUI();
