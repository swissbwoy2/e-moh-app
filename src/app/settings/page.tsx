'use client';

import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: 'en',
  });

  const handleSettingChange = (setting: string, value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Update user settings in Firestore
      setMessage('Settings updated successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

          <div className="mt-6">
            {message && (
              <div className="mb-4 rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Notifications Settings */}
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Notifications
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose how you want to receive notifications.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="emailNotifications"
                            type="checkbox"
                            checked={settings.emailNotifications}
                            onChange={(e) =>
                              handleSettingChange('emailNotifications', e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="emailNotifications"
                            className="font-medium text-gray-700"
                          >
                            Email notifications
                          </label>
                          <p className="text-gray-500">
                            Get notified about new matches and messages via email.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="pushNotifications"
                            type="checkbox"
                            checked={settings.pushNotifications}
                            onChange={(e) =>
                              handleSettingChange('pushNotifications', e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label
                            htmlFor="pushNotifications"
                            className="font-medium text-gray-700"
                          >
                            Push notifications
                          </label>
                          <p className="text-gray-500">
                            Receive push notifications in your browser.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      Display
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Customize your display preferences.
                    </p>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="darkMode"
                            type="checkbox"
                            checked={settings.darkMode}
                            onChange={(e) =>
                              handleSettingChange('darkMode', e.target.checked)
                            }
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="darkMode" className="font-medium text-gray-700">
                            Dark mode
                          </label>
                          <p className="text-gray-500">
                            Use dark theme for better visibility in low light.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="language"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Language
                        </label>
                        <select
                          id="language"
                          value={settings.language}
                          onChange={(e) =>
                            handleSettingChange('language', e.target.value)
                          }
                          className="mt-1 modern-input"
                        >
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="it">Italiano</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() =>
                    setSettings({
                      emailNotifications: true,
                      pushNotifications: true,
                      darkMode: false,
                      language: 'en',
                    })
                  }
                  className="btn-modern bg-white py-2 px-4 text-gray-700 hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-modern bg-blue-600 py-2 px-4 text-white hover:bg-blue-700"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}