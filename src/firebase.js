
  import firebase from "firebase/app";
  import "firebase/firestore";

  var firebaseConfig = {
    apiKey: "AIzaSyAL3du6nMCQ0flZ1XzzVJIY0HR2cZbCNwQ",
    authDomain: "goodbarkaraoke.firebaseapp.com",
    projectId: "goodbarkaraoke",
    storageBucket: "goodbarkaraoke.appspot.com",
    messagingSenderId: "443669429939",
    appId: "1:443669429939:web:28f5a2ae8bf660acdabac6"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase;