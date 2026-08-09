// ================= LOGIN STATUS =================

const isLoggedIn =
    localStorage.getItem("isLoggedIn");


// ================= CURRENT PAGE =================

const currentPage =
    window.location.pathname.split("/").pop();


// ================= PROTECTED PAGES =================

const protectedPages = [
    "dashboard.html",
    "internships.html",
    "profile.html"
];


// ================= LOGIN PROTECTION =================

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


        // Clear login session

        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("profileName");


        // Go to home page

        window.location.href = "index.html";

    });

}


// ================= LOGIN BUTTON =================

const loginLink =
    document.getElementById("loginLink");


if (isLoggedIn === "true") {

    // Logged in → hide Login

    if (loginLink) {
        loginLink.style.display = "none";
    }


    // Logged in → show Logout

    if (logoutLink) {
        logoutLink.style.display = "inline-block";
    }

} else {

    // Logged out → show Login

    if (loginLink) {
        loginLink.style.display = "inline-block";
    }


    // Logged out → hide Logout

    if (logoutLink) {
        logoutLink.style.display = "none";
    }

}