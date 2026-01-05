document.addEventListener("DOMContentLoaded", () => {
  const userData = localStorage.getItem("user");

  if (!userData) {
    Swal.fire({
      icon: "warning",
      title: "Please log in first!",
      confirmButtonColor: "#ff523b",
    }).then(() => {
      window.location.href = "/Account/account.html";
    });
    return;
  }

  const user = JSON.parse(userData);
  const userNameEl = document.getElementById("user-name");
  const userEmailEl = document.getElementById("user-email");

  userNameEl.textContent = user.name;
  userEmailEl.textContent = user.email;

  /* ===================== LOGOUT ===================== */
  document.getElementById("logout-btn").addEventListener("click", () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ff523b",
      cancelButtonColor: "#777",
      confirmButtonText: "Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        Swal.fire({
          icon: "success",
          title: "Logged out successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => (window.location.href = "/index.html"), 1500);
      }
    });
  });

  
 /* ===================== PROFILE IMAGE LOAD ===================== */

  async function loadProfileImage() {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await fetch("https://kivan-backend.onrender.com/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = await res.json();

    if (userData.profileImage) {
      document.getElementById("profile-img").src =
        `https://kivan-backend.onrender.com/uploads/profile/${userData.profileImage}`;
    }
  } catch (err) {
    console.error("Failed to load profile image", err);
  }
}


 /* ===================== PROFILE IMAGE UPLOAD ===================== */

const uploadInput = document.getElementById("upload-photo");
const profileImg = document.getElementById("profile-img");

uploadInput.addEventListener("change", async () => {
  const file = uploadInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const res = await fetch("https://kivan-backend.onrender.com/api/auth/update-profile-image", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ instant preview
      profileImg.src = `https://kivan-backend.onrender.com/uploads/profile/${data.image}`;

      Swal.fire({
        icon: "success",
        title: "Profile image updated!",
        timer: 1200,
        showConfirmButton: false,
      });
    } else {
      Swal.fire("Error", data.message, "error");
    }
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Image upload failed", "error");
  }
});


loadProfileImage();


/* ===================== EDIT USERNAME ===================== */


const editBtn = document.getElementById("edit-name-btn");
const input = document.getElementById("edit-name-input");
const saveBtn = document.getElementById("save-name-btn");

// When clicking EDIT button
editBtn.addEventListener("click", () => {
  input.style.display = "block";
  saveBtn.style.display = "inline-block";
  input.value = user.name; 
});

// When clicking SAVE button
saveBtn.addEventListener("click", async () => {
  const newName = input.value.trim();

  if (!newName || newName === user.name) {
    input.style.display = "none";
    saveBtn.style.display = "none";
    return;
  }

  const res = await fetch("https://kivan-backend.onrender.com/api/auth/update-name", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: user.id,
      name: newName,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    user.name = newName;
    localStorage.setItem("user", JSON.stringify(user));
    userNameEl.textContent = newName;

    Swal.fire({
      icon: "success",
      title: "Username updated!",
      timer: 1200,
      showConfirmButton: false,
    });
  } else {
    Swal.fire("Error", data.message, "error");
  }

  input.style.display = "none";
  saveBtn.style.display = "none";
});



  /* ===================== MOBILE AND ADDDESS PART  ===================== */

// SAVE MOBILE
document.getElementById("save-mobile-btn").addEventListener("click", async () => {
  const mobile = document.getElementById("mobile-input").value;
  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch("https://kivan-backend.onrender.com/api/auth/update-phone", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: user.id,
      phone: mobile,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    Swal.fire("Success", "Mobile number updated!", "success");
    user.phone = mobile;
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    Swal.fire("Error", data.message, "error");
  }
});


// SAVE CITY
document.getElementById("save-city-btn").addEventListener("click", async () => {
  const city = document.getElementById("city-select").value;
  const user = JSON.parse(localStorage.getItem("user"));

  if (!city) {
    return Swal.fire("Warning", "Please select a city", "warning");
  }

  const res = await fetch("https://kivan-backend.onrender.com/api/auth/update-city", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: user.id,
      city: city,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    Swal.fire("Success", "City updated!", "success");
    user.city = city;
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    Swal.fire("Error", data.message, "error");
  }
});

// LOAD CITY ON PAGE LOAD
const citySelect = document.getElementById("city-select");
citySelect.value = user.city || "";



// SAVE ADDRESS
document.getElementById("save-address-btn").addEventListener("click", async () => {
  const address = document.getElementById("address-input").value;
  const user = JSON.parse(localStorage.getItem("user"));

  const res = await fetch("https://kivan-backend.onrender.com/api/auth/update-address", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: user.id,
      address: address,
    }),
  });

  const data = await res.json();

  if (res.ok) {
    Swal.fire("Success", "Address updated!", "success");
    user.address = address;
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    Swal.fire("Error", data.message, "error");
  }
});


// SHOW PHONE & ADDRESS ON LOAD
const mobileInput = document.getElementById("mobile-input");
const addressInput = document.getElementById("address-input");

mobileInput.value = user.phone || "";
addressInput.value = user.address || "";






  /* ===================== PASSWORD RESET MODAL ===================== */
  const modal = document.getElementById("password-modal");
  const cancelBtn = document.getElementById("cancel-reset");
  const submitBtn = document.getElementById("submit-reset");
  const currentPass = document.getElementById("current-pass");
  const newPass = document.getElementById("new-pass");
  const confirmPass = document.getElementById("confirm-pass");

  // Open modal
  document.getElementById("reset-pass-btn").addEventListener("click", () => {
    modal.classList.add("active");
  });

  // Close modal
  cancelBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    currentPass.value = "";
    newPass.value = "";
    confirmPass.value = "";
  });

  /* ===================== SECURE PASSWORD RESET ===================== */
  submitBtn.addEventListener("click", async () => {
    if (!currentPass.value || !newPass.value || !confirmPass.value) {
      return Swal.fire("⚠️ Warning", "Please fill in all fields.", "warning");
    }
    if (newPass.value !== confirmPass.value) {
      return Swal.fire("❌ Error", "Passwords do not match!", "error");
    }

    try {
      const res = await fetch("https://kivan-backend.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          email: user.email,
          currentPassword: currentPass.value,
          newPassword: newPass.value,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Password updated successfully!",
          showConfirmButton: false,
          timer: 1500,
        });
        modal.classList.remove("active");
        currentPass.value = "";
        newPass.value = "";
        confirmPass.value = "";
      } else {
        Swal.fire({
          icon: "error",
          title: "Incorrect current password!",
          text: data.message || "",
        });
      }
    } catch (err) {
      console.error("Reset password error:", err);
      Swal.fire("⚠️ Server error", "Something went wrong.", "error");
    }
  });
});


