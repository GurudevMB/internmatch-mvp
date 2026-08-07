const email = localStorage.getItem("userEmail");

document.getElementById("userEmail").textContent = email || "Not Logged In";

document.getElementById("editBtn").addEventListener("click", function () {

    alert("Edit Profile feature coming in Version 2.0 🚀");

});