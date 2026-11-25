
const STORAGE_KEY = "materNutriRefeicoes";

const modal = document.getElementById("meal-modal");
const form = document.getElementById("meal-form");
const mealList = document.getElementById("meal-list");
const searchInput = document.getElementById("search-meal");
const dateFilter = document.getElementById("filter-date");

let meals = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

document.getElementById("meal-date").value = getLocalDate();
dateFilter.value = getLocalDate();

function saveMeals() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
}

function openModal() {
  form.reset();
  document.getElementById("meal-date").value = getLocalDate();
  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
}

document.getElementById("new-meal").addEventListener("click", openModal);
document.getElementById("empty-new-meal").addEventListener("click", openModal);
document.getElementById("close-modal").addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const meal = {
    id: Date.now(),
    name: document.getElementById("meal-name").value,
    foods: document.getElementById("food-name").value.trim(),
    date: document.getElementById("meal-date").value,
    time: document.getElementById("meal-time").value,
    notes: document.getElementById("meal-notes").value.trim()
  };

  meals.push(meal);
  saveMeals();

  dateFilter.value = meal.date;
  searchInput.value = "";

  closeModal();
  renderMeals();
});

function formatDate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function renderMeals() {
  const search = searchInput.value.toLowerCase().trim();
  const selectedDate = dateFilter.value;

  const filteredMeals = meals
    .filter((meal) => {
      const matchesSearch =
        meal.name.toLowerCase().includes(search) ||
        meal.foods.toLowerCase().includes(search) ||
        meal.notes.toLowerCase().includes(search);

      const matchesDate = !selectedDate || meal.date === selectedDate;

      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      return `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`);
    });

  mealList.innerHTML = "";

  if (filteredMeals.length === 0) {
    mealList.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚒</div>
        <h3>Nenhuma refeição encontrada</h3>
        <p>Registre uma refeição ou altere os filtros para consultar seu diário.</p>
        <button class="primary-button" id="empty-new-meal">＋ Nova refeição</button>
      </div>
    `;

    document.getElementById("empty-new-meal").addEventListener("click", openModal);
    return;
  }

  filteredMeals.forEach((meal) => {
    const card = document.createElement("article");
    card.className = "meal-card";

    const title = document.createElement("h3");
    title.textContent = meal.name;

    const date = document.createElement("p");
    date.textContent = `📅 ${formatDate(meal.date)} às ${meal.time}`;

    const foods = document.createElement("p");
    foods.textContent = `🍽 ${meal.foods}`;

    card.append(title, date, foods);

    if (meal.notes) {
      const notes = document.createElement("p");
      notes.textContent = `Observações: ${meal.notes}`;
      card.appendChild(notes);
    }

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.textContent = "Excluir refeição";

    deleteButton.addEventListener("click", () => {
      if (confirm("Deseja realmente excluir esta refeição?")) {
        meals = meals.filter((item) => item.id !== meal.id);
        saveMeals();
        renderMeals();
      }
    });

    card.appendChild(deleteButton);
    mealList.appendChild(card);
  });
}

searchInput.addEventListener("input", renderMeals);
dateFilter.addEventListener("change", renderMeals);

document.getElementById("show-all").addEventListener("click", () => {
  dateFilter.value = "";
  searchInput.value = "";
  renderMeals();
});

renderMeals();
