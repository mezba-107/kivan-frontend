const form = document.getElementById("productForm");
const msg = document.getElementById("msg");
const token = localStorage.getItem("token");

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

const galleryInput = document.getElementById("gallery");
const galleryPreview = document.getElementById("galleryPreview");

/* =========================
   ✅ MAIN IMAGE PREVIEW
========================= */
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  if (file) {
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.style.display = "block";
  }
});

/* =========================
   ✅ GALLERY IMAGE PREVIEW
========================= */
galleryInput.addEventListener("change", () => {
  galleryPreview.innerHTML = ""; // reset

  const files = galleryInput.files;

  if (files.length > 0) {
    Array.from(files).forEach(file => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.style.width = "80px";
      img.style.height = "80px";
      img.style.objectFit = "cover";
      img.style.borderRadius = "8px";
      img.style.border = "1px solid #333";

      galleryPreview.appendChild(img);
    });
  }


  
});




/* =========================
   ✅ ADD PRODUCT
========================= */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    /* ✅ Upload main image */
    const imageForm = new FormData();
    imageForm.append("image", imageInput.files[0]);

    const uploadRes = await fetch(
      "https://kivan-backend.onrender.com/api/upload/product",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: imageForm
      }
    );

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) throw new Error("Image upload failed");


    // ✅ GALLERY UPLOAD START

let galleryImages = [];

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
        Authorization: `Bearer ${token}`,
      },
      body: galleryForm
    }
  );

  // ✅ ERROR CHECK
  if (!galleryRes.ok) {
    throw new Error("Gallery upload failed");
  }

  const galleryData = await galleryRes.json();
  galleryImages = galleryData.images || [];
}

// ✅ GALLERY UPLOAD END


    /* ✅ Create product */
    const productData = {
      name: document.getElementById("name").value,
      price: document.getElementById("price").value,
      description: document.getElementById("description").value,
      category: document.getElementById("category").value,
      image: uploadData.image,
      gallery: galleryImages
    };

    const res = await fetch("https://kivan-backend.onrender.com/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });

    if (!res.ok) throw new Error("Product add failed");

    msg.innerText = "✅ Product added successfully";
    form.reset();
    imagePreview.style.display = "none";
    galleryPreview.innerHTML = "";

  } catch (err) {
    console.error(err);
    msg.innerText = "❌ Failed to add product";
  }
});


