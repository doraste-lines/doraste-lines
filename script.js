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
function openModal(element) {
  const modal = document.getElementById('modal');
  const modalContent = modal.querySelector('.modal-content');
  const modalVideo = modal.querySelector('video#modal-video');

  // Clear previous content
  modalContent.querySelectorAll('img, video').forEach(el => el.remove());

  if (element.querySelector('img')) {
    // IMAGE
    const img = document.createElement('img');
    img.src = element.querySelector('img').src;
    img.alt = element.querySelector('img').alt || '';
    modalContent.appendChild(img);
  } else if (element.querySelector('video')) {
    // VIDEO
    const video = document.createElement('video');
    video.src = element.querySelector('video source').src;
    video.controls = true;
    video.autoplay = true;
    modalContent.appendChild(video);
  }

  modal.style.display = 'flex';
}

// Close modal
function closeModal() {
  const modal = document.getElementById('modal');
  const modalContent = modal.querySelector('.modal-content');
  modal.style.display = 'none';
  // Stop video if exists
  const video = modalContent.querySelector('video');
  if (video) video.pause();
}
