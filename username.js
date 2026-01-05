// ==================== SHOW USERNAME ON NAVBAR (CLICK → PROFILE PAGE) ====================
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.getElementById("MenuItems");
  if (!menuItems) return;

  const userData = localStorage.getItem("user");
  const accountLink = Array.from(menuItems.querySelectorAll("a")).find(
    (a) =>
      a.textContent.trim().toLowerCase() === "account" ||
      a.textContent.trim().toLowerCase().startsWith("hi,")
  );

  // ✅ যদি user login করা থাকে
  if (userData && accountLink) {
    const user = JSON.parse(userData);
    accountLink.textContent = `Hi, ${user.name}`;
    accountLink.href = "/profile/profile.html"; // ← এখানেই ঠিক করা হলো
    accountLink.style.fontWeight = "bold";
    accountLink.style.color = "#ff523b";
    accountLink.style.cursor = "pointer";
  }

  // ❌ যদি user না থাকে (logout অবস্থায়)
  else if (accountLink) {
    accountLink.textContent = "Account";
    accountLink.href = "/Account/account.html";
    accountLink.style.fontWeight = "normal";
    accountLink.style.color = "inherit";
  }
});

