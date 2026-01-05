const productList = document.getElementById("productList");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const pagination = document.getElementById("pagination");

let allProducts = [];
let filteredProducts = []; // ✅ new
let currentPage = 1;
const productsPerPage = 12;

// ===============================
// FETCH PRODUCTS
// ===============================
async function fetchProducts() {
  try {
    const res = await fetch("https://kivan-backend.onrender.com/api/products");
    const data = await res.json();

    allProducts = data;
    filteredProducts = [...allProducts]; // ✅ copy
    renderPage();
  } catch (err) {
    console.error("Product fetch error:", err);
  }
}

// ===============================
// RENDER CURRENT PAGE
// ===============================
function renderPage() {
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const pageProducts = filteredProducts.slice(start, end);

  renderProducts(pageProducts);
  renderPagination();
}

// ===============================
// RENDER PRODUCTS
// ===============================
function renderProducts(products) {
  productList.innerHTML = "";

  if (products.length === 0) {
    productList.innerHTML = "<p>No products found</p>";
    pagination.style.display = "none";
    return;
  }

  products.forEach(product => {
    productList.innerHTML += `
      <div class="col-4">
        <a href="/product/single-product.html?id=${product._id}">
          <img src="https://kivan-backend.onrender.com${product.image}" alt="${product.name}">
          <h4>${product.name}</h4>
        </a>
        <p> PRICE  : ৳ ${product.price}</p>
      </div>
    `;
  });
}

// ===============================
// RENDER PAGINATION
// ===============================
function renderPagination() {
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // ✅ যদি শুধু 1 page থাকে → শুধু "1" দেখাও
  if (totalPages === 1) {
    const btn = document.createElement("span");
    btn.innerText = "1";
    btn.classList.add("active");
    pagination.appendChild(btn);
    return;
  }

  // ← PREV
  const prev = document.createElement("span");
  prev.innerHTML = "←";
  prev.className = "arrow";
  prev.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
    }
  };
  pagination.appendChild(prev);

  // PAGE NUMBERS
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("span");
    btn.innerText = i;

    if (i === currentPage) btn.classList.add("active");

    btn.onclick = () => {
      currentPage = i;
      renderPage();
    };

    pagination.appendChild(btn);
  }

  // → NEXT
  const next = document.createElement("span");
  next.innerHTML = "→";
  next.className = "arrow";
  next.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPage();
    }
  };
  pagination.appendChild(next);
}


// ===============================
// FILTER
// ===============================
categorySelect.addEventListener("change", () => {
  const value = categorySelect.value;

  filteredProducts =
    value === "all"
      ? [...allProducts]
      : allProducts.filter(p => p.category === value);

  currentPage = 1;
  renderPage();
});

// ===============================
// SORT
// ===============================
sortSelect.addEventListener("change", () => {
  const value = sortSelect.value;

  if (value === "priceLow") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (value === "priceHigh") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  currentPage = 1;
  renderPage();
});

// ===============================
// INIT
// ===============================
fetchProducts();

// ===============================
// FILTER for price sorting
// ===============================


sortSelect.addEventListener("change", () => {
  const value = sortSelect.value;

  if (value === "priceLow") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } 
  else if (value === "priceHigh") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  currentPage = 1;
  renderPage();
});
