// lib/community.ts
import { db, storage } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  Timestamp,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { 
  SupportGroup, 
  GroupMember, 
  CommunityPost, 
  Comment,
  UserProfile
} from './types';
import { runTransaction } from 'firebase/firestore';
// Support Groups
export async function createSupportGroup(groupData: Omit<SupportGroup, 'id' | 'createdAt' | 'memberCount'>) {
  const groupsRef = collection(db, 'supportGroups');
  const newGroup = {
    ...groupData,
    createdAt: serverTimestamp(),
    memberCount: 1
  };
  
  const docRef = await addDoc(groupsRef, newGroup);
  return docRef.id;
}

export async function getSupportGroups(conditions: string[] = []) {
  const groupsRef = collection(db, 'supportGroups');
  
  try {
    // First get all groups
    const snapshot = await getDocs(groupsRef);
    let groups = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SupportGroup[];
    
    // If conditions are provided, filter them
    if (conditions.length > 0) {
      groups = groups.filter(group => 
        group.conditions.some(condition => conditions.includes(condition))
      );
    }
    
    // Sort by createdAt
    return groups.sort((a, b) => 
      (b.createdAt as Timestamp).toMillis() - (a.createdAt as Timestamp).toMillis()
    );
  } catch (error) {
    console.error('Error fetching support groups:', error);
    return [];
  }
}

export async function getSupportGroup(groupId: string) {
  const groupDoc = await getDoc(doc(db, 'supportGroups', groupId));
  if (!groupDoc.exists()) {
    throw new Error('Group not found');
  }
  return {
    id: groupDoc.id,
    ...groupDoc.data()
  } as SupportGroup;
}

// Group Members
// export async function joinGroup(groupId: string, userId: string) {
//   // Check if user is already a member
//   const memberRef = doc(db, 'supportGroups', groupId, 'members', userId);
//   const memberDoc = await getDoc(memberRef);
  
//   if (memberDoc.exists()) {
//     throw new Error('You are already a member of this group');
//   }

//   const membersRef = collection(db, 'supportGroups', groupId, 'members');
//   const memberDoc = {
//     userId,
//     joinedAt: serverTimestamp(),
//     role: 'member' as const
//   };
  
//   await addDoc(membersRef, memberDoc);
//   await updateDoc(doc(db, 'supportGroups', groupId), {
//     memberCount: increment(1)
//   });
// }
export async function joinGroup(groupId: string, userId: string): Promise<string> {
  try {
    const memberRef = doc(db, 'supportGroups', groupId, 'members', userId);
    const existingMember = await getDoc(memberRef);
    
    if (existingMember.exists()) {
      throw new Error('You are already a member of this group');
    }

    const membersRef = collection(db, 'supportGroups', groupId, 'members');
    const newMember = {
      userId,
      joinedAt: serverTimestamp(),
      role: 'member' as const
    };
    
    // Using transaction for atomic updates
    await runTransaction(db, async (transaction) => {
      const groupRef = doc(db, 'supportGroups', groupId);
      const docRef = await addDoc(membersRef, newMember);
      transaction.update(groupRef, {
        memberCount: increment(1)
      });
      return docRef.id;
    });

    // Also update user's groups list
    await updateDoc(doc(db, 'users', userId), {
      groups: arrayUnion(groupId)
    });

    return "Successfully joined group";
  } catch (error) {
    console.error('Error joining group:', error);
    throw error;
  }
}
export async function leaveGroup(groupId: string, userId: string) {
  const membersRef = collection(db, 'supportGroups', groupId, 'members');
  const q = query(membersRef, where('userId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    await deleteDoc(snapshot.docs[0].ref);
    await updateDoc(doc(db, 'supportGroups', groupId), {
      memberCount: increment(-1)
    });
  }
}

// Media Upload
export async function uploadMedia(file: File): Promise<string> {
  const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

// Community Posts
export async function createPost(postData: Omit<CommunityPost, 'id' | 'createdAt' | 'likeCount' | 'commentCount' | 'likedBy'>) {
  const postsRef = collection(db, 'communityPosts');
  const newPost = {
    ...postData,
    createdAt: serverTimestamp(),
    likeCount: 0,
    commentCount: 0,
    likedBy: []
  };
  
  const docRef = await addDoc(postsRef, newPost);
  return docRef.id;
}

export async function getPosts(groupId?: string) {
  const postsRef = collection(db, 'communityPosts');
  let q = query(postsRef, orderBy('createdAt', 'desc'));
  
  if (groupId) {
    q = query(q, where('groupId', '==', groupId));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as CommunityPost[];
}

// Like/Unlike Posts
export async function likePost(postId: string, userId: string) {
  const postRef = doc(db, 'communityPosts', postId);
  await updateDoc(postRef, {
    likedBy: arrayUnion(userId),
    likeCount: increment(1)
  });
}

export async function unlikePost(postId: string, userId: string) {
  const postRef = doc(db, 'communityPosts', postId);
  await updateDoc(postRef, {
    likedBy: arrayRemove(userId),
    likeCount: increment(-1)
  });
}

// Comments
export async function addComment(commentData: Omit<Comment, 'id' | 'createdAt'>) {
  const commentsRef = collection(db, 'communityPosts', commentData.postId, 'comments');
  const newComment = {
    ...commentData,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(commentsRef, newComment);
  await updateDoc(doc(db, 'communityPosts', commentData.postId), {
    commentCount: increment(1)
  });
  
  return docRef.id;
}

export async function getComments(postId: string) {
  const commentsRef = collection(db, 'communityPosts', postId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'desc'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Comment[];
}

// Initialize groups for conditions
export async function initializeConditionGroups() {
  const conditions = [
    "Cerebral Palsy",
    "Autism Spectrum Disorder",
    "Down Syndrome",
    "ADHD",
    "Developmental Delay",
    "Speech Delay",
    "Sensory Processing Disorder"
  ];

  for (const condition of conditions) {
    const groupsRef = collection(db, 'supportGroups');
    const q = query(groupsRef, where('name', '==', `${condition} Support Group`));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      const newGroup: Omit<SupportGroup, 'id'> = {
        name: `${condition} Support Group`,
        description: `A supportive community for parents and caregivers of children with ${condition}. Share experiences, get advice, and find support.`,
        tags: [condition.toLowerCase().replace(/\s+/g, '-')],
        createdBy: 'system',
        createdAt: Timestamp.now(),
        memberCount: 0,
        isPrivate: false,
        conditions: [condition],
        members: []
      };

      await addDoc(groupsRef, newGroup);
    }
  }
}

// Get groups for user's conditions
export async function getGroupsForUser(userId: string): Promise<SupportGroup[]> {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }

  const userData = userDoc.data() as UserProfile;
  const userConditions = userData.conditions || [];

  const groupsRef = collection(db, 'supportGroups');
  const q = query(groupsRef, where('conditions', 'array-contains-any', userConditions));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as SupportGroup[];
}