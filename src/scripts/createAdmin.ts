import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB6gSYLUDtw2Jrjul_O7GDkP0jNefi_a2E",
  authDomain: "immo-rama-app.firebaseapp.com",
  projectId: "immo-rama-app",
  storageBucket: "immo-rama-app.appspot.com",
  messagingSenderId: "352896107824",
  appId: "1:352896107824:web:5b704b4c9dd7c0a2b1f4f5",
  measurementId: "G-5DCXYEHSBT"
};

console.log('Initializing Firebase...');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createAdminUser = async () => {
  try {
    const email = 'admin@immo-rama.ch';
    const password = 'Admin123!';

    console.log('Creating admin user...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log('Admin user created in Auth, now creating in Firestore...');
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      role: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Admin user created successfully with UID:', user.uid);
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists');
    } else {
      console.error('Error creating admin user:', error.code, error.message);
    }
  } finally {
    setTimeout(() => process.exit(0), 2000); // Ajout d'un délai pour permettre à Firebase de terminer ses opérations
  }
};

createAdminUser();
