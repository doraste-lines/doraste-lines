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
// Grab all existing boxes on the page
const allBoxes = Array.from(document.querySelectorAll(".box"));

// Where results will be displayed
const searchResultsContainer = document.querySelector(".search-results");

// Input field
const searchInput = document.getElementById("searchInput");

// Initial load: show all
renderResults(allBoxes);

// Listen to search typing
searchInput.addEventListener("input", function() {
  const term = this.value.toLowerCase().trim();

  if (term === "") {
    renderResults(allBoxes);
    return;
  }

  // Filter by alt text or data-title or video src
  const filtered = allBoxes.filter(box => {
    let text = "";

    // Image
    const img = box.querySelector("img");
    if (img && img.alt) text += img.alt.toLowerCase();

    // Video
    const video = box.querySelector("video");
    if (video && video.src) text += video.src.toLowerCase();

    // Custom tags
    if (box.dataset.title) text += box.dataset.title.toLowerCase();

    return text.includes(term);
  });

  renderResults(filtered);
});

// Render the boxes inside search grid
function renderResults(items) {
  searchResultsContainer.innerHTML = "";
  items.forEach(item => searchResultsContainer.appendChild(item));
                                       }
  

