import { doc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/config/firebase';

interface UserInfo {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  birthDate: string;
  nationality: string;
  residencePermit: string;
  maritalStatus: string;
  currentPropertyManager: string;
  propertyManagerContact: string;
  currentRent: string;
  livingAtCurrentAddressSince: string;
  currentRooms: string;
  extraordinaryCharges: boolean;
  chargesDetails: string;
  hasProsecution: boolean;
  hasGuardianship: boolean;
  reasonForMoving: string;
  profession: string;
  employer: string;
  monthlyIncome: string;
  employmentStartDate: string;
  usageType: string;
}

interface Files {
  prosecutionRecord: File | null;
  payslips: File[];
  identityDocument: File | null;
}

export async function createMandate(userInfo: UserInfo, files: Files) {
  try {
    // Upload documents
    const uploadFile = async (file: File, path: string) => {
      const fileRef = ref(storage, `mandates/${path}/${Date.now()}-${file.name}`);
      await uploadBytes(fileRef, file);
      return getDownloadURL(fileRef);
    };

    const [prosecutionRecordUrl, identityDocumentUrl, ...payslipUrls] = await Promise.all([
      files.prosecutionRecord && uploadFile(files.prosecutionRecord, 'prosecution-records'),
      files.identityDocument && uploadFile(files.identityDocument, 'identity-documents'),
      ...files.payslips.map(file => uploadFile(file, 'payslips'))
    ]);

    // Create mandate document
    const mandateRef = doc(db, 'search-mandates', userInfo.userId);
    await setDoc(mandateRef, {
      ...userInfo,
      documents: {
        prosecutionRecord: prosecutionRecordUrl,
        identityDocument: identityDocumentUrl,
        payslips: payslipUrls.filter(Boolean)
      },
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { success: true };
  } catch (error) {
    console.error('Error creating mandate:', error);
    throw new Error('Failed to create mandate');
  }
}

export async function updateMandateStatus(mandateId: string, status: 'approved' | 'rejected' | 'pending') {
  try {
    const mandateRef = doc(db, 'search-mandates', mandateId);
    await setDoc(mandateRef, {
      status,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error updating mandate status:', error);
    throw new Error('Failed to update mandate status');
  }
}

export async function addMandateNote(mandateId: string, note: string) {
  try {
    const mandateRef = doc(db, 'search-mandates', mandateId);
    await setDoc(mandateRef, {
      notes: arrayUnion({
        content: note,
        createdAt: serverTimestamp()
      }),
      updatedAt: serverTimestamp()
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error('Error adding mandate note:', error);
    throw new Error('Failed to add mandate note');
  }
}