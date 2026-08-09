const email = localStorage.getItem("userEmail");

const userEmail = document.getElementById("userEmail");
const userName = document.getElementById("userName");
const avatar = document.getElementById("avatar");


// ================= LOAD USER DETAILS =================

if (email && userEmail && userName && avatar) {

    userEmail.textContent = email;

    const savedName =
        localStorage.getItem("profileName");

    const name =
        savedName || email.split("@")[0];

    userName.textContent =
        name.charAt(0).toUpperCase() + name.slice(1);

    avatar.textContent =
        name.charAt(0).toUpperCase();

}


// ================= EDIT PROFILE =================

const editBtn = document.getElementById("editBtn");

if (editBtn) {

    editBtn.addEventListener("click", function () {

        const currentName =
            userName.textContent;

        const newName =
            prompt("Enter your name:", currentName);


        if (newName && newName.trim() !== "") {

            const updatedName =
                newName.trim();


            localStorage.setItem(
                "profileName",
                updatedName
            );


            userName.textContent =
                updatedName.charAt(0).toUpperCase() +
                updatedName.slice(1);


            avatar.textContent =
                updatedName.charAt(0).toUpperCase();


            alert("✅ Profile Updated Successfully!");

        }

    });

}