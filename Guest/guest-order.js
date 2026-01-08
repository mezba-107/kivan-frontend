document.addEventListener("DOMContentLoaded", function () {

    const cart = JSON.parse(localStorage.getItem("guestCart")) || [];

    const guestCartItems = document.getElementById("guestCartItems");
    const guestSubtotal = document.getElementById("guestSubtotal");
    const guestShipping = document.getElementById("guestShipping");
    const guestTotal = document.getElementById("guestTotal");
    const guestDue = document.getElementById("guestDue");

    const citySelect = document.getElementById("guestCity");
    const shippingSelect = document.getElementById("shippingMethod");

    let subtotal = 0;

    // ================================
    // SHOW CART ITEMS
    // ================================
    function loadCart() {
        guestCartItems.innerHTML = "";
        subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            subtotal += itemTotal;

            guestCartItems.innerHTML += `
                <div class="cart-line">
                    <span>${item.name} (Size: ${item.size}) × ${item.qty}</span>
                    <span>৳${itemTotal}</span>
                </div>
            `;
        });

        guestSubtotal.textContent = "৳" + subtotal;
        calculateTotal();
    }

    // ================================
    // SHIPPING UPDATE BASED ON CITY
    // ================================
    function calculateTotal() {
        let shippingCharge = 0;

        if (citySelect.value === "Dhaka") {
            shippingCharge = 60;
            shippingSelect.value = "inside";
            shippingSelect.disabled = false;
        } else if (citySelect.value) {
            shippingCharge = 120;
            shippingSelect.value = "outside";
            shippingSelect.disabled = true;
        }

        guestShipping.textContent = "৳" + shippingCharge;

        const total = subtotal + shippingCharge;
        guestTotal.textContent = "৳" + total;
        guestDue.textContent = "৳" + total;

        return total;
    }

    citySelect.addEventListener("change", calculateTotal);
    shippingSelect.addEventListener("change", calculateTotal);

    // Load cart at start
    loadCart();

    // ================================
    // SUBMIT ORDER
    // ================================
    document.getElementById("guestOrderForm").addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("guestName").value.trim();
        const phone = document.getElementById("guestPhone").value.trim();
        const address = document.getElementById("guestAddress").value.trim();

        const shippingCharge = citySelect.value === "Dhaka" ? 60 : 120;
        const paymentMethod = document.getElementById("paymentMethod").value;

        const totalAmount = calculateTotal();

        const orderData = {
            name,
            phone,
            address,
            items: cart,
            totalAmount,
            shippingCharge,
            paymentMethod
        };

        try {
            const res = await fetch("http://localhost:5000/api/orders/guest-create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData),
            });

            const data = await res.json();

            if (!res.ok) {
                alert("❌ Order Failed: " + data.message);
                return;
            }

            // ================================
            // ✅ SUCCESS POPUP
            // ================================
            const popup = document.getElementById("successPopup");
            popup.style.display = "flex";

            // ✅ SAVE GUEST PHONE
            localStorage.setItem("guestPhone", phone);

            // clear cart
            localStorage.removeItem("guestCart");

            // ok button
            document.getElementById("popupOkBtn").onclick = () => {
                popup.style.display = "none";
                window.location.href = "/product cart/my-orders.html";
            };

        } catch (error) {
            console.error("Order error:", error);
            alert("❌ Something went wrong!");
        }
    });

});
