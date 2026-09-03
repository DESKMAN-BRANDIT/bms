import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyCa2XVuD7uXWIbJ47yXMkygAmsKtNO8tW4",
  authDomain: "business-management-syst-76369.firebaseapp.com",
  projectId: "business-management-syst-76369",
  storageBucket: "business-management-syst-76369.firebasestorage.app",
  messagingSenderId: "771910576307",
  appId: "1:771910576307:web:79b43b9d03426ebf51e8c6"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


export {
  app,
  auth,
  db
};
