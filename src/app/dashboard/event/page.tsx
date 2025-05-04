"use client";

import React from 'react';
import { Calendar, Users, Clock, MapPin, Book, ThumbsUp, Heart, ArrowRight, CheckCircle, X } from 'lucide-react';

const colors = {
  primary: '#D6BC8B',         // Warm golden taupe - more vibrant than original
  primaryDark: '#B8976C',     // Darker golden taupe
  primaryLight: '#E8D4AF',    // Light warm beige
  secondary: '#94785A',       // Medium warm taupe
  accent: '#FFCF8B',          // Soft peachy/apricot accent - children are attracted to this warmth
  highlight: '#FFB347',       // Mango/orange highlight for important elements - kids love this pop of color
  text: '#5D4B36',            // Dark taupe for text - good contrast but softer than black
  textLight: '#7A6A5F',       // Lighter text color
  background: '#FBF7F1',      // Very light cream background - easier on children's eyes
  white: '#FFFFFF',
  offWhite: '#FAF9F7',
  softBlue: '#B7D1E2',        // Soft blue for variety - children respond to blue as calming
  softGreen: '#C5D8B9',       // Soft green for variety - children like natural colors
  green: '#4CAF50',           // Added for success icon
};

const events = [
  {
    id: 1,
    title: "Sensory-Friendly Play Day",
    date: "April 25, 2025",
    time: "10:00 AM - 12:00 PM",
    location: "Sunshine Community Center",
    description: "A morning of structured play activities designed for neurodivergent children ages 5-12. Activities include sensory bins, quiet corners, and guided social interactions.",
    category: "Children",
    registrationLink: "#register-1"
  },
  {
    id: 2,
    title: "Parent Workshop: Understanding Sensory Processing",
    date: "April 26, 2025",
    time: "6:30 PM - 8:00 PM",
    location: "Virtual Event (Zoom)",
    description: "Join Dr. Rachel Greene, occupational therapist, as she explains sensory processing differences and offers practical strategies to support your child at home and in school.",
    category: "Parents",
    registrationLink: "#register-2"
  },
  {
    id: 3,
    title: "Art Therapy Group for Teens",
    date: "May 2, 2025",
    time: "4:00 PM - 5:30 PM",
    location: "Creative Minds Studio",
    description: "Teens ages 13-17 are invited to express themselves through art in this supportive group led by art therapist Jamie Wilson. No artistic experience needed!",
    category: "Teens",
    registrationLink: "#register-3"
  },
  {
    id: 4,
    title: "Family Support Circle",
    date: "May 7, 2025",
    time: "7:00 PM - 8:30 PM",
    location: "Community Library, Room 204",
    description: "Connect with other families in a facilitated discussion group. Share experiences, resources, and support strategies while children enjoy supervised activities in the adjacent room.",
    category: "Family",
    registrationLink: "#register-4"
  },
  {
    id: 5,
    title: "Expert Talk: Educational Accommodations",
    date: "May 12, 2025",
    time: "6:00 PM - 7:30 PM",
    location: "Virtual Event (Zoom)",
    description: "Educational advocate Sophia Martinez explains IEPs, 504 plans, and how to work effectively with your child's school to ensure they receive appropriate support and accommodations.",
    category: "Parents",
    registrationLink: "#register-5"
  },
  {
    id: 6,
    title: "Social Skills Game Day",
    date: "May 18, 2025",
    time: "1:00 PM - 3:00 PM",
    location: "Sunshine Community Center",
    description: "Children ages 7-12 will practice social skills through structured board games and cooperative activities. Trained facilitators will guide interactions in a low-pressure environment.",
    category: "Children",
    registrationLink: "#register-6"
  }
];

// New Registration Popup Component
interface RegistrationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
}

const RegistrationPopup: React.FC<RegistrationPopupProps> = ({ isOpen, onClose, eventTitle }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      {/* Popup content */}
      <div 
        className="relative bg-white rounded-lg shadow-xl p-6 m-4 max-w-md w-full animate-fade-in"
        style={{ backgroundColor: colors.white }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={24} style={{ color: colors.text }} />
        </button>
        
        {/* Success icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primaryLight }}>
            <CheckCircle size={40} style={{ color: colors.green }} />
          </div>
        </div>
        
        {/* Confirmation title */}
        <h3 
          className="text-2xl font-bold text-center mb-2"
          style={{ color: colors.text }}
        >
          Registration Successful!
        </h3>
        
        {/* Event title */}
        <p 
          className="text-center mb-4 font-medium"
          style={{ color: colors.textLight }}
        >
          You've registered for:
        </p>
        <p 
          className="text-center mb-6 font-bold"
          style={{ color: colors.primaryDark }}
        >
          {eventTitle}
        </p>
        
        {/* Confirmation message */}
        <div 
          className="text-center mb-6 p-4 rounded-lg"
          style={{ backgroundColor: colors.background }}
        >
          <p style={{ color: colors.text }}>
            Thank you for registering! Further details including schedule, preparation tips, and any materials needed will be sent to your email shortly.
          </p>
        </div>
        
        {/* OK button */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-md font-medium transition-colors"
            style={{ 
              backgroundColor: colors.primary, 
              color: colors.white,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.primaryDark}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

// Category badge component
const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  let bgColor;
  
  switch(category) {
    case "Children":
      bgColor = colors.softBlue;
      break;
    case "Parents":
      bgColor = colors.softGreen;
      break;
    case "Teens":
      bgColor = colors.accent;
      break;
    case "Family":
      bgColor = colors.highlight;
      break;
    default:
      bgColor = colors.primaryLight;
  }
  
  return (
    <span 
      className="text-xs font-medium px-2 py-1 rounded-full"
      style={{ backgroundColor: bgColor, color: colors.text }}
    >
      {category}
    </span>
  );
};

// Updated Event row component for timetable with popup
interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  registrationLink: string;
}

const EventRow: React.FC<{ event: Event }> = ({ event }) => {
  const [showPopup, setShowPopup] = React.useState(false);
  
const handleRegister = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
    e.preventDefault();
    setShowPopup(true);
};
  
  return (
    <div className="grid grid-cols-12 gap-4 py-4 border-b" style={{ borderColor: colors.primaryLight }}>
      <div className="col-span-12 md:col-span-2">
        <div className="flex items-center text-sm" style={{ color: colors.text }}>
          <Calendar size={16} className="mr-1" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center text-sm mt-1" style={{ color: colors.textLight }}>
          <Clock size={16} className="mr-1" />
          <span>{event.time}</span>
        </div>
      </div>
      
      <div className="col-span-12 md:col-span-6">
        <h3 className="font-bold" style={{ color: colors.text }}>{event.title}</h3>
        <div className="flex items-center text-sm mt-1" style={{ color: colors.textLight }}>
          <MapPin size={16} className="mr-1" />
          <span>{event.location}</span>
        </div>
        <p className="text-sm mt-1" style={{ color: colors.textLight }}>{event.description}</p>
      </div>
      
      <div className="col-span-12 md:col-span-2 flex items-center">
        <CategoryBadge category={event.category} />
      </div>
      
      <div className="col-span-12 md:col-span-2 flex items-center">
        <a 
          href="#"
          onClick={handleRegister}
          className="inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors"
          style={{ 
            backgroundColor: colors.primary, 
            color: colors.white,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.primaryDark}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary}
        >
          Register
        </a>
      </div>
      
      {/* Registration confirmation popup */}
      <RegistrationPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)} 
        eventTitle={event.title}
      />
    </div>
  );
};

// Filter button component
interface FilterButtonProps {
  category: string;
  activeFilter: string;
  setActiveFilter: (category: string) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ category, activeFilter, setActiveFilter }) => {
  const isActive = activeFilter === category;
  
  return (
    <button
      onClick={() => setActiveFilter(category)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive ? 'shadow-md' : ''}`}
      style={{ 
        backgroundColor: isActive ? colors.primary : colors.offWhite,
        color: isActive ? colors.white : colors.text,
      }}
    >
      {category}
    </button>
  );
};

export default function EventsPage() {
  const [activeFilter, setActiveFilter] = React.useState("All");
  
  const filteredEvents = activeFilter === "All" 
    ? events 
    : events.filter(event => event.category === activeFilter);

  // Add animation styles
  const fadeInAnimation = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out;
    }
  `;

  return (
    <main className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Add the animation styles */}
      <style jsx global>{fadeInAnimation}</style>
      
      {/* Hero section */}
      <section className="relative py-16 px-4 md:px-8" style={{ backgroundColor: colors.primaryLight }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.text }}>
                Meet & Greet Events
              </h1>
              <p className="text-lg mb-6" style={{ color: colors.textLight }}>
                Join our welcoming community events designed specifically for neurodivergent children 
                and their families. Connect, learn, and grow together in a supportive environment.
              </p>
              <div className="flex space-x-4">
                <a 
                  href="#upcoming-events" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-medium transition-colors"
                  style={{ 
                    backgroundColor: colors.highlight, 
                    color: colors.white,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9A826'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.highlight}
                >
                  View Events <ArrowRight size={18} className="ml-2" />
                </a>
                <a 
                  href="#newsletter" 
                  className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-medium transition-colors"
                  style={{ 
                    backgroundColor: 'transparent', 
                    color: colors.text,
                    border: `2px solid ${colors.primary}`
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                    e.currentTarget.style.color = colors.white;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = colors.text;
                  }}
                >
                  Sign Up for Updates
                </a>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-12">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img 
                  src="/api/placeholder/500/300" 
                  alt="Community event" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className="w-full h-16"
          >
            <path 
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
              style={{ fill: colors.background }}
            ></path>
          </svg>
        </div>
      </section>
      
      {/* What to expect section */}
      <section className="py-16 px-4 md:px-8" id="what-to-expect">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: colors.text }}>
            What to Expect at Our Events
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: colors.softBlue }}>
                <Heart size={32} style={{ color: colors.text }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Supportive Environment</h3>
              <p style={{ color: colors.textLight }}>
                All our events are designed to be sensory-friendly and inclusive, with trained staff who understand neurodivergent needs.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: colors.softGreen }}>
                <Book size={32} style={{ color: colors.text }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Expert Guidance</h3>
              <p style={{ color: colors.textLight }}>
                Learn from professionals specializing in neurodiversity, education, therapy, and family support.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: colors.accent }}>
                <Users size={32} style={{ color: colors.text }} />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Community Connection</h3>
              <p style={{ color: colors.textLight }}>
                Meet other families, share experiences, and build lasting relationships with people who understand your journey.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Upcoming events section */}
      <section className="py-16 px-4 md:px-8" id="upcoming-events" style={{ backgroundColor: colors.offWhite }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-center" style={{ color: colors.text }}>
            Upcoming Events
          </h2>
          <p className="text-center mb-8 max-w-2xl mx-auto" style={{ color: colors.textLight }}>
            Browse our calendar of upcoming events for neurodivergent children and their families. 
            Registration is required for all events to ensure we can provide the best experience.
          </p>
          
          {/* Filter buttons */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <FilterButton category="All" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <FilterButton category="Children" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <FilterButton category="Teens" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <FilterButton category="Parents" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
            <FilterButton category="Family" activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          </div>
          
          {/* Events timetable */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Timetable header */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b font-bold" style={{ backgroundColor: colors.primaryLight, borderColor: colors.primary }}>
              <div className="col-span-12 md:col-span-2">Date & Time</div>
              <div className="col-span-12 md:col-span-6">Event</div>
              <div className="col-span-12 md:col-span-2">Category</div>
              <div className="col-span-12 md:col-span-2">Action</div>
            </div>
            
            {/* Events list */}
            <div className="divide-y" style={{ borderColor: colors.primaryLight }}>
              {filteredEvents.map(event => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter signup */}
      <section className="py-16 px-4 md:px-8" id="newsletter" style={{ backgroundColor: colors.softBlue }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
            Stay Updated
          </h2>
          <p className="mb-6" style={{ color: colors.textLight }}>
            Sign up for our newsletter to receive updates about upcoming events, resources, 
            and community news for neurodivergent children and their families.
          </p>
          
          <form className="flex flex-col md:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md focus:outline-none focus:ring-2"
              style={{ 
                border: `1px solid ${colors.primaryLight}`,
                backgroundColor: colors.white,
                color: colors.text,
                outline: `2px solid ${colors.primary}`
              }}
              required
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-md font-medium transition-colors"
              style={{ 
                backgroundColor: colors.primary, 
                color: colors.white,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.primaryDark}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary}
            >
              Subscribe
            </button>
          </form>
          
          <p className="mt-4 text-sm" style={{ color: colors.textLight }}>
            We respect your privacy and will never share your information.
          </p>
        </div>
      </section>
      
      {/* FAQ section */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center" style={{ color: colors.text }}>
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                Are events wheelchair accessible?
              </h3>
              <p style={{ color: colors.textLight }}>
                Yes, all our venues are wheelchair accessible. Please let us know about any specific 
                accessibility needs when you register so we can best accommodate you.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                What ages are your events designed for?
              </h3>
              <p style={{ color: colors.textLight }}>
                We offer events for children (ages 5-12), teens (ages 13-17), parents/caregivers, 
                and whole families. Each event listing specifies the intended audience.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                Do I need to stay with my child during events?
              </h3>
              <p style={{ color: colors.textLight }}>
                This depends on the event. Some events require parent/caregiver supervision, while others 
                are drop-off. The event description will clearly indicate whether parents need to stay.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
                What if my child needs to take a break during an event?
              </h3>
              <p style={{ color: colors.textLight }}>
                All our in-person events include designated quiet spaces where children can take breaks 
                if they feel overwhelmed. Staff are trained to recognize when a child might need space.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Contact section */}
      <section className="py-16 px-4 md:px-8" style={{ backgroundColor: colors.primaryLight }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: colors.text }}>
            Need More Information?
          </h2>
          <p className="mb-6" style={{ color: colors.textLight }}>
            If you have questions about our events or need assistance with registration, 
            our friendly team is here to help.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <a 
              href="mailto:events@example.com"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-medium transition-colors"
              style={{ 
                backgroundColor: colors.primary, 
                color: colors.white,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.primaryDark}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primary}
            >
              Email Us
            </a>
            <a 
              href="tel:+15551234567"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md text-base font-medium transition-colors"
              style={{ 
                backgroundColor: 'transparent', 
                color: colors.text,
                border: `2px solid ${colors.primary}`
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary;
                e.currentTarget.style.color = colors.white;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.text;
              }}
            >
              Call Us: (555) 123-4567
            </a>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 px-4 md:px-8" style={{ backgroundColor: colors.text, color: colors.white }}>
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-2">© 2025 Neurodiversity Community Center. All rights reserved.</p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="hover:underline">Terms of Service</a>
            <span>|</span>
            <a href="#" className="hover:underline">Accessibility</a>
          </div>
        </div>
      </footer>
    </main>
  );
}