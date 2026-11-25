
const STORAGE_KEY = "materNutriSuplementos";

const modal = document.getElementById("supplement-modal");
const form = document.getElementById("supplement-form");
const list = document.getElementById("supplement-list");

let supplements = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentStatus = "ativo";

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function saveSupplements() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(supplements));
}

function formatDate(date) {
  if (!date) return "";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function openModal() {
  form.reset();
  document.getElementById("supplement-start").value = getLocalDate();
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
}

document.getElementById("new-supplement")
  .addEventListener("click", openModal);

document.getElementById("close-modal")
  .addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const supplement = {
    id: Date.now(),
    name: document.getElementById("supplement-name").value.trim(),
    dose: document.getElementById("supplement-dose").value.trim(),
    frequency: document.getElementById("supplement-frequency").value,
    time: document.getElementById("supplement-time").value,
    start: document.getElementById("supplement-start").value,
    notes: document.getElementById("supplement-notes").value.trim(),
    status: "ativo"
  };

  supplements.push(supplement);

  saveSupplements();
  closeModal();
  currentStatus = "ativo";
  updateTabs();
  renderSupplements();
});

function updateTabs() {
  const activeCount = supplements.filter(
    item => item.status === "ativo"
  ).length;

  const pausedCount = supplements.filter(
    item => item.status === "pausado"
  ).length;

  document.getElementById("active-count").textContent = activeCount;
  document.getElementById("paused-count").textContent = pausedCount;

  document.getElementById("tab-active").classList.toggle(
    "active",
    currentStatus === "ativo"
  );

  document.getElementById("tab-paused").classList.toggle(
    "active",
    currentStatus === "pausado"
  );
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    currentStatus = tab.dataset.status;
    updateTabs();
    renderSupplements();
  });
});

function renderSupplements() {
  updateTabs();

  const filtered = supplements.filter(
    item => item.status === currentStatus
  );

  list.innerHTML = "";

  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";

    const icon = document.createElement("div");
    icon.className = "empty-icon";
    icon.textContent = "♢";

    const title = document.createElement("h3");
    title.textContent = currentStatus === "ativo"
      ? "Nenhum suplemento aqui"
      : "Nenhum suplemento pausado";

    const description = document.createElement("p");
    description.textContent = currentStatus === "ativo"
      ? "Cadastre vitaminas e suplementos orientados pelo profissional de saúde."
      : "Os suplementos que você pausar aparecerão aqui.";

    empty.append(icon, title, description);

    if (currentStatus === "ativo") {
      const button = document.createElement("button");
      button.className = "primary-button";
      button.textContent = "＋ Novo suplemento";
      button.addEventListener("click", openModal);
      empty.appendChild(button);
    }

    list.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "supplement-card";

    const title = document.createElement("h3");
    title.textContent = item.name;

    const dose = document.createElement("p");
    dose.textContent = `Dose orientada: ${item.dose}`;

    const frequency = document.createElement("p");
    frequency.textContent = `Frequência: ${item.frequency}`;

    const start = document.createElement("p");
    start.textContent = `Data de início: ${formatDate(item.start)}`;

    card.append(title, dose, frequency, start);

    if (item.time) {
      const time = document.createElement("p");
      time.textContent = `Horário registrado: ${item.time}`;
      card.appendChild(time);
    }

    if (item.notes) {
      const notes = document.createElement("p");
      notes.textContent = `Observações: ${item.notes}`;
      card.appendChild(notes);
    }

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const toggleButton = document.createElement("button");
    toggleButton.className = "action-button";
    toggleButton.textContent = currentStatus === "ativo"
      ? "Pausar suplemento"
      : "Retomar suplemento";

    toggleButton.addEventListener("click", () => {
      const message = currentStatus === "ativo"
        ? "Deseja marcar este suplemento como pausado?"
        : "Deseja marcar este suplemento como em uso?";

      if (confirm(message)) {
        item.status = currentStatus === "ativo"
          ? "pausado"
          : "ativo";

        saveSupplements();
        renderSupplements();
      }
    });

    const deleteButton = document.createElement("button");
    deleteButton.className = "action-button delete";
    deleteButton.textContent = "Excluir";

    deleteButton.addEventListener("click", () => {
      if (confirm("Deseja realmente excluir este suplemento?")) {
        supplements = supplements.filter(
          supplement => supplement.id !== item.id
        );

        saveSupplements();
        renderSupplements();
      }
    });

    actions.append(toggleButton, deleteButton);
    card.appendChild(actions);
    list.appendChild(card);
  });
}

renderSupplements();
