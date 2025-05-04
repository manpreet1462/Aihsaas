// app/signup/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: '',
    password: '',
    childName: '',
    age: '',
    parentName: '',
    parentNumber: '',
    location: '',
    problem: '',
    conditions: [] as string[],
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const conditionOptions = [
    "Cerebral Palsy",
    "Autism Spectrum Disorder",
    "Down Syndrome",
    "ADHD",
    "Developmental Delay",
    "Speech Delay",
    "Sensory Processing Disorder"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleConditionToggle = (condition: string) => {
    setForm(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // 1. Create auth user
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      
      // 2. Update user profile with parent name
      await updateProfile(userCred.user, {
        displayName: form.parentName
      });

      // 3. Prepare user data for Firestore
      const userData = {
        email: form.email,
        childName: form.childName,
        age: form.age,
        parentName: form.parentName,
        parentNumber: form.parentNumber,
        location: form.location,
        problem: form.problem,
        conditions: form.conditions,
        bio: form.bio,
        uid: userCred.user.uid,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      };

      // 4. Save to Firestore
      await setDoc(doc(db, 'users', userCred.user.uid), userData);

      // 5. Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      
      // Enhanced error handling
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please log in instead.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'permission-denied':
          setError('Database permission denied. Please contact support.');
          break;
        default:
          setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300 ease-in-out";

  const buttonClass = "w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-opacity-50 shadow-md";

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 text-black">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 ease-in-out transform">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
          <h2 className="text-2xl font-bold text-white text-center">Welcome to Aihsaas</h2>
          <p className="text-blue-100 text-center mt-1">Create your account to get started</p>
        </div>
        
        {/* <div className="flex justify-center -mt-3">
          <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`h-1 w-8 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`h-1 w-8 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
          </div>
        </div> */}
        <div className="flex justify-center -mt-3">
            <div className="flex items-center">
            <div className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`h-1 w-8 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`h-1 w-8 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`h-1 w-8 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
            <div className={`h-2 w-2 rounded-full ${step >= 4 ? 'bg-blue-600' : 'bg-gray-300'} transition-colors duration-300`}></div>
        </div>
    </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded animate-fadeIn">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSignup} className="space-y-5">
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-medium text-gray-800">Account Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={form.email}
                    placeholder="your.email@example.com" 
                    className={inputClass} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    name="password" 
                    value={form.password}
                    placeholder="Create a secure password" 
                    className={inputClass} 
                    onChange={handleChange} 
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
                </div>
                <button 
                  type="button" 
                  className={buttonClass}
                  onClick={nextStep}
                >
                  Continue
                </button>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-medium text-gray-800">Parent Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    name="parentName" 
                    value={form.parentName}
                    placeholder="Your name" 
                    className={inputClass} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                  <input 
                    type="tel" 
                    name="parentNumber" 
                    value={form.parentNumber}
                    placeholder="Your phone number" 
                    className={inputClass} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={form.location}
                    placeholder="City, State" 
                    className={inputClass} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="flex space-x-3">
                  <button 
                    type="button" 
                    className="w-1/3 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                    onClick={prevStep}
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    className="w-2/3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-300"
                    onClick={nextStep}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-lg font-medium text-gray-800">Child Information</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Child's Name</label>
                  <input 
                    type="text" 
                    name="childName" 
                    value={form.childName}
                    placeholder="Child's name" 
                    className={inputClass} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Child's Age</label>
                  <input 
                    type="number" 
                    name="age" 
                    value={form.age}
                    placeholder="Age in years" 
                    className={inputClass} 
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Describe the Challenges</label>
                  <textarea 
                    name="problem" 
                    value={form.problem}
                    placeholder="Please briefly describe the challenges your child faces" 
                    className={`${inputClass} h-24 resize-none`}
                    onChange={handleChange} 
                    required 
                  />
                </div>
                <div className="flex space-x-3">
                    <button 
                        type="button" 
                        className="w-1/3 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
                        onClick={prevStep}
                    >
                        Back
                    </button>
                    <button 
                        type="button" // Changed from type="submit"
                        className={`w-2/3 ${buttonClass}`}
                        onClick={nextStep} // Changed from handleSignup
                    >
                    Continue
                    </button>
                </div>
            </div>
            )}

            {/* {step === 4 && (
  <div className="space-y-4 animate-fadeIn">
    <h3 className="text-lg font-medium text-gray-800">Community Profile</h3>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Child's Conditions (Select all that apply)
      </label>
      <div className="grid grid-cols-2 gap-2">
        {conditionOptions.map(condition => (
          <label key={condition} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.conditions.includes(condition)}
              onChange={() => handleConditionToggle(condition)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span>{condition}</span>
          </label>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Brief Bio (Optional)
      </label>
      <textarea
        name="bio"
        value={form.bio}
        placeholder="Tell other parents about your journey..."
        className={`${inputClass} h-24 resize-none`}
        onChange={handleChange}
      />
    </div>

    <div className="flex space-x-3">
      <button 
        type="button" 
        className="w-1/3 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
        onClick={prevStep}
      >
        Back
      </button>
      <button 
        type="submit" 
        className={`w-2/3 ${buttonClass}`}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </div>
        ) : "Complete Signup"}
      </button>
    </div>
  </div>
)} */}
        {step === 4 && (
  <div className="space-y-4 animate-fadeIn">
    <h3 className="text-lg font-medium text-gray-800">Community Profile</h3>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Child's Conditions (Select all that apply)
      </label>
      <div className="grid grid-cols-2 gap-2">
        {conditionOptions.map(condition => (
          <label key={condition} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={form.conditions.includes(condition)}
              onChange={() => handleConditionToggle(condition)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <span>{condition}</span>
          </label>
        ))}
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Brief Bio (Optional)
      </label>
      <textarea
        name="bio"
        value={form.bio}
        placeholder="Tell other parents about your journey..."
        className={`${inputClass} h-24 resize-none`}
        onChange={handleChange}
      />
    </div>

    <div className="flex space-x-3">
      <button 
        type="button" 
        className="w-1/3 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-300"
        onClick={prevStep}
      >
        Back
      </button>
      <button 
        type="submit" // This is now the actual submit button
        className={`w-2/3 ${buttonClass}`}
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating account...
          </div>
        ) : "Complete Signup"}
      </button>
    </div>
  </div>
)}
          </form>
          
          <p className="mt-6 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-300">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}