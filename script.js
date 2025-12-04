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
// --- Show Search Page ---
function showSearch() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('search').classList.add('active');
}

// --- Auto-detect tags from alt text ---
function initSearchPage() {
  const boxes = [...document.querySelectorAll('#images .box, #videos .box')];
  const tagCounts = {};
  const resultsContainer = document.getElementById('searchResults');
  const tagListContainer = document.getElementById('tagList');

  // Extract words from alt text
  boxes.forEach(box => {
    const alt = (box.querySelector('img')?.alt || box.querySelector('video')?.alt || '').toLowerCase();
    const words = alt.match(/\b[a-z]{3,}\b/g); // words with 3+ letters
    if(!words) return;

    box.dataset.tags = words.join(' ');
    words.forEach(w => tagCounts[w] = (tagCounts[w] || 0) + 1);
  });

  // Sort tags: meaningful first, then by frequency
  const meaningful = ['motivation','inspiration','poem','faith','space','time','life','history','work','blessing','dream','love','nature','journey','hope'];
  const allTags = Object.keys(tagCounts).sort((a,b)=>{
    if(meaningful.includes(a) && !meaningful.includes(b)) return -1;
    if(!meaningful.includes(a) && meaningful.includes(b)) return 1;
    return tagCounts[b]-tagCounts[a];
  }).slice(0, 15); // top 15 tags

  // Display tags
  allTags.forEach(tag=>{
    const btn = document.createElement('button');
    btn.textContent = tag;
    btn.onclick = () => filterResults(tag);
    tagListContainer.appendChild(btn);
  });

  // Display all boxes initially
  boxes.forEach(box => resultsContainer.appendChild(box.cloneNode(true)));

  // Filter function
  function filterResults(tag){
    resultsContainer.innerHTML = '';
    const filtered = boxes.filter(box => box.dataset.tags.includes(tag.toLowerCase()));
    if(filtered.length === 0) {
      resultsContainer.innerHTML = `<p>No results found for "${tag}"</p>`;
      return;
    }
    filtered.forEach(box => resultsContainer.appendChild(box.cloneNode(true)));
  }

  // Search input
  document.getElementById('searchInput').addEventListener('input', function(){
    const term = this.value.toLowerCase();
    if(!term) {
      resultsContainer.innerHTML = '';
      boxes.forEach(box => resultsContainer.appendChild(box.cloneNode(true)));
      return;
    }
    const filtered = boxes.filter(box => box.dataset.tags.includes(term));
    resultsContainer.innerHTML = '';
    if(filtered.length===0){
      resultsContainer.innerHTML = `<p>No results found for "${term}"</p>`;
      return;
    }
    filtered.forEach(box => resultsContainer.appendChild(box.cloneNode(true)));
  });
}

// Initialize after DOM loaded
window.addEventListener('DOMContentLoaded', initSearchPage);
