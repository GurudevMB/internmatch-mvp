const email = localStorage.getItem("userEmail");

const userEmail = document.getElementById("userEmail");
const userName = document.getElementById("userName");
const avatar = document.getElementById("avatar");

if(email){

    userEmail.textContent = email;

    const name = email.split("@")[0];

    userName.textContent =
        name.charAt(0).toUpperCase() + name.slice(1);

    avatar.textContent =
        name.charAt(0).toUpperCase();

}

document.getElementById("editBtn").addEventListener("click",function(){

    alert("Edit Profile feature will be available in Version 2.0 🚀");

});