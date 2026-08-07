// ================= AVAILABLE COUNT =================

const totalInternships = document.querySelectorAll(".internship-card").length;

localStorage.setItem("availableCount", totalInternships);


// ================= APPLY / UNAPPLY =================

function applyInternship(id) {

    let applied =
        JSON.parse(localStorage.getItem("appliedInternships")) || [];


    // UNAPPLY
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


        let btn = document.getElementById("apply-" + id);

        if (btn) {
            btn.innerText = "Apply";
        }


        alert("❌ Application Removed Successfully!");

        return;
    }


    // APPLY

    applied.push(id);


    localStorage.setItem(
        "appliedInternships",
        JSON.stringify(applied)
    );


    localStorage.setItem(
        "appliedCount",
        applied.length
    );


    let btn = document.getElementById("apply-" + id);

    if (btn) {
        btn.innerText = "✅ Applied";
    }


    alert("✅ Application Submitted Successfully!");

}



// ================= SAVE / UNSAVE =================

function saveInternship(id) {

    let saved =
        JSON.parse(localStorage.getItem("savedInternships")) || [];


    // UNSAVE

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


        let btn = document.getElementById("save-" + id);

        if (btn) {
            btn.innerText = "⭐ Save";
        }


        alert("❌ Internship Removed from Saved!");

        return;
    }


    // SAVE

    saved.push(id);


    localStorage.setItem(
        "savedInternships",
        JSON.stringify(saved)
    );


    localStorage.setItem(
        "savedCount",
        saved.length
    );


    let btn = document.getElementById("save-" + id);

    if (btn) {
        btn.innerText = "★ Saved";
    }


    alert("⭐ Internship Saved Successfully!");

}



// ================= LOAD SAVED STATE =================

document.addEventListener("DOMContentLoaded", () => {


    let applied =
        JSON.parse(localStorage.getItem("appliedInternships")) || [];


    let saved =
        JSON.parse(localStorage.getItem("savedInternships")) || [];



    applied.forEach(id => {

        let btn = document.getElementById("apply-" + id);

        if (btn) {
            btn.innerText = "✅ Applied";
        }

    });



    saved.forEach(id => {

        let btn = document.getElementById("save-" + id);

        if (btn) {
            btn.innerText = "★ Saved";
        }

    });


});