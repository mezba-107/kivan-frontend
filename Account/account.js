// ==================== DARK MODE ====================
let darkmode = localStorage.getItem("darkmode");
const themeSwitch = document.getElementById("theme-switch");
const logo = document.getElementById("logo");

const enableDarkmode = () => {
  document.body.classList.add("darkmode");
  localStorage.setItem("darkmode", "active");
  if (logo) logo.src = "/images/logo-kivan-dark.png";
};

const disableDarkmode = () => {
  document.body.classList.remove("darkmode");
  localStorage.setItem("darkmode", null);
  if (logo) logo.src = "/images/logo-kivan-light.png";
};

if (darkmode === "active") enableDarkmode();
else disableDarkmode();

if (themeSwitch) {
  themeSwitch.addEventListener("click", () => {
    darkmode = localStorage.getItem("darkmode");
    darkmode !== "active" ? enableDarkmode() : disableDarkmode();
  });
}


// ==================== GLOBAL LOADER ====================
const loader = document.getElementById("globalLoader");

function showLoader(text = "Loading...") {
  if (!loader) return;
  loader.style.display = "flex";
  loader.querySelector("p").innerText = text;
}

function hideLoader() {
  if (!loader) return;
  loader.style.display = "none";
}


// ==================== CUSTOM POPUP ====================
function showPopup(title, message, isSuccess = true) {
  const popup = document.getElementById("customPopup");
  const icon = popup.querySelector(".popup-icon");

  document.getElementById("popupTitle").innerText = title;
  document.getElementById("popupText").innerText = message;

  popup.classList.remove("success", "error");

  if (isSuccess) {
    icon.innerText = "✓";
    popup.classList.add("success");
  } else {
    icon.innerText = "✕";
    popup.classList.add("error");
  }

  popup.style.display = "flex";
}

function closePopup() {
  document.getElementById("customPopup").style.display = "none";
}


// ==================== ACCOUNT PAGE SCRIPT ====================
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Account page loaded");

  const loginForm = document.getElementById("LoginForm");
  const registerForm = document.getElementById("RegForm");

  const BASE_URL = "https://kivan-backend.onrender.com/api/auth";


// ==================== SIGNUP ====================
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = registerForm.querySelector("input[placeholder='Username']").value.trim();
    const email = registerForm.querySelector("input[placeholder='Email']").value.trim();
    const password = registerForm.querySelector("input[placeholder='Password']").value;

    if (!name || !email || !password) {
      showPopup("Error", "All fields are required!", false);
      return;
    }

    try {
      showLoader("Creating your account...");

      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      hideLoader();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showPopup(
          "Signup Successful",
          "Your account has been created & you are now logged in"
        );

        setTimeout(() => {
          window.location.href = "/profile/profile.html";
        }, 2000);
      } else {
        showPopup("Signup Failed", data.message || "Signup failed", false);
      }

    } catch (err) {
      hideLoader();
      console.error("Signup error:", err);
      showPopup("Error", "Server error. Please try again.", false);
    }
  });
}


// ==================== LOGIN ====================
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector("input[placeholder='Email']").value.trim();
    const password = loginForm.querySelector("input[placeholder='Password']").value;

    if (!email || !password) {
      showPopup("Login Failed", "Email and password are required", false);
      return;
    }

    try {
      showLoader("Logging you in...");

      const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      hideLoader();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        showPopup("Login Successful", "You have logged in successfully");

        setTimeout(() => {
          window.location.href = "/index.html";
        }, 1500);
      } else {
        showPopup("Login Failed", data.message || "Invalid email or password", false);
      }

    } catch (err) {
      hideLoader();
      console.error("Login error:", err);
      showPopup("Error", "Server error. Please try again later.", false);
    }
  });
}

});


// ==================== SHOW USER NAME ON NAVBAR ====================
document.addEventListener("DOMContentLoaded", () => {
  const menuItems = document.getElementById("MenuItems");
  const userData = localStorage.getItem("user");
  if (!menuItems) return;

  const accountLink = Array.from(menuItems.querySelectorAll("a")).find(
    (a) => a.textContent.trim() === "Account"
  );

  if (userData && accountLink) {
    const user = JSON.parse(userData);
    accountLink.textContent = `Hi, ${user.name}`;
    accountLink.href = "#";

    const logoutItem = document.createElement("li");
    const logoutLink = document.createElement("a");
    logoutLink.textContent = "Logout";
    logoutLink.href = "#";
    logoutLink.style.color = "red";

    logoutLink.addEventListener("click", () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      alert("Logged out successfully!");
      window.location.href = "/index.html";
    });

    logoutItem.appendChild(logoutLink);
    menuItems.appendChild(logoutItem);
  }
});
