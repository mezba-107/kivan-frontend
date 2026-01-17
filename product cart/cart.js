// ================================
// ✅ PAGE LOAD
// ================================
document.addEventListener("DOMContentLoaded", function () {

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  updateCartCount();

  // =================================
  // ✅ CART PAGE
  // =================================
  const tableBody = document.querySelector(".cart-page table");
  const totalContainer = document.querySelector(".total-price table");

  // ✅ REMOVE MODAL ELEMENTS
  const removeModal = document.getElementById("remove-modal");
  const cancelRemoveBtn = document.getElementById("cancel-remove");
  const confirmRemoveBtn = document.getElementById("confirm-remove");
  let removeIndex = null;

  function getCartDeliveryCharge() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.city) return 120;
    const city = user.city.toLowerCase().trim();
    return city === "dhaka" || city === "ঢাকা" ? 60 : 120;
  }

  if (tableBody && totalContainer) {

    let cart = [];
    let cartLoaded = false; // ✅ FIX (important)

    if (isLoggedIn) {
      loadCartFromDB();
    } else {
      // ✅ GUEST CART LOAD
      cart = (JSON.parse(localStorage.getItem("guestCart")) || []).map(item => ({
        id: item.productId,
        name: item.name,
        image: item.image.startsWith("http")
          ? item.image.replace("https://kivan-backend.onrender.com", "")
          : item.image,
        price: item.price,
        quantity: item.qty,
        size: item.size
      }));

      cartLoaded = true;
      updateCartDisplay();
      updateCartCount();
    }

    // ===============================
    // 🔥 LOAD CART FROM DB (LOGIN)
    // ===============================
    async function loadCartFromDB() {
      const res = await fetch("https://kivan-backend.onrender.com/api/cart", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      cart = (data.items || []).map(item => ({
        id: item.product._id,
        name: item.product.name,
        image: item.product.image,
        price: item.price,
        quantity: item.qty,
        size: item.size
      }));

      cartLoaded = true; // ✅ FIX
      updateCartDisplay();
      updateCartCount();
    }

    // ===============================
    // ✅ DISPLAY CART
    // ===============================
    function updateCartDisplay() {

      // ✅ FIX: DB load শেষ না হলে empty ধরবে না
      if (!cartLoaded) return;

      tableBody.querySelectorAll("tr").forEach((r, i) => i > 0 && r.remove());

      let subtotal = 0;

      cart.forEach((item, index) => {
        const total = item.price * item.quantity;
        subtotal += total;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>
            <div class="cart-info">
              <img src="${item.image?.url || item.image}" width="80">
              <div>
                <p>${item.name}</p>
                <small>Size: ${item.size}</small><br>
                <small>Price: ৳ ${item.price}</small><br>
                <a href="#" class="remove" data-index="${index}">Remove</a>
              </div>
            </div>
          </td>

<td>
  <input 
    type="number" 
    min="1" 
    value="${item.quantity}"
    class="qty-input"
    data-index="${index}"
  >
</td>

          <td>৳ ${total}</td>
        `;

        tableBody.appendChild(row);
      });

      const deliveryCharge = getCartDeliveryCharge();
      totalContainer.innerHTML = `
        <tr><td>Subtotal</td><td>৳ ${subtotal}</td></tr>
        <tr><td>Delivery</td><td>৳ ${deliveryCharge}</td></tr>
        <tr><td><strong>Total</strong></td><td><strong>৳ ${subtotal + deliveryCharge}</strong></td></tr>
      `;
    }

    // ===============================
    // 🔔 REMOVE CLICK → SHOW MODAL
    // ===============================
    tableBody.addEventListener("click", (e) => {
      if (!e.target.classList.contains("remove")) return;

      e.preventDefault();
      removeIndex = e.target.dataset.index;
      removeModal.style.display = "flex";
    });

    cancelRemoveBtn.addEventListener("click", () => {
      removeModal.style.display = "none";
      removeIndex = null;
    });

    confirmRemoveBtn.addEventListener("click", async () => {

      if (removeIndex === null) return;

      const item = cart[removeIndex];
      if (!item) return;

      if (isLoggedIn) {
        await fetch(
          `https://kivan-backend.onrender.com/api/cart/remove/${item.id}?size=${item.size}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        await loadCartFromDB();
      } else {
        cart.splice(removeIndex, 1);

        const rawGuestCart = cart.map(item => ({
          productId: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          qty: item.quantity,
          size: item.size
        }));

        localStorage.setItem("guestCart", JSON.stringify(rawGuestCart));
        updateCartDisplay();
        updateCartCount();
      }

      removeModal.style.display = "none";
      removeIndex = null;
    });

    // ===============================
// 🔄 QTY CHANGE (NO RELOAD)
// ===============================
tableBody.addEventListener("input", async (e) => {
  if (!e.target.classList.contains("qty-input")) return;

  const index = e.target.dataset.index;
  let newQty = parseInt(e.target.value);

  if (isNaN(newQty) || newQty < 1) {
    newQty = 1;
    e.target.value = 1;
  }

  const item = cart[index];
  if (!item) return;

  // 🔐 LOGIN USER → DB UPDATE
  if (isLoggedIn) {
    await fetch("https://kivan-backend.onrender.com/api/cart/update", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        productId: item.id,
        size: item.size,
        qty: newQty
      })
    });
  }
  // 👤 GUEST → localStorage UPDATE
  else {
    cart[index].quantity = newQty;

    const rawGuestCart = cart.map(p => ({
      productId: p.id,
      name: p.name,
      image: p.image,
      price: p.price,
      qty: p.quantity,
      size: p.size
    }));

    localStorage.setItem("guestCart", JSON.stringify(rawGuestCart));
  }

  // 🔄 UI + NAVBAR UPDATE
  cart[index].quantity = newQty;
  updateCartDisplay();
  updateCartCount();
});


  }
});














// ================================
// POPUP SYSTEM (FINAL TWO-STEP VERSION)
// ================================

function getDeliveryCharge(city) {
  if (!city) return 120;

  const c = city.toLowerCase().trim();

  if (c === "dhaka" || c === "ঢাকা") {
    return 60;
  }

  return 120;
}


// Buttons
const confirmBtn = document.getElementById("confirmOrderBtn");
const cancelPopupBtn = document.getElementById("cancelPopupBtn");
const nextStepBtn = document.getElementById("nextStepBtn");
const backBtn = document.getElementById("backToStep1");
const finalConfirmBtn = document.getElementById("finalConfirmBtn");
const removeBtn = document.getElementById("removeProductBtn");

// Step Popups
const popupBox = document.getElementById("order-confirm-popup");
const step2Popup = document.getElementById("step2Popup");

// Slider Buttons
const prevBtn = document.getElementById("prevProduct");
const nextBtn = document.getElementById("nextProduct");

// Current product index
let currentIndex = 0;

// Popup cart array
let popupCart = [];


// =========================
// CANCEL POPUP
// =========================
if (cancelPopupBtn) {
  cancelPopupBtn.onclick = () => {
    popupBox.style.display = "none";
  };
}


/// ================================
// STEP 1 → OPEN CONFIRM POPUP (DB FIX)
// ================================
if (confirmBtn) {
  confirmBtn.addEventListener("click", async function () {

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user) {
      document.getElementById("loginGuestPopup").style.display = "flex";
      return;
    }

    if (!user.name || !user.phone || !user.address || !user.city) {
      Swal.fire({
        icon: "warning",
        title: "Complete Your Profile",
        text: "Name, Phone, Address & City required.",
        confirmButtonColor: "#ff523b",
      }).then(() => {
        sessionStorage.setItem("profile_incomplete", "1");
        window.location.href = "/profile/profile.html";
      });
      return;
    }

    // =========================
    // 🔥 LOGIN USER → LOAD CART FROM DB
    // =========================
    let cart = [];

    if (token) {
      const res = await fetch("https://kivan-backend.onrender.com/api/cart", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();

      cart = (data.items || []).map(item => ({
        id: item.product._id,
        name: item.product.name,
        image: item.product.image?.url || item.product.image,
        price: item.price,
        quantity: item.qty,
        size: item.size
      }));
    }

    if (cart.length === 0) {
      Swal.fire("Cart is empty!");
      return;
    }

    popupCart = JSON.parse(JSON.stringify(cart));
    currentIndex = 0;

    updateSlider();

    document.getElementById("popup-user-name").innerText = user.name;
    document.getElementById("popup-user-phone").innerText = user.phone;
    document.getElementById("popup-user-city").innerText = user.city;
    document.getElementById("popup-user-address").innerText = user.address;

    popupBox.style.display = "flex";
  });
}


// ================================
// SLIDER UPDATE
// ================================
function updateSlider() {
  const p = popupCart[currentIndex];

  document.getElementById("popup-product-img").src = p.image;
  document.getElementById("popup-product-title").innerText = p.name;
  document.getElementById("popup-product-size").innerText = `Size: ${p.size || "N/A"}`;
  document.getElementById("popup-product-qty").innerText = `Quantity: ${p.quantity}`;

  const totalPrice = p.price * p.quantity;
  document.getElementById("popup-product-price").innerText = `Price: ${p.price} × ${p.quantity} = ${totalPrice} ৳`;
}


// ================================
// SLIDER BUTTONS
// ================================
if (prevBtn) {
  prevBtn.onclick = () => {
    currentIndex = (currentIndex - 1 + popupCart.length) % popupCart.length;
    updateSlider();
  };
}

if (nextBtn) {
  nextBtn.onclick = () => {
    currentIndex = (currentIndex + 1) % popupCart.length;
    updateSlider();
  };
}


// ================================
// REMOVE CURRENT PRODUCT (FULL FIX)
// ================================
if (removeBtn) {
  removeBtn.onclick = () => {

    // শুধু popupCart থেকে remove হবে
    popupCart.splice(currentIndex, 1);

    // ❌ localStorage cart update হবে না → তাই cart আগের মতো থাকবে

    // popup ফাঁকা → popup বন্ধ
    if (popupCart.length === 0) {
      popupBox.style.display = "none";
      return;
    }

    // index fix
    if (currentIndex >= popupCart.length) {
      currentIndex = popupCart.length - 1;
    }

    updateSlider();
  };
}




// ================================
// STEP 1 → STEP 2
// ================================
if (nextStepBtn) {
  nextStepBtn.onclick = function () {

    popupBox.style.display = "none";
    step2Popup.style.display = "flex";

    const invoiceDiv = document.getElementById("invoiceList");
    invoiceDiv.innerHTML = "";

    let subtotal = 0;

    popupCart.forEach((p, index) => {
      const total = p.price * p.quantity;
      subtotal += total;

      invoiceDiv.innerHTML += `
        <p><strong>${index + 1}. ${p.name}</strong> — ${p.price} × ${p.quantity} = ${total} ৳</p>
      `;
    });

    const user = JSON.parse(localStorage.getItem("user"));

    // ✅ DELIVERY CHARGE CALCULATION (MAIN FIX)
    const deliveryCharge = getDeliveryCharge(user.city);

    // ✅ UI UPDATE
    document.getElementById("invSubtotal").innerText = subtotal;
    document.getElementById("invDelivery").innerText = deliveryCharge;
    document.getElementById("invTotal").innerText = subtotal + deliveryCharge;

    document.getElementById("invUser").innerText = user.name;
    document.getElementById("invMobile").innerText = user.phone;
    document.getElementById("invCity").innerText = user.city;
    document.getElementById("invAddress").innerText = user.address;

    const pay = document.getElementById("invPayment");
    pay.value = "";
    pay.classList.remove("error-border");
    document.getElementById("paymentError").style.display = "none";
  };
}


// ================================
// BACK BUTTON
// ================================
if (backBtn) {
  backBtn.onclick = function () {
    step2Popup.style.display = "none";
    popupBox.style.display = "flex";
  };
}

// ================================
// FINAL CONFIRM — AUTO SCROLL + CART FIX
// ================================
if (finalConfirmBtn) {
  finalConfirmBtn.onclick = async function () {

    const paymentMethod = document.getElementById("invPayment").value;
    const paymentBox = document.getElementById("invPayment");
    const paymentError = document.getElementById("paymentError");

    const scrollBox = document.querySelector("#step2Popup .invoice-box");

    paymentError.style.display = "none";
    paymentBox.classList.remove("shake", "error-border");

    // VALIDATION
    if (!paymentMethod) {

      paymentError.style.display = "block";
      paymentBox.classList.add("shake", "error-border");

      scrollBox.scrollTo({
        top: paymentBox.offsetTop - 120,
        behavior: "smooth"
      });

      setTimeout(() => paymentBox.classList.remove("shake"), 400);
      return;
    }

    // ORDER SUBMIT
    const token = localStorage.getItem("token");
    let subtotal = popupCart.reduce((sum, p) => sum + p.price * p.quantity, 0);

    const user = JSON.parse(localStorage.getItem("user"));
const shippingCharge = getDeliveryCharge(user.city);


const orderData = {
  items: popupCart,
  paymentMethod,
  shippingCharge: shippingCharge,   // 🔥 NEW
  totalAmount: subtotal + shippingCharge
};


    try {
      const res = await fetch("https://kivan-backend.onrender.com/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

if (res.ok) {
  Swal.fire({
    icon: "success",
    title: "Order Confirmed!",
    timer: 1800,
    showConfirmButton: false,
  });

  




// 🟢 LOGIN USER → REMOVE ORDERED ITEMS FROM DB CART
for (const item of popupCart) {
  await fetch(
    `https://kivan-backend.onrender.com/api/cart/remove/${item.id}?size=${item.size}`,
    {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );
}

updateCartCount();


  step2Popup.style.display = "none";
  setTimeout(() => location.reload(), 1200);
}
  else {
        Swal.fire("Error", data.message || "Order failed", "error");
      }

    } catch {
      Swal.fire("Server Error", "Please try again later.", "error");
    }
  };
}






// ================================
// REMOVE ERROR ON CHANGE
// ================================
document.getElementById("invPayment").addEventListener("change", function () {
  this.classList.remove("error-border");
  document.getElementById("paymentError").style.display = "none";
});



// ================================
// LOGIN / GUEST POPUP
// ================================

// selectors
const lgPopup = document.getElementById("loginGuestPopup");
const lgBox = document.querySelector(".lg-box");
const lgLoginBtn = document.getElementById("lgLoginBtn");
const lgGuestBtn = document.getElementById("lgGuestBtn");

// LOGIN → account page
lgLoginBtn.onclick = (e) => {
  e.stopPropagation(); // popup close trigger হবে না
  window.location.href = "/Account/account.html";
};

// GUEST → guest order page
lgGuestBtn.onclick = (e) => {
  e.stopPropagation();
  window.location.href = "/Guest/guest-order.html";
};

// click outside → popup off
lgPopup.addEventListener("click", (e) => {
  if (!lgBox.contains(e.target)) {
    lgPopup.style.display = "none";
  }
});

// ESC → popup off
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    lgPopup.style.display = "none";
  }
});





