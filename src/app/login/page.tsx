// app/login/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
      
      // Get the ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Set the session cookie
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: idToken }),
      });

      if (response.ok) {
        // Explicitly redirect to dashboard after successful login
        router.push('/dashboard');
      } else {
        throw new Error('Failed to set session');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user-friendly error messages
  const getErrorMessage = (code: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later';
      default:
        return 'Login failed. Please try again';
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out";
  const buttonClass = "w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 shadow-md";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 text-black">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 ease-in-out transform">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
          <h2 className="text-3xl font-bold text-white text-center">Welcome Back</h2>
          <p className="text-blue-100 text-center mt-2">Sign in to your Aihsaas account</p>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded animate-fadeIn flex justify-between items-center">
              <div>
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
              <button 
                onClick={() => setError('')} 
                className="text-red-700 font-bold text-xl hover:text-red-800"
              >
                ×
              </button>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="your.email@example.com" 
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-300">
                  Forgot password?
                </a>
              </div>
              <input 
                type="password" 
                placeholder="Enter your password" 
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className={buttonClass}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : 'Sign In'}
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}