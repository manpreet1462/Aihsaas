// app/community/profile/[userId]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc , getDocs} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getPosts } from '@/lib/community';
import type { UserProfile, CommunityPost } from '@/lib/types';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          throw new Error('User profile not found');
        }
        setUserProfile(userDoc.data() as UserProfile);

        // Load user's posts
        const userPosts = await getPosts(undefined);
        setPosts(userPosts.filter(post => post.userId === userId));
      } catch (err) {
        console.error('Error loading user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setError('You need to be logged in to view this page');
        setLoading(false);
      } else {
        setIsAuthenticated(true);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

//   const router = useRouter();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/community')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Back to Community
          </button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 text-black">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
            {userProfile.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userProfile.parentName}</h1>
            <p className="text-gray-600">{userProfile.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Child's Information</h2>
            <p><span className="font-medium">Name:</span> {userProfile.childName}</p>
            <p><span className="font-medium">Age:</span> {userProfile.age} years</p>
            <p><span className="font-medium">Conditions:</span> {userProfile.conditions.join(', ')}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
            <p><span className="font-medium">Email:</span> {userProfile.email}</p>
            <p><span className="font-medium">Phone:</span> {userProfile.parentNumber}</p>
          </div>
        </div>

        {userProfile.bio && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">About</h2>
            <p className="text-gray-700">{userProfile.bio}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-600">No posts yet.</p>
        ) : (
          <div className="space-y-4">
            {posts.map(post => (
              <div key={post.id} className="border rounded-lg p-4">
                <p className="text-gray-700">{post.content}</p>
                {post.mediaUrl && (
                  <div className="mt-2">
                    {post.mediaType === 'image' ? (
                      <img src={post.mediaUrl} alt="Post media" className="max-h-96 rounded-lg" />
                    ) : (
                      <audio controls src={post.mediaUrl} className="w-full" />
                    )}
                  </div>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {post.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}