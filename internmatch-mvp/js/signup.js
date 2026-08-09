// ================= SIGNUP =================

const signupForm =
    document.getElementById("signupForm");


if (signupForm) {

    signupForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // ================= GET VALUES =================

            const name =
                document.getElementById("signupName")
                    .value
                    .trim();


            const email =
                document.getElementById("signupEmail")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document.getElementById("signupPassword")
                    .value;


            const confirmPassword =
                document.getElementById("confirmPassword")
                    .value;


            // ================= EMPTY CHECK =================

            if (
                name === "" ||
                email === "" ||
                password === "" ||
                confirmPassword === ""
            ) {

                alert("Please fill all fields.");

                return;
            }


            // ================= NAME VALIDATION =================

            if (name.length < 3) {

                alert(
                    "Name must contain at least 3 characters."
                );

                return;
            }


            // ================= EMAIL VALIDATION =================

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                alert(
                    "Please enter a valid email address."
                );

                return;
            }


            // ================= PASSWORD LENGTH =================

            if (password.length < 8) {

                alert(
                    "Password must contain at least 8 characters."
                );

                return;
            }


            // ================= PASSWORD CHARACTER CHECK =================

            const hasUppercase =
                /[A-Z]/.test(password);


            const hasNumber =
                /[0-9]/.test(password);


            const hasSpecial =
                /[!@#$%^&*]/.test(password);


            if (
                !hasUppercase &&
                !hasNumber &&
                !hasSpecial
            ) {

                alert(
                    "Password must contain at least one uppercase letter, number, or special character."
                );

                return;
            }


            // ================= SPACE CHECK =================

            if (/\s/.test(password)) {

                alert(
                    "Password must not contain spaces."
                );

                return;
            }


            // ================= CONFIRM PASSWORD =================

            if (password !== confirmPassword) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            // ================= CHECK EXISTING ACCOUNT =================

            const existingUser =
                JSON.parse(
                    localStorage.getItem(
                        "internMatchUser"
                    )
                );


            if (
                existingUser &&
                existingUser.email === email
            ) {

                alert(
                    "An account with this email already exists."
                );

                return;
            }


            // ================= SAVE USER =================

            const user = {

                name: name,

                email: email,

                password: password

            };


            localStorage.setItem(
                "internMatchUser",
                JSON.stringify(user)
            );


            // ================= SAVE PROFILE NAME =================

            localStorage.setItem(
                "profileName",
                name
            );


            // ================= SUCCESS =================

            alert(
                "✅ Account created successfully! Please login."
            );


            // ================= REDIRECT =================

            window.location.href =
                "login.html";

        }
    );

}
// ================= CLEAR SIGNUP FORM =================

window.addEventListener("pageshow", function () {

    const signupForm =
        document.getElementById("signupForm");

    if (signupForm) {
        signupForm.reset();
    }

});