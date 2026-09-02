const API_URL = "http://127.0.0.1:8000";


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

function checkAdmin() {

    const token =
        localStorage.getItem(
            "accessToken"
        );

    if (!token) {

        alert(
            "Please login as admin."
        );

        window.location.href =
            "login.html";

        return false;
    }

    try {

        const payload =
            JSON.parse(
                atob(
                    token
                        .split(".")[1]
                )
            );

        if (
            payload.role !== "admin"
        ) {

            alert(
                "Access denied. Admin only."
            );

            window.location.href =
                "index.html";

            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Invalid token:",
            error
        );

        localStorage.removeItem(
            "accessToken"
        );

        window.location.href =
            "login.html";

        return false;
    }
}


// ================= EDIT MODE =================

let editingInternshipId =
    null;


// ================= LOAD INTERNSHIPS =================

async function loadInternships() {

    const internshipList =
        document.getElementById(
            "internshipList"
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


        internshipList.innerHTML =
            "";


        if (
            internships.length === 0
        ) {

            internshipList.innerHTML = `

                <p>
                    No internships found.
                </p>

            `;

            return;
        }


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
                            Internship ID:
                        </strong>

                        ${internship.internship_id}
                    </p>

                    <p>
                        <strong>
                            Company ID:
                        </strong>

                        ${internship.company_id}
                    </p>

                    <p>
                        <strong>
                            Description:
                        </strong>

                        ${internship.description}
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

                    <button
                        class="edit-btn"
                        onclick="editInternship(
                            ${internship.internship_id}
                        )"
                    >

                        Edit

                    </button>


                    <button
                        class="delete-btn"
                        onclick="deleteInternship(
                            ${internship.internship_id}
                        )"
                    >

                        Delete

                    </button>

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

            <p>
                Unable to load internships.
            </p>

        `;
    }
}


// ================= CREATE / UPDATE FORM =================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const form =
            document.getElementById(
                "internshipForm"
            );

        if (!form) {

            return;
        }


        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const companyId =
                    document.getElementById(
                        "companyId"
                    ).value;


                const title =
                    document.getElementById(
                        "title"
                    ).value;


                const description =
                    document.getElementById(
                        "description"
                    ).value;


                const location =
                    document.getElementById(
                        "location"
                    ).value;


                const duration =
                    document.getElementById(
                        "duration"
                    ).value;


                const stipend =
                    document.getElementById(
                        "stipend"
                    ).value;


                const skills =
                    document.getElementById(
                        "skills"
                    ).value;


                const internshipData = {

                    company_id:
                        Number(companyId),

                    title:
                        title,

                    description:
                        description,

                    location:
                        location,

                    duration:
                        duration,

                    stipend:
                        stipend,

                    skills_required:
                        skills

                };


                try {

                    let response;


                    // ================= UPDATE =================

                    if (
                        editingInternshipId !==
                        null
                    ) {

                        response =
                            await fetch(
                                `${API_URL}/internships/${editingInternshipId}`,
                                {

                                    method:
                                        "PUT",

                                    headers:
                                        getAuthHeaders(),

                                    body:
                                        JSON.stringify(
                                            internshipData
                                        )

                                }
                            );

                    }


                    // ================= CREATE =================

                    else {

                        response =
                            await fetch(
                                `${API_URL}/internships`,
                                {

                                    method:
                                        "POST",

                                    headers:
                                        getAuthHeaders(),

                                    body:
                                        JSON.stringify(
                                            internshipData
                                        )

                                }
                            );

                    }


                    if (!response.ok) {

                        const errorData =
                            await response.json();

                        throw new Error(

                            errorData.detail ||

                            "Operation failed"

                        );
                    }


                    if (
                        editingInternshipId !==
                        null
                    ) {

                        alert(
                            "Internship updated successfully!"
                        );

                    } else {

                        alert(
                            "Internship created successfully!"
                        );

                    }


                    cancelEdit();


                    await loadInternships();


                } catch (error) {

                    console.error(
                        "Form error:",
                        error
                    );

                    alert(
                        "Error: " +
                        error.message
                    );
                }

            }
        );


        if (checkAdmin()) {

            loadInternships();

        }

    }
);


// ================= EDIT INTERNSHIP =================

async function editInternship(id) {

    try {

        const response =
            await fetch(
                `${API_URL}/internships/${id}`
            );

        if (!response.ok) {

            throw new Error(
                "Failed to load internship"
            );
        }


        const internship =
            await response.json();


        editingInternshipId =
            id;


        document.getElementById(
            "companyId"
        ).value =
            internship.company_id;


        document.getElementById(
            "title"
        ).value =
            internship.title;


        document.getElementById(
            "description"
        ).value =
            internship.description;


        document.getElementById(
            "location"
        ).value =
            internship.location;


        document.getElementById(
            "duration"
        ).value =
            internship.duration;


        document.getElementById(
            "stipend"
        ).value =
            internship.stipend;


        document.getElementById(
            "skills"
        ).value =
            internship.skills_required;


        document.getElementById(
            "formTitle"
        ).innerText =
            "Edit Internship";


        document.getElementById(
            "submitButton"
        ).innerText =
            "Update Internship";


        document.getElementById(
            "cancelButton"
        ).style.display =
            "inline-block";


        window.scrollTo({

            top: 0,

            behavior:
                "smooth"

        });


    } catch (error) {

        console.error(
            "Edit error:",
            error
        );

        alert(
            "Unable to load internship."
        );
    }
}


// ================= CANCEL EDIT =================

function cancelEdit() {

    editingInternshipId =
        null;


    const form =
        document.getElementById(
            "internshipForm"
        );

    if (form) {

        form.reset();

    }


    document.getElementById(
        "formTitle"
    ).innerText =
        "Create Internship";


    document.getElementById(
        "submitButton"
    ).innerText =
        "Create Internship";


    document.getElementById(
        "cancelButton"
    ).style.display =
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

                    method:
                        "DELETE",

                    headers:
                        getAuthHeaders()

                }
            );


        if (!response.ok) {

            const errorData =
                await response.json();

            throw new Error(

                errorData.detail ||

                "Failed to delete internship"

            );
        }


        alert(
            "Internship deleted successfully!"
        );


        await loadInternships();


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

        alert(
            "Error: " +
            error.message
        );
    }
}


// ================= LOGOUT =================

function logout() {

    localStorage.removeItem(
        "accessToken"
    );


    localStorage.removeItem(
        "appliedCount"
    );


    localStorage.removeItem(
        "savedCount"
    );


    alert(
        "Logged out successfully."
    );


    window.location.href =
        "login.html";
}