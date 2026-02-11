/* Versión corregida y pulida del JS del juego.
   Asegúrate de tener index.html y script.js en la misma carpeta. */

"use strict";

/* ----------------------
   Estado y configuración
   ----------------------*/
let clicks = 0;
let prestigios = 0;
let multiplicadorPrestigio = 1;
let bonusMejoras = 0;

let inventarioMax = 50;
let inventario = [];
let equipadas = [];

const COSTO_RULETA = 100;

/* Rarezas (8 tiers) - probabilidades en % (suman ~100) */
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

/* Nombres por tier (los tuyos) */
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

/* Relacion simple para lore (algunas amistades/rivalidades) */
const amistades = { "Orion":["Vega","Lyra"], "Nova":["Atlas"], "Fenrir":["Valkor"], "Solaris":["Eclipse"], "Aurelion":["Aurorath"], "Elarion":["Thyrian"] };
const rivalidades = { "Nyx":["Solaris"], "Obsidian":["Luminary"], "Noctyra":["Aurelion"], "Eclipse":["Solaris"] };

/* ----------------------
   Elementos del DOM
   ----------------------*/
const clicksSpan = document.getElementById("clicks");
const multTotalSpan = document.getElementById("multTotal");
const btnClick = document.getElementById("btnClick");

const btnGirar1 = document.getElementById("btnGirar1");
const btnGirar10 = document.getElementById("btnGirar10");
const btnGirar50 = document.getElementById("btnGirar50");
const btnGirarMax = document.getElementById("btnGirarMax");

const invCountSpan = document.getElementById("invCount");
const invMaxSpan = document.getElementById("invMax") || (() => { /* fallback */ })();
const inventarioLista = document.getElementById("inventarioLista");
const anuncioMascota = document.getElementById("anuncioMascota");

const btnEquiparMejores = document.getElementById("btnEquiparMejores");
const btnFusionarTodo = document.getElementById("btnFusionarTodo");

const prestigiosSpan = document.getElementById("prestigios");
const prestigioCostoSpan = document.getElementById("prestigioCosto");
const btnPrestigio = document.getElementById("btnPrestigio");

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

/* ----------------------
   Lógica / utilidades
   ----------------------*/
function calcularBonusMascotas() {
  return equipadas.reduce((acc, m) => acc + (m.mult || 0), 0);
}
function calcularMultiplicadorTotal() {
  const base = 1;
  const total = (base + calcularBonusMascotas() + bonusMejoras) * multiplicadorPrestigio;
  return total;
}
function actualizarUI() {
  clicksSpan.textContent = Math.floor(clicks);
  multTotalSpan.textContent = calcularMultiplicadorTotal().toFixed(2);
  document.getElementById("invCount").textContent = inventario.length;
  document.getElementById("invMax").textContent = inventarioMax;
  prestigiosSpan.textContent = prestigios;
  prestigioCostoSpan.textContent = 250 * (prestigios + 1);
  renderInventario();
  guardar();
}

/* Click central */
btnClick.addEventListener("click", () => {
  clicks += calcularMultiplicadorTotal();
  // pequeño feedback visual (texto temporal)
  const old = anuncioMascota.textContent;
  anuncioMascota.textContent = "";
  actualizarUI();
});

/* ----------------------
   Ruleta
   ----------------------*/
function elegirRareza() {
  // Asegurarse que sumen 100 (si no, normalizar)
  const totalChance = rarezas.reduce((s, r) => s + r.chance, 0);
  const roll = Math.random() * totalChance;
  let acc = 0;
  for (const r of rarezas) {
    acc += r.chance;
    if (roll <= acc) return r;
  }
  return rarezas[0];
}

function generarDescripcion(nombre, rareza) {
  let base = `${nombre} es una criatura de rareza ${rareza.nombre}. Aporta su energía única al equipo.`;
  if (amistades[nombre]) base += ` Se lleva bien con ${amistades[nombre].join(" y ")}.`;
  if (rivalidades[nombre]) base += ` Tiene cierta rivalidad con ${rivalidades[nombre].join(" y ")}.`;
  if (rareza.tier >= 7) base += " Su aparición es un acontecimiento memorable.";
  if (rareza.tier === 8) base += " Ver una Cósmica es casi irrepetible; muchos guardan captura.";
  return base;
}

function generarMascota() {
  const r = elegirRareza();
  const nivel = r.tier;
  const nombres = nombresPorTier[nivel];
  const nombre = nombres[Math.floor(Math.random()*nombres.length)];
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
  const espacioDisponible = inventarioMax - inventario.length;
  if (espacioDisponible <= 0) return alert("Inventario lleno!");
  const maxTiradas = Math.min(veces, espacioDisponible);
  const costoTotal = maxTiradas * COSTO_RULETA;
  if (clicks < costoTotal) return alert("No tienes suficientes clicks");
  clicks -= costoTotal;

  for (let i=0;i<maxTiradas;i++){
    const m = generarMascota();
    inventario.push(m);
    anuncioMascota.textContent = `Obtuviste: ${m.nombre} (${m.rareza}) x${m.mult}`;
    // si es Celestial o Cósmica, hacemos anuncio especial
    if (m.tier >= 7) {
      flashAnnouncement(m);
    }
  }
  actualizarUI();
}

function flashAnnouncement(m){
  const prev = anuncioMascota.textContent;
  anuncioMascota.style.color = (m.tier === 8) ? "#ffd166" : "#9be7ff";
  anuncioMascota.textContent = `¡Salió ${m.nombre} — ${m.rareza}! x${m.mult}`;
  setTimeout(()=>{ anuncioMascota.style.color = ""; anuncioMascota.textContent = prev; }, 3500);
}

/* Vincular botones ruleta */
btnGirar1.onclick = () => tirarRuleta(1);
btnGirar10.onclick = () => tirarRuleta(10);
btnGirar50.onclick = () => tirarRuleta(50);
btnGirarMax.onclick = () => tirarRuleta(inventarioMax);

/* ----------------------
   Inventario / render / modal
   ----------------------*/
function renderInventario(){
  inventarioLista.innerHTML = "";
  // determinamos conteos por tier para resaltar fusionables
  const countByTier = inventario.reduce((acc, m) => { acc[m.tier] = (acc[m.tier]||0)+1; return acc; }, {});
  inventario.forEach((m) => {
    const div = document.createElement("div");
    div.className = "mascotaCard";
    if ((countByTier[m.tier] || 0) >= 2) div.classList.add("fusionable");

    const inner = document.createElement("div");
    inner.className = "meta";
    inner.innerHTML = `<div class="name">${m.nombre}</div><div class="rare">${m.rareza} • x${m.mult}</div>`;

    const actions = document.createElement("div");
    actions.className = "actions";
    const equipBtn = document.createElement("button");
    const equipada = equipadas.find(x => x.id === m.id);
    equipBtn.textContent = equipada ? "Quitar" : "Equipar";
    equipBtn.onclick = (e) => {
      e.stopPropagation();
      if (equipada) equipadas = equipadas.filter(x => x.id !== m.id);
      else {
        if (equipadas.length >= 3) return alert("Solo puedes equipar 3 mascotas");
        equipadas.push(m);
      }
      actualizarUI();
    };
    const infoBtn = document.createElement("button");
    infoBtn.textContent = "Info";
    infoBtn.onclick = (e) => {
      e.stopPropagation();
      abrirModal(m);
    };

    actions.appendChild(equipBtn);
    actions.appendChild(infoBtn);

    div.appendChild(inner);
    div.appendChild(actions);

    // click en la tarjeta abre modal
    div.addEventListener("click", () => abrirModal(m));
    inventarioLista.appendChild(div);
  });
}

function abrirModal(m){
  modalContenido.innerHTML = `<h3 style="margin:0 0 6px">${m.nombre}</h3>
    <div style="color:#9fb0ff;margin-bottom:6px;font-size:14px">${m.rareza} • Tier ${m.tier}</div>
    <div style="font-weight:700;margin-bottom:8px">Multiplicador: x${m.mult}</div>
    <p style="color:#cbd6ff">${m.descripcion}</p>`;
  modal.classList.add("activo");
}

/* ----------------------
   Equipar mejores / fusion
   ----------------------*/
btnEquiparMejores.onclick = () => {
  equipadas = [...inventario].sort((a,b)=>b.mult - a.mult).slice(0,3);
  actualizarUI();
};

btnFusionarTodo.onclick = () => {
  if (inventario.length < 2) return alert("Necesitas al menos 2 mascotas para fusionar");
  const suma = inventario.reduce((s,m)=>s + (m.mult||0), 0);
  const nueva = {
    id: "fusion-"+Date.now(),
    nombre: "Quimera",
    rareza: "Fusionada",
    tier: 0,
    mult: parseFloat((suma * 0.6).toFixed(2)),
    descripcion: "Criatura resultante de la fusión: poderosa, extraña y con rasgos de varias especies."
  };
  inventario = [nueva];
  equipadas = [];
  actualizarUI();
};

/* ----------------------
   Prestigio y confeti
   ----------------------*/
btnPrestigio.onclick = () => {
  const costo = 250 * (prestigios + 1);
  if (clicks < costo) return alert("No tienes clicks suficientes para renacer");
  clicks = 0;
  prestigios++;
  multiplicadorPrestigio = 1 + prestigios * 0.5;
  inventario = [];
  equipadas = [];
  lanzarConfeti();
  actualizarUI();
};

function lanzarConfeti(){
  for (let i=0;i<80;i++){
    const c = document.createElement("div");
    c.className = "confeti";
    c.style.left = (Math.random()*100) + "vw";
    c.style.background = `hsl(${Math.random()*360}deg 80% 60%)`;
    c.style.width = (6 + Math.random()*8) + "px";
    c.style.height = (8 + Math.random()*10) + "px";
    c.style.opacity = 0.95;
    c.style.transform = `translateY(-20px) rotate(${Math.random()*360}deg)`;
    c.style.position = "fixed";
    c.style.top = "-10px";
    c.style.zIndex = 9999;
    document.body.appendChild(c);
    // caída
    const dur = 1400 + Math.random()*1200;
    c.animate([{transform:`translateY(0) rotate(0deg)`},{transform:`translateY(${window.innerHeight + 50}px) rotate(${Math.random()*720}deg)`}], {duration: dur, easing:"linear"});
    setTimeout(()=>c.remove(), dur+50);
  }
}

/* ----------------------
   Guardado / carga
   ----------------------*/
function guardar(){
  try{
    localStorage.setItem("clickerSave", JSON.stringify({clicks,prestigios,multiplicadorPrestigio,inventario,equipadas,inventarioMax}));
  }catch(e){ console.warn("No se pudo guardar:", e) }
}
function cargar(){
  try{
    const data = JSON.parse(localStorage.getItem("clickerSave"));
    if (!data) return;
    clicks = data.clicks || 0;
    prestigios = data.prestigios || 0;
    multiplicadorPrestigio = data.multiplicadorPrestigio || 1;
    inventario = data.inventario || [];
    equipadas = data.equipadas || [];
    inventarioMax = data.inventarioMax || 50;
  }catch(e){ console.warn("Carga inválida:", e) }
}

/* ----------------------
   Inicio
   ----------------------*/
cargar();
actualizarUI();

/* Si quieres, en el siguiente mensaje puedo:
   - separar CSS en style.css,
   - convertir la ruleta en animación visual,
   - añadir tienda con upgrades reales,
   - implementar fusiones por tier (2 de tier X -> 1 de X+1), etc.

   ¡Lo que prefieras y otra vez perdón por la versión anterior! */
