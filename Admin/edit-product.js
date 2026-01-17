const galleryInput = document.getElementById("gallery");
const galleryPreview = document.getElementById("galleryPreview");

let oldGallery = [];

/* ===============================
   ✅ BASIC SETUP
================================ */

const form = document.getElementById("editProductForm");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

const token = localStorage.getItem("token");
if (!token) location.href = "/login.html";

// ✅ URL থেকে product id নেওয়া
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

// ✅ পুরানো image path রাখার জন্য
let oldImagePath = "";

/* ===============================
   ✅ LOAD PRODUCT DATA
================================ */

async function loadProduct() {
  const res = await fetch(`https://kivan-backend.onrender.com/api/products/${productId}`);
  const p = await res.json();

  document.getElementById("name").value = p.name;
  document.getElementById("price").value = p.price;
  document.getElementById("description").value = p.description || "";

  // ✅ main image
  oldImagePath = p.image?.url || "";
  if (p.image?.url) {
    imagePreview.src = p.image.url;
    imagePreview.style.display = "block";
  }

  // ✅ gallery preview
  if (p.gallery && p.gallery.length > 0) {
    oldGallery = p.gallery;
    galleryPreview.innerHTML = "";

    p.gallery.forEach(img => {
      const image = document.createElement("img");
      image.src = img.url;
      image.style.width = "80px";
      image.style.height = "80px";
      image.style.objectFit = "cover";
      image.style.borderRadius = "6px";

      galleryPreview.appendChild(image);
    });
  }
}

loadProduct();

/* ===============================
   ✅ IMAGE PREVIEW (NEW IMAGE)
================================ */

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.style.display = "block";
  }
});

/* ===============================
   ✅ UPDATE PRODUCT (FIXED)
================================ */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const loader = document.getElementById("loadingOverlay");
  loader.style.display = "flex"; // ✅ SHOW LOADER

  try {
    const formData = new FormData();

    formData.append("name", document.getElementById("name").value);
    formData.append("price", document.getElementById("price").value);
    formData.append(
      "description",
      document.getElementById("description").value
    );

    if (imageInput.files.length > 0) {
      formData.append("image", imageInput.files[0]);
    }

    if (galleryInput.files.length > 0) {
      Array.from(galleryInput.files).forEach(file => {
        formData.append("gallery", file);
      });
    }

    const res = await fetch(
      `https://kivan-backend.onrender.com/api/products/${productId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    if (!res.ok) throw new Error("Update failed");

    loader.style.display = "none"; // ✅ HIDE LOADER

    showPopup(
      "success",
      "Product Updated Successfully",
      "/Admin/admin-products.html"
    );

  } catch (err) {
    loader.style.display = "none"; // ❌ error হলেও hide
    console.error(err);
    showPopup("error", "Product Update Failed. Please try again.");
  }
});

/* ===============================
  ✅ GALLERY PREVIEW (NEW SELECT)
================================ */

galleryInput.addEventListener("change", () => {
  galleryPreview.innerHTML = "";

  Array.from(galleryInput.files).forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "6px";

    galleryPreview.appendChild(img);
  });
});

/* ===============================
  ✅ POPUP FUNCTIONALITY
================================ */

function showPopup(type, message, redirect = null) {
  const overlay = document.getElementById("popupOverlay");
  const icon = document.getElementById("popupIcon");
  const title = document.getElementById("popupTitle");
  const msg = document.getElementById("popupMessage");

  if (type === "success") {
    icon.className = "popup-icon success";
    icon.innerHTML = "✓";
    title.innerText = "Success";
  } else {
    icon.className = "popup-icon error";
    icon.innerHTML = "✕";
    title.innerText = "Error";
  }

  msg.innerText = message;
  overlay.style.display = "flex";
  overlay.dataset.redirect = redirect || "";
}

function closePopup() {
  const overlay = document.getElementById("popupOverlay");
  overlay.style.display = "none";

  if (overlay.dataset.redirect) {
    location.href = overlay.dataset.redirect;
  }
}
