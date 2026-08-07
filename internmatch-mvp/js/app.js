// Check Login Status
const isLoggedIn = localStorage.getItem("isLoggedIn");

// Logout Button
const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {

    logoutLink.addEventListener("click", function (e) {

        e.preventDefault();

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");

        window.location.href = "index.html";

    });

}

// Login Button
const loginLink = document.getElementById("loginLink");

if (isLoggedIn === "true") {

    if (loginLink) {
        loginLink.style.display = "none";
    }

    if (logoutLink) {
        logoutLink.style.display = "inline-block";
    }

} else {

    if (loginLink) {
        loginLink.style.display = "inline-block";
    }

    if (logoutLink) {
        logoutLink.style.display = "none";
    }

}