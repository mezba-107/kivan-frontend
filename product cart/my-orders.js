console.log("✅ my order js working");

let previousOrderStatus = {};

// ✅ ADD (NEW)
let selectedOrder = null;

// ================= POPUP (NEW) =================
function showPopup(message) {
  document.getElementById("popupText").innerText = message;
  document.getElementById("customPopup").style.display = "flex";
}

function closePopup() {
  document.getElementById("customPopup").style.display = "none";
}
// ==============================================


// ✅ ADD (NEW) — cancel status text
function getCancelStatusText(order) {
  if (!order.cancelRequest || !order.cancelRequest.requested) return "";

  if (order.cancelRequest.status === "pending") {
    return "⏳ Waiting for admin approval";
  }

  if (order.cancelRequest.status === "approved") {
    return "✅ Cancel Approved";
  }

  if (order.cancelRequest.status === "declined") {
    return "❌ Request Denied";
  }

  return "";
}


const ordersWrapper = document.querySelector(".orders-wrapper");
const token = localStorage.getItem("token");
const guestPhone = localStorage.getItem("guestPhone");

async function loadMyOrders() {

  ordersWrapper.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading your orders...</p>
    </div>
  `;

  if (!token && !guestPhone) {
    ordersWrapper.innerHTML = `<p>Please login to view orders</p>`;
    return;
  }

  let apiUrl = "";
  let headers = {};

  if (token) {
    apiUrl = "https://kivan-backend.onrender.com/api/orders/my-orders";
    headers = { Authorization: `Bearer ${token}` };
  } else {
    apiUrl = `https://kivan-backend.onrender.com/api/orders/guest-orders/${guestPhone}`;
  }

  try {
    const res = await fetch(apiUrl, { headers });
    if (!res.ok) throw new Error("Unauthorized");

    const orders = await res.json();

    if (orders.length === 0) {
      ordersWrapper.innerHTML = `<p>😕 You have no orders yet</p>`;
      return;
    }

    ordersWrapper.innerHTML = "";

    orders.forEach((order) => {

const canRequestCancel =
  (order.status === "pending" || order.status === "confirmed") &&
  !order.cancelRequest?.requested;


      const prevStatus = previousOrderStatus[order._id];

      let itemsHTML = "";
      order.items.forEach((item) => {
        itemsHTML += `
          <div class="order-item">
            <span>
              ${item.name}
              <small>(Size: ${item.size || "N/A"})</small>
              x${item.quantity}
            </span>
            <span>৳${item.price * item.quantity}</span>
          </div>
        `;
      });

      ordersWrapper.innerHTML += `
        <div class="order-card" id="order-${order._id}">
          <div class="order-header">
            <span>Order ID: ${order._id}</span>
            <span>${new Date(order.createdAt).toLocaleDateString()}</span>
          </div>

          ${itemsHTML}

          <div class="order-footer">

            <div class="price-breakdown">
              <p>Subtotal: ৳${order.subtotal ?? (order.totalAmount - (order.shippingCharge || 0))}</p>
              <p>Delivery: ৳${order.shippingCharge ?? 0}</p>
              <strong>Total: ৳${order.totalAmount}</strong>
            </div>

            <div class="order-actions">
              <span class="status ${order.status}">
                ${order.status.toUpperCase()}
              </span>

              <button 
                class="invoice-btn"
                onclick="goInvoice('${order._id}')">
                <span class="invoice-icon">🧾</span>
                Invoice
              </button>

              ${
                getCancelStatusText(order)
                  ? `<div class="cancel-status">${getCancelStatusText(order)}</div>`
                  : ""
              }

              ${canRequestCancel ? `
                <button
                  class="cancel-req-btn"
                  onclick='openCancelPopup(${JSON.stringify(order)})'>
                  ❌ Cancel Order Request
                </button>
              ` : ""}
            </div>
          </div>
        </div>
      `;

      if (prevStatus && prevStatus !== order.status) {
        const card = document.getElementById(`order-${order._id}`);
        if (card) {
          card.classList.add("highlight");
          setTimeout(() => {
            card.classList.remove("highlight");
          }, 600);
        }
      }

      previousOrderStatus[order._id] = order.status;
    });

  } catch (err) {
    console.error(err);
    ordersWrapper.innerHTML = `<p>Failed to load orders</p>`;
  }
}

loadMyOrders();
setInterval(loadMyOrders, 6000);

function goInvoice(orderId) {
  window.location.href = "/product cart/invoice.html?orderId=" + orderId;
}

// ================= CANCEL REQUEST =================

function openCancelPopup(order) {
  selectedOrder = order;

  document.getElementById("cancelPopup").style.display = "flex";
  document.getElementById("cancelOrderInfo").innerHTML = `
    <p><b>Order ID:</b> ${order._id}</p>
    <p><b>Total:</b> ৳${order.totalAmount}</p>
  `;

  document.getElementById("cancelReason").value = "";
}

function closeCancelPopup() {
  document.getElementById("cancelPopup").style.display = "none";
  selectedOrder = null;
}

async function sendCancelRequest() {
  const reason = document.getElementById("cancelReason").value.trim();

  if (!reason) {
    showPopup("Please write a reason");
    return;
  }

  try {
    const res = await fetch(
      `https://kivan-backend.onrender.com/api/orders/cancel-request/${selectedOrder._id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      showPopup(data.message || "Request failed");
      return;
    }

    showPopup("Cancel request sent successfully");
    closeCancelPopup();
    loadMyOrders();

  } catch (err) {
    showPopup("Server error");
  }
}
