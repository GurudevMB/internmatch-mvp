const API_URL = "http://127.0.0.1:8000";

// ================= WELCOME USER =================

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

        welcome.textContent =
            "Welcome Student 👋";
    }
}


// ================= APPLIED COUNT FROM BACKEND =================

async function loadAppliedCount() {

    const appliedElement =
        document.getElementById("appliedCount");

    if (!appliedElement) return;

    const token =
        localStorage.getItem("accessToken");

    if (!token) {

        appliedElement.textContent = 0;
        return;
    }

    try {

        // ================= GET USER ID FROM JWT =================

        const payload =
            JSON.parse(
                atob(
                    token.split(".")[1]
                )
            );

        const userId =
            Number(payload.sub);

        // ================= GET APPLICATIONS =================

        const response =
            await fetch(
                `${API_URL}/applications`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load applications"
            );
        }

        const applications =
            await response.json();

        // ================= CURRENT USER APPLICATIONS =================

        const userApplications =
            applications.filter(
                function (application) {

                    return (
                        application.user_id === userId
                    );

                }
            );

        // ================= UPDATE COUNT =================

        appliedElement.textContent =
            userApplications.length;

        // Keep localStorage synced
        localStorage.setItem(
            "appliedCount",
            userApplications.length
        );

    } catch (error) {

        console.error(
            "Error loading applied count:",
            error
        );

        // Fallback to existing localStorage value
        appliedElement.textContent =
            localStorage.getItem(
                "appliedCount"
            ) || 0;
    }
}


// ================= SAVED COUNT =================

const savedElement =
    document.getElementById("savedCount");

if (savedElement) {

    savedElement.textContent =
        localStorage.getItem(
            "savedCount"
        ) || 0;
}


// ================= AVAILABLE INTERNSHIP COUNT =================

const availableElement =
    document.getElementById("availableCount");

if (availableElement) {

    availableElement.textContent =
        localStorage.getItem(
            "availableCount"
        ) || 0;
}


// ================= PAGE LOAD =================

loadAppliedCount();