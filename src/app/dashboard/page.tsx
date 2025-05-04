'use client';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Warm earthy color scheme
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
  softGreen: '#C5D8B9',       // Soft green
  softPink: '#F5D5CB',        // Soft pink
  warning: '#E9B949',         // Amber/warning
  danger: '#D17B7B'           // Soft red/danger
};

// Daily task type definition
type DailyTask = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

// Therapist type definition
type Therapist = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  available: boolean;
};

// Meeting type definition
type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  link: string;
};

// Component for the daily task card
function DailyTaskCard({ tasks, onToggleTask }: { tasks: DailyTask[], onToggleTask: (id: string) => void }) {
  return (
    <div className="p-6 rounded-xl shadow-md border transition-all hover:shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.primaryLight }}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🧩</span>
        <h3 className="text-xl font-bold" style={{ color: colors.text }}>Daily Task Centre</h3>
      </div>
      <p className="mb-4" style={{ color: colors.textLight }}>Help your child build routine and independence with these daily tasks:</p>
      <Link href='/dashboard/tasks'>
        <button className="mt-4 font-medium text-sm flex items-center border-2 rounded-full p-4 hover:bg-opacity-90 transition-all transform hover:-translate-y-1" 
          style={{ color: colors.secondary, borderColor: colors.secondary }}>
          <span>Start Daily Tasks</span>
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </Link>
    </div>
  );
}

// Component for the community section card
function CommunityCard() {
  return (
    <div className="p-6 rounded-xl shadow-md border transition-all hover:shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.primaryLight }}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">💬</span>
        <h3 className="text-xl font-bold" style={{ color: colors.text }}>Community Section</h3>
      </div>
      <p className="mb-4" style={{ color: colors.textLight }}>Connect with other parents and share experiences:</p>
      <div className="space-y-3">
        <div className='p-3 rounded-lg hover:opacity-90 transition flex justify-between items-center' 
          style={{ backgroundColor: colors.primaryLight }}>
          <p className="font-medium" style={{ color: colors.secondary }}>Parent Support Groups</p>
          <p className="text-sm" style={{ color: colors.secondary }}>Join 2,500+ parents</p>
        </div>
        <div className='p-3 rounded-lg hover:opacity-90 transition flex justify-between items-center' 
          style={{ backgroundColor: colors.primaryLight }}>
          <p className="font-medium" style={{ color: colors.secondary }}>Live Chat Spaces</p>
          <p className="text-sm" style={{ color: colors.secondary }}>42 parents online now</p>
        </div>
        <Link href="/dashboard/community" className="p-3 rounded-lg hover:opacity-90 transition flex justify-between items-center border" 
          style={{ backgroundColor: colors.white, borderColor: colors.secondary, color: colors.secondary }}>
          <div className="font-medium flex items-center justify-center">View your support Community!</div>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
}

// Component for the AI exercises card
function AIExercisesCard() {
  return (
    <div className="p-6 rounded-xl shadow-md border transition-all hover:shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.primaryLight }}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">💪</span>
        <h3 className="text-xl font-bold" style={{ color: colors.text }}>Muscle Relaxation Exercises</h3>
      </div>
      <p className="mb-4" style={{ color: colors.textLight }}>AI-powered physical exercises designed for your child's specific needs:</p>
      <div className="p-4 rounded-lg" style={{ backgroundColor: colors.primaryLight }}>
        <h4 className="font-medium mb-2" style={{ color: colors.secondary }}>Today's Recommended Exercise</h4>
        <p className="mb-3" style={{ color: colors.text }}>Fine Motor Control: Hand-Eye Coordination</p>
        <p className="text-sm mb-4" style={{ color: colors.textLight }}>This 10-minute session helps improve dexterity and focus.</p>
        <Link href='/dashboard/exercise'>
          <button className="w-full py-2 rounded-full hover:opacity-90 transition flex items-center justify-center" 
            style={{ backgroundColor: colors.highlight, color: colors.white }}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Start Exercise
          </button>
        </Link>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <Link href="/exercises/all" className="font-medium text-sm flex items-center hover:opacity-90" style={{ color: colors.secondary }}>
          View all exercises
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
        <Link href="/exercises/create" className="font-medium text-sm flex items-center hover:opacity-90" style={{ color: colors.secondary }}>
          Custom plan
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
}

// Component for the Chrome extension card
function ChromeExtensionCard() {
  return (
    <div className="p-6 rounded-xl shadow-md border transition-all hover:shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.primaryLight }}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🧩</span>
        <h3 className="text-xl font-bold" style={{ color: colors.text }}>Chrome Extension</h3>
      </div>
      <p className="mb-4" style={{ color: colors.textLight }}>Our Chrome extension helps your child with communication and daily browsing:</p>
      <div className="flex items-center p-4 rounded-lg mb-4" style={{ backgroundColor: colors.offWhite }}>
        <div className="flex-shrink-0 mr-4 p-3 rounded-full" style={{ backgroundColor: colors.accent }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
        </div>
        <div>
          <h4 className="font-medium" style={{ color: colors.text }}>Aihsaas Communication Helper</h4>
          <p className="text-sm" style={{ color: colors.textLight }}>Makes websites more accessible for neurodivergent children</p>
        </div>
      </div>
      <div className="flex space-x-3">
        <a 
          href="https://chrome.google.com/webstore" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1 py-2 rounded-full hover:opacity-90 transition text-center text-sm"
          style={{ backgroundColor: colors.highlight, color: colors.white }}
        >
          Install Extension
        </a>
        <Link 
          href="/extension/guide"
          className="flex-1 py-2 border rounded-full hover:opacity-90 transition text-center text-sm"
          style={{ borderColor: colors.secondary, color: colors.secondary }}
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}

// Component for the therapist connection card
function TherapistCard({ therapists }: { therapists: Therapist[] }) {
  return (
    <div className="p-6 rounded-xl shadow-md border transition-all hover:shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.primaryLight }}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🧠</span>
        <h3 className="text-xl font-bold" style={{ color: colors.text }}>Connect With Therapists</h3>
      </div>
      <p className="mb-4" style={{ color: colors.textLight }}>Find and book sessions with qualified therapists:</p>
      <div className="space-y-3">
        {therapists.map(therapist => (
          <div key={therapist.id} className="flex justify-between items-center border-b pb-3 last:border-0" style={{ borderColor: colors.primaryLight }}>
            <div>
              <p className="font-medium" style={{ color: colors.text }}>{therapist.name}</p>
              <p className="text-sm" style={{ color: colors.textLight }}>{therapist.specialty}</p>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-4 h-4 ${i < therapist.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>
            </div>
            <button 
              disabled={!therapist.available}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                therapist.available 
                  ? 'hover:opacity-90' 
                  : 'cursor-not-allowed'
              }`}
              style={{
                backgroundColor: therapist.available ? colors.softGreen : colors.offWhite,
                color: therapist.available ? colors.text : colors.textLight
              }}
            >
              {therapist.available ? 'Book Now' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Link href="/dashboard/therapists" className="font-medium text-sm flex items-center hover:opacity-90" style={{ color: colors.secondary }}>
          View all therapists
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
}

// Component for scheduled meetings card
function MeetingsCard({ meetings }: { meetings: Meeting[] }) {
  return (
    <div className="p-6 rounded-xl shadow-md border transition-all hover:shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.primaryLight }}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">📅</span>
        <h3 className="text-xl font-bold" style={{ color: colors.text }}>Scheduled Meets</h3>
        <Link href='/dashboard/event'>
          <button className="flex-1 ml-2 px-3 py-1 rounded-full hover:opacity-90 transition text-center text-sm"
            style={{ backgroundColor: colors.highlight, color: colors.white }}>
            Schedule Meets
          </button>
        </Link>
      </div>
      <p className="mb-4" style={{ color: colors.textLight }}>Your upcoming sessions and meetups:</p>
      {meetings.length > 0 ? (
        <div className="space-y-3">
          {meetings.map(meeting => (
            <div key={meeting.id} className="p-3 rounded-lg" style={{ backgroundColor: colors.offWhite }}>
              <div className="flex justify-between items-start">
                <h4 className="font-medium" style={{ color: colors.text }}>{meeting.title}</h4>
                <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: colors.softBlue, color: colors.text }}>
                  Upcoming
                </span>
              </div>
              <div className="flex items-center text-sm mt-2" style={{ color: colors.textLight }}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {meeting.date}
              </div>
              <div className="flex items-center text-sm mt-1" style={{ color: colors.textLight }}>
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {meeting.time}
              </div>
              <div className="mt-3 flex">
                <a 
                  href={meeting.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-full hover:opacity-90 transition text-center text-sm mr-2"
                  style={{ backgroundColor: colors.highlight, color: colors.white }}
                >
                  Join Meeting
                </a>
                <button className="px-3 py-2 border rounded-full hover:opacity-90 transition" style={{ borderColor: colors.primary }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.text }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 rounded-lg" style={{ backgroundColor: colors.offWhite }}>
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.textLight }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p style={{ color: colors.textLight }}>No upcoming meetings</p>
          <button className="mt-3 px-4 py-2 rounded-full hover:opacity-90 transition text-sm" style={{ backgroundColor: colors.highlight, color: colors.white }}>
            Schedule a Meeting
          </button>
        </div>
      )}
    </div>
  );
}

// Component for parent guidance card
function GuidanceCard({ condition }: { condition: string }) {
  // Determine guidance resources based on child's condition
  const getConditionSpecificGuidance = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'autism':
        return [
          { title: "Autism Communication Strategies", description: "How to improve daily communication", link: "/guides/autism/communication" },
          { title: "Sensory Processing Tips", description: "Managing sensory overload", link: "/guides/autism/sensory" },
          { title: "Social Skills Development", description: "Activities to build social confidence", link: "/guides/autism/social" }
        ];
      case 'cerebral palsy':
      case 'cp':
        return [
          { title: "Physical Therapy at Home", description: "Simple exercises for motor skills", link: "/guides/cp/physical-therapy" },
          { title: "Assistive Technology Guide", description: "Tools to improve independence", link: "/guides/cp/assistive-tech" },
          { title: "Nutrition for CP", description: "Diet and feeding strategies", link: "/guides/cp/nutrition" }
        ];
      case 'adhd':
        return [
          { title: "ADHD Focus Techniques", description: "Strategies to improve concentration", link: "/guides/adhd/focus" },
          { title: "Routine Building for ADHD", description: "Creating effective daily structures", link: "/guides/adhd/routine" },
          { title: "Managing Hyperactivity", description: "Channeling energy positively", link: "/guides/adhd/hyperactivity" }
        ];
      default:
        return [
          { title: "General Neurodiversity Support", description: "Core strategies for all parents", link: "/dashboard/guidancex" },
          { title: "Building Confidence & Independence", description: "Helping your child thrive", link: "/dashboard/guidancex" },
          { title: "Communication Techniques", description: "Effective parent-child communication", link: "/dashboard/guidancex" }
        ];
    }
  };

  const guidanceResources = getConditionSpecificGuidance(condition);

  return (
    <div className="p-6 rounded-xl shadow-md border transition-all hover:shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.primaryLight }}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🧭</span>
        <h3 className="text-xl font-bold" style={{ color: colors.text }}>Guidance for Parents</h3>
      </div>
      <p className="mb-4" style={{ color: colors.textLight }}>Resources tailored for parents of children with {condition || 'neurodiversity'}:</p>
      <div className="space-y-3">
        {guidanceResources.map((resource, index) => (
          <Link key={index} href={resource.link} className="block p-3 rounded-lg hover:opacity-90 transition hover:translate-x-1 transform" style={{ backgroundColor: colors.primaryLight }}>
            <p className="font-medium" style={{ color: colors.text }}>{resource.title}</p>
            <p className="text-sm" style={{ color: colors.textLight }}>{resource.description}</p>
          </Link>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <Link href="/guides/all" className="font-medium text-sm flex items-center hover:opacity-90" style={{ color: colors.secondary }}>
          All resources
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
        <Link href="/dashboard/guidance" className="font-medium text-sm flex items-center hover:opacity-90" style={{ color: colors.secondary }}>
          Get personalized recommendations
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
}

// Component for screening tests card
function ScreeningTestsCard({ condition }: { condition: string }) {
  return (
    <div className="p-6 rounded-xl shadow-md border transition-all hover:shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.primaryLight }}>
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🧪</span>
        <h3 className="text-xl font-bold" style={{ color: colors.text }}>Screening Tests</h3>
      </div>
      <p className="mb-4" style={{ color: colors.textLight }}>Take professional screening tests to track your child's development:</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link href="/tests/autism" className={`p-4 rounded-lg text-center hover:opacity-90 transition ${condition.toLowerCase() === 'autism' ? 'opacity-100' : 'opacity-90'}`} 
          style={{ backgroundColor: condition.toLowerCase() === 'autism' ? colors.accent : colors.offWhite, color: colors.text }}>
          <div className="font-medium mb-1">Autism Screening Test</div>
          <div className="text-sm">10-15 minutes</div>
        </Link>
        <Link href="/tests/cp" className={`p-4 rounded-lg text-center hover:opacity-90 transition ${condition.toLowerCase() === 'cerebral palsy' || condition.toLowerCase() === 'cp' ? 'opacity-100' : 'opacity-90'}`} 
          style={{ backgroundColor: condition.toLowerCase() === 'cerebral palsy' || condition.toLowerCase() === 'cp' ? colors.accent : colors.offWhite, color: colors.text }}>
          <div className="font-medium mb-1">Cerebral Palsy Assessment</div>
          <div className="text-sm">15-20 minutes</div>
        </Link>
        <Link href="/tests/adhd" className={`p-4 rounded-lg text-center hover:opacity-90 transition ${condition.toLowerCase() === 'adhd' ? 'opacity-100' : 'opacity-90'}`} 
          style={{ backgroundColor: condition.toLowerCase() === 'adhd' ? colors.accent : colors.offWhite, color: colors.text }}>
          <div className="font-medium mb-1">ADHD Evaluation</div>
          <div className="text-sm">10-15 minutes</div>
        </Link>
        <Link href="/tests/development" className="p-4 rounded-lg text-center hover:opacity-90 transition" style={{ backgroundColor: colors.offWhite, color: colors.text }}>
          <div className="font-medium mb-1">General Development</div>
          <div className="text-sm">5-10 minutes</div>
        </Link>
      </div>
      <div className="mt-4">
        <Link href="/tests/history" className="font-medium text-sm flex items-center hover:opacity-90" style={{ color: colors.secondary }}>
          View previous test results
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
}

// Main dashboard component
export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Daily tasks state
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([
    { id: '1', title: 'Brush teeth', description: 'Morning and evening routine', completed: false },
    { id: '2', title: 'Get dressed', description: 'Practice putting on socks and shirts', completed: false },
    { id: '3', title: 'Practice communication', description: 'Use picture cards for 15 minutes', completed: false },
    { id: '4', title: 'Physical exercise', description: 'Do 10 minutes of recommended exercises', completed: false },
    { id: '5', title: 'Reading time', description: 'Read together for 15 minutes', completed: false },
  ]);
  
  // Mock therapist data
  const therapists: Therapist[] = [
    { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Behavioral Therapy', rating: 5, available: true },
    { id: '2', name: 'Dr. Michael Chen', specialty: 'Occupational Therapy', rating: 4, available: true },
    { id: '3', name: 'Dr. Aisha Patel', specialty: 'Speech Therapy', rating: 5, available: false },
  ];
  
  // Mock meeting data
  const meetings: Meeting[] = [
    { 
      id: '1', 
      title: 'Speech Therapy Session', 
      date: 'April 19, 2025', 
      time: '10:00 AM - 11:00 AM',
      link: 'https://meet.zoom.us/j/123456789',
    },
    { 
      id: '2', 
      title: 'Parent Support Group', 
      date: 'April 21, 2025', 
      time: '7:00 PM - 8:30 PM',
      link: 'https://meet.zoom.us/j/987654321',
    },
  ];

  // Toggle task completion
  const toggleTaskCompletion = (taskId: string) => {
    setDailyTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Clear session cookie and redirect to login
        await fetch('/api/auth/session', { method: 'DELETE' });
        router.push('/login');
        return;
      }

      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          setError('No user data found');
          // Clear session and redirect to login
          await fetch('/api/auth/session', { method: 'DELETE' });
          await signOut(auth);
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Error loading user data');
        // Clear session and redirect to login
        await fetch('/api/auth/session', { method: 'DELETE' });
        await signOut(auth);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Clear the session cookie
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Error during logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: colors.highlight }}></div>
          <p className="mt-4" style={{ color: colors.text }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: colors.text }}>{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 rounded-full hover:opacity-90 transition"
            style={{ backgroundColor: colors.highlight, color: colors.white }}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: colors.text }}>No user data available</p>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 rounded-full hover:opacity-90 transition"
            style={{ backgroundColor: colors.highlight, color: colors.white }}
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Extract condition from problem field or default to empty string
  const childCondition = userData.problem?.toLowerCase().includes('autism') 
    ? 'Autism' 
    : userData.problem?.toLowerCase().includes('cerebral palsy') || userData.problem?.toLowerCase().includes('cp')
    ? 'Cerebral Palsy'
    : userData.problem?.toLowerCase().includes('adhd')
    ? 'ADHD'
    : 'Neurodiversity';

  return (
    <div className="min-h-screen pb-12" style={{ backgroundColor: colors.background }}>
      {/* Header Section */}
      <div className="shadow" style={{ backgroundColor: colors.white }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: colors.primaryDark }}>Aihsaas</h1>
              <span className="ml-2 px-2 py-1 text-xs rounded-full" style={{ backgroundColor: colors.primaryLight, color: colors.text }}>
                Parent Dashboard
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowProfileModal(true)}
                className="hover:opacity-90 transition flex items-center"
                style={{ color: colors.text }}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-full hover:opacity-90 transition text-sm"
                style={{ backgroundColor: colors.highlight, color: colors.white }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-lg p-6 md:p-8" style={{ backgroundColor: colors.primary }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: colors.white }}>Welcome, {userData.parentName}!</h2>
              <div className="mt-2" style={{ color: colors.primaryLight }}>
                <p>Supporting {userData.childName}'s journey with {childCondition}</p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="px-4 py-2 rounded-full hover:opacity-90 transition font-medium" style={{ backgroundColor: colors.white, color: colors.primaryDark }}>
                View Child Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Daily Tasks Section */}
          <DailyTaskCard tasks={dailyTasks} onToggleTask={toggleTaskCompletion} />
          
          {/* Community Section */}
          <CommunityCard />
          
          {/* AI Exercises Section */}
          <AIExercisesCard />
          
          {/* Chrome Extension Section */}
          <ChromeExtensionCard />
          
          {/* Therapist Connection Section */}
          <TherapistCard therapists={therapists} />
          
          {/* Scheduled Meetings Section */}
          <MeetingsCard meetings={meetings} />
          
          {/* Parent Guidance Section */}
          <GuidanceCard condition={childCondition} />
          
          {/* Screening Tests Section */}
          <ScreeningTestsCard condition={childCondition} />
        </div>

        {/* Child & Parent Info Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl shadow-md border transition-all hover:shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.primaryLight }}>
            <h3 className="font-semibold text-lg mb-4 flex items-center" style={{ color: colors.text }}>
              <span className="mr-2" style={{ color: colors.primaryDark }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </span>
              Child Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm" style={{ color: colors.textLight }}>Name</p>
                <p className="font-medium" style={{ color: colors.text }}>{userData.childName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm" style={{ color: colors.textLight }}>Age</p>
                <p className="font-medium" style={{ color: colors.text }}>{userData.age} years</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm" style={{ color: colors.textLight }}>Condition</p>
                <p className="font-medium" style={{ color: colors.text }}>{childCondition}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm" style={{ color: colors.textLight }}>Location</p>
                <p className="font-medium" style={{ color: colors.text }}>{userData.location}</p>
              </div>
            </div>
            <button className="mt-4 font-medium text-sm flex items-center hover:opacity-90" style={{ color: colors.secondary }}>
              Update child information
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          
          <div className="p-6 rounded-xl shadow-md border transition-all hover:shadow-lg" style={{ backgroundColor: colors.white, borderColor: colors.primaryLight }}>
            <h3 className="font-semibold text-lg mb-4 flex items-center" style={{ color: colors.text }}>
              <span className="mr-2" style={{ color: colors.primaryDark }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </span>
              Parent Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm" style={{ color: colors.textLight }}>Name</p>
                <p className="font-medium" style={{ color: colors.text }}>{userData.parentName}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm" style={{ color: colors.textLight }}>Email</p>
                <p className="font-medium" style={{ color: colors.text }}>{userData.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm" style={{ color: colors.textLight }}>Contact</p>
                <p className="font-medium" style={{ color: colors.text }}>{userData.parentNumber}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm" style={{ color: colors.textLight }}>Member Since</p>
                <p className="font-medium" style={{ color: colors.text }}>April 2025</p>
              </div>
            </div>
            <button className="mt-4 font-medium text-sm flex items-center hover:opacity-90" style={{ color: colors.secondary }}>
              Edit profile
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal - simple implementation */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="rounded-xl p-6 max-w-md w-full" style={{ backgroundColor: colors.white }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>Edit Profile</h3>
              <button onClick={() => setShowProfileModal(false)} style={{ color: colors.textLight }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="parentName" style={{ color: colors.text }}>
                  Parent Name
                </label>
                <input 
                  id="parentName" 
                  type="text" 
                  defaultValue={userData.parentName}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.primaryLight, color: colors.text }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="email" style={{ color: colors.text }}>
                  Email
                </label>
                <input 
                  id="email" 
                  type="email" 
                  defaultValue={userData.email}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.primaryLight, color: colors.text }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="phone" style={{ color: colors.text }}>
                  Phone Number
                </label>
                <input 
                  id="phone" 
                  type="text" 
                  defaultValue={userData.parentNumber}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ borderColor: colors.primaryLight, color: colors.text }}
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 border rounded-full hover:opacity-90 transition"
                  style={{ borderColor: colors.primaryLight, color: colors.text }}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    // Here you would implement the update logic with Firebase
                    alert('Profile updated! (This is a demo)');
                    setShowProfileModal(false);
                  }}
                  className="px-4 py-2 rounded-full hover:opacity-90 transition"
                  style={{ backgroundColor: colors.highlight, color: colors.white }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}