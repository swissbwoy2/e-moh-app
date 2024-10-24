import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SearchMandate } from '@/types/search-mandate';
import { useDropzone } from 'react-dropzone';
import { storage } from '@/config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type SearchMandateFormProps = {
  onSubmit: (data: SearchMandate) => Promise<void>;
};

export const SearchMandateForm: React.FC<SearchMandateFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SearchMandate>();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: string[]}>({
    payslips: [],
    prosecutionRecord: [],
    identityDocument: [],
    additional: []
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    onDrop: async (acceptedFiles) => {
      setUploading(true);
      const uploads = acceptedFiles.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const fileRef = ref(storage, `documents/${fileName}`);
        
        try {
          const snapshot = await uploadBytes(fileRef, file);
          const url = await getDownloadURL(snapshot.ref);
          return url;
        } catch (error) {
          console.error('Error uploading file:', error);
          return null;
        }
      });

      const urls = (await Promise.all(uploads)).filter(url => url !== null);
      setUploadedFiles(prev => ({
        ...prev,
        additional: [...prev.additional, ...urls]
      }));
      setUploading(false);
    }
  });

  const onFormSubmit = async (data: SearchMandate) => {
    if (uploadedFiles.payslips.length < 3) {
      alert('Please upload at least 3 payslips');
      return;
    }

    if (!uploadedFiles.prosecutionRecord.length) {
      alert('Please upload prosecution record');
      return;
    }

    if (!uploadedFiles.identityDocument.length) {
      alert('Please upload identity document');
      return;
    }

    const formData: SearchMandate = {
      ...data,
      payslips: uploadedFiles.payslips,
      prosecutionRecord: uploadedFiles.prosecutionRecord[0],
      identityDocument: uploadedFiles.identityDocument[0],
      additionalDocuments: uploadedFiles.additional,
      createdAt: new Date(),
      updatedAt: new Date(),
      termsAcceptanceDate: new Date(),
    };

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 max-w-4xl mx-auto">
      {/* Personal Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              {...register('firstName', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Add all other personal information fields */}
        </div>
      </div>

      {/* Current Housing */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Current Housing</h2>
        {/* Add current housing fields */}
      </div>

      {/* Financial Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Financial Information</h2>
        {/* Add financial information fields */}
      </div>

      {/* Search Criteria */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Search Criteria</h2>
        {/* Add search criteria fields */}
      </div>

      {/* Document Upload */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
        
        <div className="space-y-4">
          {/* Payslips Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Last 3 Payslips</label>
            <div {...getRootProps()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <input {...getInputProps()} />
                <p className="text-sm text-gray-600">
                  Drag and drop your payslips here, or click to select files
                </p>
              </div>
            </div>
          </div>

          {/* Other document upload sections */}
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              {...register('termsAccepted', { required: true })}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">Terms and Conditions</label>
            <p className="text-gray-500">I have read and agree to the terms and conditions</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={uploading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Submit and Proceed to Payment
        </button>
      </div>
    </form>
  );
};