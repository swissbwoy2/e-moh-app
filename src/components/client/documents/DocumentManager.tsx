import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../../lib/firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import type { Document } from '@/types';

interface DocumentWithId extends Document {
  id: string;
}

const REQUIRED_DOCUMENTS = [
  { type: 'salary' as const, label: 'Fiches de salaire (3 derniers mois)', required: true },
  { type: 'id' as const, label: 'Pièce d\'identité', required: true },
  { type: 'permit' as const, label: 'Permis de séjour', required: true },
  { type: 'debt' as const, label: 'Extrait de l\'office des poursuites', required: true },
  { type: 'residence' as const, label: 'Attestation de domicile', required: false },
  { type: 'employment' as const, label: 'Attestation de l\'employeur', required: false },
  { type: 'insurance' as const, label: 'RC-ménage', required: false }
];

export const DocumentManager = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentWithId[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchDocuments = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const q = query(
        collection(db, 'documents'),
        where('userId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const docs: DocumentWithId[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        validUntil: doc.data().validUntil?.toDate(),
      } as DocumentWithId));
      setDocuments(docs);
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      setError('Impossible de charger les documents');
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleFileUpload = async (docType: Document['type'], file: File) => {
    if (!user) return;

    try {
      setUploading(true);
      setError('');

      // Create storage reference
      const fileRef = ref(storage, `documents/${user.uid}/${docType}_${Date.now()}`);
      
      // Upload file
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      // Check if document of this type already exists
      const existingDoc = documents.find(doc => doc.type === docType);

      if (existingDoc) {
        // Update existing document
        await updateDoc(doc(db, 'documents', existingDoc.id), {
          url,
          updatedAt: new Date(),
          status: 'pending'
        });
      } else {
        // Create new document
        await addDoc(collection(db, 'documents'), {
          userId: user.uid,
          type: docType,
          url,
          name: file.name,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      await fetchDocuments();
    } catch (error) {
      console.error('Erreur lors de l\'upload du document:', error);
      setError('Impossible d\'uploader le document');
    } finally {
      setUploading(false);
    }
  };

  const getDocumentStatus = (type: Document['type']) => {
    const doc = documents.find(d => d.type === type);
    return doc?.status || 'missing';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Documents requis
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Veuillez fournir les documents suivants pour compléter votre dossier.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {REQUIRED_DOCUMENTS.map((docType) => (
          <div
            key={docType.type}
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400"
          >
            <div className="flex-1 min-w-0">
              <div className="focus:outline-none">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">
                  {docType.label}
                  {docType.required && <span className="text-red-500">*</span>}
                </p>
                <p className="text-sm text-gray-500">
                  {getDocumentStatus(docType.type) === 'missing' ? (
                    'Non fourni'
                  ) : getDocumentStatus(docType.type) === 'pending' ? (
                    'En attente de validation'
                  ) : getDocumentStatus(docType.type) === 'rejected' ? (
                    'Rejeté'
                  ) : (
                    'Validé'
                  )}
                </p>
              </div>
            </div>
            <div>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(docType.type, file);
                }}
                disabled={uploading}
                className="hidden"
                id={`file-${docType.type}`}
              />
              <label
                htmlFor={`file-${docType.type}`}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                  uploading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {uploading ? 'Envoi...' : 'Charger'}
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
