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

        // Update count AFTER backend data loads
        localStorage.setItem(
            "availableCount",
            internships.length
        );

        loadButtonStates();
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


// ================= APPLY / UNAPPLY =================

function applyInternship(id) {

    let applied =
        JSON.parse(
            localStorage.getItem("appliedInternships")
        ) || [];

    if (applied.includes(id)) {

        applied =
            applied.filter(
                item => item !== id
            );

        localStorage.setItem(
            "appliedInternships",
            JSON.stringify(applied)
        );

        localStorage.setItem(
            "appliedCount",
            applied.length
        );

        const btn =
            document.getElementById("apply-" + id);

        if (btn) {
            btn.innerText = "Apply";
        }

        alert(
            "❌ Application Removed Successfully!"
        );

        return;
    }

    applied.push(id);

    localStorage.setItem(
        "appliedInternships",
        JSON.stringify(applied)
    );

    localStorage.setItem(
        "appliedCount",
        applied.length
    );

    const btn =
        document.getElementById("apply-" + id);

    if (btn) {
        btn.innerText = "✅ Applied";
    }

    alert(
        "✅ Application Submitted Successfully!"
    );
}


// ================= SAVE / UNSAVE =================

function saveInternship(id) {

    let saved =
        JSON.parse(
            localStorage.getItem("savedInternships")
        ) || [];

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
            document.getElementById("save-" + id);

        if (btn) {
            btn.innerText = "⭐ Save";
        }

        alert(
            "❌ Internship Removed from Saved!"
        );

        return;
    }

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
        document.getElementById("save-" + id);

    if (btn) {
        btn.innerText = "★ Saved";
    }

    alert(
        "⭐ Internship Saved Successfully!"
    );
}


// ================= SEARCH =================

function setupSearch() {

    const searchInput =
        document.getElementById("searchInput");

    const internshipCards =
        document.querySelectorAll(".internship-card");

    if (!searchInput) {
        return;
    }

    searchInput.oninput = function () {

        const searchText =
            this.value
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

                card.style.display =
                    cardText.includes(searchText)
                        ? ""
                        : "none";
            }
        );
    };

    // Search from home page
    const urlParams =
        new URLSearchParams(
            window.location.search
        );

    const searchQuery =
        urlParams.get("search");

    if (searchQuery) {

        searchInput.value =
            searchQuery;

        searchInput.dispatchEvent(
            new Event("input")
        );
    }
}


// ================= LOAD SAVED / APPLIED STATE =================

function loadButtonStates() {

    let applied =
        JSON.parse(
            localStorage.getItem(
                "appliedInternships"
            )
        ) || [];

    let saved =
        JSON.parse(
            localStorage.getItem(
                "savedInternships"
            )
        ) || [];

    applied.forEach(function (id) {

        const btn =
            document.getElementById(
                "apply-" + id
            );

        if (btn) {
            btn.innerText = "✅ Applied";
        }
    });

    saved.forEach(function (id) {

        const btn =
            document.getElementById(
                "save-" + id
            );

        if (btn) {
            btn.innerText = "★ Saved";
        }
    });
}


// ================= PAGE LOAD =================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadInternships();

    }
);