// ================= AVAILABLE COUNT =================

const totalInternships =
    document.querySelectorAll(".internship-card").length;

localStorage.setItem(
    "availableCount",
    totalInternships
);


// ================= APPLY / UNAPPLY =================

function applyInternship(id) {

    let applied =
        JSON.parse(localStorage.getItem("appliedInternships")) || [];


    // ================= UNAPPLY =================

    if (applied.includes(id)) {

        applied = applied.filter(
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


    // ================= APPLY =================

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
        JSON.parse(localStorage.getItem("savedInternships")) || [];


    // ================= UNSAVE =================

    if (saved.includes(id)) {

        saved = saved.filter(
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


    searchInput.addEventListener(
        "input",
        function () {

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


                    if (
                        cardText.includes(searchText)
                    ) {

                        card.style.display = "";

                    } else {

                        card.style.display = "none";

                    }

                }
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


    // ================= APPLIED BUTTONS =================

    applied.forEach(
        function (id) {

            const btn =
                document.getElementById(
                    "apply-" + id
                );


            if (btn) {

                btn.innerText =
                    "✅ Applied";

            }

        }
    );


    // ================= SAVED BUTTONS =================

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

        loadButtonStates();

        setupSearch();

    }
);