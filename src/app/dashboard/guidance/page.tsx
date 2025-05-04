"use client";
import { useState, useCallback } from 'react';
import { getParentGuidance } from '../../../lib/gemini';

// Types moved to a separate file (types.ts) in production
interface AgeSpecificPlan {
  autism: string[];
  cerebralPalsy: string[];
  combined?: string[];
}

interface GuidanceResponse {
  support: {
    emotionalSupport: string;
    validation: string;
  };
  actionPlan: {
    immediateSteps: string[];
    ageSpecificPlans: Record<string, AgeSpecificPlan>;
    longTermStrategies: string[];
  };
  therapySuggestions: string[];
}

type ChatMessage = {
  sender: 'parent' | 'guide';
  content: string | GuidanceResponse;
  isGeneral?: boolean; // New flag for general queries
};

const DEFAULT_RESPONSE: GuidanceResponse = {
  support: {
    emotionalSupport: "We understand this is challenging",
    validation: "Your feelings are completely valid"
  },
  actionPlan: {
    immediateSteps: [
      "Take a deep breath and pause for a moment",
      "Write down your most pressing concerns",
      "Reach out to someone you trust"
    ],
    ageSpecificPlans: {
      "5": {
        autism: ["Create visual schedules", "Establish sensory-friendly spaces"],
        cerebralPalsy: ["Begin physical therapy", "Explore mobility aids"],
        combined: ["Combine OT with PT sessions"]
      }
    },
    longTermStrategies: [
      "Schedule an evaluation with a specialist",
      "Research local support resources",
      "Create a consistent daily schedule"
    ]
  },
  therapySuggestions: [
    "Occupational therapy for daily living skills",
    "Behavioral therapy for skill development"
  ]
};

// General query keywords
const GENERAL_KEYWORDS = ['weather', 'time', 'capital', 'how old', 'who is'];

export default function GuidancePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAge, setSelectedAge] = useState('5');
  const [selectedCondition, setSelectedCondition] = useState<'autism' | 'cerebralPalsy' | 'combined'>('autism');

  const isGeneralQuery = useCallback((query: string) => {
    return GENERAL_KEYWORDS.some(keyword => 
      query.toLowerCase().includes(keyword.toLowerCase())
    );
  }, []);

  const renderMessageContent = (content: string | GuidanceResponse, isGeneral?: boolean) => {
    if (typeof content === 'string' || isGeneral) {
      return (
        <div className="prose">
          <p>{typeof content === 'string' ? content : JSON.stringify(content)}</p>
        </div>
      );
    }

    const safeContent = content as GuidanceResponse;

    return (
      <div className="space-y-4">
        {/* Support Section */}
        <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
          <h3 className="font-bold text-blue-800 mb-1">Support</h3>
          <p className="text-gray-700">{safeContent.support.emotionalSupport}</p>
          <p className="text-gray-600 italic">{safeContent.support.validation}</p>
        </div>

        {/* Action Plan Section */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-lg shadow-sm">
          <h3 className="font-bold text-purple-800 text-lg mb-3">Action Plan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Age:
                <select 
                  value={selectedAge}
                  onChange={(e) => setSelectedAge(e.target.value)}
                  className="ml-2 p-1 border rounded w-full"
                >
                  {[5,6,7,8,9,10,11,12,13,14,15,16,17].map(age => (
                    <option key={age} value={String(age)}>{age} years</option>
                  ))}
                </select>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Condition:
                <select 
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value as any)}
                  className="ml-2 p-1 border rounded w-full"
                >
                  <option value="autism">Autism</option>
                  <option value="cerebralPalsy">Cerebral Palsy</option>
                  <option value="combined">Combined</option>
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-indigo-700 mb-2">Immediate Steps</h4>
              <ol className="list-decimal pl-5 space-y-2">
                {safeContent.actionPlan.immediateSteps.map((step, i) => (
                  <li key={i} className="text-gray-700">{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="font-semibold text-indigo-700 mb-2">Age-Specific Plan ({selectedAge} years)</h4>
              <ol className="list-decimal pl-5 space-y-2">
                {safeContent.actionPlan.ageSpecificPlans[selectedAge]?.[selectedCondition]?.map((step, i) => (
                  <li key={i} className="text-gray-700">{step}</li>
                )) || <li>No specific plan for this age/condition combination</li>}
              </ol>
            </div>

            <div>
              <h4 className="font-semibold text-indigo-700 mb-2">Long-term Strategies</h4>
              <ol className="list-decimal pl-5 space-y-2">
                {safeContent.actionPlan.longTermStrategies.map((step, i) => (
                  <li key={i} className="text-gray-700">{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Therapy Suggestions */}
        {safeContent.therapySuggestions.length > 0 && (
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">Therapy Suggestions</h4>
            <ul className="list-disc pl-5 space-y-1">
              {safeContent.therapySuggestions.map((therapy, i) => (
                <li key={i} className="text-gray-700">{therapy}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = { 
      sender: 'parent', 
      content: input 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const generalQuery = isGeneralQuery(input);
      
      if (generalQuery) {
        // Handle general queries differently
        setMessages(prev => [...prev, {
          sender: 'guide',
          content: "I specialize in neurodevelopmental guidance. For general questions like this, please try a different resource.",
          isGeneral: true
        }]);
        return;
      }

      const context = messages
        .slice(-3)
        .filter(m => !m.isGeneral)
        .map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content))
        .join(' ');
      
      const response = await getParentGuidance(input, context);
      setMessages(prev => [...prev, { 
        sender: 'guide', 
        content: response 
      }]);
    } catch (error) {
      console.error("Error getting guidance:", error);
      setMessages(prev => [...prev, {
        sender: 'guide',
        content: "Sorry, I encountered an error. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">
            Parent Guidance Chat
          </h2>
          <p className="text-gray-600 mb-4">
            Share your concerns about your neurodivergent child for personalized support.
          </p>
          
          <div className="space-y-4 mb-6">
            {messages.map((msg, i) => (
              <div key={i} className={`p-4 rounded-lg ${msg.sender === 'parent' 
                ? 'bg-indigo-100 text-black ml-auto max-w-[90%] md:max-w-[80%]' 
                : 'bg-gray-100 text-black mr-auto max-w-[90%] md:max-w-[80%]'}`}>
                {renderMessageContent(msg.content, msg.isGeneral)}
              </div>
            ))}
            {isLoading && (
              <div className="bg-gray-100 p-4 rounded-lg mr-auto max-w-[80%] flex gap-2">
                <span className="animate-pulse text-black">Thinking</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Share your concerns..."
              className="flex-1 text-black p-3 border rounded-lg focus:ring-2 focus:ring-indigo-200 focus:outline-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-indigo-600 text-black px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            > 
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}