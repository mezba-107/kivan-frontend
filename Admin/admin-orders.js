document.addEventListener("DOMContentLoaded", () => {


  // ================================
// ✅ CANCEL REQUEST POPUP GLOBALS (NEW)
// ================================
let activeCancelOrderId = null;

const cancelOverlay = document.getElementById("cancelReqOverlay");
const cancelReasonText = document.getElementById("cancelReqReason");
const btnApprove = document.getElementById("reqApprove");
const btnDecline = document.getElementById("reqDecline");
const btnBack = document.getElementById("reqBack");


  // ================================
  // ✅ POPUP GLOBALS
  // ================================
  let deleteTargetOrderId = null;

  const overlay = document.getElementById("confirmOverlay");
  const yesBtn = document.getElementById("confirmYes");
  const noBtn = document.getElementById("confirmNo");

  const ordersContainer = document.getElementById("ordersContainer");

  // ✅ admin token
  const token = localStorage.getItem("token");

  if (!token) {
    alert("❌ No token found. Please login as admin.");
    location.href = "/login.html";
  }

  // ================================
  // ✅ FETCH ALL ORDERS (ADMIN)
  // ================================
  async function fetchOrders() {
    const res = await fetch(
      "https://kivan-backend.onrender.com/api/orders/admin/all-orders",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const orders = await res.json();
    renderOrders(orders);
  }

  // ================================
  // ✅ RENDER ORDERS
  // ================================
  function renderOrders(orders) {
    ordersContainer.innerHTML = "";

    if (!orders.length) {
      ordersContainer.innerHTML = "<p>No orders found</p>";
      return;
    }

    orders.forEach((order) => {
      ordersContainer.innerHTML += `
        <div class="order-card" id="order-${order._id}">

          <div class="order-header">
            <div class="customer-info">
              <b>${order.userInfo?.name || order.user?.name || "No name"}</b><br>
              📞 ${order.userInfo?.phone || order.user?.phone || "No phone"}<br>
              🏠 ${order.userInfo?.address || order.user?.address || "No address"}<br>
              <small>${new Date(order.createdAt).toLocaleString()}</small>
            </div>

            <!-- ✅ RIGHT SIDE (NEW ICON + STATUS) -->
            <div class="order-right">

              ${
                order.cancelRequest?.requested
                  ? `
<div 
  class="cancel-req-icon" 
  title="Cancel request pending"

onclick="openCancelRequest(
  '${order._id}',
  '${(order.cancelRequest.reason || "").replace(/'/g, "\\'")}',
  '${order.cancelRequest.status}'
)"

>
  📩
  <span class="dot"></span>
</div>

                `
                  : ""
              }

<select onchange="updateStatus('${order._id}', this.value)">
  <option value="pending" ${order.status==="pending"?"selected":""}>pending</option>
  <option value="confirmed" ${order.status==="confirmed"?"selected":""}>confirmed</option>

  <option value="shipped" ${order.status==="shipped"?"selected":""}>shipped</option>
  <option value="out-for-delivery" ${order.status==="out-for-delivery"?"selected":""}>
    out-for-delivery
  </option>

  <option value="delivered" ${order.status==="delivered"?"selected":""}>delivered</option>
  <option value="returned" ${order.status==="returned"?"selected":""}>returned</option>

  <option value="cancelled" ${order.status==="cancelled"?"selected":""}>cancelled</option>
</select>


            </div>
          </div>

          <ul>
            ${order.items.map(i => `
              <li>
                ${i.name}
                <small>(Size: ${i.size || "N/A"})</small>
                × ${i.quantity}
              </li>
            `).join("")}
          </ul>

          <b>Total: ৳${order.totalAmount}</b>

          <div class="admin-actions">
            <a
              href="/product cart/invoice.html?orderId=${order._id}&admin=true"
              target="_blank"
              class="invoice-btn"
            >
              🧾 View Invoice
            </a>

            <button class="delete-btn" onclick="deleteOrder('${order._id}')">
              ❌ Cancel Order
            </button>
          </div>

        </div>
      `;
    });
  }


  // ================================
// ✅ OPEN CANCEL REQUEST POPUP
// ================================
window.openCancelRequest = function (orderId, reason, status) {
  activeCancelOrderId = orderId;

  // reason show
  cancelReasonText.innerHTML = `<b>Reason:</b><br>${reason}`;

  // default: pending হলে button থাকবে
  btnApprove.style.display = "inline-block";
  btnDecline.style.display = "inline-block";

  // ✅ approved হলে
  if (status === "approved") {
    cancelReasonText.innerHTML += `
      <br><br>
      <b style="color:green">✅ Cancel request APPROVED</b>
    `;
    btnApprove.style.display = "none";
    btnDecline.style.display = "none";
  }

  // ❌ declined হলে
  if (status === "declined") {
    cancelReasonText.innerHTML += `
      <br><br>
      <b style="color:red">❌ Cancel request DECLINED</b>
    `;
    btnApprove.style.display = "none";
    btnDecline.style.display = "none";
  }

  cancelOverlay.style.display = "flex";
};


// ================================
// ✅ BACK BUTTON (CLOSE POPUP)
// ================================
btnBack.onclick = () => {
  cancelOverlay.style.display = "none";
  activeCancelOrderId = null;
};

// ================================
// ❌ DECLINE CANCEL REQUEST
// ================================
btnDecline.onclick = async () => {
  if (!activeCancelOrderId) return;

  const res = await fetch(
    `https://kivan-backend.onrender.com/api/orders/admin/cancel-request/decline/${activeCancelOrderId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.ok) {
    cancelOverlay.style.display = "none";
    activeCancelOrderId = null;
    fetchOrders(); // reload orders
  } else {
    alert("❌ Failed to decline request");
  }
};


// ================================
// ✅ APPROVE CANCEL REQUEST
// ================================
btnApprove.onclick = async () => {
  if (!activeCancelOrderId) return;

  const res = await fetch(
    `https://kivan-backend.onrender.com/api/orders/admin/cancel-request/approve/${activeCancelOrderId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.ok) {
    cancelOverlay.style.display = "none";
    activeCancelOrderId = null;
    fetchOrders(); // reload orders
  } else {
    alert("❌ Failed to approve request");
  }
};




  // ================================
  // ✅ UPDATE STATUS
  // ================================
  window.updateStatus = async function (orderId, status) {
    const res = await fetch(
      `https://kivan-backend.onrender.com/api/orders/admin/update-status/${orderId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (res.ok) {
      fetchOrders();
    } else {
      alert("❌ Failed to update status");
    }
  };

  // ================================
  // ✅ OPEN CONFIRM POPUP
  // ================================
  window.deleteOrder = function (orderId) {
    deleteTargetOrderId = orderId;
    overlay.style.display = "flex";
  };

  // ================================
  // ✅ POPUP BUTTONS
  // ================================
  noBtn.onclick = () => {
    overlay.style.display = "none";
    deleteTargetOrderId = null;
  };

  yesBtn.onclick = async () => {
    if (!deleteTargetOrderId) return;

    const orderId = deleteTargetOrderId;
    const card = document.getElementById(`order-${orderId}`);
    if (card) card.classList.add("removing");

    overlay.style.display = "none";

    setTimeout(async () => {
      const res = await fetch(
        `https://kivan-backend.onrender.com/api/orders/admin/delete/${orderId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok && card) {
        card.classList.remove("removing");
        alert("❌ Failed to cancel order");
      }
    }, 350);
  };

  // ================================
  // ✅ INITIAL LOAD
  // ================================
  fetchOrders();

});

