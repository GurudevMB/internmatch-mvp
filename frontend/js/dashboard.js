const API_URL = "https://internmatch-mvp.onrender.com";


// ================= AUTH HEADERS =================

function getAuthHeaders() {

    const token =
        localStorage.getItem("accessToken");

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}


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

        const response =
            await fetch(
                `${API_URL}/applications`,
                {
                    headers: getAuthHeaders()
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load applications"
            );
        }

        const applications =
            await response.json();

        const userApplications =
            applications.filter(
                function (application) {

                    return (
                        Number(application.user_id) === userId
                    );

                }
            );

        appliedElement.textContent =
            userApplications.length;

        localStorage.setItem(
            "appliedCount",
            userApplications.length
        );

    } catch (error) {

        console.error(
            "Error loading applied count:",
            error
        );

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

        const response =
            await fetch(
                `${API_URL}/saved-internships`,
                {
                    headers: getAuthHeaders()
                }
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load saved internships"
            );
        }

        const savedInternships =
            await response.json();

        const userSavedInternships =
            savedInternships.filter(
                function (saved) {

                    return (
                        Number(saved.user_id) === userId
                    );

                }
            );

        savedElement.textContent =
            userSavedInternships.length;

        localStorage.setItem(
            "savedCount",
            userSavedInternships.length
        );

    } catch (error) {

        console.error(
            "Error loading saved count:",
            error
        );

        savedElement.textContent =
            localStorage.getItem(
                "savedCount"
            ) || 0;
    }
}


// ================= AVAILABLE INTERNSHIP COUNT =================

async function loadAvailableCount() {

    const availableElement =
        document.getElementById(
            "availableCount"
        );

    if (!availableElement) return;

    try {

        const response =
            await fetch(
                `${API_URL}/internships`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load internships"
            );
        }

        const internships =
            await response.json();

        availableElement.textContent =
            internships.length;

        localStorage.setItem(
            "availableCount",
            internships.length
        );

    } catch (error) {

        console.error(
            "Error loading internship count:",
            error
        );

        availableElement.textContent =
            localStorage.getItem(
                "availableCount"
            ) || 0;
    }
}

 
// ================= MY APPLICATIONS =================

async function loadMyApplications() {
    const container = document.getElementById("myApplicationsList");

    if (!container) return;

    const token = localStorage.getItem("accessToken");

    if (!token) {
        container.innerHTML = "<p>Please log in to view your applications.</p>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/applications`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error("Failed to load applications");
        }

        const applications = await response.json();

        if (applications.length === 0) {
            container.innerHTML = "<p>You haven't applied for any internships yet.</p>";
            return;
        }

        const internshipsResponse = await fetch(`${API_URL}/internships`);

        if (!internshipsResponse.ok) {
            throw new Error("Failed to load internship details");
        }

        const internships = await internshipsResponse.json();

        container.innerHTML = applications.map(application => {
            const internship = internships.find(
                item => Number(item.internship_id) === Number(application.internship_id)
            );

            const title = internship
                ? internship.title
                : `Internship #${application.internship_id}`;

            const status = application.status || "Applied";

            return `
                <article class="application-card">
                    <h3>${escapeApplicationText(title)}</h3>
                    <p>Application ID: ${application.application_id}</p>
                    <p>Status: <strong>${escapeApplicationText(status)}</strong></p>
                </article>
            `;
        }).join("");

    } catch (error) {
        console.error("Error loading applications:", error);
        container.innerHTML = "<p>Unable to load applications. Please refresh the page.</p>";
    }
}

function escapeApplicationText(value) {
    const element = document.createElement("span");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}


// ================= PAGE LOAD =================

loadAvailableCount();
loadAppliedCount();
loadSavedCount();
loadMyApplications();