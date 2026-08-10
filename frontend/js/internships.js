const API_URL = "http://127.0.0.1:8000";

// ================= LOAD INTERNSHIPS FROM BACKEND =================

async function loadInternships() {

    const internshipList =
        document.querySelector(".internship-list");

    if (!internshipList) return;

    try {

        const response =
            await fetch(`${API_URL}/internships`);

        if (!response.ok) {
            throw new Error("Failed to load internships");
        }

        const internships =
            await response.json();

        // Clear hardcoded cards
        internshipList.innerHTML = "";

        internships.forEach(function (internship) {

            const card =
                document.createElement("div");

            card.className = "internship-card";

            card.innerHTML = `
                <h2>${internship.title}</h2>

                <p>Company #${internship.company_id}</p>

                <span>
                    ${internship.location || "Location not specified"}
                    |
                    ₹${internship.stipend || "Not specified"}
                </span>

                <p>
                    ${internship.description || ""}
                </p>

                <p>
                    <strong>Duration:</strong>
                    ${internship.duration || "Not specified"}
                </p>

                <p>
                    <strong>Skills:</strong>
                    ${internship.skills_required || "Not specified"}
                </p>

                <button
                    id="apply-${internship.internship_id}"
                    onclick="applyInternship(${internship.internship_id})">
                    Apply
                </button>

                <button
                    id="save-${internship.internship_id}"
                    onclick="saveInternship(${internship.internship_id})">
                    ⭐ Save
                </button>
            `;

            internshipList.appendChild(card);

        });

        // Update available internship count
        localStorage.setItem(
            "availableCount",
            internships.length
        );

        // Load current button states from backend/localStorage
        await loadButtonStates();

        setupSearch();

    } catch (error) {

        console.error(
            "Error loading internships:",
            error
        );

        internshipList.innerHTML = `
            <p>
                Unable to load internships.
                Please make sure the backend server is running.
            </p>
        `;
    }
}


// ================= APPLY INTERNSHIP =================

async function applyInternship(id) {

    const token =
        localStorage.getItem("accessToken");

    if (!token) {

        alert("Please login first.");
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


        // ================= GET EXISTING APPLICATIONS =================

        const getResponse =
            await fetch(
                `${API_URL}/applications`
            );

        if (!getResponse.ok) {

            throw new Error(
                "Failed to load applications"
            );
        }

        const applications =
            await getResponse.json();


        // ================= CHECK ALREADY APPLIED =================

        const existingApplication =
            applications.find(
                function (application) {

                    return (
                        application.user_id === userId &&
                        application.internship_id === id
                    );

                }
            );


        if (existingApplication) {

            alert(
                "⚠️ You have already applied for this internship."
            );

            return;
        }


        // ================= POST APPLICATION =================

        const response =
            await fetch(
                `${API_URL}/applications`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        user_id: userId,
                        internship_id: id
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to submit application"
            );
        }


        const data =
            await response.json();


        console.log(
            "Application created:",
            data
        );


        // ================= UPDATE BUTTON =================

        const btn =
            document.getElementById(
                "apply-" + id
            );

        if (btn) {

            btn.innerText =
                "✅ Applied";
        }


        // ================= UPDATE LOCAL COUNT =================

        const currentCount =
            Number(
                localStorage.getItem(
                    "appliedCount"
                ) || 0
            );

        localStorage.setItem(
            "appliedCount",
            currentCount + 1
        );


        alert(
            "✅ Application Submitted Successfully!"
        );


    } catch (error) {

        console.error(
            "Application error:",
            error
        );

        alert(
            "❌ Unable to submit application."
        );
    }
}


// ================= SAVE / UNSAVE =================

function saveInternship(id) {

    let saved =
        JSON.parse(
            localStorage.getItem(
                "savedInternships"
            )
        ) || [];


    // ================= UNSAVE =================

    if (saved.includes(id)) {

        saved =
            saved.filter(
                item => item !== id
            );


        localStorage.setItem(
            "savedInternships",
            JSON.stringify(saved)
        );


        localStorage.setItem(
            "savedCount",
            saved.length
        );


        const btn =
            document.getElementById(
                "save-" + id
            );


        if (btn) {

            btn.innerText =
                "⭐ Save";
        }


        alert(
            "❌ Internship Removed from Saved!"
        );

        return;
    }


    // ================= SAVE =================

    saved.push(id);


    localStorage.setItem(
        "savedInternships",
        JSON.stringify(saved)
    );


    localStorage.setItem(
        "savedCount",
        saved.length
    );


    const btn =
        document.getElementById(
            "save-" + id
        );


    if (btn) {

        btn.innerText =
            "★ Saved";
    }


    alert(
        "⭐ Internship Saved Successfully!"
    );
}


// ================= SEARCH =================

function setupSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    const internshipCards =
        document.querySelectorAll(
            ".internship-card"
        );


    if (!searchInput) {
        return;
    }


    function applySearch(searchText) {

        searchText =
            searchText
                .toLowerCase()
                .trim()
                .replace(/\s+/g, " ");


        internshipCards.forEach(
            function (card) {

                const cardText =
                    card.textContent
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, " ");


                if (
                    cardText.includes(
                        searchText
                    )
                ) {

                    card.style.display = "";

                } else {

                    card.style.display = "none";
                }

            }
        );
    }


    // ================= MANUAL SEARCH =================

    searchInput.addEventListener(
        "input",
        function () {

            applySearch(
                this.value
            );

        }
    );


    // ================= SEARCH FROM HOME PAGE =================

    const urlParams =
        new URLSearchParams(
            window.location.search
        );


    const searchQuery =
        urlParams.get("search");


    if (searchQuery) {

        searchInput.value =
            searchQuery;

        applySearch(
            searchQuery
        );
    }
}


// ================= LOAD BUTTON STATES =================

async function loadButtonStates() {

    // ================= GET CURRENT USER =================

    const token =
        localStorage.getItem(
            "accessToken"
        );


    if (token) {

        try {

            const payload =
                JSON.parse(
                    atob(
                        token.split(".")[1]
                    )
                );


            const userId =
                Number(payload.sub);


            // ================= GET APPLICATIONS FROM BACKEND =================

            const response =
                await fetch(
                    `${API_URL}/applications`
                );


            if (response.ok) {

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


                // ================= UPDATE APPLY BUTTONS =================

                userApplications.forEach(
                    function (application) {

                        const btn =
                            document.getElementById(
                                "apply-" +
                                application.internship_id
                            );


                        if (btn) {

                            btn.innerText =
                                "✅ Applied";
                        }

                    }
                );


                // ================= SYNC APPLIED COUNT =================

                localStorage.setItem(
                    "appliedCount",
                    userApplications.length
                );
            }


        } catch (error) {

            console.error(
                "Error loading application states:",
                error
            );
        }
    }


    // ================= SAVED BUTTONS =================

    const saved =
        JSON.parse(
            localStorage.getItem(
                "savedInternships"
            )
        ) || [];


    saved.forEach(
        function (id) {

            const btn =
                document.getElementById(
                    "save-" + id
                );


            if (btn) {

                btn.innerText =
                    "★ Saved";
            }

        }
    );
}


// ================= PAGE LOAD =================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadInternships();

    }
);