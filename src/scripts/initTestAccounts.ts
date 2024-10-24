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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createTestAccounts = async () => {
  try {
    console.log('Début de la création des comptes tests...');

    // Création compte agent
    console.log('Création du compte agent...');
    const agentCredential = await createUserWithEmailAndPassword(
      auth,
      'agent@immo-rama.ch',
      'Agent123!'
    );
    console.log('Compte Firebase créé pour l\'agent');
    
    await setDoc(doc(db, 'users', agentCredential.user.uid), {
      email: 'agent@immo-rama.ch',
      role: 'AGENT',
      firstName: 'Jean',
      lastName: 'Martin',
      phone: '+41 76 123 45 67',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Données agent enregistrées dans Firestore');

    // Création compte client
    console.log('Création du compte client...');
    const clientCredential = await createUserWithEmailAndPassword(
      auth,
      'client@test.ch',
      'Client123!'
    );
    console.log('Compte Firebase créé pour le client');
    
    await setDoc(doc(db, 'users', clientCredential.user.uid), {
      email: 'client@test.ch',
      role: 'CLIENT',
      firstName: 'Marie',
      lastName: 'Dubois',
      phone: '+41 78 987 65 43',
      createdAt: new Date(),
      updatedAt: new Date(),
      subscriptionEndDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    });
    console.log('Données client enregistrées dans Firestore');

    console.log('Création des comptes tests terminée avec succès!');
    
    // Force l'arrêt du script
    process.exit(0);

  } catch (error) {
    console.error('Erreur lors de la création des comptes:', error);
    process.exit(1);
  }
};

createTestAccounts();
