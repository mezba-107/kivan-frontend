// ================================
// ✅ PAGE LOAD
// ================================
document.addEventListener("DOMContentLoaded", function () {

  updateCartCount();


  // =================================
  // ✅ ADD TO CART (PRODUCT PAGE)
  // =================================
  const addToCartBtn = document.querySelector(".add-to-cart");

  if (addToCartBtn) {
    addToCartBtn.addEventListener("click", function (e) {
      e.preventDefault();

      // ✅ Product Size (NEW)
      const sizeSelect = document.getElementById("product-size");
      const selectedSize = sizeSelect ? sizeSelect.value : "";

      // ❌ size না নিলে add হবে না
      if (!selectedSize) {
        showToast("⚠️ Please select a size first", "warn");
        return;
      }

      // ✅ Product Name
      const productName =
        document.querySelector(".product-title")?.textContent.trim() ||
        document.querySelector("h1")?.textContent.trim() ||
        "Unknown Product";

      // ✅ Product Price
      const priceText =
        document.querySelector(".product-price")?.textContent.replace(/[^0-9.]/g, "") ||
        document.querySelector("h4")?.textContent.replace(/[^0-9.]/g, "") ||
        "0";

      const price = parseFloat(priceText);

      // ✅ Quantity
      const quantity =
        parseInt(document.querySelector("input[type='number']")?.value) || 1;

      // ✅ Product Image
      const imgSrc =
        document.querySelector(".product-img")?.src || "";

      // ✅ Product Object (SIZE INCLUDED ✅)
      const product = {
        name: productName,
        price: price,
        quantity: quantity,
        size: selectedSize,
        image: imgSrc
      };

      // ✅ Load Cart
      let cart = JSON.parse(localStorage.getItem("cart")) || [];

      // ✅ Same product + same size check
      const existingProduct = cart.find(
        item => item.name === product.name && item.size === product.size
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.push(product);
      }

      // ✅ Save to localStorage
      localStorage.setItem("cart", JSON.stringify(cart));

      updateCartCount();


      // ✅ Fly animation (UNCHANGED ✅)
      flyToCart();
    });
  }


// =================================
// ✅ CART PAGE
// =================================
const tableBody = document.querySelector(".cart-page table");
const totalContainer = document.querySelector(".total-price table");


// ✅ DELIVERY CHARGE (CITY BASED)

function getCartDeliveryCharge() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.city) return 120;

  const city = user.city.toLowerCase().trim();
  return city === "dhaka" || city === "ঢাকা" ? 60 : 120;
}


if (tableBody && totalContainer) {

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  function updateCartDisplay() {

    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((row, index) => {
      if (index > 0) row.remove();
    });

    let subtotal = 0;

    cart.forEach((item, index) => {

      const row = document.createElement("tr");
      const total = item.price * item.quantity;
      subtotal += total;

      row.innerHTML = `
        <td>
          <div class="cart-info">
            <img src="${item.image}" width="80">
            <div>
              <p>${item.name}</p>
              <small>Size: ${item.size}</small><br>
              <small>Price: ৳ ${item.price.toFixed(2)}</small><br>
              <a href="#" class="remove" data-index="${index}">Remove</a>
            </div>
          </div>
        </td>
        <td>
          <input type="number" min="1" value="${item.quantity}"
            class="qty" data-index="${index}">
        </td>
        <td>৳ ${total.toFixed(2)}</td>
      `;

      tableBody.appendChild(row);
    });

    // 🔥 AUTO DELIVERY CHARGE
    const deliveryCharge = getCartDeliveryCharge();

    const totalAmount = subtotal + deliveryCharge;

    totalContainer.innerHTML = `
      <tr>
        <td>Subtotal</td>
        <td>৳ ${subtotal.toFixed(2)}</td>
      </tr>
      <tr>
        <td>Delivery Charge</td>
        <td>৳ ${deliveryCharge.toFixed(2)}</td>
      </tr>
      <tr>
        <td><strong>Total</strong></td>
        <td><strong>৳ ${totalAmount.toFixed(2)}</strong></td>
      </tr>
    `;
  }


  // ✅ Quantity change
  tableBody.addEventListener("change", function (e) {
    if (e.target.classList.contains("qty")) {
      const index = e.target.dataset.index;
      cart[index].quantity = parseInt(e.target.value);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartDisplay();
      updateCartCount();
    }
  });


  // ✅ REMOVE ITEM MODAL
  const removeModal = document.getElementById("remove-modal");
  const cancelBtn = document.getElementById("cancel-remove");
  const confirmBtn = document.getElementById("confirm-remove");
  let removeIndex = null;

  tableBody.addEventListener("click", e => {
    if (e.target.classList.contains("remove")) {
      e.preventDefault();
      removeIndex = e.target.dataset.index;
      removeModal.style.display = "flex";
    }
  });

  cancelBtn.onclick = () => removeModal.style.display = "none";

  confirmBtn.onclick = () => {
    cart.splice(removeIndex, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartDisplay();
    updateCartCount();
    removeModal.style.display = "none";
  };

  updateCartDisplay();
}




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


// ================================
// STEP 1 → OPEN CONFIRM POPUP
// ================================
if (confirmBtn) {
  confirmBtn.addEventListener("click", function () {
    const user = JSON.parse(localStorage.getItem("user"));

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

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) return Swal.fire("Cart is empty!");

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
      const res = await fetch("http://localhost:5000/api/orders/create", {
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

  




  // 🟢 FIX: ordered items remove from cart
  let mainCart = JSON.parse(localStorage.getItem("cart")) || [];

  popupCart.forEach(orderItem => {
    mainCart = mainCart.filter(c =>
      !(c.id === orderItem.id && c.size === orderItem.size)
    );
  });

  localStorage.setItem("cart", JSON.stringify(mainCart));
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






// =================================
// ✅ ADD TO CART FLY ANIMATION (WORKING ✅)
// =================================
function flyToCart() {

  const productImg = document.querySelector(".product-img");
  const cartIcon = document.getElementById("cart-icon");

  if (!productImg || !cartIcon) return;

  const img = productImg.cloneNode(true);
  const imgRect = productImg.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  img.classList.add("fly-img");
  img.style.position = "fixed";
  img.style.left = imgRect.left + "px";
  img.style.top = imgRect.top + "px";
  img.style.width = imgRect.width + "px";
  img.style.zIndex = "9999";

  document.body.appendChild(img);

  setTimeout(() => {
    img.style.left = cartRect.left + "px";
    img.style.top = cartRect.top + "px";
    img.style.width = "20px";
    img.style.opacity = "0";
  }, 50);

  setTimeout(() => img.remove(), 900);
}

// alart ar jnno

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}



// ============================
// ✅ NAVBAR CART COUNT
// ============================
function updateCartCount() {
  const cartCount = document.getElementById("cart-count");
  if (!cartCount) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQty > 0) {
    cartCount.textContent = totalQty;
    cartCount.classList.add("show");

    // ✅ bump animation restart
    cartCount.classList.remove("bump");
    void cartCount.offsetWidth;
    cartCount.classList.add("bump");
  } else {
    cartCount.classList.remove("show");
  }
}
});



// Popup selectors
const lgPopup = document.getElementById("loginGuestPopup");
const lgLoginBtn = document.getElementById("lgLoginBtn");
const lgGuestBtn = document.getElementById("lgGuestBtn");

// LOGIN → go to login page
lgLoginBtn.onclick = () => {
    window.location.href = "/Account/account.html";
};

// GUEST → redirect to new guest order page
lgGuestBtn.onclick = () => {
    window.location.href = "/Guest/guest-order.html";
};





