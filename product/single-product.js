// ==============================
// GET ID FROM URL
// ==============================
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

if (!productId) {
  document.body.innerHTML = "<h1>Product not found</h1>";
  throw new Error("No product id");
}

// ==============================
// FETCH SINGLE PRODUCT
// ==============================
async function fetchSingleProduct() {
  try {
    const res = await fetch(`https://kivan-backend.onrender.com/api/products/${productId}`);
    const product = await res.json();

    if (!res.ok || !product) {
      document.body.innerHTML = "<h1>Product not found</h1>";
      return;
    }

    // ==============================
    // SET DATA
    // ==============================
    document.getElementById("title").innerText = product.name;
    document.getElementById("price").innerText = "৳" + product.price;
    document.getElementById("desc").innerText = product.description;
    document.getElementById("ProductImg").src =
      "https://kivan-backend.onrender.com" + product.image;

    // ==============================
    // GALLERY (optional)
    // ==============================
    const gallery = document.getElementById("gallery");
    if (gallery && product.gallery && product.gallery.length > 0) {
      gallery.innerHTML = "";

      product.gallery.forEach(img => {
        const image = document.createElement("img");
        image.src = "https://kivan-backend.onrender.com" + img;
        image.width = 80;
        image.style.cursor = "pointer";

        image.onclick = () => {
          document.getElementById("ProductImg").src =
            "https://kivan-backend.onrender.com" + img;
        };

        gallery.appendChild(image);
      });
    }

  } catch (err) {
    console.error(err);
    document.body.innerHTML = "<h1>Product not found</h1>";
  }
}

// ==============================
// FETCH RELATED PRODUCTS (RANDOM 4)
// ==============================
async function fetchRelatedProducts() {
  try {
    const res = await fetch("https://kivan-backend.onrender.com/api/products");
    const products = await res.json();

    if (!Array.isArray(products)) return;

    // 🔴 current product বাদ
    const filtered = products.filter(p => p._id !== productId);

    // 🔀 shuffle
    const shuffled = filtered.sort(() => 0.5 - Math.random());

    // 🎯 4 ta product
    const selected = shuffled.slice(0, 4);

    const container = document.getElementById("related-products");
    if (!container) return;

    container.innerHTML = "";

    selected.forEach(p => {
      
container.innerHTML += `
  <div class="col-4">
    <div class="related-card">
      <a href="/product/single-product.html?id=${p._id}">
        <img src="https://kivan-backend.onrender.com${p.image}" alt="${p.name}">
      </a>

      <h4>${p.name}</h4>
      <p>৳${p.price}</p>
    </div>
  </div>
`;

    });


  } catch (err) {
    console.error("Related products error:", err);
  }
}



// ==============================
// INIT
// ==============================
fetchSingleProduct();
fetchRelatedProducts();

