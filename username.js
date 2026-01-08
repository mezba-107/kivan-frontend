// ==================== SHOW USERNAME ON NAVBAR (CLICK → PROFILE PAGE) ====================
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.getElementById("MenuItems");
  if (!menuItems) return;

  const userData = localStorage.getItem("user");
  const accountLink = Array.from(menuItems.querySelectorAll("a")).find(
    (a) =>
      a.textContent.trim().toLowerCase() === "account" ||
      a.textContent.trim().toLowerCase().startsWith("hi,")
  );

  // ✅ যদি user login করা থাকে
  if (userData && accountLink) {
    const user = JSON.parse(userData);
    accountLink.textContent = `Hi, ${user.name}`;
    accountLink.href = "/profile/profile.html"; // ← এখানেই ঠিক করা হলো
    accountLink.style.fontWeight = "bold";
    accountLink.style.color = "#ff523b";
    accountLink.style.cursor = "pointer";
  }

  // ❌ যদি user না থাকে (logout অবস্থায়)
  else if (accountLink) {
    accountLink.textContent = "Account";
    accountLink.href = "/Account/account.html";
    accountLink.style.fontWeight = "normal";
    accountLink.style.color = "inherit";
  }
});


// =================================
// ✅ FLY TO CART ANIMATION
// =================================  

document.addEventListener("DOMContentLoaded", () => {

  const btn = document.querySelector(".add-to-cart");
  const sizeSelect = document.getElementById("product-size");

  btn.addEventListener("click", () => {

    const selectedSize = sizeSelect?.value;

    // ❌ size না থাকলে → fly হবে না
    if (!selectedSize) {
      console.log("❌ Size not selected");
      return;
    }

    // ✅ size থাকলে → fly
    flyToCart();
  });

});

function flyToCart() {
  const productImg = document.getElementById("ProductImg");
  const cartIcon = document.getElementById("cart-icon");

  if (!productImg || !cartIcon) {
    console.log("❌ image or cart icon missing");
    return;
  }

  const imgRect = productImg.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const img = productImg.cloneNode(true);
  img.classList.add("fly-img");

  img.style.position = "fixed";
  img.style.left = imgRect.left + "px";
  img.style.top = imgRect.top + "px";
  img.style.width = imgRect.width + "px";
  img.style.zIndex = "99999";

  document.body.appendChild(img);

  setTimeout(() => {
    img.style.left = cartRect.left + "px";
    img.style.top = cartRect.top + "px";
    img.style.width = "30px";
    img.style.opacity = "0";
  }, 50);

  setTimeout(() => img.remove(), 900);
}




// =================================
// 🔔 GLOBAL CART UPDATE TRIGGER
// =================================
function triggerCartUpdate() {
  document.dispatchEvent(new Event("cartUpdated"));
}

// =================================
// ✅ NAVBAR CART COUNT
// =================================
async function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;

  const token = localStorage.getItem("token");
  let totalQty = 0;

  // LOGIN USER → DB CART
  if (token) {
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        totalQty = (data.items || []).reduce(
          (sum, item) => sum + (item.qty || 0),
          0
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  // GUEST USER → LOCAL CART
  else {
    const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];
    totalQty = guestCart.reduce(
      (sum, item) => sum + (item.qty || item.quantity || 0),
      0
    );
  }

  // UI UPDATE
  if (totalQty > 0) {
    cartCount.textContent = totalQty;
    cartCount.classList.add("show");

    cartCount.classList.remove("bump");
    void cartCount.offsetWidth;
    cartCount.classList.add("bump");
  } else {
    cartCount.textContent = "";
    cartCount.classList.remove("show");
  }
}

// AUTO
document.addEventListener("cartUpdated", updateCartCount);
document.addEventListener("DOMContentLoaded", updateCartCount);


// =========================
// TOAST FUNCTION (COMMON)
// =========================
function showToast(message, type = "warn") {
  const toast = document.getElementById("toast");

  if (!toast) {
    console.error("Toast element not found");
    return;
  }

  toast.textContent = message;

  // reset
  toast.className = "";
  toast.id = "toast";

  toast.classList.add(type);
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}
