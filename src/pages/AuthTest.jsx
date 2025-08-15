import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { motion } from 'framer-motion';

const AuthTest = () => {
  const { user, loading } = useAuth();
  const [session, setSession] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };

    const getUserData = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();
          
          if (error) {
            console.error('Error fetching user data:', error);
          } else {
            setUserData(data);
          }
        } catch (err) {
          console.error('Error:', err);
        }
      }
    };

    getSession();
    getUserData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Authentication Test Page
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Auth Context State */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Auth Context State</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
                <p><strong>User:</strong> {user ? 'Present' : 'None'}</p>
                {user && (
                  <div className="mt-2 text-sm">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Supabase Session */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Supabase Session</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Session:</strong> {session ? 'Active' : 'None'}</p>
                {session && (
                  <div className="mt-2 text-sm">
                    <p><strong>Access Token:</strong> {session.access_token ? 'Present' : 'None'}</p>
                    <p><strong>Refresh Token:</strong> {session.refresh_token ? 'Present' : 'None'}</p>
                    <p><strong>Expires:</strong> {new Date(session.expires_at * 1000).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* User Metadata */}
            {user && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">User Metadata</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>User Metadata:</strong></p>
                  <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </pre>
                  
                  <p className="mt-4"><strong>App Metadata:</strong></p>
                  <pre className="text-xs mt-2 bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(user.app_metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Database User Data */}
            {userData && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Database User Data</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto">
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Admin Check Test */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Admin Access Test</h3>
            <div className="space-y-2">
              <p><strong>Email Check:</strong> {user?.email === 'admin@abhilakshyoga.com' ? '✅ Admin Email' : '❌ Not Admin Email'}</p>
              <p><strong>User Metadata Role:</strong> {user?.user_metadata?.role === 'admin' ? '✅ Admin Role' : '❌ No Admin Role'}</p>
              <p><strong>App Metadata Role:</strong> {user?.app_metadata?.role === 'admin' ? '✅ Admin Role' : '❌ No Admin Role'}</p>
              <p><strong>Database Role:</strong> {userData?.role === 'admin' ? '✅ Admin Role' : '❌ No Admin Role'}</p>
            </div>
            
            <div className="mt-4 p-4 bg-white rounded border">
              <p className="text-sm text-gray-600">
                <strong>Admin Access Result:</strong> {
                  (user?.email === 'admin@abhilakshyoga.com' || 
                   user?.user_metadata?.role === 'admin' || 
                   user?.app_metadata?.role === 'admin' ||
                   userData?.role === 'admin') ? '✅ ACCESS GRANTED' : '❌ ACCESS DENIED'
                }
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Test Admin Access
            </button>
            <button
              onClick={() => window.location.href = '/admin-login'}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Admin Login
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthTest; 