// ==================== DARK MODE ====================
let darkmode = localStorage.getItem('darkmode');
const themeSwitch = document.getElementById('theme-switch');
const logo = document.getElementById('logo');

const enableDarkmode = () => {
  document.body.classList.add('darkmode');
  localStorage.setItem('darkmode', 'active');
  if (logo) logo.src = '/images/logo-kivan-dark.png';
};

const disableDarkmode = () => {
  document.body.classList.remove('darkmode');
  localStorage.setItem('darkmode', null);
  if (logo) logo.src = '/images/logo-kivan-light.png';
};

if (darkmode === "active") enableDarkmode();
else disableDarkmode();

if (themeSwitch) {
  themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem('darkmode');
    darkmode !== "active" ? enableDarkmode() : disableDarkmode();
  });
}












// ==================== DROPDOWN PAGE REDIRECT ====================
const select = document.getElementById("productSelect");
if (select) {
  select.addEventListener("change", function () {
    if (this.value) window.location.href = this.value;
  });

  const currentPath = window.location.pathname.toLowerCase();
  for (let option of select.options) {
    const optionPath = new URL(option.value, window.location.origin).pathname.toLowerCase();
    if (currentPath === optionPath) {
      option.selected = true;
      break;
    }
  }
}


// ==================== PAGINATION ====================
document.addEventListener("DOMContentLoaded", function () {
  const pageContainer = document.querySelector(".page-btn");
  if (!pageContainer) return;

  const pageUrls = {
      1: "/product/products.html",
      2: "/product 2/product 2.html",
      3: "/product 3/product 3.html",
      4: "/product 4/product 4.html"
  };

  function getCurrentPage() {
      const currentPath = decodeURIComponent(window.location.pathname.toLowerCase());
      for (let key in pageUrls) {
          if (currentPath.includes(pageUrls[key].toLowerCase())) {
              return parseInt(key);
          }
      }
      return 1;
  }

  function goToPage(pageNum) {
      if (pageUrls[pageNum]) window.location.href = pageUrls[pageNum];
  }

  function renderPagination() {
      const currentPage = getCurrentPage();
      pageContainer.innerHTML = "";

      const left = document.createElement("span");
      left.innerHTML = "&#8592;";
      left.style.cursor = currentPage === 1 ? "not-allowed" : "pointer";
      left.style.opacity = currentPage === 1 ? "0.5" : "1";
      left.addEventListener("click", () => { if (currentPage > 1) goToPage(currentPage - 1); });
      pageContainer.appendChild(left);

      for (let i = 1; i <= Object.keys(pageUrls).length; i++) {
          const page = document.createElement("span");
          page.textContent = i;
          page.style.cursor = "pointer";
          if (i === currentPage) {
              page.style.background = "#ff523b";
              page.style.color = "#fff";
              page.style.padding = "5px 10px";
              page.style.borderRadius = "5px";
          }
          page.addEventListener("click", () => goToPage(i));
          pageContainer.appendChild(page);
      }

      const right = document.createElement("span");
      right.innerHTML = "&#8594;";
      right.style.cursor = currentPage === Object.keys(pageUrls).length ? "not-allowed" : "pointer";
      right.style.opacity = currentPage === Object.keys(pageUrls).length ? "0.5" : "1";
      right.addEventListener("click", () => { if (currentPage < Object.keys(pageUrls).length) goToPage(currentPage + 1); });
      pageContainer.appendChild(right);
  }

  renderPagination();
});



