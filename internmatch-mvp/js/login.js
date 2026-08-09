const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        // ================= EMPTY FIELD CHECK =================

        if (email === "" || password === "") {

            alert("Please fill all fields.");

            return;
        }


        // ================= EMAIL VALIDATION =================

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (!emailPattern.test(email)) {

            alert("Please enter a valid email address.");

            return;
        }


        // ================= PASSWORD VALIDATION =================

        if (password.length < 8) {

            alert("Password must contain at least 8 characters.");

            return;
        }


        if (!/[A-Z]/.test(password)) {

            alert(
                "Password must contain at least one uppercase letter."
            );

            return;
        }


        if (!/[a-z]/.test(password)) {

            alert(
                "Password must contain at least one lowercase letter."
            );

            return;
        }


        if (!/[0-9]/.test(password)) {

            alert(
                "Password must contain at least one number."
            );

            return;
        }


        if (!/[!@#$%^&*]/.test(password)) {

            alert(
                "Password must contain at least one special character."
            );

            return;
        }


        if (/\s/.test(password)) {

            alert("Password must not contain spaces.");

            return;
        }


        // ================= SAVE LOGIN STATE =================

        localStorage.setItem(
            "isLoggedIn",
            "true"
        );


        localStorage.setItem(
            "userEmail",
            email
        );


        // ================= REDIRECT =================

        window.location.href =
            "dashboard.html";

    });

}