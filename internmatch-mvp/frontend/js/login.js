// ================= LOGIN =================

const loginForm = document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // ================= GET VALUES =================

            const email =
                document.getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document.getElementById("password")
                    .value;


            // ================= EMPTY CHECK =================

            if (email === "" || password === "") {

                alert("Please fill all fields.");

                return;
            }


            // ================= GET REGISTERED USER =================

            const savedUser =
                JSON.parse(
                    localStorage.getItem("internMatchUser")
                );


            // ================= NO ACCOUNT =================

            if (!savedUser) {

                alert(
                    "No account found. Please create an account first."
                );

                return;
            }


            // ================= EMAIL CHECK =================

            if (email !== savedUser.email) {

                alert(
                    "❌ Invalid email or password."
                );

                return;
            }


            // ================= PASSWORD CHECK =================

            if (password !== savedUser.password) {

                alert(
                    "❌ Invalid email or password."
                );

                return;
            }


            // ================= LOGIN SUCCESS =================

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );


            localStorage.setItem(
                "userEmail",
                savedUser.email
            );


            localStorage.setItem(
                "profileName",
                savedUser.name
            );


            alert(
                "✅ Login Successful! Welcome to InternMatch."
            );


            // ================= DASHBOARD =================

            window.location.href =
                "dashboard.html";

        }
    );

}