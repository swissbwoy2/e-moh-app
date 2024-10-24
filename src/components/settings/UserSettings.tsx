import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface SettingsSection {
  id: string;
  title: string;
  description: string;
  fields: SettingsField[];
}

interface SettingsField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'toggle';
  options?: string[];
  value?: string | boolean;
}

export const UserSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings configuration based on user role
  const settingsSections = (): SettingsSection[] => {
    const commonSettings: SettingsSection[] = [
      {
        id: 'profile',
        title: 'Profile Settings',
        description: 'Manage your personal information and account details',
        fields: [
          {
            id: 'displayName',
            label: 'Display Name',
            type: 'text',
            value: user?.displayName || '',
          },
          {
            id: 'email',
            label: 'Email',
            type: 'email',
            value: user?.email || '',
          },
        ],
      },
      {
        id: 'notifications',
        title: 'Notification Settings',
        description: 'Configure how you want to receive notifications',
        fields: [
          {
            id: 'emailNotifications',
            label: 'Email Notifications',
            type: 'toggle',
            value: user?.settings?.emailNotifications ?? true,
          },
          {
            id: 'pushNotifications',
            label: 'Push Notifications',
            type: 'toggle',
            value: user?.settings?.pushNotifications ?? true,
          },
        ],
      },
      {
        id: 'security',
        title: 'Security Settings',
        description: 'Manage your account security preferences',
        fields: [
          {
            id: 'twoFactorAuth',
            label: 'Two-Factor Authentication',
            type: 'toggle',
            value: user?.settings?.twoFactorAuth ?? false,
          },
        ],
      },
    ];

    // Role-specific settings
    switch (user?.role) {
      case 'client':
        return [
          ...commonSettings,
          {
            id: 'searchPreferences',
            title: 'Search Preferences',
            description: 'Customize your property search settings',
            fields: [
              {
                id: 'automaticMatching',
                label: 'Automatic Property Matching',
                type: 'toggle',
                value: user?.settings?.automaticMatching ?? true,
              },
              {
                id: 'matchingFrequency',
                label: 'Matching Notification Frequency',
                type: 'select',
                options: ['Immediately', 'Daily', 'Weekly'],
                value: user?.settings?.matchingFrequency || 'Daily',
              },
            ],
          },
        ];
      case 'agent':
        return [
          ...commonSettings,
          {
            id: 'availability',
            title: 'Availability Settings',
            description: 'Set your working hours and availability',
            fields: [
              {
                id: 'workingDays',
                label: 'Working Days',
                type: 'select',
                options: ['Monday-Friday', 'Monday-Saturday', 'All Week'],
                value: user?.settings?.workingDays || 'Monday-Friday',
              },
              {
                id: 'autoResponder',
                label: 'Automatic Response When Unavailable',
                type: 'toggle',
                value: user?.settings?.autoResponder ?? true,
              },
            ],
          },
        ];
      case 'admin':
        return [
          ...commonSettings,
          {
            id: 'adminPreferences',
            title: 'Administrative Settings',
            description: 'Configure system-wide preferences',
            fields: [
              {
                id: 'automaticApproval',
                label: 'Automatic Mandate Approval',
                type: 'toggle',
                value: user?.settings?.automaticApproval ?? false,
              },
              {
                id: 'agentAssignmentMethod',
                label: 'Agent Assignment Method',
                type: 'select',
                options: ['Round Robin', 'Load Balanced', 'Manual'],
                value: user?.settings?.agentAssignmentMethod || 'Manual',
              },
            ],
          },
        ];
      default:
        return commonSettings;
    }
  };

  const handleSettingChange = async (sectionId: string, fieldId: string, value: string | boolean) => {
    try {
      setLoading(true);
      setMessage(null);

      const userRef = doc(db, 'users', user!.id);
      const updateData = {
        [`settings.${fieldId}`]: value,
      };

      await updateDoc(userRef, updateData);
      await updateUser(); // Refresh user context

      setMessage({
        type: 'success',
        text: 'Settings updated successfully',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update settings',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {settingsSections().map((section) => (
        <div key={section.id} className="mb-8 bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{section.description}</p>

            <div className="mt-6 space-y-6">
              {section.fields.map((field) => (
                <div key={field.id} className="flex items-start">
                  <div className="flex-1">
                    <label
                      htmlFor={field.id}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.label}
                    </label>

                    {field.type === 'toggle' ? (
                      <button
                        type="button"
                        className={`${
                          field.value ? 'bg-blue-600' : 'bg-gray-200'
                        } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        onClick={() =>
                          handleSettingChange(section.id, field.id, !field.value)
                        }
                        disabled={loading}
                      >
                        <span
                          className={`${
                            field.value ? 'translate-x-5' : 'translate-x-0'
                          } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                        />
                      </button>
                    ) : field.type === 'select' ? (
                      <select
                        id={field.id}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={field.value}
                        onChange={(e) =>
                          handleSettingChange(section.id, field.id, e.target.value)
                        }
                        disabled={loading}
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        id={field.id}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={field.value as string}
                        onChange={(e) =>
                          handleSettingChange(section.id, field.id, e.target.value)
                        }
                        disabled={loading}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};