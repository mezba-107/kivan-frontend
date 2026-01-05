document.addEventListener("DOMContentLoaded", loadDashboardData);

async function loadDashboardData() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://localhost:5000/api/orders/admin/order-stats", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    document.getElementById("totalOrders").innerText = data.total || 0;
    document.getElementById("pendingOrders").innerText = data.pending || 0;
    document.getElementById("confirmedOrders").innerText = data.confirmed || 0;
    document.getElementById("shippedOrders").innerText = data.shipped || 0;
    document.getElementById("outForDeliveryOrders").innerText = data.outForDelivery || 0;
    document.getElementById("deliveredOrders").innerText = data.delivered || 0;
    document.getElementById("returnedOrders").innerText = data.returned || 0;
    document.getElementById("cancelledOrders").innerText = data.cancelled || 0;

  } catch (err) {
    console.error("Dashboard load failed", err);
  }
}
