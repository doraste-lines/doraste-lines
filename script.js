// Home/About
function showAbout() {
  document.getElementById("home").classList.remove("active");
  document.getElementById("about").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() {
  document.getElementById("about").classList.remove("active");
  document.getElementById("home").classList.add("active");
  shuffleMedia("images");
  shuffleMedia("videos");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Tabs
function showTab(tab) {
  const images = document.getElementById("images");
  const videos = document.getElementById("videos");
  const tabs = document.querySelectorAll(".tab-btn");
  
  if (tab === "images") {
    images.classList.add("active");
    videos.classList.remove("active");
  } else {
    videos.classList.add("active");
    images.classList.remove("active");
  }

  tabs.forEach(btn => btn.classList.remove("active"));
  if (tab === "images") tabs[0].classList.add("active");
  else tabs[1].classList.add("active");
}

// Shuffle Function
function shuffleMedia(sectionId) {
  const container = document.getElementById(sectionId);
  const boxes = Array.from(container.children);
  const shuffled = boxes.sort(() => Math.random() - 0.5);
  container.innerHTML = "";
  shuffled.forEach(box => container.appendChild(box));
}

// Video Modal
function openModal(el) {
  const modal = document.getElementById("modal");
  const modalVideo = document.getElementById("modal-video");

  if (el.querySelector("video")) {
    modalVideo.src = el.querySelector("video source").src;
    modal.style.display = "flex";
    modalVideo.style.display = "block";
    modalVideo.play();
  }
}

function closeModal() {
  const modal = document.getElementById("modal");
  const modalVideo = document.getElementById("modal-video");
  modal.style.display = "none";
  modalVideo.pause();
  modalVideo.src = "";
}

// Video Hover Preview
document.querySelectorAll("#videos .box video").forEach(video => {
  video.parentElement.addEventListener("mouseenter", () => {
    video.currentTime = 0;
    video.muted = true;
    video.play();
  });
  video.parentElement.addEventListener("mouseleave", () => {
    video.pause();
    video.currentTime = 0;
  });
});

// Shuffle on Load
window.addEventListener("DOMContentLoaded", () => {
  shuffleMedia("images");
  shuffleMedia("videos");
});

// Light/Dark Mode Toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
  const toggleBtn = document.querySelector(".theme-toggle");
  toggleBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// Back to Top
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  if (window.scrollY > 200) backToTop.style.display = "block";
  else backToTop.style.display = "none";
});
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
// ===== GET DATA =====
const imgItems = [...document.querySelectorAll(".grid-item img")];
const searchInput = document.querySelector(".search-input");
const tagsContainer = document.querySelector(".tags-container");
const grid = document.querySelector(".grid");
const noResults = document.querySelector(".no-results");
const backBtn = document.querySelector(".back-btn");

// ===== UTILS =====
function normalize(text) {
  return text.toLowerCase().trim();
}

// Extract & count all tag occurrences from alt text
function getAllTags() {
  const map = {};

  imgItems.forEach(img => {
    const words = normalize(img.alt).split(/\s+/);

    words.forEach(w => {
      if (!map[w]) map[w] = 0;
      map[w]++;
    });
  });

  // Turn object to array and sort by frequency
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(v => v[0]);
}

// Generate tags UI
function renderTags() {
  const tags = getAllTags().slice(0, 15); // top 15 only
  tagsContainer.innerHTML = "";

  tags.forEach(tag => {
    const el = document.createElement("div");
    el.className = "tag-item";
    el.textContent = tag;
    el.dataset.tag = tag;

    el.addEventListener("click", () => {
      searchInput.value = "";
      filterByTag(tag);

      document.querySelectorAll(".tag-item").forEach(b => b.classList.remove("active"));
      el.classList.add("active");
    });

    tagsContainer.appendChild(el);
  });
}

// Filter by tag (fuzzy)
function filterByTag(tag) {
  let count = 0;

  imgItems.forEach(img => {
    const match = normalize(img.alt).includes(tag.toLowerCase());
    img.parentElement.style.display = match ? "block" : "none";
    if (match) count++;
  });

  showOrHideEmpty(count);
}

// Search by input
function filterBySearch(text) {
  text = normalize(text);
  let count = 0;

  imgItems.forEach(img => {
    const match = normalize(img.alt).includes(text);
    img.parentElement.style.display = match ? "block" : "none";
    if (match) count++;
  });

  showOrHideEmpty(count);
}

// Show "no results"
function showOrHideEmpty(count) {
  if (count === 0) {
    noResults.style.display = "block";
  } else {
    noResults.style.display = "none";
  }
}

// Become live search
searchInput.addEventListener("input", e => {
  const value = e.target.value;

  document.querySelectorAll(".tag-item").forEach(b => b.classList.remove("active"));

  if (!value.trim()) {
    // reset all items
    imgItems.forEach(img => img.parentElement.style.display = "block");
    noResults.style.display = "none";
    return;
  }

  filterBySearch(value);
});

// ===== BACK BUTTON =====
if (window.location.pathname.includes("search")) {
  backBtn.style.display = "block";
  backBtn.addEventListener("click", () => {
    window.location.href = "/";
  });
}

// ===== INIT =====
renderTags();
