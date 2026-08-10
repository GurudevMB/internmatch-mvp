const API_URL = "http://127.0.0.1:8000";

// ================= WELCOME USER =================

const email =
    localStorage.getItem("userEmail");

const welcome =
    document.getElementById("welcomeUser");

if (welcome) {

    if (email) {

        const name =
            email.split("@")[0];

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


// ================= GET CURRENT USER ID =================

function getCurrentUserId() {

    const token =
        localStorage.getItem("accessToken");

    if (!token) {
        return null;
    }

    try {

        const payload =
            JSON.parse(
                atob(
                    token.split(".")[1]
                )
            );

        return Number(payload.sub);

    } catch (error) {

        console.error(
            "Error reading user token:",
            error
        );

        return null;
    }
}


// ================= APPLIED COUNT FROM BACKEND =================

async function loadAppliedCount() {

    const appliedElement =
        document.getElementById("appliedCount");

    if (!appliedElement) return;

    const userId =
        getCurrentUserId();

    if (!userId) {

        appliedElement.textContent = 0;

        return;
    }

    try {

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

        // Fallback
        appliedElement.textContent =
            localStorage.getItem(
                "appliedCount"
            ) || 0;
    }
}


// ================= SAVED COUNT FROM BACKEND =================

async function loadSavedCount() {

    const savedElement =
        document.getElementById("savedCount");

    if (!savedElement) return;

    const userId =
        getCurrentUserId();

    if (!userId) {

        savedElement.textContent = 0;

        return;
    }

    try {

        // ================= GET SAVED INTERNSHIPS =================

        const response =
            await fetch(
                `${API_URL}/saved-internships`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load saved internships"
            );
        }

        const savedInternships =
            await response.json();


        // ================= CURRENT USER SAVED INTERNSHIPS =================

        const userSavedInternships =
            savedInternships.filter(
                function (saved) {

                    return (
                        saved.user_id === userId
                    );

                }
            );


        // ================= UPDATE COUNT =================

        savedElement.textContent =
            userSavedInternships.length;


        // Keep localStorage synced
        localStorage.setItem(
            "savedCount",
            userSavedInternships.length
        );


    } catch (error) {

        console.error(
            "Error loading saved count:",
            error
        );

        // Fallback
        savedElement.textContent =
            localStorage.getItem(
                "savedCount"
            ) || 0;
    }
}


// ================= AVAILABLE INTERNSHIP COUNT =================

const availableElement =
    document.getElementById(
        "availableCount"
    );

if (availableElement) {

    availableElement.textContent =
        localStorage.getItem(
            "availableCount"
        ) || 0;
}


// ================= PAGE LOAD =================

loadAppliedCount();
loadSavedCount();