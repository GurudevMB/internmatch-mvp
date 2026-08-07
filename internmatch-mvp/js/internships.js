// ================= AVAILABLE COUNT =================

const totalInternships = document.querySelectorAll(".internship-card").length;

localStorage.setItem("availableCount", totalInternships);


// ================= APPLY / UNAPPLY =================

function applyInternship(id) {

    let applied =
        JSON.parse(localStorage.getItem("appliedInternships")) || [];


    if (applied.includes(id)) {

        applied = applied.filter(item => item !== id);

        localStorage.setItem(
            "appliedInternships",
            JSON.stringify(applied)
        );

        localStorage.setItem(
            "appliedCount",
            applied.length
        );

        alert("❌ Application Removed Successfully!");

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


    alert("✅ Application Submitted Successfully!");

}



// ================= SAVE / UNSAVE =================

function saveInternship(id) {

    let saved =
        JSON.parse(localStorage.getItem("savedInternships")) || [];


    if (saved.includes(id)) {

        saved = saved.filter(item => item !== id);


        localStorage.setItem(
            "savedInternships",
            JSON.stringify(saved)
        );


        localStorage.setItem(
            "savedCount",
            saved.length
        );


        alert("❌ Internship Removed from Saved!");

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


    alert("⭐ Internship Saved Successfully!");

}