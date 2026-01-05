/* ===============================
   EXISTING TOAST (UNCHANGED)
================================ */
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}


/* ===============================
   ✅ NEW CENTER POPUP FUNCTIONS
   (ANIMATION + AUTO CLOSE ADDED)
================================ */
function showContactModal() {
  const modal = document.getElementById("contactModal");

  modal.classList.remove("hidden");

  /* 🔥 auto close after 3 seconds */
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 3000);
}

/* close button (UNCHANGED) */
document.getElementById("closeModalBtn")?.addEventListener("click", () => {
  document.getElementById("contactModal").classList.add("hidden");
});


/* ===============================
   FORM SUBMIT (UNCHANGED LOGIC)
================================ */
document.getElementById("contactForm").addEventListener("submit", async e => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();
  const msgBox = document.getElementById("contactMsg");

  try {
    const res = await fetch("https://kivan-backend.onrender.com/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, phone, message })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    /* 🔥 ONLY THIS LINE */
    showContactModal();

    e.target.reset();

  } catch (err) {
    msgBox.style.color = "#ff6b6b";
    msgBox.innerText = "❌ Failed to send message!";
  }
});
