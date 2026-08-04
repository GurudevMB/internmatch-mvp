function applyInternship() {
    alert("Application submitted successfully!");
}

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", function () {

    const searchValue = searchInput.value.toLowerCase();

    const cards = document.querySelectorAll(".internship-card");

    cards.forEach(function(card){

        const title = card.querySelector("h2").textContent.toLowerCase();

        if(title.includes(searchValue)){
            card.style.display = "block";
        }
        else{
            card.style.display = "none";
        }

    });

});