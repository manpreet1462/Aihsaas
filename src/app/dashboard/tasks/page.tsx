// // app/tasks/selection/page.tsx
// 'use client';
// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { tasks } from '@/lib/tasks';

// export default function TaskSelection() {
//   const router = useRouter();
//   const [selectedTask, setSelectedTask] = useState<string | null>(null);
//   const [repetitionMode, setRepetitionMode] = useState<'fixed' | 'ai'>('fixed');
//   const [customInterval, setCustomInterval] = useState<number>(15);

//   const handleStartTask = () => {
//     if (selectedTask) {
//       router.push(`/dashboard/tasks/execute?task=${selectedTask}&mode=${repetitionMode}&interval=${customInterval}`);
//     }
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-6 text-black bg-white rounded-lg shadow-md flex flex-col justify-center">
//       <h1 className="text-3xl font-bold mb-8 text-center">Select Daily Task</h1>
      
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
//         {tasks.map(task => (
//           <div
//             key={task.id}
//             className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
//               selectedTask === task.id 
//                 ? 'border-blue-500 bg-blue-50 scale-105' 
//                 : 'border-gray-200 hover:border-blue-300'
//             }`}
//             onClick={() => setSelectedTask(task.id)}
//           >
//             <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-blue-600 text-2xl">
//               🦷
//             </div>
//             <h3 className="font-bold text-lg">{task.title}</h3>
//             <p className="text-gray-600 text-sm">{task.description}</p>
//             <div className="mt-2 flex justify-between items-center">
//               <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
//                 {task.category}
//               </span>
//               <span className="text-xs text-gray-500 capitalize">
//                 {task.difficulty}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {selectedTask && (
//         <div className="bg-white p-6 rounded-xl shadow-md">
//           <h2 className="text-xl font-semibold mb-4">Task Settings</h2>
          
//           <div className="mb-6">
//             <label className="block text-sm font-medium mb-2">Prompt Repetition</label>
//             <div className="flex space-x-4">
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="radio"
//                   checked={repetitionMode === 'fixed'}
//                   onChange={() => setRepetitionMode('fixed')}
//                   className="h-4 w-4 text-blue-600"
//                 />
//                 <span>Fixed Interval</span>
//               </label>
//               <label className="flex items-center space-x-2">
//                 <input
//                   type="radio"
//                   checked={repetitionMode === 'ai'}
//                   onChange={() => setRepetitionMode('ai')}
//                   className="h-4 w-4 text-blue-600"
//                 />
//                 <span>AI-Adjusted</span>
//               </label>
//             </div>
//           </div>

//           {repetitionMode === 'fixed' && (
//             <div className="mb-6">
//               <label className="block text-sm font-medium mb-2">
//                 Repeat every (seconds): {customInterval}
//               </label>
//               <input
//                 type="range"
//                 min="5"
//                 max="60"
//                 value={customInterval}
//                 onChange={(e) => setCustomInterval(Number(e.target.value))}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//               />
//             </div>
//           )}

//           <button
//             onClick={handleStartTask}
//             className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium"
//           >
//             Start Task
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { tasks } from '@/lib/tasks';
import Link from 'next/link';

// Color scheme definition
const colors = {
  primary: '#D6BC8B',         // Warm golden taupe - more vibrant than original
  primaryDark: '#B8976C',     // Darker golden taupe
  primaryLight: '#E8D4AF',    // Light warm beige
  secondary: '#94785A',       // Medium warm taupe
  accent: '#FFCF8B',          // Soft peachy/apricot accent
  highlight: '#FFB347',       // Mango/orange highlight for important elements
  text: '#5D4B36',            // Dark taupe for text
  textLight: '#7A6A5F',       // Lighter text color
  background: '#FBF7F1',      // Very light cream background
  white: '#FFFFFF',
  offWhite: '#FAF9F7',
  softBlue: '#B7D1E2',        // Soft blue for variety
  softGreen: '#C5D8B9'        // Soft green for variety
};

// Task icons mapping
const taskIcons: Record<string, string> = {
  brushing: '🦷',
  eating: '🥄',
  washing: '🧼',
  puzzle: '🧩',
  drawing: '🖍️',
  reading: '📚',
  cleaning: '🧹',
  default: '✨'
};

export default function TaskSelection() {
  const router = useRouter();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [repetitionMode, setRepetitionMode] = useState<'fixed' | 'ai'>('fixed');
  const [customInterval, setCustomInterval] = useState<number>(15);

  const handleStartTask = () => {
    if (selectedTask) {
      router.push(`/dashboard/tasks/execute?task=${selectedTask}&mode=${repetitionMode}&interval=${customInterval}`);
    }
  };

  // Added new tasks to the existing tasks array
  const enhancedTasks = [
    ...tasks,
    {
      id: 'eating',
      title: 'Eating Practice',
      description: 'Practice using spoon and fork with proper form',
      category: 'Self Care',
      difficulty: 'easy'
    },
    {
      id: 'washing',
      title: 'Face Washing',
      description: 'Learn to wash and wipe face properly',
      category: 'Hygiene',
      difficulty: 'easy'
    },
    {
      id: 'puzzle',
      title: 'Simple Puzzles',
      description: 'Complete age-appropriate digital puzzles',
      category: 'Cognitive',
      difficulty: 'medium'
    },
    {
      id: 'drawing',
      title: 'Coloring Time',
      description: 'Practice coloring within the lines',
      category: 'Creative',
      difficulty: 'easy'
    },
    {
      id: 'cleaning',
      title: 'Clean-up Time',
      description: 'Learn how to tidy up toys and belongings',
      category: 'Responsibility',
      difficulty: 'medium'
    }
  ];

  const getTaskIcon = (taskId: string) => {
    return taskIcons[taskId] || taskIcons.default;
  };

  return (
    
    <div style={{ backgroundColor: colors.background }} className="min-h-screen py-8 px-4">
      <header style={{ backgroundColor: colors.primaryLight }} className="shadow-lg">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="text-white text-2xl font-bold">TherapyConnect</span>
                        </div>
                        <Link href='/dashboard'><button
                            style={{ backgroundColor: colors.accent, color: colors.primaryDark }}
                            className="px-4 py-2 rounded-md font-medium hover:opacity-90 transition duration-300"
                        >
                            Go to Dashboard
                        </button></Link>
                    </div>
                </div>
            </header>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
        <h1 style={{ color: colors.text }} className="text-3xl font-bold mb-4 text-center">
          Choose Your Daily Task!
        </h1>
        <p style={{ color: colors.textLight }} className="text-center mb-8">
          Select a fun activity to practice today
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {enhancedTasks.map(task => (
            <div
              key={task.id}
              style={{
                borderColor: selectedTask === task.id ? colors.highlight : colors.primaryLight,
                backgroundColor: selectedTask === task.id ? colors.accent + '30' : colors.white
              }}
              className={`border-2 rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
                selectedTask === task.id 
                  ? 'scale-105' 
                  : 'hover:border-accent'
              }`}
              onClick={() => setSelectedTask(task.id)}
            >
              <div 
                style={{ backgroundColor: colors.softBlue }}
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-3xl"
              >
                {getTaskIcon(task.id)}
              </div>
              <h3 style={{ color: colors.text }} className="font-bold text-lg mb-1">{task.title}</h3>
              <p style={{ color: colors.textLight }} className="text-sm mb-3">{task.description}</p>
              <div className="flex justify-between items-center">
                <span 
                  style={{ backgroundColor: colors.primaryLight, color: colors.text }}
                  className="text-xs px-3 py-1 rounded-full font-medium"
                >
                  {task.category}
                </span>
                <span 
                  style={{ color: task.difficulty === 'easy' ? colors.softGreen : colors.primaryDark }}
                  className="text-xs font-medium capitalize"
                >
                  {task.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>

        {selectedTask && (
          <div 
            style={{ backgroundColor: colors.offWhite, borderColor: colors.primaryLight }}
            className="p-6 rounded-xl shadow-sm border-2 transition-all animate-fadeIn"
          >
            <h2 style={{ color: colors.text }} className="text-xl font-semibold mb-4">Task Settings</h2>
            
            <div className="mb-6">
              <label style={{ color: colors.text }} className="block text-sm font-medium mb-3">How often should we remind?</label>
              <div className="flex flex-wrap gap-4">
                <label 
                  style={{ 
                    backgroundColor: repetitionMode === 'fixed' ? colors.accent : colors.white,
                    borderColor: colors.primaryLight
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    checked={repetitionMode === 'fixed'}
                    onChange={() => setRepetitionMode('fixed')}
                    className="h-4 w-4"
                    style={{ accentColor: colors.highlight }}
                  />
                  <span style={{ color: colors.text }}>Fixed Time</span>
                </label>
                <label 
                  style={{ 
                    backgroundColor: repetitionMode === 'ai' ? colors.accent : colors.white,
                    borderColor: colors.primaryLight
                  }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg border-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    checked={repetitionMode === 'ai'}
                    onChange={() => setRepetitionMode('ai')}
                    className="h-4 w-4"
                    style={{ accentColor: colors.highlight }}
                  />
                  <span style={{ color: colors.text }}>Smart Timing</span>
                </label>
              </div>
            </div>

            {repetitionMode === 'fixed' && (
              <div className="mb-8">
                <label style={{ color: colors.text }} className="block text-sm font-medium mb-2">
                  Remind every <span style={{ color: colors.highlight }} className="font-bold">{customInterval}</span> seconds
                </label>
                <div className="flex items-center gap-2">
                  <span style={{ color: colors.textLight }} className="text-xs">Faster</span>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={customInterval}
                    onChange={(e) => setCustomInterval(Number(e.target.value))}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    style={{ 
                      backgroundColor: colors.primaryLight,
                      accentColor: colors.highlight
                    }}
                  />
                  <span style={{ color: colors.textLight }} className="text-xs">Slower</span>
                </div>
              </div>
            )}

            <button
              onClick={handleStartTask}
              style={{ backgroundColor: colors.highlight }}
              className="w-full text-white py-4 rounded-lg hover:opacity-90 transition font-bold text-lg shadow-md"
            >
              Start Now!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}