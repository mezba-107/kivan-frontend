const usersTableBody = document.getElementById("usersTableBody");
const ordersContainer = document.getElementById("ordersContainer");

const API_BASE = "https://kivan-backend.onrender.com/api";
const TOKEN = localStorage.getItem("token");

if (!TOKEN) {
  alert("Unauthorized! Please login again.");
  window.location.href = "/login.html";
}

/* ===============================
   FETCH & RENDER USERS
================================ */
async function fetchUsers() {
  try {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

    if (!res.ok) throw new Error("Failed to fetch users");

    const users = await res.json();
    renderUsers(users);
  } catch (err) {
    console.error("❌ Failed to load users", err);
  }
}

function renderUsers(users) {
  usersTableBody.innerHTML = "";

  users.forEach(user => {
    const tr = document.createElement("tr");

    const avatar =
      user.avatar && user.avatar.url
        ? user.avatar.url
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name || "User"
          )}&background=0D1B2A&color=fff`;

    tr.innerHTML = `
      <td>
        <img 
  src="${user.profileImage?.url || 'https://ui-avatars.com/api/?name=' + user.name}" 
  class="user-avatar"
/>

      </td>

      <td>${user.name || "-"}</td>
      <td>${user.phone || user.mobile || "-"}</td>
      <td>${user.address || "-"}</td>
      <td>${user.city || "-"}</td>
      <td>${user.totalOrders || user.orders || 0}</td>

      <td>
        <select class="role-select role-${user.role}" data-id="${user._id}">
          <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
          <option value="moderator" ${user.role === "moderator" ? "selected" : ""}>Moderator</option>
          <option value="user" ${user.role === "user" ? "selected" : ""}>User</option>
        </select>
      </td>

      <td>
        <button class="save-btn" onclick="saveRole('${user._id}')">Save</button>
        <button class="view-btn" onclick="viewOrders('${user._id}')">View Orders</button>
      </td>
    `;

    usersTableBody.appendChild(tr);
  });
}

/* ===============================
   UPDATE USER ROLE
================================ */
async function saveRole(userId) {
  const select = document.querySelector(`select[data-id="${userId}"]`);
  const role = select.value;

  try {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TOKEN}`
      },
      body: JSON.stringify({ role })
    });

    if (!res.ok) throw new Error("Role update failed");

showPopup("Role updated successfully");

  } catch (err) {
    console.error(err);
showPopup("Failed to update role");

  }
}


/* ================================
   VIEW ORDERS (FROM BACKEND)
================================ */
async function viewOrders(userId) {
  ordersContainer.innerHTML = "";

  try {
    const res = await fetch(
      `https://kivan-backend.onrender.com/api/admin/users/${userId}/orders`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    const orders = await res.json();

    orders.forEach((order, index) => {
      const div = document.createElement("div");
      div.className = "order-card";

      div.innerHTML = `
        <div class="order-header" onclick="toggleItems(${index})">
          <span>
            <strong>#ORD-${order._id.slice(-4)}</strong>
            • ${new Date(order.createdAt).toLocaleDateString()}
          </span>

          <span class="badge ${order.status}">
            ${order.status.toUpperCase()}
          </span>
        </div>

        <div class="items" id="items-${index}">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Size</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>

            <tbody>
              ${order.items.map(i => `
                <tr>
                  <td><img src="${i.image}" class="item-img"></td>
                  <td>${i.name || "N/A"}</td>
                  <td>${i.size || "-"}</td>
                  <td>${i.quantity || 1}</td>
                  <td>৳${i.price}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <!-- ✅ SUMMARY MOVED TO BOTTOM -->
          <div class="order-summary bottom">
            <span>Total: <strong>৳${order.totalAmount}</strong></span>
            <span>Shipping: <strong>৳${order.shippingCharge || 0}</strong></span>
            <span class="due">
              Due: <strong>৳${order.totalAmount + (order.shippingCharge || 0)}</strong>
            </span>
          </div>
        </div>
      `;

      ordersContainer.appendChild(div);
    });

    document.getElementById("ordersModal").style.display = "flex";

  } catch (err) {
    console.error(err);
    alert("Failed to load orders");
  }
}

/* ================================
   TOGGLE ITEMS
================================ */
function toggleItems(index) {
  const el = document.getElementById(`items-${index}`);
  el.style.display = el.style.display === "block" ? "none" : "block";
}

/* ================================
   CLOSE MODAL
================================ */
function closeOrders() {
  document.getElementById("ordersModal").style.display = "none";
}



window.viewOrders = viewOrders;

function toggleItems(index) {
  const el = document.getElementById(`items-${index}`);
  el.style.display = el.style.display === "none" ? "block" : "none";
}

window.toggleItems = toggleItems;



function showPopup(message) {
  const popup = document.getElementById("successPopup");
  document.getElementById("popupMessage").innerText = message;

  popup.style.display = "flex";

  setTimeout(() => {
    popup.style.display = "none";
  }, 2500);
}

function closePopup() {
  document.getElementById("successPopup").style.display = "none";
}



/* ===============================
   INIT
================================ */
fetchUsers();
