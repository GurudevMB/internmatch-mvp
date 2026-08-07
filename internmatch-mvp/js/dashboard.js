const email = localStorage.getItem("userEmail");


const welcome = document.getElementById("welcomeUser");


if (welcome) {
    if (email) {
        const name = email.split("@")[0];

        welcome.textContent =
            "Welcome, " +
            name.charAt(0).toUpperCase() +
            name.slice(1) +
            " 👋";

    } else {
        welcome.textContent = "Welcome Student 👋";
    }
}


// Applied Count
const appliedElement = document.getElementById("appliedCount");


if (appliedElement) {
    appliedElement.textContent =
        localStorage.getItem("appliedCount") || 0;
}


// Saved Count
const savedElement = document.getElementById("savedCount");


if (savedElement) {
    savedElement.textContent =
        localStorage.getItem("savedCount") || 0;
}


// Available Internship Count
const availableElement = document.getElementById("availableCount");

if (availableElement) {
    availableElement.textContent =
        localStorage.getItem("availableCount") || 0;
}