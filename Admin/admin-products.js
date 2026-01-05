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
  const res = await fetch("https://kivan-backend.onrender.com/api/products");
  const products = await res.json();

  productsDiv.innerHTML = "";

  products.forEach(p => {
    productsDiv.innerHTML += `
      <div class="product-card" id="p-${p._id}">

        <!-- ✅ PRODUCT IMAGE -->
        <img 
          src="https://kivan-backend.onrender.com${p.image}"
          class="product-img"
          onerror="this.src='/images/no-image.png'"
        />

        <!-- ✅ PRODUCT GALLERY -->
        ${p.gallery && p.gallery.length > 0 ? `
          <div class="product-gallery">
            ${p.gallery.map(img => `
              <img 
                src="https://kivan-backend.onrender.com${img}"
                onerror="this.src='/images/no-image.png'"
              />
            `).join("")}
          </div>
        ` : ""}

        <!-- ✅ PRODUCT INFO -->
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>

          <p class="product-desc">
            ${p.description || "No description"}
          </p>

          <p class="product-price">৳${p.price}</p>

          <button 
            class="edit-btn"
            onclick="openEdit('${p._id}')">
            ✏️ Edit
          </button>

          <button 
            class="delete-btn"
            onclick="deleteProduct('${p._id}')">
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
  const res = await fetch(`https://kivan-backend.onrender.com/api/products/${deleteId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.ok) {
    document.getElementById(`p-${deleteId}`).remove();
  }

  modal.style.display = "none";
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
