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

  // input গুলোতে data বসানো
  document.getElementById("name").value = p.name;
  document.getElementById("price").value = p.price;
  document.getElementById("description").value = p.description || "";

  // ✅ পুরানো image remember করা
  oldImagePath = p.image;

  // ✅ previous image preview দেখানো
  if (p.image) {
    imagePreview.src = `https://kivan-backend.onrender.com${p.image}`;
    imagePreview.style.display = "block";
  }

  // ✅ OLD GALLERY LOAD + PREVIEW
if (p.gallery && p.gallery.length > 0) {
  oldGallery = p.gallery;
  galleryPreview.innerHTML = "";

  p.gallery.forEach(img => {
    const image = document.createElement("img");
    image.src = `https://kivan-backend.onrender.com${img}`;
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
   ✅ UPDATE PRODUCT
================================ */

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    let imagePath = oldImagePath;

    // ✅ যদি নতুন image select করা হয়
    if (imageInput.files.length > 0) {
      const imgForm = new FormData();
      imgForm.append("image", imageInput.files[0]);

      const uploadRes = await fetch(
        "https://kivan-backend.onrender.com/api/upload/product",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: imgForm
        }
      );

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error("Image upload failed");

      imagePath = uploadData.image;
    }

    /* ===============================
   ✅ GALLERY UPLOAD (ADD HERE 👈)
================================ */

// 👉 যদি নতুন gallery select করা হয়
if (galleryInput.files.length > 0) {
  const galleryForm = new FormData();

  Array.from(galleryInput.files).forEach(file => {
    galleryForm.append("gallery", file);
  });

  const galleryRes = await fetch(
    "https://kivan-backend.onrender.com/api/upload/gallery",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: galleryForm
    }
  );

  const galleryData = await galleryRes.json();
  if (!galleryRes.ok) throw new Error("Gallery upload failed");

  // 👉 old gallery replace হবে
  oldGallery = galleryData.images;
}


    // ✅ update request
    const updatedProduct = {
      name: document.getElementById("name").value,
      price: document.getElementById("price").value,
      description: document.getElementById("description").value,
      image: imagePath,
      gallery: oldGallery
    };

    const res = await fetch(
      `https://kivan-backend.onrender.com/api/products/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedProduct)
      }
    );

    if (!res.ok) throw new Error("Update failed");

    showPopup(
      "success",
      "Product Updated Successfully",
      "/Admin/admin-products.html"
);


} catch (err) {
  console.error(err);

  showPopup(
    "error",
    "Product Update Failed. Please try again."
  );
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
