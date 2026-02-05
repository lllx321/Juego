let clicks = 0;
let prestigios = 0;
let prestigioCosto = 250; // según lo que habíamos hablado

let ruletaNivel = 0;
let costoBaseRuleta = 100;
let multiplicadorCostoRuleta = 1.6; // escala por nivel

let mejoraRuletaNivel = 0;
let mejoraRuletaMax = 5;
let mejoraRuletaCosto = 1000;

let inventario = [];
let inventarioMax = 50;
let mascotasEquipadasMax = 3;

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

// Modal
const modal = document.getElementById("modalMascota");
const modalContenido = document.getElementById("modalContenido");
const modalCerrar = document.getElementById("modalCerrar");

// Paneles
const panelMascotas = document.getElementById("panelMascotas");
const panelTienda = document.getElementById("panelTienda");
const btnMascotas = document.getElementById("btnMascotas");
const btnTienda = document.getElementById("btnTienda");

// Botones principales
document.getElementById("btnClick").addEventListener("click", () => {
  clicks += calcularMultiplicadorTotal();
  actualizarUI();
});

// Botones ruleta (multi-giro)
document.getElementById("btnGirar1").addEventListener("click", () => girarMultiple(1));
document.getElementById("btnGirar10").addEventListener("click", () => girarMultiple(10));
document.getElementById("btnGirar50").addEventListener("click", () => girarMultiple(50));
document.getElementById("btnGirarMax").addEventListener("click", () => girarMaximo());

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

// Mascotas
const mascotasPool = [
  { nombre: "Miel", mult: 1.1, rareza: "Común", desc: "Una mascota dulce que aumenta un poco tus clicks." },
  { nombre: "Coco", mult: 1.3, rareza: "Común", desc: "Travieso pero útil para empezar." },
  { nombre: "Freya", mult: 5, rareza: "Super Rara", desc: "Una guardiana poderosa de los bosques." },
  { nombre: "Fenrir", mult: 8, rareza: "Épica", desc: "El lobo legendario que multiplica tu poder." },
  { nombre: "Aetherion", mult: 20, rareza: "Mítica", desc: "Ser de energía pura." },
  { nombre: "Celesthar", mult: 50, rareza: "Divina", desc: "Entidad celestial de poder infinito." }
];

// ====== RUleta ======

function costoGiroActual() {
  return Math.floor(costoBaseRuleta * Math.pow(multiplicadorCostoRuleta, ruletaNivel));
}

function girarUnaVez() {
  if (inventario.length >= inventarioMax) return false;

  const costo = costoGiroActual();
  if (clicks < costo) return false;

  clicks -= costo;

  // Mejora de probabilidades por nivel
  let bonus = mejoraRuletaNivel * 0.1 + ruletaNivel * 0.05;

  let r = Math.random();
  let index = Math.floor((1 - Math.pow(r, 1 + bonus)) * mascotasPool.length);

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
  return true;
}

function girarMultiple(n) {
  let girosHechos = 0;
  for (let i = 0; i < n; i++) {
    if (!girarUnaVez()) break;
    girosHechos++;
  }
  if (girosHechos === 0) {
    alert("No puedes girar (sin espacio o sin clicks).");
  }
  actualizarUI();
}

function girarMaximo() {
  const espacioLibre = inventarioMax - inventario.length;
  if (espacioLibre <= 0) {
    alert("Inventario lleno.");
    return;
  }

  const costo = costoGiroActual();
  const maxPorClicks = Math.floor(clicks / costo);
  const giros = Math.min(espacioLibre, maxPorClicks);

  if (giros <= 0) {
    alert("No tienes clicks suficientes.");
    return;
  }

  girarMultiple(giros);
}

// ====== MEJORAS / PRESTIGIO ======

function mejorarRuleta() {
  if (mejoraRuletaNivel >= mejoraRuletaMax) return alert("Ya está al máximo");
  if (clicks < mejoraRuletaCosto) return alert("No tienes clicks");

  clicks -= mejoraRuletaCosto;
  mejoraRuletaNivel++;
  mejoraRuletaCosto = Math.floor(mejoraRuletaCosto * 2);
  actualizarUI();
}

function hacerPrestigio() {
  if (clicks < prestigioCosto) return alert("No tienes clicks");

  prestigios++;
  clicks = 0;

  mejoraRuletaNivel = 0;
  mejoraRuletaCosto = 1000;

  prestigioCosto = Math.floor(prestigioCosto * 3);

  actualizarUI();
}

// ====== MULTIPLICADOR ======

function calcularMultiplicadorTotal() {
  let base = 1;
  let bonusMascotas = 0;

  inventario.forEach(m => {
    if (m.equipada) bonusMascotas += m.mult;
  });

  let multRebirth = 1 + prestigios;

  return (base + bonusMascotas) * multRebirth;
}

// ====== FUSIÓN ======

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
}

// ====== UI ======

function actualizarUI() {
  clicksSpan.textContent = Math.floor(clicks);
  multTotalSpan.textContent = calcularMultiplicadorTotal().toFixed(2);

  ruletaNivelSpan.textContent = ruletaNivel;
  ruletaCostoSpan.textContent = costoGiroActual();

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

    if (puedeFusionar(m)) {
      div.classList.add("fusionable");
    }

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
        alert("Solo puedes equipar " + mascotasEquipadasMax + " mascotas.");
        return;
      }

      m.equipada = !m.equipada;
      actualizarUI();
    };

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.onclick = (e) => {
      e.stopPropagation();
      inventario.splice(i, 1);
      actualizarUI();
    };

    div.appendChild(btnEquipar);
    div.appendChild(btnEliminar);
    inventarioLista.appendChild(div);
  });
}

modalCerrar.onclick = () => {
  modal.style.display = "none";
};

// Inicial
actualizarUI();
