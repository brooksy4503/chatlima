'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminTestPage() {
  const [userStatus, setUserStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [settingAdmin, setSettingAdmin] = useState(false);
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthorized'>('loading');
  const router = useRouter();

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/check-status');
      const data = await response.json();
      
      if (data.success) {
        setAuthStatus('authenticated');
        setUserStatus(data);
      } else {
        setAuthStatus('unauthorized');
        router.push('/auth/sign-in');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus('unauthorized');
      router.push('/auth/sign-in');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const setAsAdmin = async () => {
    setSettingAdmin(true);
    try {
      const response = await fetch('/api/admin/set-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userStatus?.user?.email }),
      });

      const data = await response.json();
      if (data.success) {
        await checkAuthStatus(); // Refresh status
      } else {
        alert('Failed to set admin: ' + data.error);
      }
    } catch (error) {
      alert('Error setting admin status');
    } finally {
      setSettingAdmin(false);
    }
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (authStatus === 'unauthorized') {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Admin Status Check</CardTitle>
          <CardDescription>
            Check your current admin status and set admin if needed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userStatus?.success ? (
            <>
              <div className="space-y-2">
                <h3 className="font-semibold">User Information:</h3>
                <div className="bg-gray-100 p-3 rounded">
                  <p><strong>Name:</strong> {userStatus.user.name}</p>
                  <p><strong>Email:</strong> {userStatus.user.email}</p>
                  <p><strong>User ID:</strong> {userStatus.user.id}</p>
                  <p><strong>Role:</strong> {userStatus.user.role || 'not set'}</p>
                  <p><strong>Is Admin:</strong> {userStatus.user.isAdmin ? 'Yes' : 'No'}</p>
                  <p><strong>Is Anonymous:</strong> {userStatus.user.isAnonymous ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <Alert className={userStatus.isAdmin ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
                <AlertDescription className={userStatus.isAdmin ? 'text-green-800' : 'text-yellow-800'}>
                  <strong>Admin Status:</strong> {userStatus.isAdmin ? 'You are an admin!' : 'You are not an admin yet.'}
                </AlertDescription>
              </Alert>

              {!userStatus.isAdmin && (
                <Button 
                  onClick={setAsAdmin} 
                  disabled={settingAdmin}
                  className="w-full"
                >
                  {settingAdmin ? 'Setting Admin...' : 'Set Me as Admin'}
                </Button>
              )}

              {userStatus.isAdmin && (
                <div className="space-y-2">
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      ✅ You can now access the admin panel at <code className="bg-green-100 px-1 rounded">/admin</code>
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={() => window.location.href = '/admin'} 
                    className="w-full"
                  >
                    Go to Admin Panel
                  </Button>
                </div>
              )}
            </>
          ) : (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                Error: {userStatus?.error || 'Failed to check admin status'}
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-gray-500 mt-4">
            <p>This page helps you check and set your admin status for the ChatLima admin panel.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 