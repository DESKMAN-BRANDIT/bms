import {
  auth,
  db
} from "./firebase.js";


import {
  onAuthStateChanged,
  signOut
} from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";


import {
  doc,
  getDoc,
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp
} from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


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

const logoutBtn =
  document.getElementById("logoutBtn");

const userInitial =
  document.getElementById("userInitial");

const profileButton =
  document.getElementById("profileButton");

const profileMenu =
  document.getElementById("profileMenu");

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

const profileLogoutBtn =
  document.getElementById("profileLogoutBtn");

const currentDate =
  document.getElementById("currentDate");

const footerYear =
  document.getElementById("footerYear");

const openCustomerFormBtn =
  document.getElementById("openCustomerFormBtn");

const emptyAddCustomerBtn =
  document.getElementById("emptyAddCustomerBtn");

const customerFormPanel =
  document.getElementById("customerFormPanel");

const customerForm =
  document.getElementById("customerForm");

const formTitle =
  document.getElementById("formTitle");

const editingCustomerId =
  document.getElementById("editingCustomerId");

const customerName =
  document.getElementById("customerName");

const customerPhone =
  document.getElementById("customerPhone");

const customerEmail =
  document.getElementById("customerEmail");

const customerAddress =
  document.getElementById("customerAddress");

const customerNotes =
  document.getElementById("customerNotes");

const cancelCustomerBtn =
  document.getElementById("cancelCustomerBtn");

const saveCustomerBtn =
  document.getElementById("saveCustomerBtn");

const customerSearch =
  document.getElementById("customerSearch");

const customerTotal =
  document.getElementById("customerTotal");

const customerLoading =
  document.getElementById("customerLoading");

const customerEmpty =
  document.getElementById("customerEmpty");

const customerNoResults =
  document.getElementById("customerNoResults");

const customerTableWrapper =
  document.getElementById("customerTableWrapper");

const customerTableBody =
  document.getElementById("customerTableBody");

const customerMessage =
  document.getElementById("customerMessage");


/*
==================================================
APPLICATION STATE
==================================================
*/

let currentUser = null;

let currentUserData = null;

let businessId = null;

let customers = [];

let unsubscribeCustomers = null;


/*
==================================================
INITIALIZATION
==================================================
*/

setCurrentDate();

setFooterYear();

setupNavigation();

setupCustomerEvents();

startAuthentication();


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
FOOTER
==================================================
*/

function setFooterYear() {

  footerYear.textContent =
    new Date().getFullYear();

}


/*
==================================================
MOBILE NAVIGATION
==================================================
*/

function setupNavigation() {

  menuBtn.addEventListener(
    "click",
    () => {

      sidebar.classList.add("open");

      sidebarOverlay.classList.add("show");

    }
  );


  sidebarOverlay.addEventListener(
    "click",
    closeSidebar
  );

}


function closeSidebar() {

  sidebar.classList.remove("open");

  sidebarOverlay.classList.remove("show");

}


/*
==================================================
AUTHENTICATION
==================================================
*/

function startAuthentication() {

  onAuthStateChanged(
    auth,
    async (user) => {

      if (!user) {

        window.location.replace(
          "../login.html"
        );

        return;

      }


      currentUser = user;


      try {

        await loadUserProfile();

        subscribeToCustomers();

      } catch (error) {

        console.error(
          "Customer module initialization error:",
          error
        );


        showMessage(
          friendlyFirestoreError(error)
        );

      }

    }
  );

}


/*
==================================================
USER PROFILE
==================================================
*/

async function loadUserProfile() {

  const userRef =
    doc(
      db,
      "users",
      currentUser.uid
    );


  const snapshot =
    await getDoc(userRef);


  if (!snapshot.exists()) {

    throw new Error(
      "User profile does not exist."
    );

  }


  currentUserData =
    snapshot.data();


  businessId =
    currentUserData.businessId;


  if (!businessId) {

    throw new Error(
      "Business ID is missing from your account."
    );

  }


  const name =
    currentUserData.name ||
    currentUser.displayName ||
    "User";


  const role =
    currentUserData.role ||
    "staff";


  userName.textContent =
    name;


  userRole.textContent =
    capitalize(role);


  userInitial.textContent =
    name
      .charAt(0)
      .toUpperCase();

}


/*
==================================================
CUSTOMER REAL-TIME LISTENER
==================================================
*/

function subscribeToCustomers() {

  customerLoading.hidden =
    false;

  customerEmpty.hidden =
    true;

  customerNoResults.hidden =
    true;

  customerTableWrapper.hidden =
    true;


  const customersRef =
    collection(
      db,
      "customers"
    );


  const customersQuery =
    query(
      customersRef,
      where(
        "businessId",
        "==",
        businessId
      )
    );


  unsubscribeCustomers =
    onSnapshot(
      customersQuery,

      (snapshot) => {

        customers =
          snapshot.docs.map(
            (customerDoc) => ({

              id:
                customerDoc.id,

              ...customerDoc.data()

            })
          );


        customers.sort(
          (a, b) => {

            const aTime =
              a.createdAt?.toMillis?.() ||
              0;

            const bTime =
              b.createdAt?.toMillis?.() ||
              0;


            return bTime - aTime;

          }
        );


        customerLoading.hidden =
          true;


        renderCustomers();

      },

      (error) => {

        console.error(
          "Customer listener error:",
          error
        );


        customerLoading.hidden =
          true;


        showMessage(
          friendlyFirestoreError(error)
        );

      }
    );

}


/*
==================================================
RENDER CUSTOMERS
==================================================
*/

function renderCustomers() {

  const searchTerm =
    customerSearch.value
      .trim()
      .toLowerCase();


  const filteredCustomers =
    customers.filter(
      (customer) => {

        const searchableText = [

          customer.name,

          customer.phone,

          customer.email,

          customer.address

        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();


        return searchableText
          .includes(searchTerm);

      }
    );


  customerTotal.textContent =
    customers.length;


  customerTableBody.innerHTML =
    "";


  if (customers.length === 0) {

    customerEmpty.hidden =
      false;

    customerNoResults.hidden =
      true;

    customerTableWrapper.hidden =
      true;

    return;

  }


  customerEmpty.hidden =
    true;


  if (filteredCustomers.length === 0) {

    customerNoResults.hidden =
      false;

    customerTableWrapper.hidden =
      true;

    return;

  }


  customerNoResults.hidden =
    true;

  customerTableWrapper.hidden =
    false;


  filteredCustomers.forEach(
    (customer) => {

      const row =
        document.createElement("tr");


      row.innerHTML = `

        <td data-label="Name">
          <strong>
            ${escapeHTML(
              customer.name ||
              "Unnamed"
            )}
          </strong>
        </td>

        <td data-label="Phone">
          ${escapeHTML(
            customer.phone ||
            "—"
          )}
        </td>

        <td data-label="Email">
          ${escapeHTML(
            customer.email ||
            "—"
          )}
        </td>

        <td data-label="Address">
          ${escapeHTML(
            customer.address ||
            "—"
          )}
        </td>

        <td data-label="Actions">

          <div class="customer-actions">

            <button
              type="button"
              class="table-action edit"
              data-action="edit"
              data-id="${customer.id}"
            >
              Edit
            </button>

            <button
              type="button"
              class="table-action delete"
              data-action="delete"
              data-id="${customer.id}"
            >
              Delete
            </button>

          </div>

        </td>

      `;


      customerTableBody.appendChild(row);

    }
  );

}


/*
==================================================
OPEN ADD FORM
==================================================
*/

function openAddForm() {

  customerForm.reset();

  editingCustomerId.value =
    "";

  formTitle.textContent =
    "Add Customer";

  saveCustomerBtn.textContent =
    "Save Customer";

  customerFormPanel.hidden =
    false;

  customerName.focus();

  customerFormPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/*
==================================================
OPEN EDIT FORM
==================================================
*/

function openEditForm(customerId) {

  const customer =
    customers.find(
      (item) =>
        item.id === customerId
    );


  if (!customer) {

    showMessage(
      "Customer record could not be found."
    );

    return;

  }


  editingCustomerId.value =
    customer.id;

  customerName.value =
    customer.name || "";

  customerPhone.value =
    customer.phone || "";

  customerEmail.value =
    customer.email || "";

  customerAddress.value =
    customer.address || "";

  customerNotes.value =
    customer.notes || "";


  formTitle.textContent =
    "Edit Customer";

  saveCustomerBtn.textContent =
    "Update Customer";


  customerFormPanel.hidden =
    false;


  customerName.focus();

  customerFormPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/*
==================================================
CLOSE FORM
==================================================
*/

function closeCustomerForm() {

  customerForm.reset();

  const editingId =
  editingCustomerId.value.trim();

  formTitle.textContent =
    "Add Customer";

  saveCustomerBtn.textContent =
    "Save Customer";

  customerFormPanel.hidden =
    true;

}


/*
==================================================
CUSTOMER FORM EVENTS
==================================================
*/

function setupCustomerEvents() {

  openCustomerFormBtn.addEventListener(
    "click",
    openAddForm
  );


  emptyAddCustomerBtn.addEventListener(
    "click",
    openAddForm
  );


  cancelCustomerBtn.addEventListener(
    "click",
    closeCustomerForm
  );


  customerSearch.addEventListener(
    "input",
    renderCustomers
  );


  customerTableBody.addEventListener(
    "click",
    handleTableAction
  );


  customerForm.addEventListener(
    "submit",
    saveCustomer
  );


  logoutBtn.addEventListener(
    "click",
    logout
  );

}


/*
==================================================
SAVE CUSTOMER
==================================================
*/

async function saveCustomer(event) {

  event.preventDefault();


  if (!businessId) {

    showMessage(
      "Business information is unavailable."
    );

    return;

  }


  const name =
    customerName.value.trim();

  const phone =
    customerPhone.value.trim();

  const email =
    customerEmail.value.trim();

  const address =
    customerAddress.value.trim();

  const notes =
    customerNotes.value.trim();


  if (!name) {

    showMessage(
      "Customer name is required."
    );

    customerName.focus();

    return;

  }


  if (!phone) {

    showMessage(
      "Customer phone is required."
    );

    customerPhone.focus();

    return;

  }


  const editingId =
    editingCustomerId.value.trim();


  try {

    saveCustomerBtn.disabled =
      true;


    saveCustomerBtn.textContent =
      editingId
        ? "Updating..."
        : "Saving...";


    if (editingId) {

      const customerRef =
        doc(
          db,
          "customers",
          editingId
        );


      await updateDoc(
        customerRef,
        {

          name,

          phone,

          email,

          address,

          notes,

          updatedAt:
            serverTimestamp()

        }
      );


      showSuccess(
        "Customer updated successfully."
      );

    } else {

      await addDoc(
        collection(
          db,
          "customers"
        ),
        {

          businessId,

          name,

          phone,

          email,

          address,

          notes,

          createdBy:
            currentUser.uid,

          createdAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp()

        }
      );


      showSuccess(
        "Customer added successfully."
      );

    }


    closeCustomerForm();

  } catch (error) {

    console.error(
      "Save customer error:",
      error
    );


    showMessage(
      friendlyFirestoreError(error)
    );

  } finally {

    saveCustomerBtn.disabled =
      false;


    saveCustomerBtn.textContent =
  editingId
    ? "Update Customer"
    : "Save Customer";

  }

}


/*
==================================================
TABLE ACTION
==================================================
*/

function handleTableAction(event) {

  const button =
    event.target.closest(
      "button[data-action]"
    );


  if (!button) {

    return;

  }


  const action =
    button.dataset.action;

  const id =
    button.dataset.id;


  if (action === "edit") {

    openEditForm(id);

  }


  if (action === "delete") {

    deleteCustomer(id);

  }

}


/*
==================================================
DELETE CUSTOMER
==================================================
*/

async function deleteCustomer(customerId) {

  const customer =
    customers.find(
      (item) =>
        item.id === customerId
    );


  if (!customer) {

    showMessage(
      "Customer record not found."
    );

    return;

  }


  const confirmed =
    window.confirm(
      `Delete ${customer.name || "this customer"}?\n\nThis action cannot be undone.`
    );


  if (!confirmed) {

    return;

  }


  try {

    await deleteDoc(
      doc(
        db,
        "customers",
        customerId
      )
    );


    showSuccess(
      "Customer deleted successfully."
    );

  } catch (error) {

    console.error(
      "Delete customer error:",
      error
    );


    showMessage(
      friendlyFirestoreError(error)
    );

  }

}


/*
==================================================
LOGOUT
==================================================
*/

async function logout() {

  try {

    logoutBtn.disabled =
      true;

    logoutBtn.textContent =
      "Logging out...";


    await signOut(auth);


    window.location.replace(
      "../login.html"
    );

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );


    logoutBtn.disabled =
      false;

    logoutBtn.textContent =
      "Logout";


    showMessage(
      "Unable to logout. Please try again."
    );

  }

}


/*
==================================================
SUCCESS MESSAGE
==================================================
*/

function showSuccess(message) {

  customerMessage.textContent =
    message;

  customerMessage.classList.add(
    "show",
    "message-success"
  );

}


/*
==================================================
ERROR MESSAGE
==================================================
*/

function showMessage(message) {

  customerMessage.textContent =
    message;

  customerMessage.classList.add(
    "show"
  );

  customerMessage.classList.remove(
    "message-success"
  );

}


/*
==================================================
FIRESTORE ERROR HANDLING
==================================================
*/

function friendlyFirestoreError(error) {

  if (
    error?.code ===
    "permission-denied"
  ) {

    return "Permission denied. Your Firestore security rules are blocking this operation.";

  }


  if (
    error?.code ===
    "failed-precondition"
  ) {

    return "Firestore requires an index or configuration change for this operation.";

  }


  if (
    error?.code ===
    "unavailable"
  ) {

    return "Firestore is temporarily unavailable. Check your internet connection.";

  }


  if (
    error?.code ===
    "unauthenticated"
  ) {

    return "Your session has expired. Please login again.";

  }


  return (
    error?.message ||
    "Something went wrong. Please try again."
  );

}


/*
==================================================
HTML ESCAPING
==================================================
*/

function escapeHTML(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


/*
==================================================
UTILITY
==================================================
*/

function capitalize(value) {

  const text =
    String(value || "");


  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );

}