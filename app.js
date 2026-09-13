// Liner Notes — 앨범/싱글/EP/곡 리뷰 & 해석 다이어리
// 데이터는 전부 브라우저 localStorage에 저장됩니다 (서버 없음).

const STORAGE_KEY = "liner-notes-entries";

const TYPE_LABEL = {
  album: "앨범",
  ep: "EP",
  single: "싱글",
  song: "곡",
};

/** @typedef {{id:string, type:string, artist:string, title:string, year:string, cover:string, rating:number, review:string, interpretation:string, createdAt:number}} Entry */

/** @type {Entry[]} */
let entries = loadEntries();
let currentFilter = "all";
let currentSearch = "";
let editingId = null;

// ---------- storage ----------

function loadEntries() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("저장된 데이터를 불러오지 못했습니다.", e);
  }
  return seedEntries();
}

function saveEntries() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// 처음 방문한 사람도 빈 화면 대신 예시를 볼 수 있도록 샘플 몇 개를 넣어둔다.
function seedEntries() {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      type: "album",
      artist: "실리카겔",
      title: "Machine Boy",
      year: "2023",
      cover: "",
      rating: 5,
      review: "기계적인 사운드와 인간적인 가사가 부딪히면서 만들어내는 긴장감이 이 앨범의 전부다.",
      interpretation:
        "제목 그대로 '기계 소년'이라는 화자를 통해 감정을 억누르고 효율만을 요구받는 현대인을 은유한다. 신스와 기타가 뒤섞이는 사운드 자체가 인간과 기계의 경계가 흐려지는 것을 표현하는 듯하다.",
      createdAt: now - 3000,
    },
    {
      id: crypto.randomUUID(),
      type: "song",
      artist: "잔나비",
      title: "주저하는 연인들을 위해",
      year: "2018",
      cover: "",
      rating: 5,
      review: "고백하지 못하는 마음을 이렇게 섬세하게 그릴 수 있을까.",
      interpretation:
        "'우리는 왜 이렇게 됐을까'라는 구절이 반복되며, 확신 없는 관계 속에서도 서로를 놓지 못하는 두 사람의 심리를 시간의 흐름(사계절)에 빗대어 표현한다.",
      createdAt: now - 2000,
    },
    {
      id: crypto.randomUUID(),
      type: "ep",
      artist: "Oasis",
      title: "(What's the Story) Morning Glory?",
      year: "1995",
      cover: "",
      rating: 4,
      review: "브릿팝의 정석. 청춘의 낙관과 허세가 동시에 느껴진다.",
      interpretation: "",
      createdAt: now - 1000,
    },
  ];
}

// ---------- DOM refs ----------

const grid = document.getElementById("entry-grid");
const emptyState = document.getElementById("empty-state");
const searchInput = document.getElementById("search");
const filtersEl = document.getElementById("filters");
const newEntryBtn = document.getElementById("new-entry-btn");

const modalBackdrop = document.getElementById("modal-backdrop");
const modalTitle = document.getElementById("modal-title");
const entryForm = document.getElementById("entry-form");
const deleteBtn = document.getElementById("delete-btn");
const cancelBtn = document.getElementById("cancel-btn");
const modalClose = document.getElementById("modal-close");
const ratingInput = document.getElementById("rating-input");

const detailBackdrop = document.getElementById("detail-backdrop");
const detailTitle = document.getElementById("detail-title");
const detailBody = document.getElementById("detail-body");
const detailClose = document.getElementById("detail-close");
const detailEditBtn = document.getElementById("detail-edit-btn");

let detailEntryId = null;

// ---------- rendering ----------

function render() {
  const filtered = entries
    .filter((e) => currentFilter === "all" || e.type === currentFilter)
    .filter((e) => {
      if (!currentSearch) return true;
      const q = currentSearch.toLowerCase();
      return (
        e.artist.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  emptyState.classList.toggle("hidden", entries.length > 0);
  grid.innerHTML = "";

  filtered.forEach((entry) => {
    grid.appendChild(renderCard(entry));
  });
}

function renderCard(entry) {
  const card = document.createElement("article");
  card.className = "entry-card";
  card.addEventListener("click", () => openDetail(entry.id));

  const cover = document.createElement("div");
  cover.className = "entry-cover";
  if (entry.cover) {
    const img = document.createElement("img");
    img.src = entry.cover;
    img.alt = `${entry.artist} - ${entry.title}`;
    img.onerror = () => { cover.innerHTML = "🎵"; };
    cover.appendChild(img);
  } else {
    cover.textContent = "🎵";
  }

  const body = document.createElement("div");
  body.className = "entry-body";
  body.innerHTML = `
    <span class="entry-type-badge type-${entry.type}">${TYPE_LABEL[entry.type]}</span>
    <span class="entry-artist">${escapeHtml(entry.artist)}${entry.year ? ` · ${escapeHtml(entry.year)}` : ""}</span>
    <span class="entry-title">${escapeHtml(entry.title)}</span>
    <span class="entry-stars">${starString(entry.rating)}</span>
    ${entry.review ? `<span class="entry-review-snippet">${escapeHtml(entry.review)}</span>` : ""}
  `;

  card.appendChild(cover);
  card.appendChild(body);
  return card;
}

function starString(rating) {
  const n = Number(rating) || 0;
  return "★".repeat(n) + "☆".repeat(5 - n);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// ---------- filters & search ----------

filtersEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".chip");
  if (!btn) return;
  filtersEl.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  render();
});

searchInput.addEventListener("input", (e) => {
  currentSearch = e.target.value.trim();
  render();
});

// ---------- write/edit modal ----------

function openModal(entry = null) {
  editingId = entry ? entry.id : null;
  modalTitle.textContent = entry ? "글 수정하기" : "새 글쓰기";
  deleteBtn.classList.toggle("hidden", !entry);

  document.getElementById("entry-id").value = entry?.id ?? "";
  document.getElementById("type").value = entry?.type ?? "album";
  document.getElementById("year").value = entry?.year ?? "";
  document.getElementById("artist").value = entry?.artist ?? "";
  document.getElementById("title").value = entry?.title ?? "";
  document.getElementById("cover").value = entry?.cover ?? "";
  document.getElementById("review").value = entry?.review ?? "";
  document.getElementById("interpretation").value = entry?.interpretation ?? "";
  setRating(entry?.rating ?? 0);

  modalBackdrop.classList.remove("hidden");
  document.getElementById("artist").focus();
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  entryForm.reset();
  editingId = null;
}

newEntryBtn.addEventListener("click", () => openModal());
cancelBtn.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

// star rating widget
function setRating(value) {
  ratingInput.dataset.value = value;
  [...ratingInput.querySelectorAll(".star")].forEach((star) => {
    star.classList.toggle("filled", Number(star.dataset.value) <= value);
  });
}

ratingInput.addEventListener("click", (e) => {
  const star = e.target.closest(".star");
  if (!star) return;
  setRating(Number(star.dataset.value));
});

entryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const entry = {
    id: editingId ?? crypto.randomUUID(),
    type: document.getElementById("type").value,
    year: document.getElementById("year").value.trim(),
    artist: document.getElementById("artist").value.trim(),
    title: document.getElementById("title").value.trim(),
    cover: document.getElementById("cover").value.trim(),
    rating: Number(ratingInput.dataset.value) || 0,
    review: document.getElementById("review").value.trim(),
    interpretation: document.getElementById("interpretation").value.trim(),
    createdAt: editingId
      ? entries.find((e) => e.id === editingId)?.createdAt ?? Date.now()
      : Date.now(),
  };

  if (editingId) {
    entries = entries.map((e) => (e.id === editingId ? entry : e));
  } else {
    entries.push(entry);
  }

  saveEntries();
  closeModal();
  render();
});

deleteBtn.addEventListener("click", () => {
  if (!editingId) return;
  if (!confirm("이 글을 삭제할까요? 되돌릴 수 없어요.")) return;
  entries = entries.filter((e) => e.id !== editingId);
  saveEntries();
  closeModal();
  render();
});

// ---------- detail modal ----------

function openDetail(id) {
  const entry = entries.find((e) => e.id === id);
  if (!entry) return;
  detailEntryId = id;

  detailTitle.textContent = `${entry.artist} — ${entry.title}`;
  detailBody.innerHTML = `
    ${entry.cover ? `<img class="detail-cover" src="${entry.cover}" alt="${escapeHtml(entry.title)}" />` : ""}
    <div class="detail-meta">
      <span class="entry-type-badge type-${entry.type}">${TYPE_LABEL[entry.type]}</span>
      ${entry.year ? `<span class="entry-artist">${escapeHtml(entry.year)}</span>` : ""}
      <span class="entry-stars">${starString(entry.rating)}</span>
    </div>
    ${entry.review ? `<div class="detail-section"><h3>감상평</h3><p>${escapeHtml(entry.review)}</p></div>` : ""}
    ${entry.interpretation ? `<div class="detail-section"><h3>해석</h3><p>${escapeHtml(entry.interpretation)}</p></div>` : ""}
    ${!entry.review && !entry.interpretation ? `<p style="color:var(--text-dim)">아직 작성된 감상평/해석이 없어요.</p>` : ""}
  `;

  detailBackdrop.classList.remove("hidden");
}

function closeDetail() {
  detailBackdrop.classList.add("hidden");
  detailEntryId = null;
}

detailClose.addEventListener("click", closeDetail);
detailBackdrop.addEventListener("click", (e) => {
  if (e.target === detailBackdrop) closeDetail();
});

detailEditBtn.addEventListener("click", () => {
  const entry = entries.find((e) => e.id === detailEntryId);
  closeDetail();
  if (entry) openModal(entry);
});

// ---------- init ----------

render();
