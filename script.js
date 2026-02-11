/* script.js
   Versión con:
   - Inventario y ruleta
   - Tienda con 20 mejoras (desbloqueo por rebirths)
   - Prestigio que NO borra mascotas (pero sí resetea mejoras compradas)
   - Guardado en localStorage
*/

"use strict";

/* -----------------------
   Estado inicial / config
   ----------------------- */
let clicks = 0;
let prestigios = 0;
let multiplicadorPrestigio = 1;

let inventarioMax = 50;
let inventario = [];   // array de mascotas (objetos)
let equipadas = [];    // array de objetos (referencias por id)
let purchasedUpgrades = []; // ids de mejoras compradas

let bonusMejoras = 0; // calculado a partir de purchasedUpgrades

const COSTO_RULETA = 100;

/* -----------------------
   Rarezas (tier + prob + rangos)
   tier: 1..8
   ----------------------- */
const rarezas = [
  { nombre:"Común", tier:1, chance:55, multMin:1.05, multMax:1.8 },
  { nombre:"Poco común", tier:2, chance:25, multMin:1.8, multMax:3.0 },
  { nombre:"Rara", tier:3, chance:10, multMin:3.0, multMax:6.0 },
  { nombre:"Épica", tier:4, chance:6, multMin:6.0, multMax:12.0 },
  { nombre:"Legendaria", tier:5, chance:3.5, multMin:12.0, multMax:25.0 },
  { nombre:"Mítica", tier:6, chance:0.39, multMin:25.0, multMax:45.0 },
  { nombre:"Celestial", tier:7, chance:0.1, multMin:45.0, multMax:80.0 },
  { nombre:"Cósmica", tier:8, chance:0.01, multMin:80.0, multMax:120.0 }
];

/* -----------------------
   Nombres por tier (tu lista ampliada)
   ----------------------- */
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

/* -----------------------
   Shop: 20 mejoras (nombre, mult, rebirthRequirement, flavor)
   Precios se calculan automáticamente (ver función priceFor)
   ----------------------- */
const shopDefinitions = [
  { id: "u1",  name:"Dedito Despierto", mult:1.3,  req:0,  note:"El índice abre un ojo." },
  { id: "u2",  name:"Crack… Crack… Nudillos Listos", mult:1.7, req:0,  note:"Ritual obligatorio." },
  { id: "u3",  name:"Mouse con Actitud", mult:2.2, req:0,  note:"Se siente más responsivo… o es efecto placebo." },

  { id: "u4",  name:"Cardio para el Índice", mult:2.8, req:1,  note:"Crecimiento sabroso." },
  { id: "u5",  name:"Pulgar Celoso (ahora ayuda)", mult:3.5, req:1,  note:"Pulgar al rescate." },
  { id: "u6",  name:"Ritmito Pegajoso", mult:4.3, req:2,  note:"Entras en modo metrónomo humano." },
  { id: "u7",  name:"Click con Flow", mult:5.2, req:2,  note:"Siente el ritmo." },
  { id: "u8",  name:"Mini Overclock Humano", mult:6.5, req:3,  note:"Subiendo RPM." },

  { id: "u9",  name:"Sudor Productivo", mult:8.0, req:3,  note:"Mid Game ya." },
  { id: "u10", name:"Índice Modo Deportivo", mult:10.0, req:4, note:"Modo atletico." },
  { id: "u11", name:"Reflejos de Gato con Espresso", mult:12.5, req:4, note:"Más despierto que nunca." },
  { id: "u12", name:"Técnica Prohibida del Triple Tap", mult:16.0, req:5, note:"Triple tap legendario." },
  { id: "u13", name:"El Punto Dulce del Click", mult:20.0, req:6, note:"Cada clic cae perfecto." },

  { id: "u14", name:"Cafeína en la Sangre (Ed. Ilegal)", mult:26.0, req:7, note:"¿Cuántos cafés?" },
  { id: "u15", name:"Tendinitis Productiva", mult:32.0, req:8, note:"El precio del progreso." },
  { id: "u16", name:"Clicktástrofe", mult:39.0, req:9, note:"Escala Richter activado." },
  { id: "u17", name:"Índice Interdimensional", mult:48.0, req:10, note:"Clics en varios planos." },
  { id: "u18", name:"TurboClick 9000", mult:60.0, req:12, note:"Advertencias incluidas." },

  { id: "u19", name:"Dictador del Mouse", mult:78.0, req:14, note:"El cursor te obedece." },
  { id: "u20", name:"Big Bang Digital", mult:120.0, req:20, note:"Reinicias el universo." }
];

/* -----------------------
   DOM elements
   ----------------------- */
const clicksSpan = document.getElementById("clicks");
const multTotalSpan = document.getElementById("multTotal");
const btnClick = document.getElementById("btnClick");

const btnGirar1 = document.getElementById("btnGirar1");
const btnGirar10 = document.getElementById("btnGirar10");
const btnGirar50 = document.getElementById("btnGirar50");
const btnGirarMax = document.getElementById("btnGirarMax");

const invCountSpan = document.getElementById("invCount");
const invMaxSpan = document.getElementById("invMax") || (() => {})();
const inventarioLista = document.getElementById("inventarioLista");
const anuncioMascota = document.getElementById("anuncioMascota");

const btnEquiparMejores = document.getElementById("btnEquiparMejores");
const btnFusionarTodo = document.getElementById("btnFusionarTodo");

const prestigiosSpan = document.getElementById("prestigios");
const prestigioCostoSpan = document.getElementById("prestigioCosto");
const btnPrestigio = document.getElementById("btnPrestigio");

const shopListDiv = document.getElementById("shopList");

const panelLeft = document.getElementById("panelMascotas");
const panelRight = document.getElementById("panelTienda");
document.getElementById("toggleLeft").onclick = () => panelLeft.classList.toggle("hidden");
document.getElementById("toggleRight").onclick = () => panelRight.classList.toggle("hidden");

/* Modal */
const modal = document.getElementById("modalMascota");
const modalContenido = document.getElementById("modalContenido");
const modalCerrar = document.getElementById("modalCerrar");
modalCerrar.onclick = () => modal.classList.remove("activo");
modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("activo"); });

/* -----------------------
   Utilidades
   ----------------------- */
function priceFor(upg) {
  // Fórmula de coste balanceada:
  // base = mult * 100
  // scale por rebirth requirement: 2^(req/4)
  const base = upg.mult * 100;
  const scale = Math.pow(2, upg.req / 4);
  const price = Math.round(base * scale);
  return price;
}

function getUpgradeById(id) {
  return shopDefinitions.find(u => u.id === id);
}

/* -----------------------
   Cálculos de multiplicador
   ----------------------- */
function calcularBonusMascotas() {
  return equipadas.reduce((a,m) => a + (m.mult || 0), 0);
}

function calcularBonusMejoras() {
  // purchasedUpgrades suma (mult - 1) para cada mejora
  let sum = 0;
  purchasedUpgrades.forEach(uid => {
    const up = shopDefinitions.find(s => s.id === uid);
    if (up) sum += (up.mult - 1);
  });
  return sum;
}

function calcularMultiplicadorTotal() {
  bonusMejoras = calcularBonusMejoras();
  const base = 1;
  const total = (base + calcularBonusMascotas() + bonusMejoras) * multiplicadorPrestigio;
  return total;
}

/* -----------------------
   UI / renderers
   ----------------------- */
function actualizarUI() {
  clicksSpan.textContent = Math.floor(clicks);
  multTotalSpan.textContent = calcularMultiplicadorTotal().toFixed(2);
  document.getElementById("invCount").textContent = inventario.length;
  document.getElementById("invMax").textContent = inventarioMax;
  prestigiosSpan.textContent = prestigios;
  prestigioCostoSpan.textContent = 250 * (prestigios + 1);
  renderInventario();
  renderShop();
  guardar();
}

/* Inventario */
function renderInventario() {
  inventarioLista.innerHTML = "";
  // conteo por tier para resaltar fusionables
  const countByTier = inventario.reduce((acc,m) => { acc[m.tier] = (acc[m.tier] || 0) + 1; return acc; }, {});
  inventario.forEach((m) => {
    const div = document.createElement("div");
    div.className = "mascotaCard";
    if ((countByTier[m.tier] || 0) >= 2) div.classList.add("fusionable");

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = `<div class="name">${m.nombre}</div><div class="rare">${m.rareza} • x${m.mult}</div>`;

    const actions = document.createElement("div");
    actions.className = "actions";
    const btnEq = document.createElement("button");
    btnEq.textContent = equipadas.find(x => x.id === m.id) ? "Quitar" : "Equipar";
    btnEq.onclick = (e) => {
      e.stopPropagation();
      toggleEquip(m.id);
    };
    const btnInfo = document.createElement("button");
    btnInfo.textContent = "Info";
    btnInfo.onclick = (e) => {
      e.stopPropagation();
      abrirModal(m);
    };

    actions.appendChild(btnEq);
    actions.appendChild(btnInfo);

    div.appendChild(meta);
    div.appendChild(actions);
    div.onclick = () => abrirModal(m);
    inventarioLista.appendChild(div);
  });
}

/* Modal */
function abrirModal(m) {
  modalContenido.innerHTML = `<h3 style="margin:0 0 6px">${m.nombre}</h3>
    <div style="color:#9fb0ff;margin-bottom:6px;font-size:14px">${m.rareza} • Tier ${m.tier}</div>
    <div style="font-weight:700;margin-bottom:8px">Multiplicador: x${m.mult}</div>
    <p style="color:#cbd6ff">${m.descripcion}</p>`;
  modal.classList.add("activo");
}

/* -----------------------
   Equipar / desequipar
   ----------------------- */
function toggleEquip(id) {
  const found = equipadas.find(x => x.id === id);
  if (found) {
    equipadas = equipadas.filter(x => x.id !== id);
  } else {
    if (equipadas.length >= 3) {
      return alert("Solo puedes equipar 3 mascotas");
    }
    const pet = inventario.find(x => x.id === id);
    if (pet) equipadas.push(pet);
  }
  actualizarUI();
}

/* Equipar mejores */
document.getElementById("btnEquiparMejores").onclick = () => {
  equipadas = [...inventario].sort((a,b)=>b.mult - a.mult).slice(0,3);
  actualizarUI();
};

/* Fusión: versión simple (fusionar todo en 1) */
document.getElementById("btnFusionarTodo").onclick = () => {
  if (inventario.length < 2) return alert("Necesitas al menos 2 mascotas para fusionar");
  const suma = inventario.reduce((s,m)=> s + (m.mult||0), 0);
  const nueva = {
    id: "fusion-" + Date.now(),
    nombre: "Quimera",
    rareza: "Fusionada",
    tier: 0,
    mult: parseFloat((suma * 0.6).toFixed(2)),
    descripcion: "Resultado de la unión de varias energías."
  };
  inventario = [nueva];
  equipadas = [];
  actualizarUI();
};

/* -----------------------
   Ruleta
   ----------------------- */
function elegirRareza() {
  const total = rarezas.reduce((s,r) => s + r.chance, 0);
  let roll = Math.random() * total;
  let acc = 0;
  for (const r of rarezas) {
    acc += r.chance;
    if (roll <= acc) return r;
  }
  return rarezas[0];
}

function generarDescripcion(nombre, rareza) {
  let base = `${nombre} es una mascota de rareza ${rareza.nombre}. Su presencia añade carácter al equipo.`;
  // pequeñas notas (si existe amistad/rivalidad)
  const friendships = { "Orion":["Vega","Lyra"], "Nova":["Atlas"], "Fenrir":["Valkor"], "Solaris":["Eclipse"], "Aurelion":["Aurorath"], "Elarion":["Thyrian"] };
  const rivalries = { "Nyx":["Solaris"], "Obsidian":["Luminary"], "Noctyra":["Aurelion"], "Eclipse":["Solaris"] };
  if (friendships[nombre]) base += ` Se lleva bien con ${friendships[nombre].join(" y ")}.`;
  if (rivalries[nombre]) base += ` Tiene rivalidad con ${rivalries[nombre].join(" y ")}.`;
  if (rareza.tier >= 7) base += " Su aparición es un evento memorable.";
  if (rareza.tier === 8) base += " Ver una Cósmica es casi irrepetible.";
  return base;
}

function generarMascota() {
  const r = elegirRareza();
  const nivel = r.tier;
  const lista = nombresPorTier[nivel];
  const nombre = lista[Math.floor(Math.random() * lista.length)];
  const mult = r.multMin + Math.random() * (r.multMax - r.multMin);
  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2,8),
    nombre,
    rareza: r.nombre,
    tier: r.tier,
    mult: parseFloat(mult.toFixed(2)),
    descripcion: generarDescripcion(nombre, r)
  };
}

function tirarRuleta(veces) {
  const espacio = inventarioMax - inventario.length;
  if (espacio <= 0) return alert("Inventario lleno!");
  const tiradas = Math.min(veces, espacio);
  const costo = tiradas * COSTO_RULETA;
  if (clicks < costo) return alert("No tienes suficientes clicks");
  clicks -= costo;

  for (let i=0;i<tiradas;i++) {
    const m = generarMascota();
    inventario.push(m);
    anuncioMascota.textContent = `Obtuviste: ${m.nombre} (${m.rareza}) x${m.mult}`;
    if (m.tier >= 7) flashAnnouncement(m);
  }
  actualizarUI();
}

function flashAnnouncement(m) {
  const prev = anuncioMascota.textContent;
  anuncioMascota.style.color = (m.tier === 8) ? "#ffd166" : "#9be7ff";
  anuncioMascota.textContent = `¡Salió ${m.nombre} — ${m.rareza}! x${m.mult}`;
  setTimeout(()=>{ anuncioMascota.style.color = ""; anuncioMascota.textContent = prev; }, 3500);
}

btnGirar1.onclick = () => tirarRuleta(1);
btnGirar10.onclick = () => tirarRuleta(10);
btnGirar50.onclick = () => tirarRuleta(50);
btnGirarMax.onclick = () => tirarRuleta(inventarioMax);

/* -----------------------
   Tienda
   ----------------------- */
function renderShop() {
  shopListDiv.innerHTML = "";
  shopDefinitions.forEach(u => {
    const bought = purchasedUpgrades.includes(u.id);
    const unlocked = prestigios >= u.req;
    const price = priceFor(u);
    const item = document.createElement("div");
    item.className = "shopItem";
    const meta = document.createElement("div");
    meta.className = "shopMeta";
    meta.innerHTML = `<div class="shopName">${u.name}</div><div class="shopDesc">${u.note} • x${u.mult} • Reqs: ${u.req} rebirths</div>`;

    const right = document.createElement("div");
    right.style.display = "flex";
    right.style.flexDirection = "column";
    right.style.alignItems = "flex-end";
    right.style.gap = "6px";

    const priceEl = document.createElement("div");
    priceEl.style.fontWeight = "700";
    priceEl.textContent = `${price} clicks`;

    const btn = document.createElement("button");
    btn.className = "buyBtn";
    if (bought) {
      btn.textContent = "Comprada";
      btn.disabled = true;
      btn.style.opacity = 0.6;
    } else if (!unlocked) {
      btn.textContent = `Bloqueada (${u.req})`;
      btn.disabled = true;
      btn.style.opacity = 0.5;
    } else {
      btn.textContent = "Comprar";
      btn.onclick = () => {
        buyUpgrade(u.id);
      };
    }

    right.appendChild(priceEl);
    right.appendChild(btn);
    item.appendChild(meta);
    item.appendChild(right);
    shopListDiv.appendChild(item);
  });
}

function buyUpgrade(id) {
  const up = shopDefinitions.find(s => s.id === id);
  if (!up) return;
  const price = priceFor(up);
  if (clicks < price) return alert("No tienes suficientes clicks para comprar esto.");
  if (purchasedUpgrades.includes(id)) return;
  if (prestigios < up.req) return alert("Aún no desbloqueada.");

  clicks -= price;
  purchasedUpgrades.push(id);
  // recalc bonusMejoras en actualizarUI
  actualizarUI();
}

/* -----------------------
   Prestigio (rebirth)
   ----------------------- */
btnPrestigio.onclick = () => {
  const costo = 250 * (prestigios + 1);
  if (clicks < costo) return alert("No tienes clicks suficientes para renacer");
  // Rebirth: resetea clicks y mejoras, pero NO las mascotas
  clicks = 0;
  prestigios++;
  multiplicadorPrestigio = 1 + prestigios * 0.5;

  // resetear mejoras compradas y bonusMejoras
  purchasedUpgrades = [];
  bonusMejoras = 0;

  // NOTA: inventario y equipadas se mantienen (tú pediste así)
  actualizarUI();
};

/* -----------------------
   Guardado / carga
   ----------------------- */
function guardar() {
  try {
    const save = {
      clicks, prestigios, multiplicadorPrestigio,
      inventario, equipadas, purchasedUpgrades, inventarioMax
    };
    localStorage.setItem("clickerSave_v2", JSON.stringify(save));
  } catch (e) {
    console.warn("Error guardando:", e);
  }
}

function cargar() {
  try {
    const raw = localStorage.getItem("clickerSave_v2");
    if (!raw) return;
    const data = JSON.parse(raw);
    clicks = data.clicks || 0;
    prestigios = data.prestigios || 0;
    multiplicadorPrestigio = data.multiplicadorPrestigio || 1;
    inventario = data.inventario || [];
    equipadas = data.equipadas || [];
    purchasedUpgrades = data.purchasedUpgrades || [];
    inventarioMax = data.inventarioMax || 50;
  } catch (e) {
    console.warn("Error cargando:", e);
  }
}

/* -----------------------
   Inicializaciones
   ----------------------- */
cargar();
actualizarUI();

/* -----------------------
   Extra: click central
   ----------------------- */
btnClick.addEventListener("click", () => {
  clicks += calcularMultiplicadorTotal();
  actualizarUI();
});

// Exponer algunas funciones para debugging en consola si quieres
window._game = { generarMascota, tirarRuleta, inventario, equipadas, purchasedUpgrades, guardar, cargar, priceFor };
