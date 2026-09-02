const API_URL = "http://127.0.0.1:8000";


// ================= AUTH HEADERS =================

function getAuthHeaders() {

    const token =
        localStorage.getItem(
            "accessToken"
        );

    return {
        "Content-Type": "application/json",

        "Authorization":
            `Bearer ${token}`
    };
}


// ================= GET CURRENT USER ID =================

function getCurrentUserId() {

    const token =
        localStorage.getItem(
            "accessToken"
        );

    if (!token) {

        return null;
    }

    try {

        const payload =
            JSON.parse(
                atob(
                    token
                        .split(".")[1]
                )
            );

        return Number(
            payload.sub
        );

    } catch (error) {

        console.error(
            "Error reading token:",
            error
        );

        return null;
    }
}


// ================= LOAD INTERNSHIPS =================

async function loadInternships() {

    const internshipList =
        document.querySelector(
            ".internship-list"
        );

    if (!internshipList) {

        return;
    }

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

        internshipList.innerHTML = "";


        // ================= CREATE INTERNSHIP CARDS =================

        internships.forEach(
            function (internship) {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "internship-card";


                card.innerHTML = `

                    <h2>
                        ${internship.title}
                    </h2>

                    <p>
                        Company #${internship.company_id}
                    </p>

                    <span>

                        ${
                            internship.location ||
                            "Location not specified"
                        }

                        |

                        ₹${
                            internship.stipend ||
                            "Not specified"
                        }

                    </span>

                    <p>
                        ${
                            internship.description ||
                            ""
                        }
                    </p>

                    <p>

                        <strong>
                            Duration:
                        </strong>

                        ${
                            internship.duration ||
                            "Not specified"
                        }

                    </p>

                    <p>

                        <strong>
                            Skills:
                        </strong>

                        ${
                            internship.skills_required ||
                            "Not specified"
                        }

                    </p>

                    <button

                        id="apply-${internship.internship_id}"

                        onclick="
                            applyInternship(
                                ${internship.internship_id}
                            )
                        "

                    >

                        Apply

                    </button>


                    <button

                        id="save-${internship.internship_id}"

                        onclick="
                            saveInternship(
                                ${internship.internship_id}
                            )
                        "

                    >

                        ⭐ Save

                    </button>

                `;


                internshipList.appendChild(
                    card
                );

            }
        );


        // ================= AVAILABLE COUNT =================

        localStorage.setItem(
            "availableCount",
            internships.length
        );


        // ================= LOAD BUTTON STATES =================

        await loadButtonStates();


        // ================= SETUP SEARCH =================

        setupSearch();


    } catch (error) {

        console.error(
            "Error loading internships:",
            error
        );

        internshipList.innerHTML = `

            <p>
                Unable to load internships.
                Please make sure the backend server
                is running.
            </p>

        `;
    }
}


// ================= APPLY / UNAPPLY =================

async function applyInternship(id) {

    const token =
        localStorage.getItem(
            "accessToken"
        );

    const userId =
        getCurrentUserId();


    if (!token || !userId) {

        alert(
            "Please login first."
        );

        return;
    }


    try {

        // ================= GET CURRENT USER APPLICATIONS =================

        const getResponse =
            await fetch(
                `${API_URL}/applications`,
                {
                    headers:
                        getAuthHeaders()
                }
            );


        if (!getResponse.ok) {

            throw new Error(
                "Failed to load applications"
            );
        }


        const applications =
            await getResponse.json();


        // ================= CHECK IF ALREADY APPLIED =================

        const existingApplication =
            applications.find(
                function (application) {

                    return Number(
                        application.internship_id
                    ) === Number(id);

                }
            );


        // ================= UNAPPLY =================

        if (existingApplication) {

            const deleteResponse =
                await fetch(
                    `${API_URL}/applications/${id}`,
                    {

                        method:
                            "DELETE",

                        headers:
                            getAuthHeaders()

                    }
                );


            if (!deleteResponse.ok) {

                const errorData =
                    await deleteResponse.json();

                throw new Error(
                    errorData.detail ||
                    "Failed to withdraw application"
                );
            }


            const btn =
                document.getElementById(
                    "apply-" + id
                );


            if (btn) {

                btn.innerText =
                    "Apply";
            }


            await updateAppliedCount();


            alert(
                "❌ Application Withdrawn Successfully!"
            );

            return;
        }


        // ================= APPLY =================

        const response =
            await fetch(
                `${API_URL}/applications`,
                {

                    method:
                        "POST",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify(
                            {

                                user_id:
                                    userId,

                                internship_id:
                                    Number(id)

                            }
                        )

                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();

            throw new Error(

                errorData.detail ||

                "Failed to submit application"

            );
        }


        const data =
            await response.json();


        console.log(
            "Application created:",
            data
        );


        const btn =
            document.getElementById(
                "apply-" + id
            );


        if (btn) {

            btn.innerText =
                "✅ Applied";
        }


        await updateAppliedCount();


        alert(
            "✅ Application Submitted Successfully!"
        );


    } catch (error) {

        console.error(
            "Application error:",
            error
        );

        alert(
            "❌ " +
            error.message
        );
    }
}


// ================= SAVE / UNSAVE =================

async function saveInternship(id) {

    const token =
        localStorage.getItem(
            "accessToken"
        );

    const userId =
        getCurrentUserId();


    if (!token || !userId) {

        alert(
            "Please login first."
        );

        return;
    }


    try {

        // ================= GET CURRENT USER SAVED INTERNSHIPS =================

        const getResponse =
            await fetch(
                `${API_URL}/saved-internships`,
                {

                    headers:
                        getAuthHeaders()

                }
            );


        if (!getResponse.ok) {

            throw new Error(
                "Failed to load saved internships"
            );
        }


        const savedInternships =
            await getResponse.json();


        // ================= CHECK IF ALREADY SAVED =================

        const existingSaved =
            savedInternships.find(
                function (saved) {

                    return Number(
                        saved.internship_id
                    ) === Number(id);

                }
            );


        // ================= UNSAVE =================

        if (existingSaved) {

            const deleteResponse =
                await fetch(
                    `${API_URL}/saved-internships/${id}`,
                    {

                        method:
                            "DELETE",

                        headers:
                            getAuthHeaders()

                    }
                );


            if (!deleteResponse.ok) {

                const errorData =
                    await deleteResponse.json();

                throw new Error(
                    errorData.detail ||
                    "Failed to remove saved internship"
                );
            }


            const btn =
                document.getElementById(
                    "save-" + id
                );


            if (btn) {

                btn.innerText =
                    "⭐ Save";
            }


            await updateSavedCount();


            alert(
                "❌ Internship Removed from Saved!"
            );

            return;
        }


        // ================= SAVE =================

        const response =
            await fetch(
                `${API_URL}/saved-internships`,
                {

                    method:
                        "POST",

                    headers:
                        getAuthHeaders(),

                    body:
                        JSON.stringify(
                            {

                                user_id:
                                    userId,

                                internship_id:
                                    Number(id)

                            }
                        )

                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();

            throw new Error(

                errorData.detail ||

                "Failed to save internship"

            );
        }


        const data =
            await response.json();


        console.log(
            "Saved internship:",
            data
        );


        const btn =
            document.getElementById(
                "save-" + id
            );


        if (btn) {

            btn.innerText =
                "★ Saved";
        }


        await updateSavedCount();


        alert(
            "⭐ Internship Saved Successfully!"
        );


    } catch (error) {

        console.error(
            "Save/Unsave error:",
            error
        );

        alert(
            "❌ " +
            error.message
        );
    }
}


// ================= UPDATE APPLIED COUNT =================

async function updateAppliedCount() {

    try {

        const response =
            await fetch(
                `${API_URL}/applications`,
                {

                    headers:
                        getAuthHeaders()

                }
            );


        if (!response.ok) {

            return;
        }


        const applications =
            await response.json();


        localStorage.setItem(
            "appliedCount",
            applications.length
        );


    } catch (error) {

        console.error(
            "Error updating applied count:",
            error
        );
    }
}


// ================= UPDATE SAVED COUNT =================

async function updateSavedCount() {

    try {

        const response =
            await fetch(
                `${API_URL}/saved-internships`,
                {

                    headers:
                        getAuthHeaders()

                }
            );


        if (!response.ok) {

            return;
        }


        const savedInternships =
            await response.json();


        localStorage.setItem(
            "savedCount",
            savedInternships.length
        );


    } catch (error) {

        console.error(
            "Error updating saved count:",
            error
        );
    }
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
                .replace(
                    /\s+/g,
                    " "
                );


        internshipCards.forEach(
            function (card) {

                const cardText =
                    card.textContent
                        .toLowerCase()
                        .trim()
                        .replace(
                            /\s+/g,
                            " "
                        );


                if (

                    cardText.includes(
                        searchText
                    )

                ) {

                    card.style.display =
                        "";

                } else {

                    card.style.display =
                        "none";
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
        urlParams.get(
            "search"
        );


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

    const token =
        localStorage.getItem(
            "accessToken"
        );


    if (!token) {

        return;
    }


    try {

        // ================= GET APPLICATIONS =================

        const applicationResponse =
            await fetch(
                `${API_URL}/applications`,
                {

                    headers:
                        getAuthHeaders()

                }
            );


        if (
            applicationResponse.ok
        ) {

            const applications =
                await applicationResponse.json();


            applications.forEach(
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


            localStorage.setItem(
                "appliedCount",
                applications.length
            );
        }


        // ================= GET SAVED INTERNSHIPS =================

        const savedResponse =
            await fetch(
                `${API_URL}/saved-internships`,
                {

                    headers:
                        getAuthHeaders()

                }
            );


        if (
            savedResponse.ok
        ) {

            const savedInternships =
                await savedResponse.json();


            savedInternships.forEach(
                function (saved) {

                    const btn =
                        document.getElementById(
                            "save-" +
                            saved.internship_id
                        );


                    if (btn) {

                        btn.innerText =
                            "★ Saved";
                    }

                }
            );


            localStorage.setItem(
                "savedCount",
                savedInternships.length
            );
        }


    } catch (error) {

        console.error(
            "Error loading button states:",
            error
        );
    }
}


// ================= PAGE LOAD =================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadInternships();

    }
);