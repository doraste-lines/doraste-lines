// Home/About
function showAbout() {
  document.getElementById("home").classList.remove("active");
  document.getElementById("about").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() {
  document.getElementById("about").classList.remove("active");
  document.getElementById("home").classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
  Promise.all([
    shuffleMedia("images", { animate: true }),
    shuffleMedia("videos", { animate: true }),
  ]);
}

// Tabs
function showTab(tab) {
  const images = document.getElementById("images");
  const videos = document.getElementById("videos");
  const tabs = document.querySelectorAll(".tab-btn");
  const categoryBar = document.getElementById("category-bar");

  if (tab === "images") {
    images.classList.add("active");
    videos.classList.remove("active");
    categoryBar?.classList.remove("hidden");
  } else {
    videos.classList.add("active");
    images.classList.remove("active");
    categoryBar?.classList.add("hidden");
    lazyLoadVideos();
  }

  tabs.forEach((btn) => btn.classList.remove("active"));
  if (tab === "images") tabs[0].classList.add("active");
  else tabs[1].classList.add("active");
}

// True random + Fisher–Yates shuffle (fair, unbiased order)
function randomUnit() {
  if (window.crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 4294967296;
  }
  return Math.random();
}

function fisherYatesShuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(randomUnit() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleMedia(sectionId, { animate = false } = {}) {
  const container = document.getElementById(sectionId);
  if (!container) return Promise.resolve();

  const boxes = Array.from(container.querySelectorAll(":scope > .box"));
  if (boxes.length < 2) return Promise.resolve();

  const shuffled = fisherYatesShuffle(boxes);

  const commitShuffle = () => {
    shuffled.forEach((box) => container.appendChild(box));
    if (sectionId === "images" && activeCategories.size > 0) applyCategoryFilter();
  };

  if (!animate || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    commitShuffle();
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    container.classList.add("is-shuffling");

    setTimeout(() => {
      commitShuffle();
      container.classList.remove("is-shuffling");
      container.classList.add("shuffle-settled");

      const settleMs = sectionId === "images" ? 520 : 380;
      setTimeout(() => {
        container.classList.remove("shuffle-settled");
        resolve();
      }, settleMs);
    }, 220);
  });
}

// Lazy-load video sources only when the Videos tab is opened
function lazyLoadVideos() {
  document.querySelectorAll("#videos video source[data-src]").forEach((source) => {
    source.src = source.dataset.src;
    source.removeAttribute("data-src");
    source.parentElement.load();
  });
}

// Video Modal
function openModal(el) {
  const modal = document.getElementById("modal");
  const modalVideo = document.getElementById("modal-video");
  const source = el.querySelector("video source");

  if (!source) return;

  lazyLoadVideos();
  modalVideo.src = source.src || source.dataset.src;
  modal.style.display = "flex";
  modalVideo.style.display = "block";
  modalVideo.play();
}

function closeModal() {
  const modal = document.getElementById("modal");
  const modalVideo = document.getElementById("modal-video");
  modal.style.display = "none";
  modalVideo.pause();
  modalVideo.src = "";
}

// Image Lightbox
const lightboxState = { scale: 1, panX: 0, panY: 0, minScale: 1, maxScale: 4 };

function getLightboxElements() {
  return {
    modal: document.getElementById("image-modal"),
    img: document.getElementById("lightbox-img"),
    viewport: document.getElementById("lightbox-viewport"),
  };
}

function resetLightboxTransform() {
  lightboxState.scale = 1;
  lightboxState.panX = 0;
  lightboxState.panY = 0;
  applyLightboxTransform();
}

function applyLightboxTransform() {
  const { img } = getLightboxElements();
  if (!img) return;
  img.style.transform = `translate(${lightboxState.panX}px, ${lightboxState.panY}px) scale(${lightboxState.scale})`;
}

function clampPan() {
  const { img, viewport } = getLightboxElements();
  if (!img || !viewport || lightboxState.scale <= 1) {
    lightboxState.panX = 0;
    lightboxState.panY = 0;
    return;
  }
  const rect = img.getBoundingClientRect();
  const vp = viewport.getBoundingClientRect();
  const excessX = Math.max(0, (rect.width - vp.width) / 2);
  const excessY = Math.max(0, (rect.height - vp.height) / 2);
  lightboxState.panX = Math.min(excessX, Math.max(-excessX, lightboxState.panX));
  lightboxState.panY = Math.min(excessY, Math.max(-excessY, lightboxState.panY));
}

function setLightboxScale(newScale, originX, originY) {
  const { img } = getLightboxElements();
  if (!img) return;

  const prev = lightboxState.scale;
  lightboxState.scale = Math.min(lightboxState.maxScale, Math.max(lightboxState.minScale, newScale));

  if (originX != null && originY != null && prev !== lightboxState.scale) {
    const ratio = lightboxState.scale / prev - 1;
    const rect = img.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    lightboxState.panX -= (originX - cx) * ratio;
    lightboxState.panY -= (originY - cy) * ratio;
  }

  if (lightboxState.scale === 1) {
    lightboxState.panX = 0;
    lightboxState.panY = 0;
  } else {
    clampPan();
  }
  applyLightboxTransform();
}

// Site URLs — Netlify primary, GitHub mirror
const SITE = {
  primary: "https://doraste-lines.netlify.app/",
  github: "https://doraste-lines.github.io/doraste-lines/",
  netlify: "https://doraste-lines.netlify.app/",
};

function getSiteBase() {
  let path = window.location.pathname;
  if (path.endsWith("index.html")) path = path.slice(0, -"index.html".length);
  if (!path.endsWith("/")) {
    const slash = path.lastIndexOf("/");
    path = slash >= 0 ? path.slice(0, slash + 1) : "/";
  }
  return window.location.origin + path;
}

function initSiteUrls() {
  const base = getSiteBase();
  const logoUrl = new URL("logo-512.png", base).href;

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = SITE.primary;

  setMetaTag("property", "og:url", base);
  setMetaTag("property", "og:image", logoUrl);
  setMetaTag("name", "twitter:image", logoUrl);

  DEFAULT_SEO.url = base;
  DEFAULT_SEO.image = logoUrl;
}

const DEFAULT_SEO = {
  title: "Doraste_Lines | Inspirational Quote Art & Visual Poetry",
  description: "Original inspirational quotes, faith reflections, and visual poetry by Don Doraste Buntu (@doraste_lines).",
  image: "https://doraste-lines.netlify.app/logo-512.png",
  url: "https://doraste-lines.netlify.app/",
};

function setMetaTag(attr, key, value) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function quoteTitleFromAlt(alt) {
  if (!alt) return "Doraste_Lines Quote Art";
  const quoted = alt.match(/text reads:\s*["']([^"']{10,120})/i);
  if (quoted) return `${quoted[1].trim()} | Doraste_Lines`;
  return alt.slice(0, 100).trim() + (alt.length > 100 ? "…" : "") + " | Doraste_Lines";
}

function updatePieceSeo(box) {
  const source = box.querySelector("img");
  if (!source) return;

  const imageUrl = new URL(source.currentSrc || source.src, window.location.href).href;
  const pageUrl = `${window.location.origin}${window.location.pathname}${window.location.search}#${box.id}`;
  const title = quoteTitleFromAlt(source.alt);
  const description = (source.alt || DEFAULT_SEO.description).slice(0, 200);

  document.title = title;
  setMetaTag("property", "og:title", title);
  setMetaTag("property", "og:description", description);
  setMetaTag("property", "og:image", imageUrl);
  setMetaTag("property", "og:url", pageUrl);
  setMetaTag("name", "twitter:title", title);
  setMetaTag("name", "twitter:description", description);
  setMetaTag("name", "twitter:image", imageUrl);
  setMetaTag("name", "description", description);
}

function resetPieceSeo() {
  document.title = "Doraste_Lines | Inspirational Quote Art & Visual Poetry by Don Doraste Buntu";
  setMetaTag("property", "og:title", DEFAULT_SEO.title);
  setMetaTag("property", "og:description", DEFAULT_SEO.description);
  setMetaTag("property", "og:image", DEFAULT_SEO.image);
  setMetaTag("property", "og:url", DEFAULT_SEO.url);
  setMetaTag("name", "twitter:title", DEFAULT_SEO.title);
  setMetaTag("name", "twitter:description", DEFAULT_SEO.description);
  setMetaTag("name", "twitter:image", DEFAULT_SEO.image);
  setMetaTag("name", "description", "Discover Doraste_Lines — original inspirational quotes, faith reflections, motivational art, and visual poetry by Don Doraste Buntu from Burundi. Browse 90+ quote images, videos, and creative work.");
}

function openImageModal(box) {
  const source = box.querySelector("img");
  const { modal, img } = getLightboxElements();
  if (!source || !modal || !img) return;

  img.src = source.currentSrc || source.src;
  img.alt = source.alt || "";
  resetLightboxTransform();
  updatePieceSeo(box);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("lightbox-open");

  const boxId = box.id;
  if (boxId) {
    history.replaceState(null, "", "#" + boxId);
  }
}

function closeImageModal() {
  const { modal, img } = getLightboxElements();
  if (!modal) return;

  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lightbox-open");
  resetLightboxTransform();
  resetPieceSeo();

  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }

  setTimeout(() => {
    if (img) img.src = "";
  }, 200);
}

function initImageLightbox() {
  const { modal, img, viewport } = getLightboxElements();
  if (!modal || !img || !viewport) return;

  document.getElementById("lightbox-close")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeImageModal();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeImageModal();
  });

  viewport.addEventListener("click", (e) => {
    if (e.target === viewport) closeImageModal();
  });

  viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    setLightboxScale(lightboxState.scale + delta, e.clientX, e.clientY);
  }, { passive: false });

  viewport.addEventListener("dblclick", (e) => {
    e.preventDefault();
    if (lightboxState.scale > 1) {
      resetLightboxTransform();
    } else {
      setLightboxScale(2, e.clientX, e.clientY);
    }
  });

  let dragStart = null;
  viewport.addEventListener("pointerdown", (e) => {
    if (lightboxState.scale <= 1 || e.target !== img) return;
    dragStart = { x: e.clientX - lightboxState.panX, y: e.clientY - lightboxState.panY };
    img.classList.add("no-transition");
    viewport.classList.add("dragging");
    viewport.setPointerCapture(e.pointerId);
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!dragStart) return;
    lightboxState.panX = e.clientX - dragStart.x;
    lightboxState.panY = e.clientY - dragStart.y;
    clampPan();
    applyLightboxTransform();
  });

  const endDrag = (e) => {
    if (!dragStart) return;
    dragStart = null;
    img.classList.remove("no-transition");
    viewport.classList.remove("dragging");
    if (e.pointerId != null) viewport.releasePointerCapture(e.pointerId);
  };

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  let pinchStart = null;
  viewport.addEventListener("touchstart", (e) => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches;
      pinchStart = {
        dist: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY),
        scale: lightboxState.scale,
        midX: (a.clientX + b.clientX) / 2,
        midY: (a.clientY + b.clientY) / 2,
      };
      img.classList.add("no-transition");
    }
  }, { passive: true });

  viewport.addEventListener("touchmove", (e) => {
    if (!pinchStart || e.touches.length !== 2) return;
    e.preventDefault();
    const [a, b] = e.touches;
    const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    const newScale = pinchStart.scale * (dist / pinchStart.dist);
    setLightboxScale(newScale, pinchStart.midX, pinchStart.midY);
  }, { passive: false });

  viewport.addEventListener("touchend", () => {
    pinchStart = null;
    img.classList.remove("no-transition");
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") closeImageModal();
  });

  document.querySelectorAll("#images .box").forEach((box) => {
    box.addEventListener("click", (e) => {
      if (e.target.closest(".buttons")) return;
      openImageModal(box);
    });
  });

  const hash = window.location.hash.slice(1);
  if (hash) {
    const box = document.getElementById(hash);
    if (box?.closest("#images")) {
      setTimeout(() => openImageModal(box), 300);
    }
  }
}

// Video Hover Preview (loads source on first hover)
function setupVideoPreviews() {
  document.querySelectorAll("#videos .box").forEach((box) => {
    const video = box.querySelector("video");
    if (!video) return;

    box.addEventListener("mouseenter", () => {
      lazyLoadVideos();
      video.currentTime = 0;
      video.muted = true;
      video.play();
    });
    box.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
  });
}

// Light/Dark Mode Toggle
function isDarkTheme() {
  return document.documentElement.classList.contains("dark");
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = saved === "dark" || (!saved && prefersDark);
  document.documentElement.classList.toggle("dark", isDark);
  updateThemeIcon();
  updateMetaThemeColor();
}

function updateThemeIcon() {
  const toggleBtn = document.querySelector(".theme-toggle i");
  if (!toggleBtn) return;
  toggleBtn.className = isDarkTheme() ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

function updateMetaThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.content = isDarkTheme() ? "#121212" : "#f7f7f7";
  }
}

function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const isDark = isDarkTheme();
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon();
  updateMetaThemeColor();
}

// Back to Top
const backToTop = document.getElementById("backToTop");
window.addEventListener(
  "scroll",
  () => {
    if (window.scrollY > 300) {
      backToTop.style.display = "inline-flex";
    } else {
      backToTop.style.display = "none";
    }
  },
  { passive: true }
);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Toast notification
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2800);
}

// Detect if image has a dark bottom-left corner for button contrast
function detectImageBrightness(img) {
  if (!img.complete || !img.naturalWidth) return;
  try {
    const canvas = document.createElement("canvas");
    const size = 20;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, img.naturalHeight - size, size, size, 0, 0, size, size);
    const data = ctx.getImageData(0, 0, size, size).data;
    let total = 0;
    for (let i = 0; i < data.length; i += 4) {
      total += (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const avg = total / (data.length / 4);
    img.dataset.dark = avg < 128 ? "true" : "false";
  } catch {
    /* cross-origin or tainted canvas — skip */
  }
}

// Like & Share buttons
function initLikeShare() {
  document.querySelectorAll(".box").forEach((box) => {
    if (box.querySelector(".buttons")) return;

    const boxId = box.id || "box-" + Math.random().toString(36).substr(2, 9);
    if (!box.id) box.id = boxId;

    const img = box.querySelector("img");
    if (img) {
      const onLoad = () => detectImageBrightness(img);
      if (img.complete) onLoad();
      else img.addEventListener("load", onLoad, { once: true });
    }

    const buttons = document.createElement("div");
    buttons.className = "buttons";

    const likeBtn = document.createElement("i");
    likeBtn.className = "fa-regular fa-heart";
    likeBtn.title = "Like";
    likeBtn.setAttribute("role", "button");
    likeBtn.setAttribute("aria-label", "Like");
    if (localStorage.getItem("like_" + boxId) === "true") {
      likeBtn.classList.replace("fa-regular", "fa-solid");
      likeBtn.classList.add("liked");
    }
    likeBtn.onclick = (e) => {
      e.stopPropagation();
      const isLiked = !likeBtn.classList.contains("fa-solid");
      likeBtn.classList.toggle("fa-solid", isLiked);
      likeBtn.classList.toggle("fa-regular", !isLiked);
      likeBtn.classList.toggle("liked", isLiked);
      localStorage.setItem("like_" + boxId, isLiked);
    };

    const shareBtn = document.createElement("i");
    shareBtn.className = "fa-solid fa-share-nodes";
    shareBtn.title = "Share";
    shareBtn.setAttribute("role", "button");
    shareBtn.setAttribute("aria-label", "Share");
    shareBtn.onclick = async (e) => {
      e.stopPropagation();
      const url = window.location.href.split("#")[0] + "#" + boxId;
      try {
        if (navigator.share) {
          await navigator.share({ url });
        } else {
          await navigator.clipboard.writeText(url);
          showToast("Link copied to clipboard");
        }
      } catch {
        /* user cancelled share */
      }
    };

    buttons.appendChild(likeBtn);
    buttons.appendChild(shareBtn);
    box.appendChild(buttons);
  });
}

// Category engine — indexes alt text + quote content for smart filtering
const CATEGORIES = [
  { id: "all", label: "All" },
  {
    id: "faith",
    label: "Faith",
    keywords: [
      "god", "lord", "prayer", "christ", "biblical", "scripture", "bible",
      "psalm", "psalms", "proverbs", "hosea", "romans", "samuel", "spiritual",
      "blessing", "faith", "divine", "worship", "involve god", "lean not",
      "trust in the lord", "will of god", "please god", "nasb", "niv",
    ],
  },
  {
    id: "motivation",
    label: "Motivation",
    keywords: [
      "motivational", "encourage", "inspire", "dream", "success", "persist",
      "beginning", "starting", "never too late", "give your best", "never try",
      "keep going", "opportunity", "next step", "new beginning", "adventure",
      "marathon", "footprints on the moon", "exploration",
    ],
  },
  {
    id: "wisdom",
    label: "Wisdom",
    keywords: [
      "wisdom", "knowledge", "learn", "lesson", "history", "think", "awareness",
      "understanding", "mistake", "perish", "stupid", "fish", "climb a tree",
      "see for themselves", "hearsay", "neglect", "experience", "doubt",
    ],
  },
  {
    id: "life",
    label: "Life",
    keywords: [
      "life", "journey", "choice", "change", "world", "better world", "seasons",
      "fragile", "memory", "battle", "path", "role", "choices you make",
    ],
  },
  {
    id: "time",
    label: "Time",
    keywords: [
      "time", "hourglass", "clock", "moment", "today", "tomorrow", "eternal",
      "age", "once upon a time", "goes fast", "not promised", "riddle",
    ],
  },
  {
    id: "self",
    label: "Self",
    keywords: [
      "yourself", "self-worth", "compare", "identity", "be yourself", "pride",
      "respect", "worth", "value", "imitate", "perfect", "superior", "inferior",
      "individuality", "ugly", "faces are", "needy", "personally",
    ],
  },
  {
    id: "love",
    label: "Love",
    keywords: [
      "love", "kindness", "parent", "friend", "smile", "happy", "valued",
      "compassion", "empathy", "obedience", "incomparable", "lift you up",
      "reflection of god's love",
    ],
  },
  {
    id: "work",
    label: "Work",
    keywords: [
      "work", "effort", "hard work", "working", "success", "preparation",
      "money", "wealth", "sow", "reap", "earn", "price", "luck",
      "say less, do more", "blessings come",
    ],
  },
  {
    id: "peace",
    label: "Peace",
    keywords: [
      "peace", "jealousy", "anger", "hatred", "let them go", "pain", "cried",
      "battle you can't see", "fighting a battle", "strong heart", "burden",
      "inner peace", "emotional",
    ],
  },
  {
    id: "words",
    label: "Words",
    keywords: [
      "words", "speak", "tongue", "say it before", "speech", "shape your world",
      "misled", "hearts often", "before you step",
    ],
  },
  {
    id: "patience",
    label: "Patience",
    keywords: [
      "patience", "trust the process", "process", "wait", "timing", "ready on time",
      "trust in", "keep faith", "choice, not a reaction",
    ],
  },
];

const boxCategoryIndex = new Map();
let activeCategories = new Set();

function extractSearchableText(alt) {
  if (!alt) return "";
  const parts = [alt];
  const patterns = [
    /text reads:\s*["']([^"']+)["']/gi,
    /quote reads:\s*["']([^"']+)["']/gi,
    /scripture reads:\s*["']([^"']+)["']/gi,
    /The quote,?\s*[^:]*:\s*["']([^"']+)["']/gi,
  ];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(alt)) !== null) parts.push(m[1]);
  });
  return parts.join(" ").toLowerCase();
}

function scoreCategoryMatch(text, category) {
  let score = 0;
  category.keywords.forEach((kw) => {
    if (text.includes(kw)) score += kw.length >= 10 ? 3 : kw.length >= 6 ? 2 : 1;
  });
  return score;
}

function buildCategoryIndex() {
  boxCategoryIndex.clear();
  document.querySelectorAll("#images .box").forEach((box) => {
    const alt = box.querySelector("img")?.alt || "";
    const text = extractSearchableText(alt);
    const categories = new Set();
    const scores = {};

    CATEGORIES.forEach((cat) => {
      if (cat.id === "all") return;
      const score = scoreCategoryMatch(text, cat);
      if (score > 0) {
        categories.add(cat.id);
        scores[cat.id] = score;
      }
    });

    boxCategoryIndex.set(box, { text, categories, scores });
    box.dataset.categories = [...categories].join(",");
  });
}

function getCategoryCounts() {
  const counts = { all: document.querySelectorAll("#images .box").length };
  CATEGORIES.forEach((cat) => {
    if (cat.id === "all") return;
    counts[cat.id] = 0;
  });
  boxCategoryIndex.forEach(({ categories }) => {
    categories.forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });
  });
  return counts;
}

function boxMatchesActiveFilters(box) {
  if (activeCategories.size === 0) return true;
  const index = boxCategoryIndex.get(box);
  if (!index) return false;
  return [...activeCategories].every((catId) => index.categories.has(catId));
}

function getBoxFilterScore(box) {
  const index = boxCategoryIndex.get(box);
  if (!index) return 0;
  return [...activeCategories].reduce((sum, catId) => sum + (index.scores[catId] || 0), 0);
}

function updateCategoryUI(visibleCount, totalCount) {
  const status = document.getElementById("category-status");
  const clearBtn = document.getElementById("category-clear");
  const hasFilter = activeCategories.size > 0;

  if (status) {
    if (!hasFilter) {
      status.textContent = `${totalCount} pieces`;
    } else {
      const names = [...activeCategories]
        .map((id) => CATEGORIES.find((c) => c.id === id)?.label)
        .filter(Boolean)
        .join(" + ");
      status.textContent = `${visibleCount} of ${totalCount} · ${names}`;
    }
  }

  clearBtn?.classList.toggle("hidden", !hasFilter);
}

function applyCategoryFilter() {
  const images = document.getElementById("images");
  const boxes = Array.from(document.querySelectorAll("#images .box"));
  const totalCount = boxes.length;
  const matched = [];
  const hidden = [];

  boxes.forEach((box) => {
    const match = boxMatchesActiveFilters(box);
    box.classList.toggle("filtered-out", !match);
    if (match) matched.push({ box, score: getBoxFilterScore(box) });
    else hidden.push(box);
  });

  matched.sort((a, b) => b.score - a.score);
  matched.forEach(({ box }) => images.appendChild(box));
  hidden.forEach((box) => images.appendChild(box));

  const emptyMsg = document.getElementById("category-empty");
  emptyMsg?.remove();

  if (matched.length === 0 && activeCategories.size > 0) {
    const msg = document.createElement("p");
    msg.id = "category-empty";
    msg.className = "category-empty";
    msg.textContent = "No pieces match this combination — try fewer themes or tap Clear.";
    images.appendChild(msg);
  }

  updateCategoryUI(matched.length, totalCount);
  updateCategoryCounts();
}

function updateCategoryCounts() {
  const counts = getCategoryCounts();
  document.querySelectorAll(".category-btn[data-category]").forEach((btn) => {
    const id = btn.dataset.category;
    const count = counts[id] ?? 0;
    const label = CATEGORIES.find((c) => c.id === id)?.label || id;
    const badge = btn.querySelector(".category-count");
    if (badge) badge.textContent = count;
    btn.setAttribute("aria-label", `${label} (${count} pieces)`);
  });
}

function setActiveCategories(next) {
  activeCategories = new Set(next);
  const container = document.getElementById("category-filters");
  container?.querySelectorAll(".category-btn").forEach((btn) => {
    const id = btn.dataset.category;
    if (id === "all") btn.classList.toggle("active", activeCategories.size === 0);
    else btn.classList.toggle("active", activeCategories.has(id));
  });
  applyCategoryFilter();
}

function initCategoryFilters() {
  const container = document.getElementById("category-filters");
  if (!container) return;

  buildCategoryIndex();
  const counts = getCategoryCounts();

  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "category-btn" + (cat.id === "all" ? " active" : "");
    btn.dataset.category = cat.id;

    const label = document.createElement("span");
    label.className = "category-label";
    label.textContent = cat.label;
    btn.appendChild(label);

    if (cat.id !== "all") {
      const count = document.createElement("span");
      count.className = "category-count";
      count.textContent = counts[cat.id] || 0;
      btn.appendChild(count);
    }

    btn.setAttribute("aria-label", `${cat.label} (${counts[cat.id] || 0} pieces)`);

    btn.addEventListener("click", () => {
      if (cat.id === "all") {
        setActiveCategories([]);
        return;
      }

      const next = new Set(activeCategories);
      if (next.has(cat.id)) next.delete(cat.id);
      else next.add(cat.id);
      setActiveCategories(next);
    });

    container.appendChild(btn);
  });

  document.getElementById("category-clear")?.addEventListener("click", () => {
    setActiveCategories([]);
  });

  updateCategoryUI(counts.all, counts.all);
}

// Protect content
function initContentProtection() {
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.querySelectorAll("img").forEach((img) => {
    img.addEventListener("dragstart", (e) => e.preventDefault());
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key === "I") ||
      (e.ctrlKey && e.key === "u")
    ) {
      e.preventDefault();
    }
  });
}

// PWA install banner
let deferredInstallPrompt = null;

function isAppleDevice() {
  const ua = navigator.userAgent;
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isGitHubPages() {
  return window.location.hostname.endsWith("github.io");
}

function isInstalledApp() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
}

function showInstallBanner() {
  const banner = document.getElementById("install-banner");
  if (!banner) return;
  banner.classList.remove("hidden");
  banner.classList.add("visible");
  banner.setAttribute("aria-hidden", "false");
  document.body.classList.add("has-install-banner");
}

function hideInstallBanner(persist) {
  const banner = document.getElementById("install-banner");
  if (!banner) return;
  banner.classList.remove("visible");
  banner.classList.add("hidden");
  banner.setAttribute("aria-hidden", "true");
  document.body.classList.remove("has-install-banner");
  if (persist) localStorage.setItem("install-banner-dismissed", "true");
}

function openInstallModal() {
  const modal = document.getElementById("install-modal");
  const confirmBtn = document.getElementById("install-modal-confirm");
  const steps = document.getElementById("install-modal-steps");
  if (!modal) return;

  if (deferredInstallPrompt) {
    confirmBtn?.classList.remove("hidden");
    steps?.classList.add("hidden");
  } else {
    confirmBtn?.classList.add("hidden");
    steps?.classList.remove("hidden");
    if (steps) {
      steps.innerHTML = `
        <li>Tap your browser <strong>menu</strong> <i class="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i></li>
        <li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
        <li>Confirm to add Doraste_Lines to your device</li>
      `;
    }
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeInstallModal() {
  const modal = document.getElementById("install-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

function openIosInstallModal() {
  const modal = document.getElementById("ios-install-modal");
  if (!modal) return;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeIosInstallModal() {
  const modal = document.getElementById("ios-install-modal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

async function triggerInstall() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    closeInstallModal();
    if (outcome === "accepted") hideInstallBanner(true);
    return;
  }
  openInstallModal();
}

function initInstallBanner() {
  if (isGitHubPages()) return;
  if (isInstalledApp()) return;
  if (localStorage.getItem("install-banner-dismissed") === "true") return;

  const banner = document.getElementById("install-banner");
  const actionBtn = document.getElementById("install-banner-action");
  const closeBtn = document.getElementById("install-banner-close");
  const title = document.getElementById("install-banner-title");
  const subtitle = document.getElementById("install-banner-sub");

  if (!banner || !actionBtn) return;

  if (isAppleDevice()) {
    if (title) title.textContent = "Add Doraste_Lines to Home Screen";
    if (subtitle) subtitle.textContent = "Open the gallery anytime from your home screen";
    actionBtn.textContent = "How to";

    actionBtn.addEventListener("click", openIosInstallModal);
    document.getElementById("ios-install-close")?.addEventListener("click", closeIosInstallModal);
    document.getElementById("ios-install-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "ios-install-modal") closeIosInstallModal();
    });

    setTimeout(showInstallBanner, 2000);
  } else {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      showInstallBanner();
    });

    actionBtn.addEventListener("click", triggerInstall);
    document.getElementById("install-modal-confirm")?.addEventListener("click", triggerInstall);
    document.getElementById("install-modal-close")?.addEventListener("click", closeInstallModal);
    document.getElementById("install-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "install-modal") closeInstallModal();
    });
  }

  closeBtn?.addEventListener("click", () => hideInstallBanner(true));

  window.addEventListener("appinstalled", () => {
    hideInstallBanner(true);
    closeInstallModal();
  });
}

// Register service worker
function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

// Init on load
window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSiteUrls();
  setupVideoPreviews();
  initLikeShare();
  initImageLightbox();
  initCategoryFilters();
  initContentProtection();
  registerServiceWorker();
  initInstallBanner();
  initLazyImageFadeIn();

  Promise.all([
    shuffleMedia("images", { animate: true }),
    shuffleMedia("videos", { animate: true }),
  ]);
});

// Fade in lazy-loaded images once they finish loading
function initLazyImageFadeIn() {
  document.querySelectorAll('#images .box img[loading="lazy"]').forEach((img) => {
    const markLoaded = () => img.classList.add("loaded");
    if (img.complete) markLoaded();
    else {
      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", markLoaded, { once: true });
    }
  });
}
