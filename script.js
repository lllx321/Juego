// ==========================================
// 1. VARIABLES PRINCIPALES (CON PERSISTENCIA)
// ==========================================
let clicks = 0;
let prestigios = 0;
let multiplicadorPrestigio = 1;
let bonusMejoras = 0;
let inventarioMax = 50;
let equipMax = 3;
let inventario = [];
let equipadas = [];
let mascotasDescubiertas = []; // Lista de nombres encontrados
let sinergiasDescubiertas = []; // Índices de VINCULOS.amistades encontrados
let COSTO_RULETA = 100;

// ==========================================
// 2. BASE DE DATOS MAESTRA (LORE Y RAREZAS)
// ==========================================
const DB_MASCOTAS = {
    // NIVEL 1
    "Nube": { rareza: "comun", lore: "Convencida de que las nubes guardan fragmentos del futuro. Una vez predijo una tormenta y desde entonces algunos la escuchan más de lo que admitirían." },
    "Coco": { rareza: "comun", lore: "Cree que un ser galáctico llamado Thyrian le habla en sueños. Ha evitado que otros tomen malas decisiones con sus señales imposibles." },
    "Miel": { rareza: "comun", lore: "Tiene una calma contagiosa. Basta con que se siente entre dos mascotas que discuten para que el enojo pierda fuerza." },
    "Panqué": { rareza: "comun", lore: "Tiene el talento sobrenatural de aparecer justo cuando hay comida o cuando alguien la necesita." },
    "Tofu": { rareza: "comun", lore: "La serenidad hecha mascota. Su respiración es tan pausada que algunos se tranquilizan solo al acompasarla." },
    "Lilo": { rareza: "comun", lore: "Convencida de que el mundo es un mapa incompleto esperando ser descubierto." },
    "Copo": { rareza: "comun", lore: "Pequeño admirador del invierno. Trata de imitar el temple frío incluso cuando tiembla." },
    "Bombo": { rareza: "comun", lore: "Hace ruido al moverse, pero ese estruendo ha servido más de una vez como alarma temprana." },
    "Canela": { rareza: "comun", lore: "Tiene un talento especial para convertir cualquier rincón en hogar irradiando calor invisible." },
    "Pompón": { rareza: "comun", lore: "Su memoria emocional es profunda: nunca olvida quién fue amable cuando nadie miraba." },
    "Bolita": { rareza: "comun", lore: "Muchos la subestiman, pero piensa antes de actuar y rara vez se equivoca." },
    "Trufa": { rareza: "comun", lore: "Posee un olfato legendario para encontrar lo que otros pierden, desde objetos hasta secretos." },
    "Pelusa": { rareza: "comun", lore: "Su apariencia delicada engaña; posee una valentía silenciosa que Fenrir admira." },
    "Nacho": { rareza: "comun", lore: "Improvisa chistes para romper tensiones antes de que se vuelvan peligrosas." },
    "Bubu": { rareza: "comun", lore: "Tiene instinto de guarduán, nacido para interponerse entre el riesgo y los demás." },
    "Tiki": { rareza: "comun", lore: "Cree que cada día merece celebrarse y llena el ambiente con música improvisada." },
    "Choco": { rareza: "comun", lore: "Observa más de lo que aparenta y detecta cuando algo no es sincero." },
    "Motita": { rareza: "comun", lore: "Tan pequeña que algunos olvidan que está ahí, hasta que revela algo que nadie notó." },
    "Fresita": { rareza: "comun", lore: "Su optimismo es una decisión consciente. Cree que incluso los días difíciles esconden algo bueno." },
    "Churro": { rareza: "comun", lore: "Improvisador profesional. No planea, reacciona, y contra toda lógica suele funcionar." },

    // POCO COMUNES... (Pixel, Chispa, etc. se mantienen igual)
    "Pixel": { rareza: "poco-comun", lore: "Observa el mundo como un mecanismo de patrones ocultos. Detectó irregularidades en Lumeria." },
    "Chispa": { rareza: "poco-comun", lore: "No camina: rebota. Su rapidez ha salvado a muchos de peligros inminentes." },

    // RARAS... (Bruno, Kira, Dante, etc.)
    "Bruno": { rareza: "rara", lore: "Estable y confiable como un roble antiguo. Cuando se enfada, el valle entero lo nota." },
    "Kira": { rareza: "rara", lore: "Su intuición corta directo a la verdad. Detecta intenciones incluso bien disfrazadas." },
    "Dante": { rareza: "rara", lore: "Avanza como flecha: directo y honesto." },

    // EPICAS...
    "Loki": { rareza: "epica", lore: "Encanto impredecible. Obliga a otros a salir de la rigidez." },

    // LEGENDARIAS...
    "Fenrir": { rareza: "legendaria", lore: "Lealtad legendaria. Solución inmediata." },
    "Thyrian": { rareza: "cosmica", lore: "Magnetismo cósmico. Ya vio cómo continúa la historia." },
    "Zypharion": { rareza: "cosmica", lore: "Presencia gravitacional. La gloria llega a él." },
    "Imperion": { rareza: "cosmica", lore: "Nacido para dirigir. Los destinos se toman." }
};

// ==========================================
// 3. SISTEMA DE VÍNCULOS
// ==========================================
const VINCULOS = {
    amistades: [
        { p1: "Coco", p2: "Thyrian", bono: 2.5, desc: "Vínculo de Sueños: ¡Coco potencia a su ídolo!" },
        { p1: "Pelusa", p2: "Fenrir", bono: 1.8, desc: "Admiración Pura: Pelusa inspira a Fenrir." },
        { p1: "Kaelum", p2: "Zenith", bono: 1.25, desc: "Ambición Compartida." },
        { p1: "Elarion", p2: "Zypharion", bono: 1.4, desc: "Equilibrio Eterno." }
    ],
    rivalidades: [
        { p1: "Zypharion", p2: "Imperion", castigo: 0.6, desc: "Guerra de Leyendas." }
    ]
};

const rarezas = [
    { nombre: "comun", chance: 50, min: 1, max: 3, color: "#b0b0b0" },
    { nombre: "poco-comun", chance: 25, min: 4, max: 7, color: "#4ade80" },
    { nombre: "rara", chance: 12, min: 10, max: 15, color: "#60a5fa" },
    { nombre: "epica", chance: 7, min: 20, max: 30, color: "#a855f7" },
    { nombre: "legendaria", chance: 4, min: 45, max: 60, color: "#facc15" },
    { nombre: "mitica", chance: 1.5, min: 80, max: 110, color: "#f87171" },
    { nombre: "celestial", chance: 0.4, min: 150, max: 250, color: "#22d3ee" },
    { nombre: "cosmica", chance: 0.1, min: 500, max: 800, color: "#ffffff" }
];

const MULT_FUSION = { 0: 1, 1: 1.6, 2: 2.4, 3: 5 };

// ==========================================
// 4. ELEMENTOS HTML
// ==========================================
const clicksSpan = document.getElementById("clicks");
const multTotalSpan = document.getElementById("multTotal");
const btnClick = document.getElementById("btnClick");
const inventarioLista = document.getElementById("inventarioLista");
const prestigiosSpan = document.getElementById("prestigios");

// ==========================================
// 5. SISTEMA CORE Y LÓGICA DE ÁLBUM
// ==========================================
function generarID() { return "m_" + Math.random().toString(36).slice(2) + Date.now(); }

function registrarMascota(nombre) {
    if (!mascotasDescubiertas.includes(nombre)) {
        mascotasDescubiertas.push(nombre);
        // Bono de Erudito: Reducir costo ruleta si descubres muchas
        if (mascotasDescubiertas.length >= 10) COSTO_RULETA = 80;
    }
}

function generarMascota() {
    let roll = Math.random() * 100;
    let acumulado = 0;
    let rElegida = rarezas[0];

    for (let r of rarezas) {
        acumulado += r.chance;
        if (roll <= acumulado) { rElegida = r; break; }
    }

    const pool = Object.keys(DB_MASCOTAS).filter(nombre => DB_MASCOTAS[nombre].rareza === rElegida.nombre);
    const nombreFinal = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : "Coco";
    const multAleatorio = Math.random() * (rElegida.max - rElegida.min) + rElegida.min;

    registrarMascota(nombreFinal);

    return {
        id: generarID(),
        baseName: nombreFinal,
        nombre: nombreFinal,
        rareza: rElegida.nombre,
        fusion: 0,
        multBase: parseFloat(multAleatorio.toFixed(1)),
        mult: parseFloat(multAleatorio.toFixed(1)),
        lore: DB_MASCOTAS[nombreFinal].lore,
        color: rElegida.color
    };
}

function calcularMultiplicadorTotal() {
    let bonusMascotas = 0;
    equipadas.forEach(m => bonusMascotas += m.mult);

    let total = (1 + bonusMascotas + bonusMejoras) * (1 + prestigios);
    let factorModificador = 1;

    for (let i = 0; i < equipadas.length; i++) {
        for (let j = i + 1; j < equipadas.length; j++) {
            const n1 = equipadas[i].baseName;
            const n2 = equipadas[j].baseName;

            // Amistades y Descubrimiento
            const idxA = VINCULOS.amistades.findIndex(v => (v.p1 === n1 && v.p2 === n2) || (v.p1 === n2 && v.p2 === n1));
            if (idxA !== -1) {
                factorModificador *= VINCULOS.amistades[idxA].bono;
                if (!sinergiasDescubiertas.includes(idxA)) {
                    sinergiasDescubiertas.push(idxA);
                }
            }

            const riv = VINCULOS.rivalidades.find(v => (v.p1 === n1 && v.p2 === n2) || (v.p1 === n2 && v.p2 === n1));
            if (riv) factorModificador *= riv.castigo;
        }
    }

    return total * factorModificador;
}

function actualizarUI() {
    if(clicksSpan) clicksSpan.textContent = Math.floor(clicks);
    if(multTotalSpan) multTotalSpan.textContent = calcularMultiplicadorTotal().toFixed(2);
    if(prestigiosSpan) prestigiosSpan.textContent = prestigios;
    renderInventario();
    guardar();
}

function renderInventario() {
    if(!inventarioLista) return;
    inventarioLista.innerHTML = "";
    let nombresEquipados = equipadas.map(e => e.baseName);

    inventario.forEach((m) => {
        const div = document.createElement("div");
        div.className = `card ${m.rareza}`;
        div.style.borderLeft = `5px solid ${m.color}`;
        const equipada = equipadas.some(e => e.id === m.id);

        let tieneSinergia = false;
        if (equipada) {
            tieneSinergia = VINCULOS.amistades.some(v => 
                (v.p1 === m.baseName && nombresEquipados.includes(v.p2)) || 
                (v.p2 === m.baseName && nombresEquipados.includes(v.p1))
            );
            if (tieneSinergia) div.style.boxShadow = `0 0 15px ${m.color}`;
        }
        
        if (m.fusion > 0 && !tieneSinergia) div.style.boxShadow = `0 0 ${5 * m.fusion}px ${m.color}`;

        div.innerHTML = `
            <small>${m.rareza.toUpperCase()}</small><br>
            <b style="color:${m.color}">${m.nombre} ${m.fusion > 0 ? '+'+m.fusion : ''}</b><br>
            <span>x${m.mult}</span><br>
            <button class="btn-card">${equipada ? "Desequipar" : "Equipar"}</button>
        `;

        div.querySelector("button").onclick = () => {
            if (equipada) equipadas = equipadas.filter(e => e.id !== m.id);
            else if (equipadas.length < equipMax) equipadas.push(m);
            actualizarUI();
        };

        div.ondblclick = () => alert(`LORE: "${m.lore}"`);
        inventarioLista.appendChild(div);
    });
}

// ==========================================
// 6. ENCICLOPEDIA (EL ÁLBUM)
// ==========================================
function abrirEnciclopedia() {
    let modal = document.getElementById("modalEnciclopedia");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "modalEnciclopedia";
        modal.style = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:1000; overflow-y:auto; padding:20px; display:none; color:white; font-family:sans-serif;";
        document.body.appendChild(modal);
    }

    let htmlMascotas = Object.keys(DB_MASCOTAS).map(nombre => {
        const descrita = mascotasDescubiertas.includes(nombre);
        const m = DB_MASCOTAS[nombre];
        const color = rarezas.find(r => r.nombre === m.rareza).color;
        return `<div style="display:inline-block; width:100px; padding:10px; margin:5px; border:1px solid ${descrita ? color : '#333'}; text-align:center; opacity:${descrita?1:0.4}">
            <b style="color:${descrita?color:'#555'}">${descrita ? nombre : '???'}</b><br>
            <small>${descrita ? m.rareza : '???'}</small>
        </div>`;
    }).join("");

    let htmlSinergias = VINCULOS.amistades.map((v, i) => {
        const desc = sinergiasDescubiertas.includes(i);
        return `<div style="background:#222; margin:5px; padding:10px; border-radius:5px; border-left: 4px solid ${desc ? '#4ade80' : '#444'}">
            <b>${desc ? v.desc : "Sinergia Secreta ???"}</b><br>
            <small>${desc ? `${v.p1} + ${v.p2} -> x${v.bono}` : "Combina mascotas para descubrirla"}</small>
        </div>`;
    }).join("");

    modal.innerHTML = `
        <div style="max-width:800px; margin:auto;">
            <h2>📖 Enciclopedia de Lumeria (${mascotasDescubiertas.length}/${Object.keys(DB_MASCOTAS).length})</h2>
            <button onclick="this.parentElement.parentElement.style.display='none'" style="padding:10px; cursor:pointer;">Cerrar</button>
            <h3>Mascotas Encontradas</h3>
            <div>${htmlMascotas}</div>
            <h3>Sinergias Descubiertas</h3>
            <div>${htmlSinergias}</div>
        </div>
    `;
    modal.style.display = "block";
}

// ==========================================
// 7. EVENTOS, GUARDADO Y CARGA
// ==========================================
btnClick?.addEventListener("click", () => {
    clicks += calcularMultiplicadorTotal();
    actualizarUI();
});

document.getElementById("btnGirar1")?.addEventListener("click", () => {
    if (clicks < COSTO_RULETA) return alert("¡Faltan clicks!");
    if (inventario.length >= inventarioMax) return alert("Inventario lleno.");
    clicks -= COSTO_RULETA;
    inventario.push(generarMascota());
    actualizarUI();
});

// Botón de Enciclopedia
const btnA = document.createElement("button");
btnA.textContent = "📖 Álbum";
btnA.onclick = abrirEnciclopedia;
btnA.style = "margin-left: 10px; padding: 10px 20px; cursor:pointer;";
document.body.appendChild(btnA);

function guardar() {
    const data = { clicks, prestigios, inventario, equipadas, bonusMejoras, mascotasDescubiertas, sinergiasDescubiertas };
    localStorage.setItem("clickerLoreSave", JSON.stringify(data));
}

function cargar() {
    const data = JSON.parse(localStorage.getItem("clickerLoreSave"));
    if (data) {
        clicks = data.clicks || 0;
        prestigios = data.prestigios || 0;
        inventario = data.inventario || [];
        equipadas = data.equipadas || [];
        bonusMejoras = data.bonusMejoras || 0;
        mascotasDescubiertas = data.mascotasDescubiertas || [];
        sinergiasDescubiertas = data.sinergiasDescubiertas || [];
        if (mascotasDescubiertas.length >= 10) COSTO_RULETA = 80;
    }
}

cargar();
actualizarUI();