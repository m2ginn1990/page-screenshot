// Inject the UI into the page
const createUI = () => {
  const timeline = document.createElement("div");
  timeline.id = "screenshot-timeline";
  timeline.style.display = "none";
  document.body.appendChild(timeline);

  const button = document.createElement("button");
  button.id = "screenshot-btn";
  button.textContent = "📷";
  button.style.width = "60px";
  button.style.height = "60px";
  button.style.borderRadius = "50%";
  button.style.boxShadow = "0 0 10px rgba(0, 0, 255, 0.8)";
  button.style.display = "flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.position = "fixed";
  button.style.right = "20px";
  button.style.bottom = "100px";
  button.style.backgroundColor = "#007bff";
  button.style.color = "white";
  button.style.border = "none";
  button.style.cursor = "pointer";
  document.body.appendChild(button);

  button.addEventListener("click", takeScreenshot);

  loadThumbnails();
};

// Take screenshot without extension UI
const takeScreenshot = () => {
  hideUI(); // Hide UI elements before taking screenshot

  setTimeout(() => {
      chrome.runtime.sendMessage({ action: "takeScreenshot" }, (response) => {
          if (response.success) {
              addThumbnail(response.dataUrl);
              saveThumbnailToStorage(response.dataUrl);
          }
          restoreUI();
      });
  }, 200);
};

// Load thumbnails from storage
const loadThumbnails = () => {
  chrome.storage.session.get({ screenshots: [] }, (result) => {
      result.screenshots.forEach(addThumbnail);
  });
};

// Add thumbnail to the timeline
const addThumbnail = (dataUrl) => {
  const timeline = document.getElementById("screenshot-timeline");
  timeline.style.display = "flex"; // Make timeline visible

  const container = document.createElement("div");
  container.classList.add("thumbnail-container");

  const label = document.createElement("div");
  label.classList.add("thumbnail-label");
  label.textContent = extractFilename();
  label.title = extractFilename(); // Tooltip text
  container.appendChild(label); // Append label first

  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = "Screenshot Thumbnail";
  img.classList.add("thumbnail");
  container.appendChild(img); // Append image after label

  img.addEventListener("click", () => openPreviewModal(dataUrl));

  timeline.appendChild(container);
};


// Open preview modal
const openPreviewModal = (dataUrl) => {
  const button = document.getElementById("screenshot-btn");
  if (button) button.style.display = "none";

  const modal = document.createElement("div");
  modal.id = "preview-modal";

  const img = document.createElement("img");
  img.src = dataUrl;
  img.alt = "Full Screenshot";
  modal.appendChild(img);

  const closeBtn = document.createElement("button");
  closeBtn.id = "close-modal-btn";
  closeBtn.textContent = "Close";
  closeBtn.addEventListener("click", () => {
      modal.remove();
      if (button) button.style.display = "flex";
  });
  modal.appendChild(closeBtn);

  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";
  modal.style.zIndex = "10000";

  img.style.maxWidth = "90%";
  img.style.maxHeight = "90%";

  closeBtn.style.position = "absolute";
  closeBtn.style.top = "20px";
  closeBtn.style.right = "20px";
  closeBtn.style.backgroundColor = "white";
  closeBtn.style.border = "none";
  closeBtn.style.borderRadius = "5px";
  closeBtn.style.padding = "10px";
  closeBtn.style.cursor = "pointer";

  document.body.appendChild(modal);
};

// Save screenshot to session storage
const saveThumbnailToStorage = (dataUrl) => {
  chrome.storage.session.get({ screenshots: [] }, (result) => {
      const screenshots = result.screenshots;
      screenshots.push(dataUrl);
      chrome.storage.session.set({ screenshots });
  });
};

const extractFilename = () => {
  try {
      // Get all heading elements on the page
      const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));

      // Find the largest heading by computed font size
      let largestHeading = null;
      let maxFontSize = 0;

      headings.forEach((heading) => {
          const fontSize = parseFloat(window.getComputedStyle(heading).fontSize);
          if (fontSize > maxFontSize) {
              largestHeading = heading;
              maxFontSize = fontSize;
          }
      });

      // If a visually prominent heading is found, return its text content
      if (largestHeading) {
          return largestHeading.textContent.trim();
      }

      // Fallback to document.title if no suitable heading is found
      return document.title || "Screenshot";
  } catch (error) {
      console.error("Error extracting filename:", error);
      return "Screenshot";
  }
};


// Hide UI elements before taking screenshot
const hideUI = () => {
  const button = document.getElementById("screenshot-btn");
  const timeline = document.getElementById("screenshot-timeline");
  if (button) button.style.visibility = "hidden";
  if (timeline) timeline.style.visibility = "hidden";
};

// Restore UI elements after taking screenshot
const restoreUI = () => {
  const button = document.getElementById("screenshot-btn");
  const timeline = document.getElementById("screenshot-timeline");
  if (button) button.style.visibility = "visible";
  if (timeline) timeline.style.visibility = "visible";
};

// Initialize the UI
if (!document.getElementById("screenshot-timeline")) {
  createUI();
}






