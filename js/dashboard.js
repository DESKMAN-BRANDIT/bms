import {
  auth,
  db
} from "./firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getCountFromServer,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


/*
==================================================
ELEMENTS
==================================================
*/

const sidebar =
  document.getElementById("sidebar");

const sidebarOverlay =
  document.getElementById("sidebarOverlay");

const menuBtn =
  document.getElementById("menuBtn");

const profileButton =
  document.getElementById("profileButton");

const profileMenu =
  document.getElementById("profileMenu");

const profileLogoutBtn =
  document.getElementById("profileLogoutBtn");

const userInitial =
  document.getElementById("userInitial");

const profileInitial =
  document.getElementById("profileInitial");

const profileName =
  document.getElementById("profileName");

const profileEmail =
  document.getElementById("profileEmail");

const profileRole =
  document.getElementById("profileRole");

const profileBusiness =
  document.getElementById("profileBusiness");

const profileCurrency =
  document.getElementById("profileCurrency");

const welcomeName =
  document.getElementById("welcomeName");

const businessName =
  document.getElementById("businessName");

const currentDate =
  document.getElementById("currentDate");

const footerYear =
  document.getElementById("footerYear");

const dashboardMessage =
  document.getElementById("dashboardMessage");


/*
==================================================
INITIAL UI
==================================================
*/

setCurrentDate();
setFooterYear();


/*
==================================================
DATE
==================================================
*/

function setCurrentDate() {

  currentDate.textContent =
    new Date().toLocaleDateString(
      undefined,
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }
    );

}


/*
==================================================
FOOTER YEAR
==================================================
*/

function setFooterYear() {

  footerYear.textContent =
    new Date().getFullYear();

}


/*
==================================================
MOBILE SIDEBAR
==================================================
*/

function openSidebar() {

  sidebar.classList.add("open");

  sidebarOverlay.classList.add("show");

  menuBtn.setAttribute(
    "aria-expanded",
    "true"
  );

}


function closeSidebar() {

  sidebar.classList.remove("open");

  sidebarOverlay.classList.remove("show");

  menuBtn.setAttribute(
    "aria-expanded",
    "false"
  );

}


menuBtn.addEventListener(
  "click",
  () => {

    const isOpen =
      sidebar.classList.contains("open");

    if (isOpen) {

      closeSidebar();

    } else {

      openSidebar();

    }

  }
);


sidebarOverlay.addEventListener(
  "click",
  closeSidebar
);


/*
==================================================
CLOSE SIDEBAR AFTER NAVIGATION
==================================================
*/

document
  .querySelectorAll(".nav-link")
  .forEach(
    (link) => {

      link.addEventListener(
        "click",
        closeSidebar
      );

    }
  );


/*
==================================================
PROFILE MENU
==================================================
*/

function openProfileMenu() {

  profileMenu.hidden = false;

  profileMenu.classList.add("show");

  profileButton.setAttribute(
    "aria-expanded",
    "true"
  );

  profileMenu.setAttribute(
    "aria-hidden",
    "false"
  );

}


function closeProfileMenu() {

  profileMenu.classList.remove("show");

  profileMenu.hidden = true;

  profileButton.setAttribute(
    "aria-expanded",
    "false"
  );

  profileMenu.setAttribute(
    "aria-hidden",
    "true"
  );

}


function toggleProfileMenu() {

  if (profileMenu.hidden) {

    openProfileMenu();

  } else {

    closeProfileMenu();

  }

}


profileButton.addEventListener(
  "click",
  (event) => {

    event.stopPropagation();

    toggleProfileMenu();

  }
);


/*
==================================================
CLOSE PROFILE WHEN CLICKING OUTSIDE
==================================================
*/

document.addEventListener(
  "click",
  (event) => {

    const userArea =
      document.getElementById("userArea");

    if (
      userArea &&
      !userArea.contains(event.target)
    ) {

      closeProfileMenu();

    }

  }
);


/*
==================================================
ESCAPE KEY
==================================================
*/

document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Escape") {

      closeProfileMenu();

      closeSidebar();

    }

  }
);


/*
==================================================
AUTH STATE
==================================================
*/

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      window.location.replace(
        "login.html"
      );

      return;

    }

    await loadDashboard(user);

  }
);


/*
==================================================
LOAD DASHBOARD
==================================================
*/

async function loadDashboard(user) {

  try {

    showMessage(
      "Loading business information..."
    );


    /*
    ==============================================
    USER PROFILE
    ==============================================
    */

    const userRef =
      doc(
        db,
        "users",
        user.uid
      );


    const userSnapshot =
      await getDoc(userRef);


    if (!userSnapshot.exists()) {

      throw new Error(
        "User profile does not exist."
      );

    }


    const userData =
      userSnapshot.data();


    /*
    ==============================================
    BUSINESS ID
    ==============================================
    */

    const businessId =
      userData.businessId;


    if (!businessId) {

      throw new Error(
        "Business ID is missing from user profile."
      );

    }


    /*
    ==============================================
    BUSINESS PROFILE
    ==============================================
    */

    const businessRef =
      doc(
        db,
        "businesses",
        businessId
      );


    const businessSnapshot =
      await getDoc(businessRef);


    if (!businessSnapshot.exists()) {

      throw new Error(
        "Business profile does not exist."
      );

    }


    const businessData =
      businessSnapshot.data();


    /*
    ==============================================
    USER DATA
    ==============================================
    */

    const name =
      userData.name ||
      user.displayName ||
      "User";


    const role =
      userData.role ||
      "staff";


    const email =
      userData.email ||
      user.email ||
      "—";


    const currency =
      businessData.currency ||
      "GHS";


    const business =
      businessData.name ||
      "Your Business";


    /*
    ==============================================
    INITIAL
    ==============================================
    */

    const initial =
      getInitial(name);


    /*
    ==============================================
    TOP BAR
    ==============================================
    */

    userInitial.textContent =
      initial;


    /*
    ==============================================
    PROFILE MENU
    ==============================================
    */

    profileInitial.textContent =
      initial;

    profileName.textContent =
      name;

    profileEmail.textContent =
      email;

    profileRole.textContent =
      capitalize(role);

    profileBusiness.textContent =
      business;

    profileCurrency.textContent =
      currency;


    /*
    ==============================================
    WELCOME
    ==============================================
    */

    welcomeName.textContent =
      name;

    businessName.textContent =
      business;


    /*
    ==============================================
    STATISTICS
    ==============================================
    */

    await loadStatistics(
      businessId,
      currency
    );


    hideMessage();


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );


    showMessage(
      error.message ||
      "Unable to load dashboard."
    );

  }

}


/*
==================================================
STATISTICS
==================================================
*/

async function loadStatistics(
  businessId,
  currency
) {

  const collections = [
    "customers",
    "products",
    "services",
    "sales",
    "expenses"
  ];


  const counts =
    await Promise.all(
      collections.map(
        (collectionName) =>
          countCollectionSafely(
            collectionName,
            businessId
          )
      )
    );


  document.getElementById(
    "customerCount"
  ).textContent =
    counts[0];


  document.getElementById(
    "productCount"
  ).textContent =
    counts[1];


  document.getElementById(
    "serviceCount"
  ).textContent =
    counts[2];


  document.getElementById(
    "salesCount"
  ).textContent =
    counts[3];


  document.getElementById(
    "expenseCount"
  ).textContent =
    counts[4];


  /*
  ==============================================
  REVENUE
  ==============================================
  */

  const revenue =
    await calculateRevenueSafely(
      businessId
    );


  document.getElementById(
    "revenueTotal"
  ).textContent =
    formatMoney(
      revenue,
      currency
    );

}


/*
==================================================
SAFE COLLECTION COUNT
==================================================
*/

async function countCollectionSafely(
  collectionName,
  businessId
) {

  try {

    const collectionRef =
      collection(
        db,
        collectionName
      );


    const q =
      query(
        collectionRef,
        where(
          "businessId",
          "==",
          businessId
        )
      );


    const snapshot =
      await getCountFromServer(q);


    return snapshot.data().count;


  } catch (error) {

    console.warn(
      `Unable to count ${collectionName}:`,
      error
    );


    return 0;

  }

}


/*
==================================================
REVENUE
==================================================
*/

async function calculateRevenueSafely(
  businessId
) {

  try {

    const salesRef =
      collection(
        db,
        "sales"
      );


    const q =
      query(
        salesRef,
        where(
          "businessId",
          "==",
          businessId
        ),
        where(
          "status",
          "==",
          "completed"
        )
      );


    const snapshot =
      await getDocs(q);


    let total = 0;


    snapshot.forEach(
      (document) => {

        const sale =
          document.data();


        total +=
          Number(
            sale.total || 0
          );

      }
    );


    return total;


  } catch (error) {

    console.warn(
      "Unable to calculate revenue:",
      error
    );


    return 0;

  }

}


/*
==================================================
MONEY FORMAT
==================================================
*/

function formatMoney(
  amount,
  currency
) {

  try {

    return new Intl.NumberFormat(
      undefined,
      {
        style: "currency",
        currency: currency
      }
    ).format(amount);

  } catch (error) {

    return `${currency} ${Number(amount).toFixed(2)}`;

  }

}


/*
==================================================
LOGOUT
==================================================
*/

profileLogoutBtn.addEventListener(
  "click",
  async () => {

    try {

      profileLogoutBtn.disabled =
        true;

      profileLogoutBtn.textContent =
        "Logging out...";


      await signOut(auth);


      window.location.replace(
        "login.html"
      );


    } catch (error) {

      console.error(
        "Logout error:",
        error
      );


      profileLogoutBtn.disabled =
        false;

      profileLogoutBtn.textContent =
        "Logout";


      showMessage(
        "Unable to logout. Please try again."
      );

    }

  }
);


/*
==================================================
MESSAGE
==================================================
*/

function showMessage(message) {

  dashboardMessage.textContent =
    message;

  dashboardMessage.classList.add(
    "show"
  );

}


function hideMessage() {

  dashboardMessage.textContent =
    "";

  dashboardMessage.classList.remove(
    "show"
  );

}


/*
==================================================
UTILITY — INITIAL
==================================================
*/

function getInitial(name) {

  const cleanName =
    String(name || "").trim();


  if (!cleanName) {

    return "?";

  }


  return cleanName
    .charAt(0)
    .toUpperCase();

}


/*
==================================================
UTILITY — CAPITALIZE
==================================================
*/

function capitalize(value) {

  const text =
    String(value || "");


  if (!text) {

    return "";

  }


  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );

}
