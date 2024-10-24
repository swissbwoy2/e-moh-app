import { auth, db } from '@/config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { sampleAccounts } from './sample-data';

export const initializeAdmin = async () => {
  try {
    // Create admin account if it doesn't exist
    const { email, password } = sampleAccounts.admin;
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    
    // Create admin document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      role: 'admin',
      createdAt: new Date(),
      lastLogin: new Date(),
    });

    console.log('Admin account created successfully');
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin account already exists');
    } else {
      console.error('Error creating admin account:', error);
      throw error;
    }
  }
};