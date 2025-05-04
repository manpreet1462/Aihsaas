// app/dashboard/community/page.tsx
// 'use client';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { auth, db } from '@/lib/firebase';
// import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, where } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';
// import { 
//   getSupportGroups, 
//   getPosts, 
//   createPost, 
//   joinGroup,
//   leaveGroup,
//   addComment,
//   likePost,
//   unlikePost,
//   uploadMedia,
//   getGroupsForUser,
//   initializeConditionGroups
// } from '@/lib/community';
// import type { 
//   SupportGroup, 
//   CommunityPost, 
//   Comment,
//   UserProfile 
// } from '@/lib/types';

// export default function CommunityPage() {
//   const router = useRouter();
//   const [groups, setGroups] = useState<SupportGroup[]>([]);
//   const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
//   const [posts, setPosts] = useState<CommunityPost[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [newPostContent, setNewPostContent] = useState('');
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [commentContent, setCommentContent] = useState('');
//   const [activePostId, setActivePostId] = useState<string | null>(null);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       try {
//         // Get user profile
//         const userDoc = await getDoc(doc(db, 'users', user.uid));
//         if (!userDoc.exists()) {
//           throw new Error('User profile not found');
//         }
//         setUserProfile(userDoc.data() as UserProfile);

//         // Get groups for user's conditions
//         const userGroups = await getGroupsForUser(user.uid);
//         setGroups(userGroups);

//         // Get joined groups
//         const joinedGroupsQuery = query(
//           collection(db, 'supportGroups'),
//           where('members', 'array-contains', user.uid)
//         );
//         const joinedGroupsSnapshot = await getDocs(joinedGroupsQuery);
//         setJoinedGroups(joinedGroupsSnapshot.docs.map(doc => doc.id));

//         // Get all posts
//         const allPosts = await getPosts();
//         setPosts(allPosts);
//       } catch (err) {
//         console.error('Error loading data:', err);
//         setError('Failed to load data. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);
//     }
//   };

//   const handleCreatePost = async () => {
//     if (!newPostContent.trim() && !selectedFile) return;

//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       // Get user profile
//       const userDoc = await getDoc(doc(db, 'users', user.uid));
//       if (!userDoc.exists()) {
//         throw new Error('User profile not found');
//       }
//       const userData = userDoc.data() as UserProfile;

//       // Ensure conditions is an array
//       const userConditions = Array.isArray(userData.conditions) ? userData.conditions : [];

//       // Prepare media data
//       let mediaUrl = undefined;
//       let mediaType = undefined;
      
//       if (selectedFile) {
//         mediaUrl = await uploadMedia(selectedFile);
//         mediaType = selectedFile.type.startsWith('image/') ? 'image' as const : 'audio' as const;
//       }

//       const postData = {
//         content: newPostContent,
//         userId: user.uid,
//         userProfile: {
//           uid: user.uid,
//           email: userData.email || '',
//           childName: userData.childName || '',
//           age: userData.age || 0,
//           parentName: userData.parentName || '',
//           parentNumber: userData.parentNumber || '',
//           location: userData.location || '',
//           problem: userData.problem || '',
//           conditions: userConditions,
//           bio: userData.bio || '',
//           avatarUrl: userData.avatarUrl || '',
//           createdAt: userData.createdAt || new Date().toISOString()
//         },
//         ...(mediaUrl ? { mediaUrl, mediaType } : {})
//       };

//       await createPost(postData);
//       setNewPostContent('');
//       setSelectedFile(null);
//       setPreviewUrl(null);
      
//       // Refresh posts
//       const updatedPosts = await getPosts();
//       setPosts(updatedPosts);
//     } catch (err) {
//       console.error('Error creating post:', err);
//       setError('Failed to create post. Please try again.');
//     }
//   };

//   const handleJoinGroup = async (groupId: string) => {
//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       await joinGroup(groupId, user.uid);
//       setJoinedGroups([...joinedGroups, groupId]);
//     } catch (err: any) {
//       console.error('Error joining group:', err);
//       setError(err.message || 'Failed to join group');
//     }
//   };

//   const handleViewGroup = (groupId: string) => {
//     router.push(`/dashboard/community/groups/${groupId}`);
//   };

//   const handleViewProfile = (userId: string) => {
//     router.push(`/dashboard/community/profile/${userId}`);
//   };

//   const handleLike = async (postId: string) => {
//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       const postRef = doc(db, 'communityPosts', postId);
//       const postDoc = await getDoc(postRef);
      
//       if (postDoc.exists()) {
//         const post = postDoc.data();
//         const likedBy = post.likedBy || [];
        
//         if (likedBy.includes(user.uid)) {
//           await unlikePost(postId, user.uid);
//         } else {
//           await likePost(postId, user.uid);
//         }
        
//         // Refresh posts
//         const updatedPosts = await getPosts();
//         setPosts(updatedPosts);
//       }
//     } catch (err) {
//       console.error('Error liking post:', err);
//     }
//   };

//   const handleComment = async (postId: string) => {
//     if (!commentContent.trim()) return;

//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       // Get user profile
//       const userDoc = await getDoc(doc(db, 'users', user.uid));
//       if (!userDoc.exists()) {
//         throw new Error('User profile not found');
//       }
//       const userData = userDoc.data() as UserProfile;

//       const commentData = {
//         postId,
//         userId: user.uid,
//         content: commentContent,
//         userProfile: {
//           uid: user.uid,
//           email: userData.email || '',
//           childName: userData.childName || '',
//           age: userData.age || 0,
//           parentName: userData.parentName || '',
//           parentNumber: userData.parentNumber || '',
//           location: userData.location || '',
//           problem: userData.problem || '',
//           conditions: userData.conditions || [],
//           bio: userData.bio || '',
//           avatarUrl: userData.avatarUrl || '',
//           createdAt: userData.createdAt || new Date().toISOString()
//         }
//       };

//       await addComment(commentData);
//       setCommentContent('');
//       setActivePostId(null);
      
//       // Refresh posts
//       const updatedPosts = await getPosts();
//       setPosts(updatedPosts);
//     } catch (err) {
//       console.error('Error adding comment:', err);
//     }
//   };

//   const handleAddComment = async (postId: string, comment: string) => {
//     if (!auth.currentUser) return;

//     try {
//       const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
//       if (!userDoc.exists()) {
//         throw new Error('User profile not found');
//       }
//       const userData = userDoc.data() as UserProfile;

//       const commentData = {
//         postId,
//         userId: auth.currentUser.uid,
//         content: comment,
//         userProfile: {
//           uid: auth.currentUser.uid,
//           email: userData.email || '',
//           childName: userData.childName || '',
//           age: userData.age || 0,
//           parentName: userData.parentName || '',
//           parentNumber: userData.parentNumber || '',
//           location: userData.location || '',
//           problem: userData.problem || '',
//           conditions: userData.conditions || [],
//           bio: userData.bio || '',
//           avatarUrl: userData.avatarUrl || '',
//           createdAt: userData.createdAt || new Date().toISOString()
//         }
//       };

//       await addComment(commentData);
//       const updatedPosts = await getPosts();
//       setPosts(updatedPosts);
//     } catch (err) {
//       console.error('Error adding comment:', err);
//       setError('Failed to add comment. Please try again later.');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading community...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">{error}</p>
//           <button
//             onClick={() => {
//               setError(null);
//               setLoading(true);
//             }}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white text-black">
//       <h1 className="text-3xl font-bold mb-8">Community Support</h1>
      
//       {/* Profile Navigation */}
//       <div className="flex justify-end mb-6">
//         <button
//           onClick={() => handleViewProfile(auth.currentUser?.uid || '')}
//           className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//         >
//           <span>My Profile</span>
//           {userProfile?.avatarUrl ? (
//             <img src={userProfile.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full" />
//           ) : (
//             <span className="text-2xl">👤</span>
//           )}
//         </button>
//       </div>

//       {/* Support Groups Section */}
//       <section className="mb-8">
//         <h2 className="text-2xl font-semibold mb-4">Support Groups</h2>
//         {groups.length === 0 ? (
//           <div className="text-center py-8">
//             <p className="text-gray-600">No groups found. Try creating a new group!</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 gap-4">
//             {groups.map(group => (
//               <div key={group.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h3 className="font-semibold text-lg mb-2">{group.name}</h3>
//                     <p className="text-gray-600 mb-4">{group.description}</p>
//                     <div className="flex flex-wrap gap-2 mb-4">
//                       {group.conditions.map(condition => (
//                         <span key={condition} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
//                           {condition}
//                         </span>
//                       ))}
//                     </div>
//                     <div className="flex items-center text-gray-600">
//                       <span className="mr-4">Members: {group.memberCount}</span>
//                       <span>Created: {new Date(group.createdAt.toDate()).toLocaleDateString()}</span>
//                     </div>
//                   </div>
//                   <div className="flex space-x-2">
//                     {joinedGroups.includes(group.id) ? (
//                       <button
//                         onClick={() => handleViewGroup(group.id)}
//                         className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
//                       >
//                         View Group
//                       </button>
//                     ) : (
//                       <button
//                         onClick={() => handleJoinGroup(group.id)}
//                         className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
//                       >
//                         Join Group
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       {/* Community Posts Section */}
//       <section>
//         <h2 className="text-2xl font-semibold mb-4">Community Posts</h2>
        
//         {/* New Post Form */}
//         <div className="mb-6 bg-white rounded-lg shadow p-4">
//           <textarea
//             value={newPostContent}
//             onChange={(e) => setNewPostContent(e.target.value)}
//             placeholder="Share your thoughts with the community..."
//             className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             rows={4}
//           />
          
//           {/* Media Upload */}
//           <div className="mt-2">
//             <input
//               type="file"
//               accept="image/*,audio/*"
//               onChange={handleFileChange}
//               className="mb-2"
//             />
//             {previewUrl && (
//               <div className="mt-2">
//                 {selectedFile?.type.startsWith('image/') ? (
//                   <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg" />
//                 ) : (
//                   <audio controls src={previewUrl} className="w-full" />
//                 )}
//               </div>
//             )}
//           </div>
          
//           <button
//             onClick={handleCreatePost}
//             disabled={!newPostContent.trim() && !selectedFile}
//             className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Post
//           </button>
//         </div>

//         {/* Posts List */}
//         <div className="space-y-6">
//           {posts.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-gray-600">No posts yet. Be the first to share!</p>
//             </div>
//           ) : (
//             posts.map(post => (
//               <div key={post.id} className="border rounded-lg p-4 bg-white">
//                 <div className="flex items-center mb-4">
//                   <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 overflow-hidden">
//                     {post.userProfile?.avatarUrl ? (
//                       <img src={post.userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
//                     ) : (
//                       <span className="text-2xl">👤</span>
//                     )}
//                   </div>
//                   <div>
//                     <p className="font-semibold">{post.userProfile?.parentName || 'Anonymous'}</p>
//                     <p className="text-sm text-gray-500">
//                       {post.createdAt.toDate().toLocaleDateString()}
//                     </p>
//                   </div>
//                 </div>
//                 <p className="mb-4">{post.content}</p>
                
//                 {/* Media Display */}
//                 {post.mediaUrl && (
//                   <div className="mb-4">
//                     {post.mediaType === 'image' ? (
//                       <img src={post.mediaUrl} alt="Post media" className="max-h-96 rounded-lg" />
//                     ) : (
//                       <audio controls src={post.mediaUrl} className="w-full" />
//                     )}
//                   </div>
//                 )}
                
//                 <div className="flex space-x-4 text-sm text-gray-500">
//                   <button 
//                     onClick={() => handleLike(post.id)}
//                     className={`hover:text-blue-600 ${post.likedBy?.includes(auth.currentUser?.uid || '') ? 'text-blue-600' : ''}`}
//                   >
//                     Like ({post.likeCount || 0})
//                   </button>
//                   <button 
//                     onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
//                     className="hover:text-blue-600"
//                   >
//                     Comment ({post.commentCount || 0})
//                   </button>
//                 </div>

//                 {/* Comment Section */}
//                 {activePostId === post.id && (
//                   <div className="mt-4">
//                     <textarea
//                       value={commentContent}
//                       onChange={(e) => setCommentContent(e.target.value)}
//                       placeholder="Write a comment..."
//                       className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       rows={2}
//                     />
//                     <button
//                       onClick={() => handleComment(post.id)}
//                       disabled={!commentContent.trim()}
//                       className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       Comment
//                     </button>
//                   </div>
//                 )}
//               </div>
//             ))
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }

// app/dashboard/community/page.tsx
// 'use client';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { auth, db } from '@/lib/firebase';
// import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, where } from 'firebase/firestore';
// import { onAuthStateChanged } from 'firebase/auth';
// import { 
//   getSupportGroups, 
//   getPosts, 
//   createPost, 
//   joinGroup,
//   leaveGroup,
//   addComment,
//   likePost,
//   unlikePost,
//   uploadMedia,
//   getGroupsForUser,
//   initializeConditionGroups
// } from '@/lib/community';
// import type { 
//   SupportGroup, 
//   CommunityPost, 
//   Comment,
//   UserProfile 
// } from '@/lib/types';

// export default function CommunityPage() {
//   const router = useRouter();
//   const [groups, setGroups] = useState<SupportGroup[]>([]);
//   const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
//   const [posts, setPosts] = useState<CommunityPost[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [newPostContent, setNewPostContent] = useState('');
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const [commentContent, setCommentContent] = useState('');
//   const [activePostId, setActivePostId] = useState<string | null>(null);
//   const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
//   const [activeTab, setActiveTab] = useState<'feed' | 'groups'>('feed');

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       try {
//         // Get user profile
//         const userDoc = await getDoc(doc(db, 'users', user.uid));
//         if (!userDoc.exists()) {
//           throw new Error('User profile not found');
//         }
//         setUserProfile(userDoc.data() as UserProfile);

//         // Get groups for user's conditions
//         const userGroups = await getGroupsForUser(user.uid);
//         setGroups(userGroups);

//         // Get joined groups
//         const joinedGroupsQuery = query(
//           collection(db, 'supportGroups'),
//           where('members', 'array-contains', user.uid)
//         );
//         const joinedGroupsSnapshot = await getDocs(joinedGroupsQuery);
//         setJoinedGroups(joinedGroupsSnapshot.docs.map(doc => doc.id));

//         // Get all posts
//         const allPosts = await getPosts();
//         setPosts(allPosts);
//       } catch (err) {
//         console.error('Error loading data:', err);
//         setError('Failed to load data. Please try again later.');
//       } finally {
//         setLoading(false);
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedFile(file);
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);
//     }
//   };

//   const handleCreatePost = async () => {
//     if (!newPostContent.trim() && !selectedFile) return;

//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       // Get user profile
//       const userDoc = await getDoc(doc(db, 'users', user.uid));
//       if (!userDoc.exists()) {
//         throw new Error('User profile not found');
//       }
//       const userData = userDoc.data() as UserProfile;

//       // Ensure conditions is an array
//       const userConditions = Array.isArray(userData.conditions) ? userData.conditions : [];

//       // Prepare media data
//       let mediaUrl = undefined;
//       let mediaType = undefined;
      
//       if (selectedFile) {
//         mediaUrl = await uploadMedia(selectedFile);
//         mediaType = selectedFile.type.startsWith('image/') ? 'image' as const : 'audio' as const;
//       }

//       const postData = {
//         content: newPostContent,
//         userId: user.uid,
//         userProfile: {
//           uid: user.uid,
//           email: userData.email || '',
//           childName: userData.childName || '',
//           age: userData.age || 0,
//           parentName: userData.parentName || '',
//           parentNumber: userData.parentNumber || '',
//           location: userData.location || '',
//           problem: userData.problem || '',
//           conditions: userConditions,
//           bio: userData.bio || '',
//           avatarUrl: userData.avatarUrl || '',
//           createdAt: userData.createdAt || new Date().toISOString()
//         },
//         ...(mediaUrl ? { mediaUrl, mediaType } : {})
//       };

//       await createPost(postData);
//       setNewPostContent('');
//       setSelectedFile(null);
//       setPreviewUrl(null);
      
//       // Refresh posts
//       const updatedPosts = await getPosts();
//       setPosts(updatedPosts);
//     } catch (err) {
//       console.error('Error creating post:', err);
//       setError('Failed to create post. Please try again.');
//     }
//   };

//   const handleJoinGroup = async (groupId: string) => {
//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       await joinGroup(groupId, user.uid);
//       setJoinedGroups([...joinedGroups, groupId]);
//     } catch (err: any) {
//       console.error('Error joining group:', err);
//       setError(err.message || 'Failed to join group');
//     }
//   };

//   const handleViewGroup = (groupId: string) => {
//     router.push(`/dashboard/community/groups/${groupId}`);
//   };

//   const handleViewProfile = (userId: string) => {
//     router.push(`/dashboard/community/profile/${userId}`);
//   };

//   const handleLike = async (postId: string) => {
//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       const postRef = doc(db, 'communityPosts', postId);
//       const postDoc = await getDoc(postRef);
      
//       if (postDoc.exists()) {
//         const post = postDoc.data();
//         const likedBy = post.likedBy || [];
        
//         if (likedBy.includes(user.uid)) {
//           await unlikePost(postId, user.uid);
//         } else {
//           await likePost(postId, user.uid);
//         }
        
//         // Refresh posts
//         const updatedPosts = await getPosts();
//         setPosts(updatedPosts);
//       }
//     } catch (err) {
//       console.error('Error liking post:', err);
//     }
//   };

//   const handleComment = async (postId: string) => {
//     if (!commentContent.trim()) return;

//     try {
//       const user = auth.currentUser;
//       if (!user) {
//         router.push('/login');
//         return;
//       }

//       // Get user profile
//       const userDoc = await getDoc(doc(db, 'users', user.uid));
//       if (!userDoc.exists()) {
//         throw new Error('User profile not found');
//       }
//       const userData = userDoc.data() as UserProfile;

//       const commentData = {
//         postId,
//         userId: user.uid,
//         content: commentContent,
//         userProfile: {
//           uid: user.uid,
//           email: userData.email || '',
//           childName: userData.childName || '',
//           age: userData.age || 0,
//           parentName: userData.parentName || '',
//           parentNumber: userData.parentNumber || '',
//           location: userData.location || '',
//           problem: userData.problem || '',
//           conditions: userData.conditions || [],
//           bio: userData.bio || '',
//           avatarUrl: userData.avatarUrl || '',
//           createdAt: userData.createdAt || new Date().toISOString()
//         }
//       };

//       await addComment(commentData);
//       setCommentContent('');
//       setActivePostId(null);
      
//       // Refresh posts
//       const updatedPosts = await getPosts();
//       setPosts(updatedPosts);
//     } catch (err) {
//       console.error('Error adding comment:', err);
//     }
//   };

//   const handleAddComment = async (postId: string, comment: string) => {
//     if (!auth.currentUser) return;

//     try {
//       const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
//       if (!userDoc.exists()) {
//         throw new Error('User profile not found');
//       }
//       const userData = userDoc.data() as UserProfile;

//       const commentData = {
//         postId,
//         userId: auth.currentUser.uid,
//         content: comment,
//         userProfile: {
//           uid: auth.currentUser.uid,
//           email: userData.email || '',
//           childName: userData.childName || '',
//           age: userData.age || 0,
//           parentName: userData.parentName || '',
//           parentNumber: userData.parentNumber || '',
//           location: userData.location || '',
//           problem: userData.problem || '',
//           conditions: userData.conditions || [],
//           bio: userData.bio || '',
//           avatarUrl: userData.avatarUrl || '',
//           createdAt: userData.createdAt || new Date().toISOString()
//         }
//       };

//       await addComment(commentData);
//       const updatedPosts = await getPosts();
//       setPosts(updatedPosts);
//     } catch (err) {
//       console.error('Error adding comment:', err);
//       setError('Failed to add comment. Please try again later.');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
//           <p className="mt-4 text-gray-600 font-medium">Loading community...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="text-center bg-white p-8 rounded-lg shadow-md">
//           <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//           </svg>
//           <p className="text-red-600 mb-4 font-medium">{error}</p>
//           <button
//             onClick={() => {
//               setError(null);
//               setLoading(true);
//             }}
//             className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-md"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 text-black">
//       {/* Header */}
//       <header className="bg-white shadow-sm sticky top-0 z-10">
//         <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
//           <h1 className="text-2xl font-bold text-blue-600">Connect</h1>
          
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => handleViewProfile(auth.currentUser?.uid || '')}
//               className="flex items-center space-x-2"
//             >
//               <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-blue-400">
//                 {userProfile?.avatarUrl ? (
//                   <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-500">
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                     </svg>
//                   </div>
//                 )}
//               </div>
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-5xl mx-auto px-4 pt-6 pb-16">
//         {/* Tabs */}
//         <div className="flex justify-center mb-6">
//           <div className="flex bg-white rounded-full shadow-sm">
//             <button
//               onClick={() => setActiveTab('feed')}
//               className={`px-6 py-2 rounded-full font-medium transition ${
//                 activeTab === 'feed' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Feed
//             </button>
//             <button
//               onClick={() => setActiveTab('groups')}
//               className={`px-6 py-2 rounded-full font-medium transition ${
//                 activeTab === 'groups' ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               Groups
//             </button>
//           </div>
//         </div>

//         <div className="flex flex-col md:flex-row gap-6">
//           {/* Stories/Suggestions - Desktop Only */}
//           <div className="hidden md:block w-64 flex-shrink-0">
//             <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
//               <h3 className="font-semibold text-gray-700 mb-3">My Groups</h3>
//               {joinedGroups.length === 0 ? (
//                 <p className="text-sm text-gray-500">You haven't joined any groups yet</p>
//               ) : (
//                 <div className="space-y-3">
//                   {groups
//                     .filter(group => joinedGroups.includes(group.id))
//                     .slice(0, 5)
//                     .map(group => (
//                       <div 
//                         key={group.id} 
//                         className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
//                         onClick={() => handleViewGroup(group.id)}
//                       >
//                         <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
//                           <span>{group.name.charAt(0)}</span>
//                         </div>
//                         <span className="text-sm font-medium truncate">{group.name}</span>
//                       </div>
//                     ))}
//                 </div>
//               )}
//             </div>
//             <div className="bg-white rounded-xl shadow-sm p-4">
//               <h3 className="font-semibold text-gray-700 mb-3">Suggested Groups</h3>
//               {groups
//                 .filter(group => !joinedGroups.includes(group.id))
//                 .slice(0, 3)
//                 .map(group => (
//                   <div key={group.id} className="mb-3 last:mb-0">
//                     <div className="flex items-center">
//                       <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
//                         <span>{group.name.charAt(0)}</span>
//                       </div>
//                       <span className="text-sm font-medium">{group.name}</span>
//                     </div>
//                     <div className="mt-2 flex justify-end">
//                       <button
//                         onClick={() => handleJoinGroup(group.id)}
//                         className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition"
//                       >
//                         Join
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//             </div>
//           </div>

//           {/* Main Content Area */}
//           <div className="flex-1">
//             {activeTab === 'feed' ? (
//               <>
//                 {/* Create Post Card */}
//                 <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
//                   <div className="p-4">
//                     <div className="flex items-center mb-4">
//                       <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
//                         {userProfile?.avatarUrl ? (
//                           <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center text-gray-500">
//                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                             </svg>
//                           </div>
//                         )}
//                       </div>
//                       <textarea
//                         value={newPostContent}
//                         onChange={(e) => setNewPostContent(e.target.value)}
//                         placeholder="Share your thoughts with the community..."
//                         className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
//                         rows={2}
//                       />
//                     </div>
                    
//                     {/* Media Preview */}
//                     {previewUrl && (
//                       <div className="mb-3 p-2 bg-gray-50 rounded-lg">
//                         {selectedFile?.type.startsWith('image/') ? (
//                           <img src={previewUrl} alt="Preview" className="max-h-60 rounded-lg mx-auto" />
//                         ) : (
//                           <audio controls src={previewUrl} className="w-full" />
//                         )}
//                       </div>
//                     )}
                    
//                     <div className="flex items-center justify-between border-t pt-3">
//                       <label className="cursor-pointer flex items-center text-gray-600 hover:text-blue-500 transition">
//                         <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
//                         </svg>
//                         <span className="text-sm">Add Media</span>
//                         <input
//                           type="file"
//                           accept="image/*,audio/*"
//                           onChange={handleFileChange}
//                           className="hidden"
//                         />
//                       </label>
//                       <button
//                         onClick={handleCreatePost}
//                         disabled={!newPostContent.trim() && !selectedFile}
//                         className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
//                       >
//                         Post
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Posts Feed */}
//                 <div className="space-y-6">
//                   {posts.length === 0 ? (
//                     <div className="bg-white rounded-xl shadow-sm p-8 text-center">
//                       <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
//                       </svg>
//                       <p className="text-gray-500 mb-4">No posts yet. Be the first to share!</p>
//                       <button
//                         onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
//                         className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition text-sm"
//                       >
//                         Create Post
//                       </button>
//                     </div>
//                   ) : (
//                     posts.map(post => (
//                       <div key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
//                         {/* Post Header */}
//                         <div className="p-4 flex items-center">
//                           <div 
//                             className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3 cursor-pointer"
//                             onClick={() => handleViewProfile(post.userId)}
//                           >
//                             {post.userProfile?.avatarUrl ? (
//                               <img src={post.userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
//                             ) : (
//                               <div className="w-full h-full flex items-center justify-center text-gray-500">
//                                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                                 </svg>
//                               </div>
//                             )}
//                           </div>
//                           <div className="flex-1">
//                             <p className="font-medium text-gray-800">{post.userProfile?.parentName || 'Anonymous'}</p>
//                             <p className="text-xs text-gray-500">
//                               {post.createdAt.toDate().toLocaleDateString()} · {post.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
//                             </p>
//                           </div>
//                         </div>
                        
//                         {/* Post Content */}
//                         <div className="px-4 pb-3">
//                           <p className="mb-3 text-gray-800">{post.content}</p>
//                         </div>
                        
//                         {/* Media */}
//                         {post.mediaUrl && (
//                           <div className="mb-3">
//                             {post.mediaType === 'image' ? (
//                               <img 
//                                 src={post.mediaUrl} 
//                                 alt="Post media" 
//                                 className="w-full max-h-96 object-contain bg-black"
//                               />
//                             ) : (
//                               <div className="px-4 pb-4">
//                                 <audio controls src={post.mediaUrl} className="w-full rounded-lg" />
//                               </div>
//                             )}
//                           </div>
//                         )}
                        
//                         {/* Post Actions */}
//                         <div className="px-4 py-3 border-t border-gray-100">
//                           <div className="flex justify-between">
//                             <button 
//                               onClick={() => handleLike(post.id)}
//                               className={`flex items-center ${post.likedBy?.includes(auth.currentUser?.uid || '') ? 'text-blue-500' : 'text-gray-600'}`}
//                             >
//                               <svg className="w-5 h-5 mr-1" fill={post.likedBy?.includes(auth.currentUser?.uid || '') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
//                               </svg>
//                               <span className="text-sm">{post.likeCount || 0}</span>
//                             </button>
//                             <button 
//                               onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
//                               className="flex items-center text-gray-600"
//                             >
//                               <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
//                               </svg>
//                               <span className="text-sm">{post.commentCount || 0}</span>
//                             </button>
//                           </div>
//                         </div>
                        
//                         {/* Comment Section */}
//                         {activePostId === post.id && (
//                           <div className="px-4 py-3 bg-gray-50">
//                             <div className="flex items-center">
//                               <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-2">
//                                 {userProfile?.avatarUrl ? (
//                                   <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
//                                 ) : (
//                                   <div className="w-full h-full flex items-center justify-center text-gray-500">
//                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
//                                     </svg>
//                                   </div>
//                                 )}
//                               </div>
//                               <input
//                                 type="text"
//                                 value={commentContent}
//                                 onChange={(e) => setCommentContent(e.target.value)}
//                                 placeholder="Add a comment..."
//                                 className="flex-1 p-2 rounded-full border focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
//                               />
//                               <button
//                                 onClick={() => handleComment(post.id)}
//                                 disabled={!commentContent.trim()}
//                                 className="ml-2 text-blue-500 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                               >
//                                 Post
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </>
//             ) : (
//               /* Groups View */
//               <div className="grid md:grid-cols-2 gap-4">
//                 {/* {groups.length === 0 ? (
//                   <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-8 text-center">
//                     <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
//                     </svg>
//                     <p className="text-gray-500">No support groups found yet.</p>
//                   </div>
//                 )} */}
//                 {groups.map(group => (
//                   <div 
//                     key={group.id} 
//                     className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-all duration-300"
//                   >
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-semibold text-gray-800 text-lg mb-2">{group.name}</h3>
//                         <p className="text-gray-600 mb-3">{group.description}</p>
//                         <div className="flex flex-wrap gap-2 mb-3">
//                           {group.conditions.map(condition => (
//                             <span key={condition} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
//                               {condition}
//                             </span>
//                           ))}
//                         </div>
//                         <div className="flex items-center text-gray-500 text-sm">
//                           <span className="mr-4 flex items-center">
//                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
//                             </svg>
//                             {group.memberCount || 0} members
//                           </span>
//                           <span className="flex items-center">
//                             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
//                             </svg>
//                             Created {new Date(group.createdAt.toDate()).toLocaleDateString()}
//                           </span>
//                         </div>
//                       </div>
//                       <div>
//                         {joinedGroups.includes(group.id) ? (
//                           <button
//                             onClick={() => handleViewGroup(group.id)}
//                             className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium hover:bg-blue-600 transition shadow-sm"
//                           >
//                             View Group
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() => handleJoinGroup(group.id)}
//                             className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium hover:bg-green-600 transition shadow-sm"
//                           >
//                             Join Group
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* Footer Navigation - Mobile Only */}
//       <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
//         <div className="grid grid-cols-2 gap-1">
//           <button
//             onClick={() => setActiveTab('feed')}
//             className={`p-4 flex flex-col items-center ${
//               activeTab === 'feed' ? 'text-blue-600' : 'text-gray-500'
//             }`}
//           >
//             <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
//             </svg>
//             <span className="text-xs font-medium">Feed</span>
//           </button>
//           <button
//             onClick={() => setActiveTab('groups')}
//             className={`p-4 flex flex-col items-center ${
//               activeTab === 'groups' ? 'text-blue-600' : 'text-gray-500'
//             }`}
//           >
//             <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
//             </svg>
//             <span className="text-xs font-medium">Groups</span>
//           </button>
//         </div>
//       </footer>
//     </div>
//   );
// }

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, getDocs, query, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  getSupportGroups, 
  getPosts, 
  createPost, 
  joinGroup,
  leaveGroup,
  addComment,
  likePost,
  unlikePost,
  uploadMedia,
  getGroupsForUser,
  initializeConditionGroups
} from '@/lib/community';
import type { 
  SupportGroup, 
  CommunityPost, 
  Comment,
  UserProfile 
} from '@/lib/types';

// Color scheme
const colors = {
  primary: '#D6BC8B',         // Warm golden taupe
  primaryDark: '#B8976C',     // Darker golden taupe
  primaryLight: '#E8D4AF',    // Light warm beige
  secondary: '#94785A',       // Medium warm taupe
  accent: '#FFCF8B',          // Soft peachy/apricot accent
  highlight: '#FFB347',       // Mango/orange highlight
  text: '#5D4B36',            // Dark taupe for text
  textLight: '#7A6A5F',       // Lighter text color
  background: '#FBF7F1',      // Very light cream background
  white: '#FFFFFF',
  offWhite: '#FAF9F7',
  softBlue: '#B7D1E2',        // Soft blue
  softGreen: '#C5D8B9'        // Soft green
};

export default function CommunityPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<SupportGroup[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'groups'>('feed');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      try {
        // Get user profile
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          throw new Error('User profile not found');
        }
        setUserProfile(userDoc.data() as UserProfile);

        // Get groups for user's conditions
        const userGroups = await getGroupsForUser(user.uid);
        setGroups(userGroups);

        // Get joined groups
        const joinedGroupsQuery = query(
          collection(db, 'supportGroups'),
          where('members', 'array-contains', user.uid)
        );
        const joinedGroupsSnapshot = await getDocs(joinedGroupsQuery);
        setJoinedGroups(joinedGroupsSnapshot.docs.map(doc => doc.id));

        // Get all posts
        const allPosts = await getPosts();
        setPosts(allPosts);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedFile) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      const userData = userDoc.data() as UserProfile;

      // Ensure conditions is an array
      const userConditions = Array.isArray(userData.conditions) ? userData.conditions : [];

      // Prepare media data
      let mediaUrl = undefined;
      let mediaType = undefined;
      
      if (selectedFile) {
        mediaUrl = await uploadMedia(selectedFile);
        mediaType = selectedFile.type.startsWith('image/') ? 'image' as const : 'audio' as const;
      }

      const postData = {
        content: newPostContent,
        userId: user.uid,
        userProfile: {
          uid: user.uid,
          email: userData.email || '',
          childName: userData.childName || '',
          age: userData.age || 0,
          parentName: userData.parentName || '',
          parentNumber: userData.parentNumber || '',
          location: userData.location || '',
          problem: userData.problem || '',
          conditions: userConditions,
          bio: userData.bio || '',
          avatarUrl: userData.avatarUrl || '',
          createdAt: userData.createdAt || new Date().toISOString()
        },
        ...(mediaUrl ? { mediaUrl, mediaType } : {})
      };

      await createPost(postData);
      setNewPostContent('');
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Refresh posts
      const updatedPosts = await getPosts();
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      await joinGroup(groupId, user.uid);
      setJoinedGroups([...joinedGroups, groupId]);
    } catch (err: any) {
      console.error('Error joining group:', err);
      setError(err.message || 'Failed to join group');
    }
  };

  const handleViewGroup = (groupId: string) => {
    router.push(`/dashboard/community/groups/${groupId}`);
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/dashboard/community/profile/${userId}`);
  };

  const handleLike = async (postId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const postRef = doc(db, 'communityPosts', postId);
      const postDoc = await getDoc(postRef);
      
      if (postDoc.exists()) {
        const post = postDoc.data();
        const likedBy = post.likedBy || [];
        
        if (likedBy.includes(user.uid)) {
          await unlikePost(postId, user.uid);
        } else {
          await likePost(postId, user.uid);
        }
        
        // Refresh posts
        const updatedPosts = await getPosts();
        setPosts(updatedPosts);
      }
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleComment = async (postId: string) => {
    if (!commentContent.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Get user profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      const userData = userDoc.data() as UserProfile;

      const commentData = {
        postId,
        userId: user.uid,
        content: commentContent,
        userProfile: {
          uid: user.uid,
          email: userData.email || '',
          childName: userData.childName || '',
          age: userData.age || 0,
          parentName: userData.parentName || '',
          parentNumber: userData.parentNumber || '',
          location: userData.location || '',
          problem: userData.problem || '',
          conditions: userData.conditions || [],
          bio: userData.bio || '',
          avatarUrl: userData.avatarUrl || '',
          createdAt: userData.createdAt || new Date().toISOString()
        }
      };

      await addComment(commentData);
      setCommentContent('');
      setActivePostId(null);
      
      // Refresh posts
      const updatedPosts = await getPosts();
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleAddComment = async (postId: string, comment: string) => {
    if (!auth.currentUser) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      const userData = userDoc.data() as UserProfile;

      const commentData = {
        postId,
        userId: auth.currentUser.uid,
        content: comment,
        userProfile: {
          uid: auth.currentUser.uid,
          email: userData.email || '',
          childName: userData.childName || '',
          age: userData.age || 0,
          parentName: userData.parentName || '',
          parentNumber: userData.parentNumber || '',
          location: userData.location || '',
          problem: userData.problem || '',
          conditions: userData.conditions || [],
          bio: userData.bio || '',
          avatarUrl: userData.avatarUrl || '',
          createdAt: userData.createdAt || new Date().toISOString()
        }
      };

      await addComment(commentData);
      const updatedPosts = await getPosts();
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto" style={{ borderColor: colors.highlight }}></div>
          <p className="mt-4 font-medium" style={{ color: colors.text }}>Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center p-8 rounded-lg" style={{ backgroundColor: colors.white }}>
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.highlight }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="mb-4 font-medium" style={{ color: colors.text }}>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
            }}
            className="px-6 py-2 rounded-full hover:opacity-90 transition shadow-md"
            style={{ backgroundColor: colors.highlight, color: colors.white }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <header className="shadow-sm sticky top-0 z-10" style={{ backgroundColor: colors.white }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: colors.primaryDark }}>Connect</h1>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleViewProfile(auth.currentUser?.uid || '')}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border-2" style={{ borderColor: colors.primary }}>
                {userProfile?.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.text }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                )}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-16">
        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="flex rounded-full shadow-sm" style={{ backgroundColor: colors.white }}>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-2 rounded-full font-medium transition ${
                activeTab === 'feed' ? 'text-white' : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: activeTab === 'feed' ? colors.highlight : 'transparent',
                color: activeTab === 'feed' ? colors.white : colors.text
              }}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              className={`px-6 py-2 rounded-full font-medium transition ${
                activeTab === 'groups' ? 'text-white' : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: activeTab === 'groups' ? colors.highlight : 'transparent',
                color: activeTab === 'groups' ? colors.white : colors.text
              }}
            >
              Groups
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Stories/Suggestions - Desktop Only */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: colors.white }}>
              <h3 className="font-semibold mb-3" style={{ color: colors.text }}>My Groups</h3>
              {joinedGroups.length === 0 ? (
                <p className="text-sm" style={{ color: colors.textLight }}>You haven't joined any groups yet</p>
              ) : (
                <div className="space-y-3">
                  {groups
                    .filter(group => joinedGroups.includes(group.id))
                    .slice(0, 5)
                    .map(group => (
                      <div 
                        key={group.id} 
                        className="flex items-center cursor-pointer hover:opacity-90 p-2 rounded-lg"
                        onClick={() => handleViewGroup(group.id)}
                        style={{ backgroundColor: colors.primaryLight }}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: colors.accent }}>
                          <span style={{ color: colors.text }}>{group.name.charAt(0)}</span>
                        </div>
                        <span className="text-sm font-medium truncate" style={{ color: colors.text }}>{group.name}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="rounded-xl p-4" style={{ backgroundColor: colors.white }}>
              <h3 className="font-semibold mb-3" style={{ color: colors.text }}>Suggested Groups</h3>
              {groups
                .filter(group => !joinedGroups.includes(group.id))
                .slice(0, 3)
                .map(group => (
                  <div key={group.id} className="mb-3 last:mb-0">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: colors.accent }}>
                        <span style={{ color: colors.text }}>{group.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium" style={{ color: colors.text }}>{group.name}</span>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        onClick={() => handleJoinGroup(group.id)}
                        className="text-xs px-3 py-1 rounded-full hover:opacity-90 transition"
                        style={{ backgroundColor: colors.softGreen, color: colors.text }}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'feed' ? (
              <>
                {/* Create Post Card */}
                <div className="rounded-xl mb-6 overflow-hidden" style={{ backgroundColor: colors.white }}>
                  <div className="p-4">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3" style={{ backgroundColor: colors.primaryLight }}>
                        {userProfile?.avatarUrl ? (
                          <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ color: colors.text }}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                          </div>
                        )}
                      </div>
                      <textarea
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        placeholder="Share your thoughts with the community..."
                        className="flex-1 p-3 border rounded-lg focus:outline-none resize-none"
                        rows={2}
                        style={{ 
                          borderColor: colors.primaryLight,
                          color: colors.text,
                          backgroundColor: colors.offWhite
                        }}
                      />
                    </div>
                    
                    {/* Media Preview */}
                    {previewUrl && (
                      <div className="mb-3 p-2 rounded-lg" style={{ backgroundColor: colors.primaryLight }}>
                        {selectedFile?.type.startsWith('image/') ? (
                          <img src={previewUrl} alt="Preview" className="max-h-60 rounded-lg mx-auto" />
                        ) : (
                          <audio controls src={previewUrl} className="w-full" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3" style={{ borderTopColor: colors.primaryLight }}>
                      <label className="cursor-pointer flex items-center hover:opacity-90 transition" style={{ color: colors.text }}>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-sm">Add Media</span>
                        <input
                          type="file"
                          accept="image/*,audio/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPostContent.trim() && !selectedFile}
                        className="px-4 py-2 rounded-full hover:opacity-90 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: colors.highlight, color: colors.white }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                  {posts.length === 0 ? (
                    <div className="rounded-xl p-8 text-center" style={{ backgroundColor: colors.white }}>
                      <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.textLight }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                      </svg>
                      <p className="mb-4" style={{ color: colors.textLight }}>No posts yet. Be the first to share!</p>
                      <button
                        onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
                        className="px-4 py-2 rounded-full hover:opacity-90 transition text-sm"
                        style={{ backgroundColor: colors.highlight, color: colors.white }}
                      >
                        Create Post
                      </button>
                    </div>
                  ) : (
                    posts.map(post => (
                      <div key={post.id} className="rounded-xl overflow-hidden" style={{ backgroundColor: colors.white }}>
                        {/* Post Header */}
                        <div className="p-4 flex items-center">
                          <div 
                            className="w-10 h-10 rounded-full overflow-hidden mr-3 cursor-pointer"
                            style={{ backgroundColor: colors.primaryLight }}
                            onClick={() => handleViewProfile(post.userId)}
                          >
                            {post.userProfile?.avatarUrl ? (
                              <img src={post.userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center" style={{ color: colors.text }}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium" style={{ color: colors.text }}>{post.userProfile?.parentName || 'Anonymous'}</p>
                            <p className="text-xs" style={{ color: colors.textLight }}>
                              {post.createdAt.toDate().toLocaleDateString()} · {post.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                        
                        {/* Post Content */}
                        <div className="px-4 pb-3">
                          <p className="mb-3" style={{ color: colors.text }}>{post.content}</p>
                        </div>
                        
                        {/* Media */}
                        {post.mediaUrl && (
                          <div className="mb-3">
                            {post.mediaType === 'image' ? (
                              <img 
                                src={post.mediaUrl} 
                                alt="Post media" 
                                className="w-full max-h-96 object-contain"
                                style={{ backgroundColor: colors.primaryLight }}
                              />
                            ) : (
                              <div className="px-4 pb-4">
                                <audio controls src={post.mediaUrl} className="w-full rounded-lg" />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Post Actions */}
                        <div className="px-4 py-3" style={{ borderTopColor: colors.primaryLight }}>
                          <div className="flex justify-between">
                            <button 
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center ${post.likedBy?.includes(auth.currentUser?.uid || '') ? 'text-blue-500' : ''}`}
                              style={{ color: post.likedBy?.includes(auth.currentUser?.uid || '') ? colors.highlight : colors.text }}
                            >
                              <svg className="w-5 h-5 mr-1" fill={post.likedBy?.includes(auth.currentUser?.uid || '') ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                              </svg>
                              <span className="text-sm">{post.likeCount || 0}</span>
                            </button>
                            <button 
                              onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
                              className="flex items-center"
                              style={{ color: colors.text }}
                            >
                              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                              </svg>
                              <span className="text-sm">{post.commentCount || 0}</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Comment Section */}
                        {activePostId === post.id && (
                          <div className="px-4 py-3" style={{ backgroundColor: colors.primaryLight }}>
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full overflow-hidden mr-2" style={{ backgroundColor: colors.primary }}>
                                {userProfile?.avatarUrl ? (
                                  <img src={userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center" style={{ color: colors.text }}>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <input
                                type="text"
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 p-2 rounded-full border focus:outline-none text-sm"
                                style={{ 
                                  borderColor: colors.primary,
                                  color: colors.text,
                                  backgroundColor: colors.white
                                }}
                              />
                              <button
                                onClick={() => handleComment(post.id)}
                                disabled={!commentContent.trim()}
                                className="ml-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ color: colors.highlight }}
                              >
                                Post
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              /* Groups View */
              <div className="grid md:grid-cols-2 gap-4">
                {groups.map(group => (
                  <div 
                    key={group.id} 
                    className="rounded-xl p-4 hover:shadow-md transition-all duration-300"
                    style={{ backgroundColor: colors.white }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg mb-2" style={{ color: colors.text }}>{group.name}</h3>
                        <p className="mb-3" style={{ color: colors.textLight }}>{group.description}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {group.conditions.map(condition => (
                            <span 
                              key={condition} 
                              className="px-2 py-1 rounded-full text-xs"
                              style={{ backgroundColor: colors.softBlue, color: colors.text }}
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center text-sm" style={{ color: colors.textLight }}>
                          <span className="mr-4 flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                            </svg>
                            {group.memberCount || 0} members
                          </span>
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            Created {new Date(group.createdAt.toDate()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div>
                        {joinedGroups.includes(group.id) ? (
                          <button
                            onClick={() => handleViewGroup(group.id)}
                            className="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition shadow-sm"
                            style={{ backgroundColor: colors.highlight, color: colors.white }}
                          >
                            View Group
                          </button>
                        ) : (
                          <button
                            onClick={() => handleJoinGroup(group.id)}
                            className="px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition shadow-sm"
                            style={{ backgroundColor: colors.softGreen, color: colors.text }}
                          >
                            Join Group
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Navigation - Mobile Only */}
      <footer className="md:hidden fixed bottom-0 left-0 right-0 border-t shadow-lg" style={{ backgroundColor: colors.white }}>
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => setActiveTab('feed')}
            className={`p-4 flex flex-col items-center ${
              activeTab === 'feed' ? 'opacity-100' : 'opacity-70'
            }`}
            style={{ color: activeTab === 'feed' ? colors.highlight : colors.text }}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
            </svg>
            <span className="text-xs font-medium">Feed</span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`p-4 flex flex-col items-center ${
              activeTab === 'groups' ? 'opacity-100' : 'opacity-70'
            }`}
            style={{ color: activeTab === 'groups' ? colors.highlight : colors.text }}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span className="text-xs font-medium">Groups</span>
          </button>
        </div>
      </footer>
    </div>
  );
}