const book = document.querySelector("#book");
const cover = document.querySelector("#cover");
const configUrl = new URL("./book.config.json", document.baseURI);
const leftContent = document.querySelector("#left-content");
const rightContent = document.querySelector("#right-content");
const spreadElement = document.querySelector(".spread");
const previousButton = document.querySelector("#previous");
const nextButton = document.querySelector("#next");
let config;
let spreadIndex = 0;
previousButton.disabled = true;
nextButton.disabled = true;

function setPageNumber(selector, value) {
  document.querySelector(selector).textContent = value == null ? "" : String(value);
}

async function loadPage(path) {
  const response = await fetch(new URL(path, configUrl));
  if (!response.ok) throw new Error(`Could not load page: ${path}`);
  return response.text();
}

async function renderSpread(direction = null) {
  const spread = config.pages[spreadIndex];
  const [leftHtml, rightHtml] = await Promise.all([
    loadPage(spread.left),
    loadPage(spread.right),
  ]);
  leftContent.innerHTML = leftHtml;
  rightContent.innerHTML = rightHtml;
  spreadElement.classList.remove("turn-next", "turn-previous");
  if (direction) {
    const turningPage = spreadElement.querySelector(direction === "next" ? ".page:last-child" : ".page:first-child");
    void spreadElement.offsetWidth;
    spreadElement.classList.add(direction === "next" ? "turn-next" : "turn-previous");
    await new Promise((resolve) => turningPage.addEventListener("animationend", resolve, { once: true }));
    spreadElement.classList.remove("turn-next", "turn-previous");
  }
  setPageNumber("#left-number", spreadIndex === 0 ? "" : spreadIndex * 2);
  setPageNumber("#right-number", spreadIndex * 2 + 1);
  previousButton.textContent = spreadIndex === 0 ? "← Close" : "← Previous";
  previousButton.setAttribute("aria-label", spreadIndex === 0 ? "Close the book" : "Previous page");
  previousButton.disabled = false;
  nextButton.disabled = spreadIndex >= config.pages.length - 1;
}

function showError(error) {
  console.error(error);
  const message = document.createElement("p");
  message.textContent = "The book could not be loaded. Check its configuration and page files.";
  leftContent.replaceChildren(message.cloneNode(true));
  rightContent.replaceChildren(message);
}

async function initializeBook() {
  try {
    const response = await fetch(configUrl);
    if (!response.ok) throw new Error("Could not load book.config.json");
    config = await response.json();
    if (!config.cover?.icon || !config.cover?.title || !config.cover?.subtitle || !config.cover?.favicon) {
      throw new Error("The cover needs icon, title, subtitle, and favicon paths.");
    }
    if (!Array.isArray(config.pages) || config.pages.length === 0 || config.pages.some((page) => !page.left || !page.right)) {
      throw new Error("Each configured spread needs left and right HTML page paths.");
    }

    document.querySelector("#cover-icon").src = new URL(config.cover.icon, configUrl);
    document.querySelector("#cover-title").textContent = config.cover.title;
    document.querySelector("#cover-subtitle").textContent = config.cover.subtitle;
    document.querySelector("#site-favicon").href = new URL(config.cover.favicon, configUrl);
    document.title = `${config.cover.title} — ${config.cover.subtitle}`;
    await renderSpread();
  } catch (error) {
    showError(error);
  }
}

cover.addEventListener("click", () => {
  book.classList.add("is-open");
  cover.setAttribute("aria-hidden", "true");
});

nextButton.addEventListener("click", async () => {
  if (!config) return;
  if (spreadIndex < config.pages.length - 1) {
    previousButton.disabled = true;
    nextButton.disabled = true;
    spreadIndex += 1;
    try {
      await renderSpread("next");
    } catch (error) {
      showError(error);
    } finally {
      previousButton.disabled = false;
      nextButton.disabled = spreadIndex >= config.pages.length - 1;
    }
  }
});

previousButton.addEventListener("click", async () => {
  if (!config) return;
  if (spreadIndex > 0) {
    previousButton.disabled = true;
    nextButton.disabled = true;
    spreadIndex -= 1;
    try {
      await renderSpread("previous");
    } catch (error) {
      showError(error);
    } finally {
      previousButton.disabled = false;
      nextButton.disabled = spreadIndex >= config.pages.length - 1;
    }
  } else {
    book.classList.remove("is-open");
    cover.removeAttribute("aria-hidden");
    cover.setAttribute("aria-label", "Open the book");
  }
});

initializeBook();
