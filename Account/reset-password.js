document.addEventListener("DOMContentLoaded", () => {
  // 1) URL থেকে token নেওয়া
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Invalid Link",
      text: "No token found in the URL!",
    });
    return;
  }

  // 2) Form submit handle
  const form = document.getElementById("resetForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (newPassword.length < 6) {
      return Swal.fire({
        icon: "warning",
        title: "Weak Password",
        text: "Password must be at least 6 characters!",
      });
    }

    if (newPassword !== confirmPassword) {
      return Swal.fire({
        icon: "error",
        title: "Mismatch",
        text: "New passwords do not match!",
      });
    }

    try {
      const res = await fetch("https://kivan-backend.onrender.com/api/auth/reset-password-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Password Reset!",
          text: "Your password has been updated successfully.",
          confirmButtonText: "Go to Login",
        }).then(() => {
          window.location.href = "/Account/account.html"; // Login page এ redirect
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Invalid or expired token",
        });
      }
    } catch (err) {
      console.error("Reset error:", err);
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: "Something went wrong. Try again later.",
      });
    }
  });
});
