// ==============================
// GET ID FROM URL
// ==============================
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

console.log("PRODUCT ID:", productId);

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
  product.image?.url || "/images/no-image.png";


      // ✅ SET FOR CART (IMPORTANT)
productName = product.name;
price = product.price;
image = product.image?.url || "/images/no-image.png";



    // ==============================
    // GALLERY (optional)
    // ==============================
    const gallery = document.getElementById("gallery");
    if (gallery && product.gallery && product.gallery.length > 0) {
      gallery.innerHTML = "";

      product.gallery.forEach(img => {
        const image = document.createElement("img");
        image.src = img?.url || "/images/no-image.png";

        image.width = 80;
        image.style.cursor = "pointer";

        image.onclick = () => {
          document.getElementById("ProductImg").src =
            img.url || "/images/no-image.png";
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
        <img src="${p.image?.url || "/images/no-image.png"}" alt="${p.name}">

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

let productName = "";
let price = 0;
let image = "";


// ==============================
// ADD TO CART (GUEST + LOGIN USER)
// ==============================
const addToCartBtn = document.querySelector(".add-to-cart");

addToCartBtn.addEventListener("click", async () => {

  // ======================
  // SIZE VALIDATION (FOR ALL)
  // ======================
  const sizeSelect = document.getElementById("product-size");
  const selectedSize = sizeSelect?.value;

  if (!selectedSize) {
    showToast("Please select a size ❗");
    return;
  }

  const qty = Number(document.getElementById("qtyInput")?.value || 1);
  const token = localStorage.getItem("token");

  // ======================
  // LOGIN USER → DB CART
  // ======================
  if (token) {
    try {
      const res = await fetch("https://kivan-backend.onrender.com/api/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          qty,
          size: selectedSize, // future-proof
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Add to cart failed");
        return;
      }

      showToast("Added to cart ✅");
      triggerCartUpdate(); // ✅ ADD THIS
      return;

    } catch (err) {
      console.error(err);
      showToast("Server error");
      return;
    }
  }


// ======================
// GUEST USER → LOCAL CART (FIXED)
// ======================
let cart = JSON.parse(localStorage.getItem("guestCart")) || [];

const index = cart.findIndex(
  item => item.productId === productId && item.size === selectedSize
);

if (index > -1) {
  cart[index].qty += qty;
} else {
  cart.push({
    productId: productId,
    name: productName,
    price: price,
    qty: qty,
    size: selectedSize,
    image: image
  });
}

localStorage.setItem("guestCart", JSON.stringify(cart));
showToast("Added to cart 🛒");

triggerCartUpdate(); // ✅ ADD THIS

});


// ==============================
// PRODUCT RATING (FINAL FIXED)
// ==============================
let selectedRating = 0;

const stars = document.querySelectorAll("#rating-stars i");
const submitBtn = document.getElementById("submitRating");
const msg = document.getElementById("rating-msg");
const avgRatingEl = document.getElementById("avg-rating");

// ==============================
// ⭐ STAR SELECT (USER CLICK)
// ==============================
stars.forEach((star, index) => {
  star.dataset.value = index + 1; // ⭐ IMPORTANT FIX

  star.addEventListener("click", () => {
    selectedRating = Number(star.dataset.value);

    fillStars(selectedRating);
  });
});

// ==============================
// ⭐ FILL STAR FUNCTION
// ==============================
function fillStars(count) {
  stars.forEach((star, index) => {
    star.classList.remove("fa-solid");
    star.classList.add("fa-regular");

    if (index < count) {
      star.classList.remove("fa-regular");
      star.classList.add("fa-solid");
    }
  });
}

// ==============================
// ⭐ SUBMIT RATING
// ==============================
submitBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    msg.innerText = "Please login to rate ❗";
    return;
  }

  if (!selectedRating) {
    msg.innerText = "Please select rating ⭐";
    return;
  }

  try {
    const res = await fetch("https://kivan-backend.onrender.com/api/ratings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId,
        rating: selectedRating,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      msg.innerText = data.message || "Rating failed";
      return;
    }

    msg.innerText = "Thanks for your rating ❤️";
    submitBtn.disabled = true;

    // ⭐ rating submit হওয়ার পর avg rating reload
    fetchAverageRating();

  } catch (err) {
    msg.innerText = "Server error";
  }
});

// ==============================
// ⭐ FETCH AVERAGE RATING
// ==============================
async function fetchAverageRating() {
  try {
    const res = await fetch(
      `https://kivan-backend.onrender.com/api/ratings/${productId}`
    );
    const data = await res.json();

    if (!avgRatingEl) return;

    if (data.total === 0) {
      avgRatingEl.innerText = "No ratings yet";
      fillStars(0);
    } else {
      avgRatingEl.innerText = `⭐ ${data.avgRating.toFixed(
        1
      )} / 5 (${data.total} reviews)`;

      // ⭐⭐⭐ AUTO STAR FILL (MAIN FIX)
      fillStars(Math.round(data.avgRating));
    }
  } catch (err) {
    console.error("Average rating error", err);
  }
}

// ==============================
// 🔥 PAGE LOAD এ AVG RATING
// ==============================
fetchAverageRating();
