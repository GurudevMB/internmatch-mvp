
// ================= API URL =================

const API_URL = "https://internmatch-mvp.onrender.com";


// ================= EDIT MODE =================

let editingInternshipId = null;


// ================= AUTH HEADERS =================

function getAuthHeaders() {

    const token =
        localStorage.getItem(
            "accessToken"
        );

    return {

        "Content-Type":
            "application/json",

        "Authorization":
            `Bearer ${token}`

    };
}


// ================= CHECK ADMIN =================

function checkAdminAccess() {

    const token =
        localStorage.getItem(
            "accessToken"
        );

    const role =
        localStorage.getItem(
            "userRole"
        );

    if (
        !token ||
        role !== "admin"
    ) {

        alert(
            "Access denied. Admin only."
        );

        window.location.href =
            "login.html";

        return false;
    }

    return true;
}


// ================= LOAD INTERNSHIPS =================

async function loadInternships() {

    const internshipList =
        document.getElementById(
            "internshipList"
        );

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

        // ================= UPDATE COUNTS =================

        const totalInternships =
            document.getElementById(
                "totalInternships"
            );

        const internshipCount =
            document.getElementById(
                "internshipCount"
            );

        if (totalInternships) {

            totalInternships.textContent =
                internships.length;
        }

        if (internshipCount) {

            internshipCount.textContent =
                internships.length;
        }

        // ================= EMPTY STATE =================

        if (internships.length === 0) {

            internshipList.innerHTML = `

                <div class="empty-state">

                    <h3>
                        No internships found
                    </h3>

                    <p>
                        Create your first internship opportunity.
                    </p>

                </div>

            `;

            return;
        }

        // ================= CREATE CARDS =================

        internships.forEach(
            function (internship) {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "internship-card";

                card.innerHTML = `

                    <h3>
                        ${internship.title}
                    </h3>

                    <p>
                        <strong>
                            Company ID:
                        </strong>
                        ${internship.company_id}
                    </p>

                    <p>
                        <strong>
                            Location:
                        </strong>
                        ${internship.location}
                    </p>

                    <p>
                        <strong>
                            Duration:
                        </strong>
                        ${internship.duration}
                    </p>

                    <p>
                        <strong>
                            Stipend:
                        </strong>
                        ₹${internship.stipend}
                    </p>

                    <p>
                        <strong>
                            Skills:
                        </strong>
                        ${internship.skills_required}
                    </p>

                    <p>
                        <strong>
                            Description:
                        </strong>
                        ${internship.description}
                    </p>

                    <div class="card-actions">

                        <button
                            class="edit-btn"
                            onclick="editInternship(
                                ${internship.internship_id}
                            )"
                        >
                            ✏️ Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteInternship(
                                ${internship.internship_id}
                            )"
                        >
                            🗑 Delete
                        </button>

                    </div>

                `;

                internshipList.appendChild(
                    card
                );

            }
        );

    } catch (error) {

        console.error(
            "Error loading internships:",
            error
        );

        internshipList.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load internships
                </h3>

                <p>
                    Make sure the FastAPI backend is running.
                </p>

            </div>

        `;
    }
}


// ================= CREATE / UPDATE =================

const internshipForm =
    document.getElementById(
        "internshipForm"
    );

if (internshipForm) {

    internshipForm.addEventListener(
        "submit",

        async function (event) {

            event.preventDefault();

            const internshipData = {

                company_id:
                    Number(
                        document
                            .getElementById(
                                "companyId"
                            )
                            .value
                    ),

                title:
                    document
                        .getElementById(
                            "title"
                        )
                        .value
                        .trim(),

                description:
                    document
                        .getElementById(
                            "description"
                        )
                        .value
                        .trim(),

                location:
                    document
                        .getElementById(
                            "location"
                        )
                        .value
                        .trim(),

                duration:
                    document
                        .getElementById(
                            "duration"
                        )
                        .value
                        .trim(),

                stipend:
                    document
                        .getElementById(
                            "stipend"
                        )
                        .value
                        .trim(),

                skills_required:
                    document
                        .getElementById(
                            "skills"
                        )
                        .value
                        .trim()

            };

            try {

                let response;

                // ================= CREATE =================

                if (
                    editingInternshipId === null
                ) {

                    response =
                        await fetch(

                            `${API_URL}/internships`,

                            {

                                method: "POST",

                                headers:
                                    getAuthHeaders(),

                                body:
                                    JSON.stringify(
                                        internshipData
                                    )

                            }

                        );

                }

                // ================= UPDATE =================

                else {

                    response =
                        await fetch(

                            `${API_URL}/internships/${editingInternshipId}`,

                            {

                                method: "PUT",

                                headers:
                                    getAuthHeaders(),

                                body:
                                    JSON.stringify(
                                        internshipData
                                    )

                            }

                        );

                }

                // ================= ERROR =================

                if (!response.ok) {

                    let errorData;

                    try {

                        errorData =
                            await response.json();

                    } catch {

                        errorData = {};

                    }

                    throw new Error(

                        errorData.detail ||
                        "Unable to save internship"

                    );

                }

                // ================= SUCCESS =================

                if (
                    editingInternshipId === null
                ) {

                    alert(
                        "✅ Internship created successfully!"
                    );

                } else {

                    alert(
                        "✅ Internship updated successfully!"
                    );

                }

                cancelEdit();

                await loadInternships();

            } catch (error) {

                console.error(
                    "Save internship error:",
                    error
                );

                alert(
                    "❌ " + error.message
                );

            }

        }
    );

}


// ================= EDIT INTERNSHIP =================

async function editInternship(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/internships/${id}`
            );

        if (!response.ok) {

            throw new Error(
                "Unable to load internship details"
            );

        }

        const internship =
            await response.json();

        // ================= SET EDIT MODE =================

        editingInternshipId = id;

        // ================= FILL FORM =================

        document
            .getElementById("companyId")
            .value =
            internship.company_id;

        document
            .getElementById("title")
            .value =
            internship.title;

        document
            .getElementById("description")
            .value =
            internship.description;

        document
            .getElementById("location")
            .value =
            internship.location;

        document
            .getElementById("duration")
            .value =
            internship.duration;

        document
            .getElementById("stipend")
            .value =
            internship.stipend;

        document
            .getElementById("skills")
            .value =
            internship.skills_required;

        // ================= CHANGE UI =================

        document
            .getElementById("formTitle")
            .textContent =
            "Edit Internship";

        document
            .getElementById("submitButton")
            .textContent =
            "💾 Update Internship";

        document
            .getElementById("cancelButton")
            .style.display =
            "inline-block";

        // ================= SCROLL TO FORM =================

        document
            .querySelector(".form-container")
            .scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

    } catch (error) {

        console.error(
            "Edit error:",
            error
        );

        alert(
            "❌ Unable to load internship."
        );

    }
}


// ================= CANCEL EDIT =================

function cancelEdit() {

    editingInternshipId = null;

    document
        .getElementById("internshipForm")
        .reset();

    document
        .getElementById("formTitle")
        .textContent =
        "Create Internship";

    document
        .getElementById("submitButton")
        .textContent =
        "+ Create Internship";

    document
        .getElementById("cancelButton")
        .style.display =
        "none";
}


// ================= DELETE INTERNSHIP =================

async function deleteInternship(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this internship?"
        );

    if (!confirmed) {

        return;

    }

    try {

        const response =
            await fetch(

                `${API_URL}/internships/${id}`,

                {

                    method: "DELETE",

                    headers:
                        getAuthHeaders()

                }

            );

        if (!response.ok) {

            let errorData;

            try {

                errorData =
                    await response.json();

            } catch {

                errorData = {};

            }

            throw new Error(

                errorData.detail ||
                "Unable to delete internship"

            );

        }

        alert(
            "🗑 Internship deleted successfully!"
        );

        await loadInternships();

    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "❌ " + error.message
        );

    }
}


// ================= LOGOUT =================

function logout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );

    if (!confirmed) {

        return;

    }

    // ================= CLEAR LOGIN DATA =================

    localStorage.removeItem(
        "accessToken"
    );

    localStorage.removeItem(
        "tokenType"
    );

    localStorage.removeItem(
        "userRole"
    );

    localStorage.removeItem(
        "isLoggedIn"
    );

    localStorage.removeItem(
        "userEmail"
    );

    // ================= REDIRECT =================

    window.location.href =
        "login.html";
}


// ================= PAGE LOAD =================

document.addEventListener(

    "DOMContentLoaded",

    async function () {

        const hasAccess =
            checkAdminAccess();

        if (!hasAccess) {

            return;

        }

        await loadInternships();

        // NEW: Load applications when the admin page opens
        await loadApplications();

    }

);


// ================= APPLICATION MANAGEMENT =================

const applicationStatuses = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Rejected",
    "Accepted"
];


async function loadApplications() {

    const list =
        document.getElementById(
            "applicationList"
        );

    if (!list) return;

    list.textContent =
        "Loading applications...";

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
                "Unable to load applications"
            );

        }

        const applications =
            await response.json();

        list.innerHTML = "";

        if (applications.length === 0) {

            list.textContent =
                "No applications found.";

            return;

        }

        applications.forEach(application => {

            const card =
                document.createElement("div");

            card.className =
                "internship-card";

            const heading =
                document.createElement("h3");

            heading.textContent =
                `Application #${application.application_id}`;

            const student =
                document.createElement("p");

            student.textContent =
                `Student ID: ${application.user_id}`;

            const internship =
                document.createElement("p");

            internship.textContent =
                `Internship ID: ${application.internship_id}`;

            const label =
                document.createElement("label");

            label.textContent =
                "Application Status: ";

            const select =
                document.createElement("select");

            applicationStatuses.forEach(status => {

                const option =
                    document.createElement("option");

                option.value = status;

                option.textContent = status;

                select.appendChild(option);

            });

            select.value =
                application.status;

            const button =
                document.createElement("button");

            button.className =
                "create-btn";

            button.textContent =
                "Update Status";

            button.addEventListener(
                "click",

                async () => {

                    button.disabled = true;

                    try {

                        const updateResponse =
                            await fetch(

                                `${API_URL}/applications/${application.application_id}/status`,

                                {

                                    method: "PATCH",

                                    headers:
                                        getAuthHeaders(),

                                    body:
                                        JSON.stringify({
                                            status: select.value
                                        })

                                }

                            );

                        if (!updateResponse.ok) {

                            let error = {};

                            try {

                                error =
                                    await updateResponse.json();

                            } catch {

                                error = {};

                            }

                            throw new Error(
                                error.detail ||
                                "Status update failed"
                            );

                        }

                        alert(
                            "Application status updated successfully!"
                        );

                        await loadApplications();

                    } catch (error) {

                        alert(error.message);

                    } finally {

                        button.disabled = false;

                    }

                }

            );

            card.append(
                heading,
                student,
                internship,
                label,
                select,
                button
            );

            list.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Applications error:",
            error
        );

        list.textContent =
            error.message;

    }

}
