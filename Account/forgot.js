document.getElementById("forgot-btn").addEventListener("click", async () => {
  const email = document.getElementById("forgot-email").value.trim();

  if (!email) {
    Swal.fire("Error", "Enter your email", "error");
    return;
  }

  try {
    const res = await fetch("https://kivan-backend.onrender.com/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (res.ok) {
      Swal.fire("Success", "Reset link sent to your email!", "success");
    } else {
      Swal.fire("Error", data.message, "error");
    }
  } catch (err) {
    Swal.fire("Error", "Server error", "error");
  }
});
