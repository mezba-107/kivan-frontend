fetch("/Admin/admin-nav.html")
  .then(res => res.text())
  .then(data => {
    const navDiv = document.getElementById("admin-navbar");
    navDiv.innerHTML = data;

    // ==============================
    // 🔔 LOAD MESSAGE COUNT (ADMIN)
    // ==============================
    loadMessageCount();

    // ✅📦 LOAD ORDER COUNT (ADD THIS)
    loadOrderCount(); // 🔥 এই লাইনটাই missing ছিল

    // ✅ ACTIVE + ANIMATION
    const links = navDiv.querySelectorAll(".nav-links a");
    const currentPage = window.location.pathname.split("/").pop();

    links.forEach(link => {
      const linkPage = link.getAttribute("href").split("/").pop();
      if (linkPage === currentPage) {
        link.classList.add("active");

        link.animate(
          [
            { transform: "translateY(6px)", opacity: 0 },
            { transform: "translateY(-2px)", opacity: 1 }
          ],
          {
            duration: 400,
            easing: "ease-out"
          }
        );
      }
    });
  })
  .catch(err => console.log("NAV ERROR:", err));



// ==============================
// 🔔 MESSAGE COUNT FUNCTION
// ==============================
async function loadMessageCount() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://localhost:5000/api/messages/count", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    const badge = document.getElementById("message-count");
    if (badge) {
      badge.innerText = data.count || 0;
    }

  } catch (err) {
    console.error("Failed to load message count", err);
  }
}



// ==============================
// 📦 ORDER COUNT FUNCTION
// ==============================
async function loadOrderCount() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch(
      "http://localhost:5000/api/orders/admin/pending-count",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await res.json();
    console.log("ORDER COUNT:", data); // debug

    const badge = document.getElementById("order-count");
    if (!badge) return;

    badge.innerText = data.count || 0;

    if (data.count > 0) {
      badge.style.display = "flex";
      badge.classList.add("pulse");
    } else {
      badge.style.display = "none";
    }

  } catch (err) {
    console.error("Order count error", err);
  }
}
