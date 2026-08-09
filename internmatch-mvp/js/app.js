// ================= LOGIN STATUS =================

const isLoggedIn =
    localStorage.getItem("isLoggedIn");


// ================= LOGIN PROTECTION =================

const currentPage =
    window.location.pathname.split("/").pop();


const protectedPages = [
    "dashboard.html",
    "internships.html",
    "profile.html"
];


if (
    protectedPages.includes(currentPage) &&
    isLoggedIn !== "true"
) {

    window.location.href = "index.html";

}


// ================= LOGOUT BUTTON =================

const logoutLink =
    document.getElementById("logoutLink");


if (logoutLink) {

    logoutLink.addEventListener("click", function (e) {

        e.preventDefault();


        localStorage.removeItem("isLoggedIn");

        localStorage.removeItem("userEmail");

        localStorage.removeItem("profileName");


        window.location.href = "index.html";

    });

}


// ================= LOGIN BUTTON =================

const loginLink =
    document.getElementById("loginLink");


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