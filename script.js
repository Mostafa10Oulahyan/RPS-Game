// API Configuration
const API_BASE_URL = "https://api.quran.com/api/v4";

// State
let allSurahs = [];
let filteredSurahs = [];
let currentPage = 1;
const surahsPerPage = 5;

// Reciter mapping (using actual audio slugs from Islamic Network API)
const reciterMap = {
  AbdulBaset_AbdulSamad: {
    slug: "ar.abdulbasitmurattal",
    name: "AbdulBaset AbdulSamad",
  },
  Abdul_Basit_Murattal: {
    slug: "ar.abdulbasitmurattal",
    name: "Abdul Basit Murattal",
  },
  "Abdur_Rahman_as-Sudais": {
    slug: "ar.abdurrahmaansudais",
    name: "Abdur-Rahman as-Sudais",
  },
  Mishary_Rashid_Alafasy: {
    slug: "ar.alafasy",
    name: "Mishary Rashid Alafasy",
  },
  "Sa'ud_ash-Shuraym": { slug: "ar.shaatree", name: "Sa'ud ash-Shuraym" },
};

// DOM Elements
const surahContainer = document.getElementById("surahContainer");
const loadingEl = document.getElementById("loading");
const errorEl = document.getElementById("error");
const searchInput = document.getElementById("searchInput");
const reciterSelect = document.getElementById("reciterSelect");
const sortSelect = document.getElementById("sortSelect");
const surpriseBtn = document.getElementById("surpriseBtn");
const surpriseModal = document.getElementById("surpriseModal");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNumbers = document.getElementById("pageNumbers");
const reciterNameEl = document.getElementById("reciterName");

// Initialize
async function init() {
  await loadSurahs();
  setupEventListeners();
}

// Load Surahs from API
async function loadSurahs() {
  try {
    loadingEl.style.display = "block";
    errorEl.style.display = "none";

    const response = await fetch(`${API_BASE_URL}/chapters`);
    if (!response.ok) throw new Error("Failed to fetch surahs");

    const data = await response.json();
    allSurahs = data.chapters;
    filteredSurahs = [...allSurahs];

    loadingEl.style.display = "none";
    renderSurahs();
    renderPagination();
  } catch (error) {
    console.error("Error loading surahs:", error);
    loadingEl.style.display = "none";
    errorEl.style.display = "block";
    errorEl.textContent =
      "Erreur lors du chargement des sourates. Veuillez réessayer.";
  }
}

// Render Surahs for current page
function renderSurahs() {
  const startIndex = (currentPage - 1) * surahsPerPage;
  const endIndex = startIndex + surahsPerPage;
  const surahsToDisplay = filteredSurahs.slice(startIndex, endIndex);

  surahContainer.innerHTML = "";

  surahsToDisplay.forEach((surah) => {
    const card = createSurahCard(surah);
    surahContainer.appendChild(card);
  });

  updatePaginationButtons();
}

// Create Surah Card
function createSurahCard(surah) {
  const card = document.createElement("div");
  card.className = "surah-card";

  const selectedReciter = reciterSelect.value;
  const reciterInfo = reciterMap[selectedReciter];
  const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${reciterInfo.slug}/${surah.id}.mp3`;

  card.innerHTML = `
        <div class="surah-header">
            <div class="surah-number">${surah.id}</div>
            <div class="surah-info">
                <div class="surah-name-ar">${surah.name_arabic}</div>
                <div class="surah-name-en">${surah.name_simple} - ${surah.translated_name.name}</div>
            </div>
            <div class="surah-meta">
                ${surah.verses_count} versets · Sourate n°${surah.id}
            </div>
        </div>
        <div class="audio-player">
            <audio controls preload="none">
                <source src="${audioUrl}" type="audio/mpeg">
                Votre navigateur ne supporte pas l'élément audio.
            </audio>
        </div>
    `;

  return card;
}

// Render Pagination
function renderPagination() {
  const totalPages = Math.ceil(filteredSurahs.length / surahsPerPage);
  pageNumbers.innerHTML = "";

  // Show max 7 page numbers
  let startPage = Math.max(1, currentPage - 3);
  let endPage = Math.min(totalPages, startPage + 6);

  if (endPage - startPage < 6) {
    startPage = Math.max(1, endPage - 6);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("div");
    pageBtn.className = "page-number";
    if (i === currentPage) pageBtn.classList.add("active");
    pageBtn.textContent = i;
    pageBtn.addEventListener("click", () => goToPage(i));
    pageNumbers.appendChild(pageBtn);
  }
}

// Update Pagination Buttons
function updatePaginationButtons() {
  const totalPages = Math.ceil(filteredSurahs.length / surahsPerPage);
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Go to Page
function goToPage(page) {
  currentPage = page;
  renderSurahs();
  renderPagination();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Search Surahs
function searchSurahs(query) {
  const searchTerm = query.toLowerCase().trim();

  if (searchTerm === "") {
    filteredSurahs = [...allSurahs];
  } else {
    filteredSurahs = allSurahs.filter(
      (surah) =>
        surah.name_simple.toLowerCase().includes(searchTerm) ||
        surah.name_arabic.includes(searchTerm) ||
        surah.translated_name.name.toLowerCase().includes(searchTerm) ||
        surah.id.toString() === searchTerm
    );
  }

  currentPage = 1;
  renderSurahs();
  renderPagination();
}

// Sort Surahs by Length
function sortSurahs(sortType) {
  if (sortType === "shortest") {
    filteredSurahs.sort((a, b) => a.verses_count - b.verses_count);
  } else if (sortType === "longest") {
    filteredSurahs.sort((a, b) => b.verses_count - a.verses_count);
  } else {
    filteredSurahs.sort((a, b) => a.id - b.id);
  }

  currentPage = 1;
  renderSurahs();
  renderPagination();
}

// Show Random Surah
function showSurpriseSurah() {
  const randomSurah = allSurahs[Math.floor(Math.random() * allSurahs.length)];
  const alafasyReciter = reciterMap["Mishary_Rashid_Alafasy"];
  const audioUrl = `https://cdn.islamic.network/quran/audio-surah/128/${alafasyReciter.slug}/${randomSurah.id}.mp3`;

  document.getElementById(
    "surpriseNumber"
  ).textContent = `${randomSurah.id}. ${randomSurah.name_arabic}`;
  document.getElementById("surpriseName").textContent =
    randomSurah.translated_name.name;
  document.getElementById("surpriseReciter").textContent = alafasyReciter.name;
  document.getElementById(
    "surpriseVerses"
  ).textContent = `${randomSurah.verses_count} versets · Sourate n°${randomSurah.id}`;

  const audio = document.getElementById("surpriseAudio");
  audio.src = audioUrl;

  surpriseModal.classList.add("show");
}

// Setup Event Listeners
function setupEventListeners() {
  // Search
  searchInput.addEventListener("input", (e) => {
    searchSurahs(e.target.value);
  });

  // Reciter Change
  reciterSelect.addEventListener("change", (e) => {
    const reciterInfo = reciterMap[e.target.value];
    reciterNameEl.textContent = reciterInfo.name;
    renderSurahs(); // Re-render to update audio sources
  });

  // Sort Change
  sortSelect.addEventListener("change", (e) => {
    sortSurahs(e.target.value);
  });

  // Surprise Button
  surpriseBtn.addEventListener("click", showSurpriseSurah);

  // Modal Close
  surpriseModal.addEventListener("click", (e) => {
    if (e.target === surpriseModal) {
      surpriseModal.classList.remove("show");
      const audio = document.getElementById("surpriseAudio");
      audio.pause();
    }
  });

  // Pagination
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  });

  nextBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredSurahs.length / surahsPerPage);
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  });
}

// Start the app
init();
