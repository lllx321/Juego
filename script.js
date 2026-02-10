// ====== Estado del juego ======
let game = {
  coins: 0,
  rebirths: 0,
  inventoryLimit: 20,
  inventory: [],
  equipped: [],
};

// ====== Datos de mascotas ======
const rarities = [
  { name: "Común", chance: 60, bonus: 0.1 },
  { name: "Raro", chance: 25, bonus: 0.3 },
  { name: "Épico", chance: 10, bonus: 1 },
  { name: "Legendario", chance: 5, bonus: 3 },
];

// ====== Utilidades ======
function saveGame() {
  localStorage.setItem("clickerGame", JSON.stringify(game));
}

function loadGame() {
  const data = localStorage.getItem("clickerGame");
  if (data) game = JSON.parse(data);
}

function getRebirthMultiplier() {
  return 1 + game.rebirths * 0.5;
}

function getPetsBonus() {
  return game.equipped.reduce((sum, p) => sum + p.bonus, 0);
}

function getTotalMultiplier() {
  return (1 + getPetsBonus()) * getRebirthMultiplier();
}

// ====== Click ======
document.getElementById("clickBtn").addEventListener("click", () => {
  const gain = 1 * getTotalMultiplier();
  game.coins += gain;
  updateUI();
  saveGame();
});

// ====== Rebirth ======
document.getElementById("rebirthBtn").addEventListener("click", () => {
  if (game.coins >= 10000) {
    game.coins = 0;
    game.rebirths += 1;
    game.inventory = [];
    game.equipped = [];
    updateUI();
    saveGame();
  } else {
    alert("Necesitas 10000 monedas para rebirth.");
  }
});

// ====== Ruleta ======
function spin(times) {
  let spins = times === "MAX" ? Math.floor(game.coins / 10) : times;
  if (spins <= 0) return;

  for (let i = 0; i < spins; i++) {
    if (game.inventory.length >= game.inventoryLimit) break;
    rollPet();
  }

  updateUI();
  saveGame();
}

function rollPet() {
  const roll = Math.random() * 100;
  let acc = 0;
  let rarity = rarities[0];

  for (let r of rarities) {
    acc += r.chance;
    if (roll <= acc) {
      rarity = r;
      break;
    }
  }

  const pet = {
    id: Date.now() + Math.random(),
    name: "Mascota " + rarity.name,
    rarity: rarity.name,
    bonus: rarity.bonus,
    level: 1,
  };

  game.inventory.push(pet);
}

// ====== Equipar ======
function equipPet(id) {
  if (game.equipped.length >= 3) {
    alert("Solo puedes equipar 3 mascotas.");
    return;
  }
  const idx = game.inventory.findIndex(p => p.id === id);
  if (idx !== -1) {
    const pet = game.inventory.splice(idx, 1)[0];
    game.equipped.push(pet);
    updateUI();
    saveGame();
  }
}

function unequipPet(id) {
  const idx = game.equipped.findIndex(p => p.id === id);
  if (idx !== -1) {
    const pet = game.equipped.splice(idx, 1)[0];
    game.inventory.push(pet);
    updateUI();
    saveGame();
  }
}

function equipBest() {
  // devolver todo al inventario
  game.inventory = game.inventory.concat(game.equipped);
  game.equipped = [];

  // ordenar por bonus
  game.inventory.sort((a, b) => b.bonus - a.bonus);

  // equipar los 3 mejores
  while (game.equipped.length < 3 && game.inventory.length > 0) {
    game.equipped.push(game.inventory.shift());
  }

  updateUI();
  saveGame();
}

// ====== Fusión ======
function fusePets() {
  if (game.inventory.length < 2) {
    alert("Necesitas al menos 2 mascotas en el inventario.");
    return;
  }

  const p1 = game.inventory.shift();
  const p2 = game.inventory.shift();

  const newPet = {
    id: Date.now() + Math.random(),
    name: "Fusión",
    rarity: p1.rarity,
    bonus: p1.bonus + p2.bonus,
    level: (p1.level || 1) + (p2.level || 1),
  };

  game.inventory.push(newPet);
  updateUI();
  saveGame();
}

// ====== UI ======
function updateUI() {
  document.getElementById("coins").textContent = Math.floor(game.coins);
  document.getElementById("rebirths").textContent = game.rebirths;
  document.getElementById("multiplier").textContent = getTotalMultiplier().toFixed(2);
  document.getElementById("invCount").textContent = game.inventory.length;
  document.getElementById("invLimit").textContent = game.inventoryLimit;

  const invDiv = document.getElementById("inventory");
  invDiv.innerHTML = "";
  game.inventory.forEach(p => {
    const d = document.createElement("div");
    d.className = "pet";
    d.innerHTML = `
      <strong>${p.name}</strong> [${p.rarity}]<br>
      Bonus: +${p.bonus}<br>
      <button onclick="equipPet(${p.id})">Equipar</button>
    `;
    invDiv.appendChild(d);
  });

  const eqDiv = document.getElementById("equippedPets");
  eqDiv.innerHTML = "";
  game.equipped.forEach(p => {
    const d = document.createElement("div");
    d.className = "pet equipped";
    d.innerHTML = `
      <strong>${p.name}</strong> [${p.rarity}]<br>
      Bonus: +${p.bonus}<br>
      <button onclick="unequipPet(${p.id})">Quitar</button>
    `;
    eqDiv.appendChild(d);
  });
}

// ====== Init ======
loadGame();
updateUI();
