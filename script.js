let clicks = 0;
let prestigios = 0;
let multiplicadorPrestigio = 1;

let inventarioMax = 50;
let inventario = [];
let equipadas = [];

const COSTO_RULETA = 100;

const rarezas = [
  { nombre: "Común", chance: 60, multMin: 1, multMax: 2 },
  { nombre: "Rara", chance: 25, multMin: 2, multMax: 5 },
  { nombre: "Épica", chance: 10, multMin: 5, multMax: 15 },
  { nombre: "Legendaria", chance: 4, multMin: 15, multMax: 30 },
  { nombre: "Celestial", chance: 1, multMin: 30, multMax: 49 }
];

const clicksSpan = document.getElementById("clicks");
const multTotalSpan = document.getElementById("multTotal");
const invCountSpan = document.getElementById("invCount");
const invMaxSpan = document.getElementById("invMax");
const inventarioLista = document.getElementById("inventarioLista");
const anuncioMascota = document.getElementById("anuncioMascota");
const prestigiosSpan = document.getElementById("prestigios");
const prestigioCostoSpan = document.getElementById("prestigioCosto");

function calcularBonusMascotas() {
  let total = 0;
  equipadas.forEach(m => total += m.mult);
  return total;
}

function calcularMultiplicadorTotal() {
  return (1 + calcularBonusMascotas()) * multiplicadorPrestigio;
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

document.getElementById("btnClick").onclick = () => {
  clicks += calcularMultiplicadorTotal();
  actualizarUI();
};

// Paneles
document.getElementById("btnMascotas").onclick = () => {
  document.getElementById("panelMascotas").classList.toggle("activo");
};
document.getElementById("btnTienda").onclick = () => {
  document.getElementById("panelTienda").classList.toggle("activo");
};

// Ruleta
function tirarRuleta(veces) {
  let espacio = inventarioMax - inventario.length;
  if (espacio <= 0) return alert("Inventario lleno");

  let maxTiradas = Math.min(veces, espacio);
  let costo = maxTiradas * COSTO_RULETA;
  if (clicks < costo) return alert("No tienes clicks");

  clicks -= costo;

  for (let i = 0; i < maxTiradas; i++) {
    const m = generarMascota();
    inventario.push(m);
    anuncioMascota.textContent = `Obtuviste: ${m.rareza} x${m.mult}`;
  }
  actualizarUI();
}

function generarMascota() {
  let roll = Math.random() * 100;
  let acc = 0;
  for (let r of rarezas) {
    acc += r.chance;
    if (roll <= acc) {
      let mult = r.multMin + Math.random() * (r.multMax - r.multMin);
      return { rareza: r.nombre, mult: parseFloat(mult.toFixed(2)) };
    }
  }
  return { rareza: "Común", mult: 1 };
}

document.getElementById("btnGirar1").onclick = () => tirarRuleta(1);
document.getElementById("btnGirar10").onclick = () => tirarRuleta(10);
document.getElementById("btnGirar50").onclick = () => tirarRuleta(50);
document.getElementById("btnGirarMax").onclick = () => tirarRuleta(inventarioMax);

// Inventario
function renderInventario() {
  inventarioLista.innerHTML = "";
  const fusionable = inventario.length >= 2;

  inventario.forEach((m) => {
    const div = document.createElement("div");
    div.className = "mascotaCard" + (fusionable ? " fusionable" : "");
    div.innerHTML = `<b>${m.rareza}</b><br>Mult: x${m.mult}
      <br><button>Ver</button> <button>${equipadas.includes(m) ? "Quitar" : "Equipar"}</button>`;

    const [btnVer, btnEq] = div.querySelectorAll("button");

    btnVer.onclick = () => abrirModal(m);
    btnEq.onclick = () => {
      if (equipadas.includes(m)) {
        equipadas = equipadas.filter(e => e !== m);
      } else {
        if (equipadas.length >= 3) return alert("Máx 3 equipadas");
        equipadas.push(m);
      }
      actualizarUI();
    };

    inventarioLista.appendChild(div);
  });
}

document.getElementById("btnEquiparMejores").onclick = () => {
  equipadas = [];
  const ordenadas = [...inventario].sort((a,b) => b.mult - a.mult);
  for (let i = 0; i < Math.min(3, ordenadas.length); i++) equipadas.push(ordenadas[i]);
  actualizarUI();
};

document.getElementById("btnFusionarTodo").onclick = () => {
  if (inventario.length < 2) return alert("Necesitas 2 o más");
  let suma = 0;
  inventario.forEach(m => suma += m.mult);
  inventario = [{ rareza: "Fusionada", mult: parseFloat((suma * 0.6).toFixed(2)) }];
  equipadas = [];
  actualizarUI();
};

// Prestigio
document.getElementById("btnPrestigio").onclick = () => {
  const costo = 250 * (prestigios + 1);
  if (clicks < costo) return alert("No tienes clicks");
  clicks = 0;
  prestigios++;
  multiplicadorPrestigio = 1 + prestigios * 0.5;
  inventario = [];
  equipadas = [];
  lanzarConfeti();
  actualizarUI();
};

// Modal
const modal = document.getElementById("modalMascota");
const modalContenido = document.getElementById("modalContenido");
document.getElementById("modalCerrar").onclick = () => cerrarModal();

function abrirModal(m) {
  modalContenido.innerHTML = `<h3>${m.rareza}</h3><p>Multiplicador: x${m.mult}</p>`;
  modal.classList.add("activo");
}
function cerrarModal() {
  modal.classList.remove("activo");
}

// Confeti
function lanzarConfeti() {
  for (let i = 0; i < 100; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "vw";
    c.style.background = `hsl(${Math.random()*360},100%,50%)`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 2000);
  }
}

// Guardado
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

cargar();
actualizarUI();
