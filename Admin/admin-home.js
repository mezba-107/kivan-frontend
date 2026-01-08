document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();
  loadProductStats();
});

async function loadDashboardData() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("https://kivan-backend.onrender.com/api/orders/admin/order-stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    document.getElementById("totalOrders").innerText = data.total || 0;
    document.getElementById("pendingOrders").innerText = data.pending || 0;
    document.getElementById("confirmedOrders").innerText = data.confirmed || 0;
    document.getElementById("shippedOrders").innerText = data.shipped || 0;
    document.getElementById("outForDeliveryOrders").innerText =
      data.outForDelivery || 0;
    document.getElementById("deliveredOrders").innerText = data.delivered || 0;
    document.getElementById("returnedOrders").innerText = data.returned || 0;
    document.getElementById("cancelledOrders").innerText = data.cancelled || 0;
  } catch (err) {
    console.error("Dashboard load failed", err);
  }
}

async function loadProductStats() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(
      "https://kivan-backend.onrender.com/api/products/admin/product-stats",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    document.getElementById("totalProducts").innerText = data.total || 0;
    document.getElementById("sneakersCount").innerText = data.sneakers || 0;
    document.getElementById("tshirtCount").innerText = data.tshirt || 0;
    document.getElementById("pantCount").innerText = data.pant || 0;
    document.getElementById("hoodieCount").innerText = data.hoodie || 0;
  } catch (err) {
    console.error("Product stats load failed", err);
  }
}
