// ============================
// VARIABLES
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
// RAREZAS
// ============================
const rarezas = [
  { nombre: "Común", chance: 55, multMin: 1, multMax: 2 },
  { nombre: "Poco común", chance: 25, multMin: 2, multMax: 4 },
  { nombre: "Rara", chance: 10, multMin: 4, multMax: 8 },
  { nombre: "Épica", chance: 5, multMin: 8, multMax: 15 },
  { nombre: "Legendaria", chance: 3, multMin: 15, multMax: 30 },
  { nombre: "Mítica", chance: 1.5, multMin: 30, multMax: 50 },
  { nombre: "Celestial", chance: 0.4, multMin: 50, multMax: 80 },
  { nombre: "Cósmica", chance: 0.1, multMin: 80, multMax: 120 }
];

// ============================
// MASCOTAS POR NIVEL
// ============================
const mascotasPorNivel = {
  1: ["Nube","Coco","Miel","Pixel","Chispa","Panqué","Tofu","Lilo","Copo","Bombo","Canela","Pompón","Bolita","Trufa","Pelusa","Nacho","Bubu","Tiki","Choco","Motita","Fresita","Churro"],
  2: ["Bruno","Kira","Dante","Nova","Atlas","Milo","Nala","Toby","Rocco","Duna","Simba","Otto","Kiara","Balto","Uma","Nico","Frida","Bento","Sasha"],
  3: ["Orion","Freya","Ragnar","Vega","Leónidas","Apollo","Arya","Loki","Zafiro","Kaida","Ares","Lyra","Cairo","Kenzo","Indigo","Soren"],
  4: ["Valkor","Nyx","Drako","Astra","Fenrir","Casio","Elara","Tritón","Calypso","Hyperion","Andrómeda","Boreal","Tadeo","Circe"],
  5: ["Kaelum","Zephyra","Titan","Eclipse","Solaris","Oberon","Iskandar","Selene","Octavian","Isolde","Zenith","Evander"],
  6: ["Aetherion","Luminary","Thalor","Seraphis","Obsidian","Valyrian","Azurion","Xerath","Alaric","Vesper"],
  7: ["Zypharion","Aurorath","Noctyra","Imperion","Celesthar","Eryndor","Solmire","Aurelion","Mythros"],
  8: ["Elarion","Thyrian"]
};

// ============================
// DESCRIPCIONES
// ============================
function descripcionMascota(nombre, rareza) {
  return `${nombre} es una mascota de rareza ${rareza}. Se dice que su energía influye en otras mascotas: algunas lo admiran, otras le temen. Cuando está equipada, su poder se suma a tu multiplicador.`;
}

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

const modal = document.getElementById("modalMascota");
const modalContenido = document.getElementById("modalContenido");
const modalCerrar = document.getElementById("modalCerrar");

// ============================
// FUNCIONES
// ============================
function calcularBonusMascotas() {
  let total = 0;
  equipadas.forEach(m => total += m.mult);
  return total;
}

function calcularMultiplicadorTotal() {
  return (1 + calcularBonusMascotas() + bonusMejoras) * multiplicadorPrestigio;
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
  let espacio = inventarioMax - inventario.length;
  if (espacio <= 0) return alert("Inventario lleno");

  let tiradas = Math.min(veces, espacio);
  let costo = tiradas * COSTO_RULETA;
  if (clicks < costo) return alert("No tienes clicks");

  clicks -= costo;

  for (let i = 0; i < tiradas; i++) {
    let m = generarMascota();
    inventario.push(m);
    anuncioMascota.textContent = `Obtuviste: ${m.nombre} (${m.rareza}) x${m.mult}`;
  }
  actualizarUI();
}

function generarMascota() {
  let roll = Math.random() * 100;
  let acc = 0;
  let rarezaElegida = rarezas[0];

  for (let r of rarezas) {
    acc += r.chance;
    if (roll <= acc) { rarezaElegida = r; break; }
  }

  const nivel = rarezas.indexOf(rarezaElegida) + 1;
  const lista = mascotasPorNivel[nivel];
  const nombre = lista[Math.floor(Math.random() * lista.length)];
  const mult = rarezaElegida.multMin + Math.random() * (rarezaElegida.multMax - rarezaElegida.multMin);

  return {
    nombre,
    rareza: rarezaElegida.nombre,
    mult: parseFloat(mult.toFixed(2)),
    descripcion: descripcionMascota(nombre, rarezaElegida.nombre)
  };
}

btnGirar1.onclick = () => tirarRuleta(1);
btnGirar10.onclick = () => tirarRuleta(10);
btnGirar50.onclick = () => tirarRuleta(50);
btnGirarMax.onclick = () => tirarRuleta(inventarioMax);

// ============================
// INVENTARIO
// ============================
function renderInventario() {
  inventarioLista.innerHTML = "";
  inventario.forEach((m) => {
    const div = document.createElement("div");
    const equipada = equipadas.includes(m);
    div.innerHTML = `<b>${m.nombre}</b> (${m.rareza}) x${m.mult}<br>
    <button>${equipada ? "Desequipar" : "Equipar"}</button>
    <button>Info</button>`;

    const [btnEq, btnInfo] = div.querySelectorAll("button");

    btnEq.onclick = () => {
      if (equipada) equipadas = equipadas.filter(e => e !== m);
      else {
        if (equipadas.length >= 3) return alert("Solo 3 mascotas equipadas");
        equipadas.push(m);
      }
      actualizarUI();
    };

    btnInfo.onclick = () => {
      modalContenido.innerHTML = `<h3>${m.nombre}</h3><p><b>Rareza:</b> ${m.rareza}</p><p><b>Multiplicador:</b> x${m.mult}</p><p>${m.descripcion}</p>`;
      modal.style.display = "flex";
    };

    inventarioLista.appendChild(div);
  });
}

modalCerrar.onclick = () => modal.style.display = "none";

// ============================
// EQUIPAR MEJORES
// ============================
btnEquiparMejores.onclick = () => {
  equipadas = [...inventario].sort((a,b)=>b.mult-a.mult).slice(0,3);
  actualizarUI();
};

// ============================
// FUSIÓN
// ============================
btnFusionarTodo.onclick = () => {
  if (inventario.length < 2) return alert("Necesitas 2 mascotas");
  let suma = inventario.reduce((s,m)=>s+m.mult,0);
  inventario = [{
    nombre: "Quimera",
    rareza: "Fusionada",
    mult: parseFloat((suma*0.6).toFixed(2)),
    descripcion: "Una criatura nacida de la unión de muchas almas."
  }];
  equipadas = [];
  actualizarUI();
};

// ============================
// PRESTIGIO
// ============================
btnPrestigio.onclick = () => {
  const costo = 250 * (prestigios + 1);
  if (clicks < costo) return alert("No tienes clicks");
  clicks = 0;
  prestigios++;
  multiplicadorPrestigio = 1 + prestigios * 0.5;
  inventario = [];
  equipadas = [];
  actualizarUI();
};

// ============================
// GUARDADO
// ============================
function guardar() {
  localStorage.setItem("clickerSave", JSON.stringify({
    clicks, prestigios, multiplicadorPrestigio, inventario, equipadas, inventarioMax
  }));
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
