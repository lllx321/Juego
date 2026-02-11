// ============================
// ESTADO
// ============================
let clicks = 0;
let prestigios = 0;
let multiplicadorPrestigio = 1;

let bonusMejoras = 0;
let inventarioMax = 50;
let inventario = [];
let equipadas = [];

const COSTO_RULETA = 100;

// ============================
// RAREZAS (8 TIERS)
// Probabilidades: Cósmica << Celestial (0.1%)
// ============================
const rarezas = [
  { nombre: "Común", tier: 1, chance: 55, multMin: 1.05, multMax: 1.8 },
  { nombre: "Poco común", tier: 2, chance: 25, multMin: 1.8, multMax: 3.0 },
  { nombre: "Rara", tier: 3, chance: 10, multMin: 3.0, multMax: 6.0 },
  { nombre: "Épica", tier: 4, chance: 6, multMin: 6.0, multMax: 12.0 },
  { nombre: "Legendaria", tier: 5, chance: 3.5, multMin: 12.0, multMax: 25.0 },
  { nombre: "Mítica", tier: 6, chance: 0.39, multMin: 25.0, multMax: 45.0 },
  { nombre: "Celestial", tier: 7, chance: 0.1, multMin: 45.0, multMax: 80.0 },
  { nombre: "Cósmica", tier: 8, chance: 0.01, multMin: 80.0, multMax: 120.0 }
];

// ============================
// LISTAS DE NOMBRES POR TIER
// ============================
const nombresPorTier = {
  1: ["Nube","Coco","Miel","Pixel","Chispa","Panqué","Tofu","Lilo","Copo","Bombo","Canela","Pompón","Bolita","Trufa","Pelusa","Nacho","Bubu","Tiki","Choco","Motita","Fresita","Churro"],
  2: ["Bruno","Kira","Dante","Nova","Atlas","Milo","Nala","Toby","Rocco","Duna","Simba","Otto","Kiara","Balto","Uma","Nico","Frida","Bento","Sasha"],
  3: ["Orion","Freya","Ragnar","Vega","Leónidas","Apollo","Arya","Loki","Zafiro","Kaida","Ares","Lyra","Cairo","Kenzo","Indigo","Soren"],
  4: ["Valkor","Nyx","Drako","Astra","Fenrir","Casio","Elara","Tritón","Calypso","Hyperion","Andrómeda","Boreal","Tadeo","Circe"],
  5: ["Kaelum","Zephyra","Titan","Eclipse","Solaris","Oberon","Iskandar","Selene","Octavian","Isolde","Zenith","Evander"],
  6: ["Aetherion","Luminary","Thalor","Seraphis","Obsidian","Valyrian","Azurion","Xerath","Alaric","Vesper"],
  7: ["Zypharion","Aurorath","Noctyra","Imperion","Celesthar","Eryndor","Solmire","Aurelion","Mythros"],
  8: ["Elarion","Thyrian"]
};

// Relaciones simples para el lore
const amistades = {
  "Orion": ["Vega","Lyra"],
  "Nova": ["Atlas"],
  "Fenrir": ["Valkor"],
  "Solaris": ["Eclipse"],
  "Aurelion": ["Aurorath"],
  "Elarion": ["Thyrian"]
};
const rivalidades = {
  "Nyx": ["Solaris"],
  "Obsidian": ["Luminary"],
  "Noctyra": ["Aurelion"],
  "Eclipse": ["Solaris"]
};

// ============================
// ELEMENTOS
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

const panelMascotas = document.getElementById("panelMascotas");
const panelTienda = document.getElementById("panelTienda");
document.getElementById("btnMascotas").onclick = () => panelMascotas.classList.toggle("activo");
document.getElementById("btnTienda").onclick = () => panelTienda.classList.toggle("activo");

// Modal
const modal = document.getElementById("modalMascota");
const modalContenido = document.getElementById("modalContenido");
document.getElementById("modalCerrar").onclick = () => modal.classList.remove("activo");
modal.onclick = (e) => { if (e.target === modal) modal.classList.remove("activo"); };

// ============================
// CÁLCULOS
// ============================
function calcularBonusMascotas() {
  return equipadas.reduce((a, m) => a + m.mult, 0);
}
function calcularMultiplicadorTotal() {
  const base = 1;
  const total = (base + calcularBonusMascotas() + bonusMejoras) * multiplicadorPrestigio;
  return total;
}
function actualizarUI() {
  clicksSpan.textContent = Math.floor(clicks);
  multTotalSpan.textContent = calcularMultiplicadorTotal().toFixed(2);
  invCountSpan.textContent = inventario.length;
  invMaxSpan.textContent = inventarioMax;
  prestigiosSpan.textContent = prestigios;
  prestigioCostoSpan.textContent = 250 * (prestigios + 1);
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
  const espacioDisponible = inventarioMax - inventario.length;
  if (espacioDisponible <= 0) return alert("Inventario lleno");
  const maxTiradas = Math.min(veces, espacioDisponible);
  const costoTotal = maxTiradas * COSTO_RULETA;
  if (clicks < costoTotal) return alert("No tienes suficientes clicks");
  clicks -= costoTotal;

  for (let i = 0; i < maxTiradas; i++) {
    const mascota = generarMascota();
    inventario.push(mascota);
    anuncioMascota.textContent = `Obtuviste: ${mascota.nombre} (${mascota.rareza}) x${mascota.mult.toFixed(2)}`;
  }
  actualizarUI();
}
function elegirRareza() {
  const roll = Math.random() * 100;
  let acc = 0;
  for (const r of rarezas) {
    acc += r.chance;
    if (roll <= acc) return r;
  }
  return rarezas[0];
}
function generarDescripcion(nombre, rareza) {
  let base = `${nombre} es una criatura de rareza ${rareza.nombre}. Aporta su poder con constancia y personalidad única.`;
  if (amistades[nombre]) base += ` Se lleva especialmente bien con ${amistades[nombre].join(" y ")}.`;
  if (rivalidades[nombre]) base += ` Tiene una rivalidad conocida con ${rivalidades[nombre].join(" y ")}.`;
  if (rareza.tier >= 7) base += " Su presencia se siente como un evento en sí mismo.";
  if (rareza.tier === 8) base += " Dicen que verla es casi irrepetible.";
  return base;
}
function generarMascota() {
  const r = elegirRareza();
  const lista = nombresPorTier[r.tier];
  const nombre = lista[Math.floor(Math.random() * lista.length)];
  const mult = r.multMin + Math.random() * (r.multMax - r.multMin);
  return {
    nombre,
    rareza: r.nombre,
    tier: r.tier,
    mult: parseFloat(mult.toFixed(2)),
    descripcion: generarDescripcion(nombre, r)
  };
}
btnGirar1.onclick = () => tirarRuleta(1);
btnGirar10.onclick = () => tirarRuleta(10);
btnGirar50.onclick = () => tirarRuleta(50);
btnGirarMax.onclick = () => tirarRuleta(inventarioMax);

// ============================
// INVENTARIO + MODAL
// ============================
function renderInventario() {
  inventarioLista.innerHTML = "";
  inventario.forEach((m, index) => {
    const div = document.createElement("div");
    div.className = "card mascotaCard";
    const equipada = equipadas.includes(m);

    // Señal de fusionable (si hay 2+ del mismo tier)
    const sameTierCount = inventario.filter(x => x.tier === m.tier).length;
    if (sameTierCount >= 2) div.classList.add("fusionable");

    div.innerHTML = `
      <div>
        <b>${m.nombre}</b> <small>(${m.rareza})</small><br/>
        x${m.mult.toFixed(2)} ${equipada ? " — <b>Equipada</b>" : ""}
      </div>
      <div>
        <button class="btnEquip">${equipada ? "Quitar" : "Equipar"}</button>
      </div>
    `;
    div.querySelector(".btnEquip").onclick = (e) => {
      e.stopPropagation();
      if (equipada) {
        equipadas = equipadas.filter(x => x !== m);
      } else {
        if (equipadas.length >= 3) return alert("Solo puedes equipar 3 mascotas");
        equipadas.push(m);
      }
      actualizarUI();
    };
    div.onclick = () => abrirModal(m);
    inventarioLista.appendChild(div);
  });
}
function abrirModal(m) {
  modalContenido.innerHTML = `
    <h3>${m.nombre}</h3>
    <p><b>Rareza:</b> ${m.rareza}</p>
    <p><b>Multiplicador:</b> x${m.mult.toFixed(2)}</p>
    <p>${m.descripcion}</p>
  `;
  modal.classList.add("activo");
}

// ============================
// EQUIPAR MEJORES
// ============================
btnEquiparMejores.onclick = () => {
  equipadas = [];
  const ordenadas = [...inventario].sort((a, b) => b.mult - a.mult);
  for (let i = 0; i < Math.min(3, ordenadas.length); i++) equipadas.push(ordenadas[i]);
  actualizarUI();
};

// ============================
// FUSIÓN (simple)
// ============================
btnFusionarTodo.onclick = () => {
  if (inventario.length < 2) return alert("Necesitas al menos 2 mascotas");
  let suma = 0;
  inventario.forEach(m => suma += m.mult);
  const nueva = {
    nombre: "Fusionada",
    rareza: "Fusionada",
    tier: 0,
    mult: parseFloat((suma * 0.6).toFixed(2)),
    descripcion: "Resultado de una poderosa fusión de energías."
  };
  inventario = [nueva];
  equipadas = [];
  actualizarUI();
};

// ============================
// PRESTIGIO + CONFETI
// ============================
btnPrestigio.onclick = () => {
  const costo = 250 * (prestigios + 1);
  if (clicks < costo) return alert("No tienes suficientes clicks para renacer");
  clicks = 0;
  prestigios++;
  multiplicadorPrestigio = 1 + prestigios * 0.5;
  inventario = [];
  equipadas = [];
  lanzarConfeti();
  actualizarUI();
};
function lanzarConfeti() {
  for (let i = 0; i < 120; i++) {
    const d = document.createElement("div");
    d.className = "confeti";
    d.style.left = Math.random() * 100 + "vw";
    d.style.background = `hsl(${Math.random()*360},80%,60%)`;
    d.style.animationDuration = (1 + Math.random()*1.5) + "s";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2000);
  }
}

// ============================
// GUARDADO
// ============================
function guardar() {
  const data = { clicks, prestigios, multiplicadorPrestigio, inventario, equipadas, inventarioMax };
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
}

// ============================
// INICIO
// ============================
cargar();
actualizarUI();
