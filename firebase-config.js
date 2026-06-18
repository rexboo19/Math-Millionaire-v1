// Firebase Configuration
// Firebase project: math-millionaire-77397

const firebaseConfig = {
    apiKey: "AIzaSyCphJ-8M-dN2WW9zxrQ29Y_2qaZa1XF8_o",
    authDomain: "math-millionaire-77397.firebaseapp.com",
    databaseURL: "https://math-millionaire-77397-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "math-millionaire-77397",
    storageBucket: "math-millionaire-77397.firebasestorage.app",
    messagingSenderId: "941441997056",
    appId: "1:941441997056:web:f6ced1471de1b22cb93be5",
    measurementId: "G-5SS3F2MCJ7"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    window.firebaseDatabase = firebase.database();
} else {
    console.error('Firebase SDK not loaded. Make sure firebase-app.js and firebase-database.js are included.');
}

