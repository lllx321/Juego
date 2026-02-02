let clicks = 0;
let prestigios = 0;
let prestigioCosto = 1000;

let ruletaNivel = 0;
let ruletaCostoBase = [100, 250, 500, 1000, 2000, 5000];

let mejoraRuletaNivel = 0;
let mejoraRuletaMax = 5;
let mejoraRuletaCosto = 1000;

let inventario = [];
let inventarioMax = 50;
let mascotasEquipadasMax = 3;

// ---------- GUARDADO ----------
function guardarJuego() {
  const data = {
    clicks,
    prestigios,
    prestigioCosto,
    ruletaNivel,
    mejoraRuletaNivel,
    mejoraRuletaCosto,
    inventario
  };
  localStorage.setItem("clickerMascotasSave", JSON.stringify(data));
}

function cargarJuego() {
  const save = localStorage.getItem("clickerMascotasSave");
  if (!save) return;

  const data = JSON.parse(save);
  clicks = data.clicks ?? 0;
  prestigios = data.prestigios ?? 0;
  prestigioCosto = data.prestigioCosto ?? 1000;
  ruletaNivel = data.ruletaNivel ?? 0;
  mejoraRuletaNivel = data.mejoraRuletaNivel ?? 0;
  mejoraRuletaCosto = data.mejoraRuletaCosto ?? 1000;
  inventario = data.inventario ?? [];
}

// DOM
const clicksSpan = document.getElementById("clicks");
const multTotalSpan = document.getElementById("multTotal");
const anuncioMascota = document.getElementById("anuncioMascota");

const ruletaNivelSpan = document.getElementById("ruletaNivel");
const ruletaCostoSpan = document.getElementById("ruletaCosto");

const mejoraRuletaNivelSpan = document.getElementById("mejoraRuletaNivel");
const mejoraRuletaCostoSpan = document.getElementById("mejoraRuletaCosto");

const prestigiosSpan = document.getElementById("prestigios");
const prestigioCostoSpan = document.getElementById("prestigioCosto");

const invCountSpan = document.getElementById("invCount");
const invMaxSpan = document.getElementById("invMax");
const inventarioLista = document.getElementById("inventarioLista");

// Modal descripción
const modal = document.getElementById("modalMascota");
const modalContenido = document.getElementById("modalContenido");
const modalCerrar = document.getElementById("modalCerrar");

// Paneles
const panelMascotas = document.getElementById("panelMascotas");
const panelTienda = document.getElementById("panelTienda");
const btnMascotas = document.getElementById("btnMascotas");
const btnTienda = document.getElementById("btnTienda");

// Botones
document.getElementById("btnClick").addEventListener("click", () => {
  clicks += calcularMultiplicadorTotal();
  actualizarUI();
  guardarJuego();
});

document.getElementById("btnGirar").addEventListener("click", girarRuleta);
document.getElementById("btnMejorarRuleta").addEventListener("click", mejorarRuleta);
document.getElementById("btnPrestigio").addEventListener("click", hacerPrestigio);
document.getElementById("btnFusionarTodo").addEventListener("click", fusionarTodas);

// Toggle paneles
btnMascotas.addEventListener("click", () => {
  panelMascotas.classList.toggle("activo");
  panelTienda.classList.remove("activo");
});

btnTienda.addEventListener("click", () => {
  panelTienda.classList.toggle("activo");
  panelMascotas.classList.remove("activo");
});

// Mascotas con descripción
const mascotasPool = [
  { nombre: "Miel", mult: 1.1, rareza: "Común", desc: "Una mascota dulce que aumenta un poco tus clicks." },
  { nombre: "Coco", mult: 1.3, rareza: "Común", desc: "Travieso pero útil para empezar." },
  { nombre: "Freya", mult: 5, rareza: "Super Rara", desc: "Una guardiana poderosa de los bosques." },
  { nombre: "Fenrir", mult: 8, rareza: "Épica", desc: "El lobo legendario que multiplica tu poder." },
  { nombre: "Aetherion", mult: 20, rareza: "Mítica", desc: "Ser de energía pura." },
  { nombre: "Celesthar", mult: 50, rareza: "Divina", desc: "Entidad celestial de poder infinito." }
];

function girarRuleta() {
  const costo = ruletaCostoBase[ruletaNivel] || 5000;
  if (clicks < costo) return alert("No tienes suficientes clicks");
  if (inventario.length >= inventarioMax) return alert("Inventario lleno");

  clicks -= costo;

  let bonus = mejoraRuletaNivel * 0.1;
  let index = Math.floor(Math.random() * mascotasPool.length * (1 - bonus));
  if (index < 0) index = 0;
  if (index >= mascotasPool.length) index = mascotasPool.length - 1;

  const base = mascotasPool[index];
  const multRandom = (base.mult * (0.9 + Math.random() * 0.2)).toFixed(2);

  const mascota = {
    nombre: base.nombre,
    rareza: base.rareza,
    mult: parseFloat(multRandom),
    desc: base.desc,
    equipada: false
  };

  inventario.push(mascota);
  anuncioMascota.textContent = `Te salió: ${mascota.nombre} (${mascota.rareza}) x${mascota.mult}`;
  actualizarUI();
  guardarJuego();
}

function mejorarRuleta() {
  if (mejoraRuletaNivel >= mejoraRuletaMax) return alert("Ya está al máximo");
  if (clicks < mejoraRuletaCosto) return alert("No tienes clicks");

  clicks -= mejoraRuletaCosto;
  mejoraRuletaNivel++;
  mejoraRuletaCosto = Math.floor(mejoraRuletaCosto * 2);
  actualizarUI();
  guardarJuego();
}

function hacerPrestigio() {
  if (clicks < prestigioCosto) return alert("No tienes clicks");

  prestigios++;
  clicks = 0;

  mejoraRuletaNivel = 0;
  mejoraRuletaCosto = 1000;
  prestigioCosto = Math.floor(prestigioCosto * 2.2);

  lanzarConfetti();
  actualizarUI();
  guardarJuego();
}

function calcularMultiplicadorTotal() {
  let total = 1 + prestigios;
  inventario.forEach(m => {
    if (m.equipada) total += m.mult; // suma
  });
  return total;
}

// --- FUSIÓN ---
function puedeFusionar(m) {
  return inventario.filter(x => x.nombre === m.nombre && x.rareza === m.rareza).length >= 2;
}

function fusionarUna(nombre, rareza) {
  const indices = [];
  inventario.forEach((m, i) => {
    if (m.nombre === nombre && m.rareza === rareza) indices.push(i);
  });
  if (indices.length < 2) return false;

  const m1 = inventario[indices[0]];
  const m2 = inventario[indices[1]];

  const nueva = {
    nombre: m1.nombre,
    rareza: m1.rareza,
    mult: parseFloat((m1.mult + m2.mult).toFixed(2)),
    desc: m1.desc,
    equipada: false
  };

  inventario.splice(indices[1], 1);
  inventario.splice(indices[0], 1);
  inventario.push(nueva);
  return true;
}

function fusionarTodas() {
  let algo = true;
  while (algo) {
    algo = false;
    for (let m of [...inventario]) {
      if (puedeFusionar(m)) {
        if (fusionarUna(m.nombre, m.rareza)) {
          algo = true;
          break;
        }
      }
    }
  }
  actualizarUI();
  guardarJuego();
}

// --- CONFETI FULLSCREEN ---
const confettiContainer = document.createElement("div");
confettiContainer.style.position = "fixed";
confettiContainer.style.top = "0";
confettiContainer.style.left = "0";
confettiContainer.style.width = "100%";
confettiContainer.style.height = "100%";
confettiContainer.style.pointerEvents = "none";
confettiContainer.style.zIndex = "9999";
document.body.appendChild(confettiContainer);

function lanzarConfetti() {
  const colors = ["#FFD700","#FF69B4","#00BFFF","#7CFC00","#FF7F50","#DA70D6"];
  const total = 150;

  for (let i = 0; i < total; i++) {
    const el = document.createElement("div");
    el.style.position = "absolute";
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.left = (Math.random() * 100) + "vw";
    el.style.top = (-30 - Math.random() * 25) + "vh";
    const w = 6 + Math.random() * 18;
    el.style.width = `${w}px`;
    el.style.height = `${w * 1.2}px`;
    const dur = 2200 + Math.random() * 2800;
    const delay = Math.random() * 300;
    el.style.animation = `confetti-fall-full ${dur}ms linear ${delay}ms forwards`;
    confettiContainer.appendChild(el);
    setTimeout(() => el.remove(), dur + delay + 200);
  }
}

// --- UI ---
function actualizarUI() {
  clicksSpan.textContent = Math.floor(clicks);
  multTotalSpan.textContent = calcularMultiplicadorTotal().toFixed(2);

  ruletaNivelSpan.textContent = mejoraRuletaNivel;
  ruletaCostoSpan.textContent = ruletaCostoBase[ruletaNivel] || 5000;

  mejoraRuletaNivelSpan.textContent = mejoraRuletaNivel;
  mejoraRuletaCostoSpan.textContent = mejoraRuletaCosto;

  prestigiosSpan.textContent = prestigios;
  prestigioCostoSpan.textContent = prestigioCosto;

  invCountSpan.textContent = inventario.length;
  invMaxSpan.textContent = inventarioMax;

  renderInventario();
}

function renderInventario() {
  inventarioLista.innerHTML = "";

  inventario.forEach((m, i) => {
    const div = document.createElement("div");
    div.className = "mascotaCard";

    if (puedeFusionar(m)) div.classList.add("fusionable");

    div.innerHTML = `
      <strong>${m.nombre}</strong> (${m.rareza})<br>
      Mult: x${m.mult}<br>
      Estado: ${m.equipada ? "Equipada" : "No equipada"}<br>
    `;

    div.onclick = () => {
      modalContenido.innerHTML = `
        <h2>${m.nombre}</h2>
        <p><b>Rareza:</b> ${m.rareza}</p>
        <p><b>Multiplicador:</b> x${m.mult}</p>
        <p>${m.desc}</p>
      `;
      modal.style.display = "flex";
    };

    const btnEquipar = document.createElement("button");
    btnEquipar.textContent = m.equipada ? "Quitar" : "Equipar";
    btnEquipar.onclick = (e) => {
      e.stopPropagation();
      const equipadas = inventario.filter(x => x.equipada).length;
      if (!m.equipada && equipadas >= mascotasEquipadasMax) {
        alert("Solo puedes equipar 3 mascotas");
        return;
      }
      m.equipada = !m.equipada;
      actualizarUI();
      guardarJuego();
    };

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.onclick = (e) => {
      e.stopPropagation();
      inventario.splice(i, 1);
      actualizarUI();
      guardarJuego();
    };

    div.appendChild(btnEquipar);
    div.appendChild(btnEliminar);
    inventarioLista.appendChild(div);
  });
}

modalCerrar.onclick = () => {
  modal.style.display = "none";
};

// Cargar partida al iniciar
cargarJuego();
actualizarUI();
