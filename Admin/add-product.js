const form = document.getElementById("productForm");
const msg = document.getElementById("msg");
const token = localStorage.getItem("token");

const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

const galleryInput = document.getElementById("gallery");
const galleryPreview = document.getElementById("galleryPreview");

const loader = document.getElementById("loading-overlay");
const submitBtn = form.querySelector("button");


/* MAIN IMAGE PREVIEW */
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (file) {
    imagePreview.src = URL.createObjectURL(file);
    imagePreview.style.display = "block";
  }
});

/* GALLERY PREVIEW */
galleryInput.addEventListener("change", () => {
  galleryPreview.innerHTML = "";
  Array.from(galleryInput.files).forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.style.width = "80px";
    img.style.height = "80px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";
    galleryPreview.appendChild(img);
  });
});

/* ADD PRODUCT */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!imageInput.files.length) {
    msg.innerText = "❌ Main image required";
    return;
  }

  // 🔄 SHOW LOADER
  loader.style.display = "flex";
  submitBtn.disabled = true;

  try {
    const formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("price", priceInput.value);
    formData.append("description", descriptionInput.value);
    formData.append("category", categoryInput.value);
    formData.append("image", imageInput.files[0]);

    Array.from(galleryInput.files).forEach(file => {
      formData.append("gallery", file);
    });

    const res = await fetch("https://kivan-backend.onrender.com/api/products", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) throw new Error("Product add failed");

    msg.innerText = "✅ Product added successfully";

    form.reset();
    imagePreview.style.display = "none";
    galleryPreview.innerHTML = "";

  } catch (err) {
    console.error(err);
    msg.innerText = "❌ Failed to add product";
  } finally {
    // 🔄 HIDE LOADER
    loader.style.display = "none";
    submitBtn.disabled = false;
  }
});
