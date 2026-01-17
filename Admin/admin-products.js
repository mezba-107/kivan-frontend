/* ===============================
   ✅ DOM ELEMENT
=============================== */

// যেখানে সব product card দেখানো হবে
const productsDiv = document.getElementById("products");

// localStorage থেকে admin token নেওয়া
const token = localStorage.getItem("token");

/* ===============================
   ✅ TOKEN CHECK
=============================== */

if (!token) {
  alert("Admin login required");
  location.href = "/account.html";
}

/* ===============================
   ⭐ DELETE POPUP ELEMENTS
=============================== */

let deleteId = null;
const modal = document.getElementById("deleteModal");
const confirmBtn = document.getElementById("confirmDelete");
const cancelBtn = document.getElementById("cancelDelete");

/* ===============================
   ✅ LOAD ALL PRODUCTS
=============================== */

async function loadProducts() {
  const res = await fetch("https://kivan-backend.onrender.com/api/products", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    alert("Access denied");
    return;
  }

  const products = await res.json();


  productsDiv.innerHTML = "";

  products.forEach(p => {
    productsDiv.innerHTML += `
      <div class="product-card" id="p-${p._id}">

        <!-- ✅ MAIN IMAGE -->
        <img 
          src="${p.image?.url || '/images/no-image.png'}"
          class="product-img"
        />

        <!-- ✅ GALLERY -->
        ${p.gallery && p.gallery.length ? `
          <div class="product-gallery">
            ${p.gallery.map(img => `
              <img 
                src="${img.url}"
                onerror="this.src='/images/no-image.png'"
              />
            `).join("")}
          </div>
        ` : ""}

        <!-- ✅ PRODUCT INFO -->
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-desc">${p.description || "No description"}</p>
          <p class="product-price">৳${p.price}</p>

          <button class="edit-btn" onclick="openEdit('${p._id}')">
            ✏️ Edit
          </button>

          <button class="delete-btn" onclick="deleteProduct('${p._id}')">
            ❌ Delete
          </button>
        </div>

      </div>
    `;
  });
}

/* ===============================
   ⭐ DELETE POPUP TRIGGER
=============================== */

function deleteProduct(id) {
  deleteId = id;
  modal.style.display = "flex";
}

/* ===============================
   ⭐ POPUP BUTTON ACTIONS
=============================== */

cancelBtn.addEventListener("click", () => {
  modal.style.display = "none";
  deleteId = null;
});

confirmBtn.addEventListener("click", async () => {
  if (!deleteId) return;

  // 🔄 loading start
  confirmBtn.classList.add("loading");
  confirmBtn.disabled = true;

  try {
    const res = await fetch(
      `https://kivan-backend.onrender.com/api/products/${deleteId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      document.getElementById(`p-${deleteId}`)?.remove();
    } else {
      alert("Delete failed");
    }
  } catch (err) {
    alert("Server error");
  }

  // 🔄 reset
  confirmBtn.classList.remove("loading");
  confirmBtn.disabled = false;
  modal.style.display = "none";
  deleteId = null;
});


/* ===============================
   ✅ EDIT PRODUCT PAGE OPEN
=============================== */

function openEdit(id) {
  window.location.href = `/Admin/edit-product.html?id=${id}`;
}

/* ===============================
   ✅ INITIAL LOAD
=============================== */

loadProducts();
