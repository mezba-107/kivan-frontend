const token = localStorage.getItem("token");
const wrapper = document.querySelector(".messages-wrapper");

const modal = document.getElementById("deleteModal");
const confirmBtn = document.getElementById("confirmDelete");
const cancelBtn = document.getElementById("cancelDelete");

let deleteTargetId = null;
let deleteTargetCard = null;

// =======================
// LOAD MESSAGES
// =======================
async function loadMessages() {
  const res = await fetch("https://kivan-backend.onrender.com/api/messages", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const messages = await res.json();
  wrapper.innerHTML = "";

  messages.forEach(msg => {
    wrapper.innerHTML += `
      <div class="message-card ${!msg.isRead ? "unread" : ""}">
        <div class="msg-header">
          <h4>${msg.name}</h4>
          <span class="msg-date">
            ${new Date(msg.createdAt).toLocaleDateString()}
          </span>
        </div>

        <p class="msg-email">📧 ${msg.email}</p>
        <p class="msg-phone">📞 ${msg.phone}</p>
        <p class="msg-text">${msg.message}</p>

<div class="msg-actions">
  ${
    !msg.isRead
      ? `<button class="btn-read" data-id="${msg._id}">📬 Mark Read</button>`
      : `<span class="read-label">✔ Read</span>`
  }
  <button class="btn-delete" data-id="${msg._id}">🗑️ Delete</button>
</div>

      </div>
    `;
  });
}

loadMessages();

// =======================
// OPEN MODAL
// =======================
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-delete")) {
    deleteTargetId = e.target.dataset.id;
    deleteTargetCard = e.target.closest(".message-card");
    modal.classList.remove("hidden");
  }
});

// =======================
// CANCEL DELETE
// =======================
cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  deleteTargetId = null;
  deleteTargetCard = null;
});

// =======================
// CONFIRM DELETE
// =======================
confirmBtn.addEventListener("click", async () => {
  if (!deleteTargetId) return;

  try {
    const res = await fetch(
      `https://kivan-backend.onrender.com/api/messages/${deleteTargetId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (res.ok) {
      deleteTargetCard.remove();
      if (typeof loadMessageCount === "function") {
        loadMessageCount();
      }
    }
  } catch (err) {
    console.error(err);
  }

  modal.classList.add("hidden");
});


// =======================
// MARK AS READ
// =======================
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-read")) {
    const msgId = e.target.dataset.id;

    try {
      const res = await fetch(
        `https://kivan-backend.onrender.com/api/messages/${msgId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (res.ok) {
        const card = e.target.closest(".message-card");

        // 🔥 UI update
        card.classList.remove("unread");
        e.target.outerHTML = `<span class="read-label">✔ Read</span>`;

        // 🔔 navbar unread count update
        if (typeof loadMessageCount === "function") {
          loadMessageCount();
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
});
