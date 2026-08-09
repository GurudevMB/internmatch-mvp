// ================= HOME SEARCH =================

const homeSearchInput =
    document.getElementById("homeSearchInput");

const homeSearchBtn =
    document.getElementById("homeSearchBtn");


function searchInternships() {

    const searchText =
        homeSearchInput.value.trim();


    if (searchText === "") {

        alert("Please enter an internship to search.");

        return;
    }


    window.location.href =
        "internships.html?search=" +
        encodeURIComponent(searchText);
}


if (homeSearchBtn) {

    homeSearchBtn.addEventListener(
        "click",
        searchInternships
    );

}


if (homeSearchInput) {

    homeSearchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                searchInternships();

            }

        }
    );

}