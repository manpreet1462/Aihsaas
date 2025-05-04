// app/dashboard/community/groups/[groupId]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { SupportGroup, GroupMember, UserProfile, CommunityPost } from '@/lib/types';
import { getPosts, createPost, addComment } from '@/lib/community';

export default function GroupPage() {
  const router = useRouter();
  const params = useParams();
  const groupId = params.groupId as string;
  const [group, setGroup] = useState<SupportGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);

  // useEffect(() => {
  //   const loadData = async () => {
  //     try {
  //       const user = auth.currentUser;
  //       if (!user) {
  //         router.push('/login');
  //         return;
  //       }

  //       // Get group data
  //       const groupDoc = await getDoc(doc(db, 'supportGroups', groupId));
  //       if (!groupDoc.exists()) {
  //         throw new Error('Group not found');
  //       }
  //       setGroup({ id: groupDoc.id, ...groupDoc.data() } as SupportGroup);

  //       // Check if user is a member
  //       const memberDoc = await getDoc(doc(db, 'supportGroups', groupId, 'members', user.uid));
  //       setIsMember(memberDoc.exists());

  //       // Get members
  //       const membersRef = collection(db, 'supportGroups', groupId, 'members');
  //       const membersSnapshot = await getDocs(membersRef);
  //       const membersData = await Promise.all(
  //         membersSnapshot.docs.map(async (doc) => {
  //           const memberData = doc.data() as Omit<GroupMember, 'userProfile'>;
  //           const userDoc = await getDoc(doc(db, 'users', memberData.userId));
  //           const userData = userDoc.exists() ? userDoc.data() as UserProfile : null;
            
  //           return {
  //             ...memberData,
  //             userProfile: userData
  //           } as GroupMember;
  //         })
  //       );
  //       setMembers(membersData);

  //       // Get group posts
  //       const groupPosts = await getPosts(groupId);
  //       setPosts(groupPosts);
  //     } catch (err) {
  //       console.error('Error loading group data:', err);
  //       setError('Failed to load group data');
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadData();
  // }, [groupId, router]);
  // Fix the member data fetching in your useEffect
useEffect(() => {
  const loadData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      // Get group data
      const groupDoc = await getDoc(doc(db, 'supportGroups', groupId));
      if (!groupDoc.exists()) {
        throw new Error('Group not found');
      }
      setGroup({ id: groupDoc.id, ...groupDoc.data() } as SupportGroup);

      // Check if user is a member
      const memberCheck = await getDoc(doc(db, 'supportGroups', groupId, 'members', user.uid));
      setIsMember(memberCheck.exists());

      // Get members with their profiles
      const membersRef = collection(db, 'supportGroups', groupId, 'members');
      const membersSnapshot = await getDocs(membersRef);
      
      // Use Promise.all to fetch user profiles in parallel
      const membersData = await Promise.all(
        membersSnapshot.docs.map(async (memberDoc) => {
          const memberData = memberDoc.data() as Omit<GroupMember, 'userProfile'>;
          try {
            const userDoc = await getDoc(doc(db, 'users', memberData.userId));
            return {
              ...memberData,
              id: memberDoc.id,
              userProfile: userDoc.exists() ? (userDoc.data() as UserProfile) : null
            } as GroupMember;
          } catch (error) {
            console.error('Error fetching user profile:', error);
            return {
              ...memberData,
              id: memberDoc.id,
              userProfile: null
            } as unknown as GroupMember; // Double assertion
            
          }
        })
      );
      
      setMembers(membersData);

      // Get group posts
      const groupPosts = await getPosts(groupId);
      setPosts(groupPosts);
    } catch (err) {
      console.error('Error loading group data:', err);
      setError('Failed to load group data');
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [groupId, router]);

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }
      const userData = userDoc.data() as UserProfile;

      const postData = {
        content: newPostContent,
        userId: user.uid,
        groupId: groupId,
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

      await createPost(postData);
      setNewPostContent('');
      
      // Refresh posts
      const updatedPosts = await getPosts(groupId);
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentContent.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) {
        router.push('/login');
        return;
      }

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
      const updatedPosts = await getPosts(groupId);
      setPosts(updatedPosts);
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  if (!isMember) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">You need to join this group to view its content</h2>
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-4">{group.name}</h1>
        <p className="text-gray-700 mb-4">{group.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {group.conditions.map(condition => (
            <span key={condition} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {condition}
            </span>
          ))}
        </div>

        <div className="flex items-center text-gray-600">
          <span className="mr-4">Members: {group.memberCount}</span>
          <span>Created: {new Date(group.createdAt.toDate()).toLocaleDateString()}</span>
        </div>
      </div>

      {/* New Post Form */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <textarea
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Share something with the group..."
          className="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        <button
          onClick={handleCreatePost}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Post
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 overflow-hidden">
                {post.userProfile?.avatarUrl ? (
                  <img src={post.userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div>
                <p className="font-semibold">{post.userProfile?.parentName || 'Anonymous'}</p>
                <p className="text-sm text-gray-500">
                  {post.createdAt.toDate().toLocaleDateString()}
                </p>
              </div>
            </div>
            <p className="mb-4">{post.content}</p>
            
            {/* Comment Section */}
            <div className="border-t pt-4">
              <button
                onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                Comment ({post.commentCount || 0})
              </button>
              
              {activePostId === post.id && (
                <div className="mt-4">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  >
                    Comment
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Members List */}
      {/* <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h2 className="text-2xl font-semibold mb-4">Members</h2>
        <div className="space-y-4">
          {members.map(member => (
            <div key={member.userId} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden">
                {member.userProfile?.avatarUrl ? (
                  <img src={member.userProfile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                )}
              </div>
              <div>
                <h3 className="font-medium">{member.userProfile?.parentName || 'Anonymous'}</h3>
                <p className="text-sm text-gray-600">
                  {member.role} • Joined {new Date(member.joinedAt.toDate()).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div> */}
      {/* Members List */}
<div className="bg-white rounded-lg shadow-lg p-6 mt-6">
  <h2 className="text-2xl font-semibold mb-4">Members ({members.length})</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {members.map(member => (
      <div key={member.userId} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
        <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
          {member.userProfile?.avatarUrl ? (
            <img 
              src={member.userProfile.avatarUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-300">
              {member.userProfile?.parentName?.charAt(0) || '👤'}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-medium truncate">
            {member.userProfile?.parentName || 'Anonymous'}
          </h3>
          <p className="text-sm text-gray-600 truncate">
            {member.userProfile?.location || 'No location'}
          </p>
          <p className="text-xs text-gray-500">
            Joined {new Date(member.joinedAt.toDate()).toLocaleDateString()}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
    </div>
  );
}