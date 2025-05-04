// lib/types.ts
import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
    uid: string;
    email: string;
    childName: string;
    age: number;
    parentName: string;
    parentNumber: string;
    location: string;
    problem: string;
    conditions: string[];
    bio?: string;
    avatarUrl?: string;
    createdAt: string;
  }
  
  export interface SupportGroup {
    id: string;
    name: string;
    description: string;
    tags: string[];
    createdBy: string;
    createdAt: Timestamp;
    memberCount: number;
    isPrivate: boolean;
    conditions: string[]; // Conditions this group focuses on
    members: {
      userId: string;
      joinedAt: string;
      role: 'member' | 'admin';
      userProfile?: UserProfile;
    }[];
  }
  
  export interface GroupMember {
    groupId: string;
    userId: string;
    joinedAt: Timestamp;
    role: 'member' | 'admin';
    userProfile?: UserProfile; // Optional populated user profile
  }
  
  export interface CommunityPost {
    id: string;
    userId: string;
    groupId?: string;
    content: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'audio';
    createdAt: Timestamp;
    likeCount: number;
    commentCount: number;
    likedBy: string[];
    userProfile?: UserProfile;
  }

  export interface Comment {
    id: string;
    postId: string;
    userId: string;
    content: string;
    createdAt: Timestamp;
    userProfile?: UserProfile;
  }