const token = localStorage.getItem("token");
const guestPhone = localStorage.getItem("guestPhone");

const orderId = new URLSearchParams(location.search).get("orderId");
if (!orderId) {
  alert("Order ID missing");
  throw new Error("orderId missing");
}

function money(n) {
  return "৳ " + Number(n).toLocaleString();
}

// 🔑 decide API
let apiUrl = "";
let headers = {};

if (token) {
  apiUrl = `http://localhost:5000/api/orders/${orderId}`;
  headers = { Authorization: `Bearer ${token}` };
} else {
  apiUrl = `http://localhost:5000/api/orders/guest-invoice/${orderId}`;
}

// 🔥 FETCH INVOICE
fetch(apiUrl, { headers })
  .then(res => {
    if (!res.ok) throw new Error("Invoice fetch failed");
    return res.json();
  })
  .then(order => renderInvoice(order))
  .catch(err => {
    console.error(err);
    alert("Failed to load invoice");
  });
function renderInvoice(order) {

  document.getElementById("invoiceNo").innerText =
    "INV-" + order._id.slice(-6);

  document.getElementById("invoiceDate").innerText =
    new Date(order.createdAt).toLocaleDateString();

  // BILL TO
  const name = order.userInfo?.name || order.user?.name || "Guest";
  const address = order.userInfo?.address || order.user?.address || "N/A";
  const phone = order.userInfo?.phone || order.user?.phone || "N/A";
  const email = order.user?.email || "";

  document.getElementById("billTo").innerHTML = `
    <b>${name}</b><br>
    ${address}<br>
    Phone: ${phone}<br>
    ${email ? "Email: " + email : ""}
  `;

  document.getElementById("shipTo").innerText = address;

  document.getElementById("orderDetails").innerHTML = `
    Order ID: ${order._id}<br>
    Order Time: ${new Date(order.createdAt).toLocaleString()}
  `;

  document.getElementById("paymentInfo").innerHTML = `
    Method: ${order.paymentMethod || "Cash on Delivery"}<br>
    Status: ${order.status}
  `;

  let subtotal = 0;
  const body = document.getElementById("itemsBody");
  body.innerHTML = "";

  order.items.forEach(i => {
    const qty = i.quantity ?? i.qty ?? 1;
    const amount = i.price * qty;
    subtotal += amount;

    body.innerHTML += `
      <tr>
        <td>${i.name} ${i.size ? `(Size: ${i.size})` : ""}</td>
        <td>${qty}</td>
        <td>${money(i.price)}</td>
        <td>-</td>
        <td>${money(amount)}</td>
      </tr>
    `;
  });

  const delivery = order.shippingCharge || 0;
  const total = subtotal + delivery;

  document.getElementById("subtotal").innerText = money(subtotal);
  document.getElementById("delivery").innerText = money(delivery);
  document.getElementById("paid").innerText = money(0);
  document.getElementById("total").innerText = money(total);
  document.getElementById("due").innerText = money(total);
}
