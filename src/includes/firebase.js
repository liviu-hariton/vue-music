import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBU65huvXTqK2PGEIv4jniFlvgTEt39uXw",
  authDomain: "vue-music-d0c8d.firebaseapp.com",
  projectId: "vue-music-d0c8d",
  storageBucket: "vue-music-d0c8d.appspot.com",
  /*messagingSenderId: "609500945757",*/
  appId: "1:609500945757:web:10dc7e26f56a0b4152dcb4"
};

export default firebase.initializeApp(firebaseConfig);