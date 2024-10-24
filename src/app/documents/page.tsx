'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import { db, storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const REQUIRED_DOCUMENTS = [
  { id: 'salary', name: '3 dernières fiches de salaire', required: true },
  { id: 'id', name: 'Pièce d\'identité', required: true },
  { id: 'debt', name: 'Extrait de l\'office des poursuites', required: true },
  { id: 'residence', name: 'Attestation de domicile', required: false },
  { id: 'insurance', name: 'RC-ménage', required: false }
];

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    const q = query(collection(db, 'documents'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setDocuments(docs);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  const handleFileUpload = async (docType: string, file: File) => {
    if (!user) return;
    
    setUploading(true);
    try {
      const storageRef = ref(storage, `documents/${user.uid}/${docType}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await addDoc(collection(db, 'documents'), {
        userId: user.uid,
        type: docType,
        fileName: file.name,
        url,
        status: 'PENDING',
        uploadedAt: new Date(),
        updatedAt: new Date()
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900">Documents requis</h1>
          <div className="mt-8 space-y-6">
            {REQUIRED_DOCUMENTS.map((doc) => {
              const uploadedDoc = documents.find(d => d.type === doc.id);
              return (
                <div key={doc.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {doc.name}
                        {doc.required && <span className="text-red-500">*</span>}
                      </h3>
                      {uploadedDoc && (
                        <p className="text-sm text-gray-500">
                          Status: {uploadedDoc.status}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(doc.id, file);
                        }}
                        disabled={uploading}
                        className="hidden"
                        id={`file-${doc.id}`}
                      />
                      <label
                        htmlFor={`file-${doc.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                      >
                        {uploading ? 'Envoi...' : uploadedDoc ? 'Mettre à jour' : 'Télécharger'}
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
