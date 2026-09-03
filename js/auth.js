import {
  auth,
  db
} from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const registerForm =
  document.getElementById("registerForm");

const loginForm =
  document.getElementById("loginForm");

const message =
  document.getElementById("message");


/*
==================================================
REGISTER
==================================================
*/

if (registerForm) {

  registerForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const name =
        document
          .getElementById("name")
          .value
          .trim();

      const businessName =
        document
          .getElementById("businessName")
          .value
          .trim();

      const email =
        document
          .getElementById("email")
          .value
          .trim()
          .toLowerCase();

      const password =
        document
          .getElementById("password")
          .value;


      if (!name || !businessName || !email || !password) {

        message.textContent =
          "Please complete all fields.";

        return;
      }


      try {

        message.textContent =
          "Creating your account...";


        /*
        Create Firebase Authentication account
        */

        const credential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );


        const uid =
          credential.user.uid;


        /*
        Generate business ID
        */

        const businessRef =
          doc(db, "businesses", uid);

        const businessId =
          businessRef.id;


        /*
        Create business
        */

        await setDoc(
          businessRef,
          {

            name: businessName,

            ownerId: uid,

            phone: "",

            email: email,

            address: "",

            currency: "GHS",

            country: "Ghana",

            status: "active",

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );


        /*
        Create user profile
        */

        await setDoc(
          doc(db, "users", uid),
          {

            uid: uid,

            businessId: businessId,

            name: name,

            email: email,

            role: "owner",

            status: "active",

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          }
        );


        message.textContent =
          "Account created successfully.";


        /*
        Send owner to dashboard
        */

        setTimeout(() => {

          window.location.href =
            "dashboard.html";

        }, 500);


      } catch (error) {

        console.error(
          "Registration error:",
          error
        );

        message.textContent =
          getFirebaseError(error);

      }

    }
  );

}


/*
==================================================
LOGIN
==================================================
*/

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const email =
        document
          .getElementById("email")
          .value
          .trim()
          .toLowerCase();

      const password =
        document
          .getElementById("password")
          .value;


      try {

        message.textContent =
          "Signing in...";


        const credential =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );


        /*
        Confirm that the user profile exists.
        */

        const userRef =
          doc(
            db,
            "users",
            credential.user.uid
          );


        const userSnapshot =
          await getDoc(userRef);


        if (!userSnapshot.exists()) {

          await signOut(auth);

          message.textContent =
            "Account profile not found.";

          return;
        }


        /*
        Successful login
        */

        window.location.href =
          "dashboard.html";


      } catch (error) {

        console.error(
          "Login error:",
          error
        );

        message.textContent =
          getFirebaseError(error);

      }

    }
  );

}


/*
==================================================
PROTECT PRIVATE PAGES
==================================================
*/

export function protectPage() {

  onAuthStateChanged(
    auth,
    (user) => {

      if (!user) {

        window.location.href =
          "login.html";

      }

    }
  );

}


/*
==================================================
LOGOUT
==================================================
*/

export async function logout() {

  try {

    await signOut(auth);

    window.location.href =
      "login.html";

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

  }

}


/*
==================================================
FIREBASE ERROR HANDLING
==================================================
*/

function getFirebaseError(error) {

  switch (error.code) {

    case "auth/email-already-in-use":

      return "This email is already registered.";


    case "auth/invalid-email":

      return "Enter a valid email address.";


    case "auth/weak-password":

      return "Password must contain at least 6 characters.";


    case "auth/invalid-credential":

      return "Invalid email or password.";


    case "auth/too-many-requests":

      return "Too many attempts. Try again later.";


    case "permission-denied":

      return "Database permission denied.";


    default:

      return "Something went wrong. Please try again.";

  }

}
