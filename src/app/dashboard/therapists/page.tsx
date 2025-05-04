'use client'

import { useState } from 'react';
import Head from 'next/head'
import Link from 'next/link';

// Types for our application
type TherapistSpecialty = 'cerebral-palsy' | 'autism' | 'both';
type TimeSlot = { id: string; time: string; available: boolean };

interface Therapist {
    id: string;
    name: string;
    specialty: TherapistSpecialty;
    experience: number;
    bio: string;
    availability: string[];
    imageUrl: string;
    rating: number;
    location: string;
    languages: string[];
    education: string[];
    approach: string;
    testimonials: { author: string; text: string }[];
    timeSlots: {
        [day: string]: TimeSlot[];
    };
}

// Expanded therapist data with Indian names and additional profile information
const therapistsData: Therapist[] = [
    {
        id: '1',
        name: 'Dr. Priya Sharma',
        specialty: 'cerebral-palsy',
        experience: 12,
        bio: 'Specialized in helping individuals with cerebral palsy improve motor function and communication. Trained at AIIMS Delhi.',
        availability: ['Monday', 'Wednesday', 'Friday'],
        imageUrl: '/api/placeholder/150/150',
        rating: 4.9,
        location: 'Mumbai',
        languages: ['English', 'Hindi', 'Marathi'],
        education: ['MD Pediatrics, AIIMS Delhi', 'Fellowship in Neurodevelopmental Disorders, London'],
        approach: 'I focus on personalized therapy that integrates family support with evidence-based techniques. My approach emphasizes gradual motor skill development with consistent practice and positive reinforcement.',
        testimonials: [
            { author: 'Rahul M.', text: 'Dr. Sharma has been incredible for my daughter. Her motor skills have improved significantly in just 6 months.' },
            { author: 'Anita K.', text: 'The most patient and understanding doctor we have ever worked with. She makes therapy sessions enjoyable for my child.' }
        ],
        timeSlots: {
            'Monday': [
                { id: 'm1', time: '9:00 AM', available: true },
                { id: 'm2', time: '11:00 AM', available: true },
                { id: 'm3', time: '2:00 PM', available: false },
                { id: 'm4', time: '4:00 PM', available: true },
            ],
            'Wednesday': [
                { id: 'w1', time: '10:00 AM', available: true },
                { id: 'w2', time: '1:00 PM', available: true },
                { id: 'w3', time: '3:00 PM', available: true },
            ],
            'Friday': [
                { id: 'f1', time: '9:00 AM', available: false },
                { id: 'f2', time: '11:00 AM', available: true },
                { id: 'f3', time: '2:00 PM', available: true },
            ]
        }
    },
    {
        id: '2',
        name: 'Dr. Rajesh Patel',
        specialty: 'autism',
        experience: 8,
        bio: 'Focused on behavioral therapy and social skills development for people with autism. Uses innovative techniques for communication development.',
        availability: ['Tuesday', 'Thursday', 'Saturday'],
        imageUrl: '/api/placeholder/150/150',
        rating: 4.7,
        location: 'Delhi',
        languages: ['English', 'Hindi', 'Gujarati'],
        education: ['PhD in Clinical Psychology, Delhi University', 'Certification in ABA Therapy'],
        approach: 'I believe in creating a structured environment while encouraging creativity and self-expression. My therapy sessions focus on building communication skills and emotional regulation through playful interactions.',
        testimonials: [
            { author: 'Meera S.', text: 'Dr. Patel has helped our son come out of his shell. His approach makes learning social skills fun.' },
            { author: 'Vikrant J.', text: 'We\'ve seen remarkable progress in our child\'s communication abilities since starting therapy with Dr. Patel.' }
        ],
        timeSlots: {
            'Tuesday': [
                { id: 't1', time: '10:00 AM', available: true },
                { id: 't2', time: '1:00 PM', available: false },
                { id: 't3', time: '3:00 PM', available: true },
            ],
            'Thursday': [
                { id: 'th1', time: '9:00 AM', available: true },
                { id: 'th2', time: '11:00 AM', available: true },
                { id: 'th3', time: '4:00 PM', available: true },
            ],
            'Saturday': [
                { id: 's1', time: '10:00 AM', available: true },
                { id: 's2', time: '12:00 PM', available: true },
            ]
        }
    },
    {
        id: '3',
        name: 'Dr. Ananya Krishnan',
        specialty: 'both',
        experience: 15,
        bio: 'Extensive experience with both cerebral palsy and autism, focusing on holistic approaches. Pioneer in sensory integration therapy.',
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
        imageUrl: '/api/placeholder/150/150',
        rating: 5.0,
        location: 'Bangalore',
        languages: ['English', 'Tamil', 'Kannada'],
        education: ['MD Neurology, NIMHANS Bangalore', 'Advanced Training in Sensory Integration'],
        approach: 'I take a holistic approach that combines neurological expertise with compassionate care. Each therapy plan is tailored to the individual\'s unique needs, focusing on both physical and cognitive development simultaneously.',
        testimonials: [
            { author: 'Lakshmi R.', text: 'Dr. Krishnan\'s holistic approach has been life-changing for our family. She treats the whole person, not just symptoms.' },
            { author: 'Sanjay M.', text: 'The most knowledgeable specialist we\'ve found who understands both CP and autism. Her integrated approach works wonders.' }
        ],
        timeSlots: {
            'Monday': [
                { id: 'em1', time: '8:00 AM', available: true },
                { id: 'em2', time: '10:00 AM', available: false },
                { id: 'em3', time: '3:00 PM', available: true },
            ],
            'Tuesday': [
                { id: 'et1', time: '11:00 AM', available: true },
                { id: 'et2', time: '2:00 PM', available: true },
            ],
            'Wednesday': [
                { id: 'ew1', time: '9:00 AM', available: true },
                { id: 'ew2', time: '1:00 PM', available: true },
            ],
            'Friday': [
                { id: 'ef1', time: '10:00 AM', available: true },
                { id: 'ef2', time: '2:00 PM', available: false },
                { id: 'ef3', time: '4:00 PM', available: true },
            ]
        }
    },
    {
        id: '4',
        name: 'Dr. Vikram Singh',
        specialty: 'cerebral-palsy',
        experience: 10,
        bio: 'Specialized in physical therapy for cerebral palsy patients. Develops personalized exercise programs for mobility improvement.',
        availability: ['Monday', 'Wednesday', 'Friday'],
        imageUrl: '/api/placeholder/150/150',
        rating: 4.8,
        location: 'Hyderabad',
        languages: ['English', 'Hindi', 'Telugu'],
        education: ['MS Physical Therapy, Hyderabad Medical College', 'Certified Pediatric Rehabilitation Specialist'],
        approach: 'My therapy programs build strength and confidence through targeted physical exercises. I incorporate play-based activities to make therapy enjoyable while achieving measurable progress in mobility and coordination.',
        testimonials: [
            { author: 'Pradeep K.', text: 'Dr. Singh\'s exercise program has helped my son gain remarkable control over his movements.' },
            { author: 'Sunita G.', text: 'We\'ve tried many therapists, but Dr. Singh\'s methods have shown the most consistent improvements for our child.' }
        ],
        timeSlots: {
            'Monday': [
                { id: 'vm1', time: '9:30 AM', available: true },
                { id: 'vm2', time: '11:30 AM', available: true },
                { id: 'vm3', time: '3:30 PM', available: true },
            ],
            'Wednesday': [
                { id: 'vw1', time: '10:30 AM', available: false },
                { id: 'vw2', time: '1:30 PM', available: true },
                { id: 'vw3', time: '4:30 PM', available: true },
            ],
            'Friday': [
                { id: 'vf1', time: '9:30 AM', available: true },
                { id: 'vf2', time: '2:30 PM', available: true },
            ]
        }
    },
    {
        id: '5',
        name: 'Dr. Meera Joshi',
        specialty: 'autism',
        experience: 9,
        bio: 'Specialist in cognitive behavioral therapy for autism. Helps patients develop social skills and emotional regulation.',
        availability: ['Tuesday', 'Thursday', 'Saturday'],
        imageUrl: '/api/placeholder/150/150',
        rating: 4.6,
        location: 'Pune',
        languages: ['English', 'Hindi', 'Marathi'],
        education: ['PhD Clinical Psychology, Pune University', 'Specialized Training in Cognitive Behavioral Therapy'],
        approach: 'I use evidence-based cognitive behavioral techniques adapted specifically for children with autism. My sessions focus on developing emotional awareness, social cues recognition, and practical communication strategies.',
        testimonials: [
            { author: 'Nandini P.', text: 'Dr. Joshi has given our son tools to understand his emotions and express himself better.' },
            { author: 'Deepak R.', text: 'The progress we\'ve seen in our daughter\'s social interactions since working with Dr. Joshi has been remarkable.' }
        ],
        timeSlots: {
            'Tuesday': [
                { id: 'mt1', time: '9:00 AM', available: true },
                { id: 'mt2', time: '12:00 PM', available: false },
                { id: 'mt3', time: '3:00 PM', available: true },
            ],
            'Thursday': [
                { id: 'mth1', time: '10:00 AM', available: true },
                { id: 'mth2', time: '2:00 PM', available: true },
            ],
            'Saturday': [
                { id: 'ms1', time: '9:00 AM', available: false },
                { id: 'ms2', time: '11:00 AM', available: true },
                { id: 'ms3', time: '1:00 PM', available: true },
            ]
        }
    },
    {
        id: '6',
        name: 'Dr. Arjun Desai',
        specialty: 'both',
        experience: 14,
        bio: 'Specializes in integrating multiple therapy approaches for individuals with both cerebral palsy and autism. Focus on family-centered care.',
        availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        imageUrl: '/api/placeholder/150/150',
        rating: 4.9,
        location: 'Chennai',
        languages: ['English', 'Tamil', 'Hindi'],
        education: ['MD Developmental Pediatrics, Chennai Medical College', 'Fellowship in Neurodevelopmental Disorders'],
        approach: 'I believe in empowering families through collaborative therapy. My integrated approach addresses both physical and cognitive challenges simultaneously, with an emphasis on functional skills for daily living.',
        testimonials: [
            { author: 'Kavita T.', text: 'Dr. Desai works with the entire family, teaching us how to continue therapy at home. This has accelerated our child\'s progress.' },
            { author: 'Rajiv S.', text: 'The comprehensive approach Dr. Desai takes has helped address all aspects of our son\'s development. Truly exceptional care.' }
        ],
        timeSlots: {
            'Monday': [
                { id: 'am1', time: '8:30 AM', available: true },
                { id: 'am2', time: '11:30 AM', available: true },
                { id: 'am3', time: '2:30 PM', available: false },
            ],
            'Wednesday': [
                { id: 'aw1', time: '9:30 AM', available: true },
                { id: 'aw2', time: '1:30 PM', available: true },
            ],
            'Friday': [
                { id: 'af1', time: '10:30 AM', available: false },
                { id: 'af2', time: '3:30 PM', available: true },
            ],
            'Saturday': [
                { id: 'as1', time: '9:30 AM', available: true },
                { id: 'as2', time: '12:30 PM', available: true },
            ]
        }
    },
];

export default function Home() {
    const [selectedSpecialty, setSelectedSpecialty] = useState<TherapistSpecialty | 'all'>('all');
    const [expandedTherapist, setExpandedTherapist] = useState<string | null>(null);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [viewingTherapist, setViewingTherapist] = useState<Therapist | null>(null);
    const [bookingTherapist, setBookingTherapist] = useState<Therapist | null>(null);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [locationFilter, setLocationFilter] = useState<string | 'all'>('all');

    // New color scheme
    const colors = {
        primary: '#D6BC8B',       // Warm golden taupe
        secondary: '#B8976C',     // Darker golden taupe
        light: '#E8D4AF',         // Light warm beige
        medium: '#94785A',        // Medium warm taupe
        accent: '#FFCF8B',        // Soft peachy/apricot accent
        highlight: '#FFB347',     // Mango/orange highlight
        darkText: '#5D4B36',      // Dark taupe for text
        lightText: '#7A6A5F',     // Lighter text color
        background: '#FBF7F1',    // Light background
    };

    // Get unique locations for filter
    const locations = ['all', ...Array.from(new Set(therapistsData.map(t => t.location)))];

    // Filter therapists based on specialty, location and search query
    const filteredTherapists = therapistsData.filter(therapist => {
        // Specialty filter
        const matchesSpecialty = selectedSpecialty === 'all' ||
            therapist.specialty === selectedSpecialty ||
            therapist.specialty === 'both';

        // Location filter
        const matchesLocation = locationFilter === 'all' ||
            therapist.location === locationFilter;

        // Search query filter (name, bio, or location)
        const matchesSearch = searchQuery === '' ||
            therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            therapist.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
            therapist.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            therapist.languages.some(lang => lang.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesSpecialty && matchesLocation && matchesSearch;
    });

    const toggleExpandTherapist = (therapistId: string) => {
        setExpandedTherapist(expandedTherapist === therapistId ? null : therapistId);
        setSelectedDay(null);
        setSelectedTimeSlot(null);
    };

    const handleDaySelect = (day: string) => {
        setSelectedDay(day);
        setSelectedTimeSlot(null);
    };

    const handleTimeSlotSelect = (timeSlotId: string) => {
        setSelectedTimeSlot(timeSlotId);
    };

    const openBookingModal = (therapist: Therapist) => {
        setBookingTherapist(therapist);
        setIsBookingModalOpen(true);
    };

    const closeBookingModal = () => {
        setIsBookingModalOpen(false);
        setBookingSuccess(false);
    };

    const openProfileModal = (therapist: Therapist) => {
        setViewingTherapist(therapist);
        setIsProfileModalOpen(true);
    };

    const closeProfileModal = () => {
        setIsProfileModalOpen(false);
    };

    const handleBooking = () => {
        // Here you would handle the actual booking logic with an API call
        setBookingSuccess(true);
        // Reset selections after successful booking
        setTimeout(() => {
            setIsBookingModalOpen(false);
            setBookingSuccess(false);
            setSelectedDay(null);
            setSelectedTimeSlot(null);
            setExpandedTherapist(null);
        }, 3000);
    };

    // Stars for ratings
    const renderStars = (rating: number) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`} style={{ color: colors.highlight }} className="text-lg">★</span>);
        }

        if (hasHalfStar) {
            stars.push(<span key="half" style={{ color: colors.highlight }} className="text-lg">★</span>);
        }

        const remainingStars = 5 - stars.length;
        for (let i = 0; i < remainingStars; i++) {
            stars.push(<span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>);
        }

        return stars;
    };

    return (
        <div style={{ backgroundColor: colors.background }} className="min-h-screen">
            <Head>
                <title>TherapyConnect - Helping Those with CP and Autism</title>
                <meta name="description" content="Connect with specialized therapists for cerebral palsy and autism" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <header style={{ backgroundColor: colors.medium }} className="shadow-lg">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="text-white text-2xl font-bold">TherapyConnect</span>
                        </div>
                        <Link href='/dashboard'><button
                            style={{ backgroundColor: colors.accent, color: colors.darkText }}
                            className="px-4 py-2 rounded-md font-medium hover:opacity-90 transition duration-300"
                        >
                            Go to Dashboard
                        </button></Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <section className="mb-12">
                    <div
                        style={{
                            background: `linear-gradient(to right, ${colors.medium}, ${colors.secondary})`,
                        }}
                        className="rounded-xl p-8 text-white shadow-xl"
                    >
                        <h1 className="text-4xl font-bold mb-4">Specialized Therapy Support</h1>
                        <p className="text-xl mb-6">Connecting individuals with cerebral palsy and autism to qualified therapists for personalized consultations and support.</p>
                    </div>
                </section>

                <section className="mb-12">
                    <h2 style={{ color: colors.darkText }} className="text-3xl font-bold mb-6">Find a Therapist</h2>

                    {/* Enhanced search and filter section */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label style={{ color: colors.darkText }} className="block mb-2">Search therapists:</label>
                                <input
                                    type="text"
                                    placeholder="Search by name, location, language..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        borderColor: colors.light,
                                        color: 'black', // Ensures text is black
                                        backgroundColor: 'white' // Ensures background is white
                                    }}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label style={{ color: colors.darkText }} className="block mb-2">Specialty:</label>
                                <select
                                    style={{
                                        borderColor: colors.light,
                                        color: 'black' // This will make the selected option text black
                                    }}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:border-transparent"
                                    value={selectedSpecialty}
                                    onChange={(e) => setSelectedSpecialty(e.target.value as TherapistSpecialty | 'all')}
                                >
                                    <option value="all" style={{ color: 'black' }}>All Specialties</option>
                                    <option value="cerebral-palsy" style={{ color: 'black' }}>Cerebral Palsy</option>
                                    <option value="autism" style={{ color: 'black' }}>Autism</option>
                                    <option value="both" style={{ color: 'black' }}>Both CP & Autism</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ color: colors.darkText }} className="block mb-2">Location:</label>
                                <select
                                    style={{
                                        borderColor: colors.light,
                                        color: 'black' // This makes the selected value text black
                                    }}
                                    className="w-full p-2 border rounded-md focus:ring-2 focus:border-transparent"
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                >
                                    {locations.map(location => (
                                        <option
                                            key={location}
                                            value={location}
                                            style={{ color: 'black' }} // This makes dropdown options text black
                                        >
                                            {location === 'all' ? 'All Locations' : location}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedSpecialty('all'); setLocationFilter('all'); }}
                                    style={{ backgroundColor: colors.medium }}
                                    className="w-full text-white p-2 rounded-md hover:opacity-90 transition duration-300"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results count */}
                    <div className="mb-6">
                        <p style={{ color: colors.lightText }} className="text-stone-600">
                            Showing {filteredTherapists.length} therapists {searchQuery && `matching "${searchQuery}"`}
                        </p>
                    </div>

                    {/* Therapist cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTherapists.length > 0 ? (
                            filteredTherapists.map((therapist) => (
                                <div key={therapist.id}
                                    className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg ${expandedTherapist === therapist.id ? 'ring-2' : ''
                                        }`}
                                    style={{
                                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        ...(expandedTherapist === therapist.id ? { ringColor: colors.primary } : {})
                                    }}
                                >
                                    <div className="p-6">
                                        <div className="flex items-center mb-4">
                                            <img
                                                src={therapist.imageUrl}
                                                alt={therapist.name}
                                                style={{ borderColor: colors.light }}
                                                className="w-16 h-16 rounded-full mr-4 object-cover border-2"
                                            />
                                            <div>
                                                <h3 style={{ color: colors.darkText }} className="text-xl font-bold">{therapist.name}</h3>
                                                <p style={{ color: colors.lightText }}>
                                                    {therapist.specialty === 'cerebral-palsy' ? 'Cerebral Palsy Specialist' :
                                                        therapist.specialty === 'autism' ? 'Autism Specialist' :
                                                            'CP & Autism Specialist'}
                                                </p>
                                                <div className="flex mt-1">
                                                    {renderStars(therapist.rating)}
                                                    <span style={{ color: colors.lightText }} className="ml-1 text-sm">({therapist.rating})</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4 flex flex-wrap gap-1">
                                            <span style={{ backgroundColor: colors.light, color: colors.darkText }} className="px-2 py-1 rounded-md text-sm">
                                                {therapist.location}
                                            </span>
                                            {therapist.languages.map(lang => (
                                                <span key={lang} style={{ backgroundColor: colors.background, color: colors.darkText }} className="px-2 py-1 rounded-md text-sm">
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>

                                        <p style={{ color: colors.lightText }} className="mb-4">{therapist.bio}</p>
                                        <div style={{ color: colors.darkText }} className="mb-4">
                                            <span className="font-medium">Experience:</span> {therapist.experience} years
                                        </div>
                                        <div style={{ color: colors.darkText }} className="mb-6">
                                            <span className="font-medium">Available on:</span> {therapist.availability.join(', ')}
                                        </div>

                                        <div className="flex justify-between mb-4">
                                            <button
                                                onClick={() => toggleExpandTherapist(therapist.id)}
                                                style={{ backgroundColor: colors.primary, color: colors.darkText }}
                                                className="px-4 py-2 rounded-md hover:opacity-90 transition duration-300 shadow font-medium"
                                            >
                                                {expandedTherapist === therapist.id ? 'Hide Schedule' : 'View Schedule'}
                                            </button>
                                            <button
                                                onClick={() => openProfileModal(therapist)}
                                                style={{ borderColor: colors.secondary, color: colors.darkText }}
                                                className="border px-4 py-2 rounded-md hover:bg-opacity-10 hover:bg-yellow-100 transition duration-300 font-medium"
                                            >
                                                View Profile
                                            </button>
                                        </div>

                                        {expandedTherapist === therapist.id && (
                                            <div style={{ borderColor: colors.light }} className="mt-4 pt-4 border-t">
                                                <h4 style={{ color: colors.darkText }} className="font-medium mb-3">Select a day:</h4>
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {therapist.availability.map(day => (
                                                        <button
                                                            key={day}
                                                            onClick={() => handleDaySelect(day)}
                                                            style={selectedDay === day ?
                                                                { backgroundColor: colors.medium, color: 'white' } :
                                                                { backgroundColor: colors.light, color: colors.darkText }
                                                            }
                                                            className="px-3 py-1 rounded-md transition duration-300 hover:opacity-90"
                                                        >
                                                            {day}
                                                        </button>
                                                    ))}
                                                </div>

                                                {selectedDay && therapist.timeSlots[selectedDay] && (
                                                    <>
                                                        <h4 style={{ color: colors.darkText }} className="font-medium mb-3">Available time slots:</h4>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                                                            {therapist.timeSlots[selectedDay].map(slot => (
                                                                <button
                                                                    key={slot.id}
                                                                    disabled={!slot.available}
                                                                    onClick={() => slot.available && handleTimeSlotSelect(slot.id)}
                                                                    style={
                                                                        !slot.available ?
                                                                            { backgroundColor: colors.background, color: '#aaa', cursor: 'not-allowed' } :
                                                                            selectedTimeSlot === slot.id ?
                                                                                { backgroundColor: colors.medium, color: 'white' } :
                                                                                { backgroundColor: colors.light, color: colors.darkText }
                                                                    }
                                                                    className="px-3 py-2 rounded-md transition duration-300 hover:opacity-90"
                                                                >
                                                                    {slot.time}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        {selectedTimeSlot && (
                                                            <button
                                                                onClick={() => openBookingModal(therapist)}
                                                                style={{ backgroundColor: colors.highlight, color: colors.darkText }}
                                                                className="w-full py-2 rounded-md hover:opacity-90 transition duration-300 font-medium"
                                                            >
                                                                Book Appointment
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 py-8 text-center">
                                <p style={{ color: colors.lightText }} className="text-xl">No therapists found matching your criteria.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedSpecialty('all'); setLocationFilter('all'); }}
                                    style={{ backgroundColor: colors.medium }}
                                    className="mt-4 text-white px-6 py-2 rounded-md hover:opacity-90 transition duration-300"
                                >
                                    Reset Search
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            {/* Profile Modal */}
            {isProfileModalOpen && viewingTherapist && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div
                        style={{ backgroundColor: colors.background, maxWidth: '800px' }}
                        className="rounded-lg shadow-xl w-full p-0 overflow-hidden"
                    >
                        <div style={{ backgroundColor: colors.medium }} className="p-6 text-white">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-bold">Therapist Profile
                                </h3>
                                <button
                                    onClick={closeProfileModal}
                                    className="text-white hover:text-gray-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <div className="flex flex-col md:flex-row md:items-start gap-6 mb-8">
                                <img
                                    src={viewingTherapist.imageUrl}
                                    alt={viewingTherapist.name}
                                    style={{ borderColor: colors.primary }}
                                    className="w-32 h-32 rounded-full object-cover border-4 mx-auto md:mx-0"
                                />
                                <div className="flex-1">
                                    <h2 style={{ color: colors.darkText }} className="text-2xl font-bold mb-2">{viewingTherapist.name}</h2>
                                    <p style={{ color: colors.primary }} className="text-lg font-medium mb-2">
                                        {viewingTherapist.specialty === 'cerebral-palsy' ? 'Cerebral Palsy Specialist' :
                                            viewingTherapist.specialty === 'autism' ? 'Autism Specialist' :
                                                'CP & Autism Specialist'}
                                    </p>
                                    <div className="flex mb-4">
                                        {renderStars(viewingTherapist.rating)}
                                        <span style={{ color: colors.lightText }} className="ml-2">({viewingTherapist.rating})</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p style={{ color: colors.darkText }} className="font-medium">Location:</p>
                                            <p style={{ color: colors.lightText }}>{viewingTherapist.location}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: colors.darkText }} className="font-medium">Experience:</p>
                                            <p style={{ color: colors.lightText }}>{viewingTherapist.experience} years</p>
                                        </div>
                                        <div>
                                            <p style={{ color: colors.darkText }} className="font-medium">Languages:</p>
                                            <p style={{ color: colors.lightText }}>{viewingTherapist.languages.join(', ')}</p>
                                        </div>
                                        <div>
                                            <p style={{ color: colors.darkText }} className="font-medium">Available on:</p>
                                            <p style={{ color: colors.lightText }}>{viewingTherapist.availability.join(', ')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 style={{ color: colors.medium }} className="text-xl font-bold mb-3">About</h3>
                                <p style={{ color: colors.darkText }} className="mb-4">{viewingTherapist.bio}</p>
                            </div>

                            <div className="mb-8">
                                <h3 style={{ color: colors.medium }} className="text-xl font-bold mb-3">Education & Qualifications</h3>
                                <ul style={{ color: colors.darkText }} className="list-disc pl-5 space-y-1">
                                    {viewingTherapist.education.map((edu, index) => (
                                        <li key={index}>{edu}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mb-8">
                                <h3 style={{ color: colors.medium }} className="text-xl font-bold mb-3">Therapeutic Approach</h3>
                                <p style={{ color: colors.darkText }}>{viewingTherapist.approach}</p>
                            </div>

                            <div className="mb-8">
                                <h3 style={{ color: colors.medium }} className="text-xl font-bold mb-3">Patient Testimonials</h3>
                                <div className="space-y-4">
                                    {viewingTherapist.testimonials.map((testimonial, index) => (
                                        <div key={index} style={{ backgroundColor: colors.light, borderLeftColor: colors.primary }} className="p-4 rounded-md border-l-4">
                                            <p style={{ color: colors.darkText }} className="italic mb-2">"{testimonial.text}"</p>
                                            <p style={{ color: colors.medium }} className="text-right font-medium">— {testimonial.author}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 style={{ color: colors.medium }} className="text-xl font-bold mb-3">Availability</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {viewingTherapist.availability.map(day => (
                                        <div key={day} className="mb-2">
                                            <h4 style={{ color: colors.darkText }} className="font-medium mb-1">{day}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {viewingTherapist.timeSlots[day].map(slot => (
                                                    <span
                                                        key={slot.id}
                                                        style={{
                                                            backgroundColor: slot.available ? colors.accent : colors.background,
                                                            color: colors.darkText,
                                                            opacity: slot.available ? 1 : 0.5
                                                        }}
                                                        className="px-3 py-1 rounded-md text-sm"
                                                    >
                                                        {slot.time} {!slot.available && '(Booked)'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={() => {
                                        closeProfileModal();
                                        const therapist = viewingTherapist;
                                        setTimeout(() => {
                                            setExpandedTherapist(therapist.id);
                                            setSelectedDay(therapist.availability[0] || null);
                                        }, 100);
                                    }}
                                    style={{ backgroundColor: colors.highlight, color: colors.darkText }}
                                    className="px-8 py-3 rounded-md hover:opacity-90 transition duration-300 font-medium"
                                >
                                    Schedule an Appointment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Booking Modal */}
            {isBookingModalOpen && bookingTherapist && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div style={{ backgroundColor: colors.background }} className="rounded-lg shadow-xl max-w-md w-full p-6">
                        {bookingSuccess ? (
                            <div className="text-center">
                                <div style={{ backgroundColor: '#e7f5ea', color: '#2a603b' }} className="p-4 rounded-lg mb-4">
                                    <h3 className="text-xl font-bold mb-2">Booking Confirmed!</h3>
                                    <p>Your appointment with {bookingTherapist.name} has been scheduled.</p>
                                </div>
                                <p style={{ color: colors.lightText }} className="mb-4">A confirmation email has been sent to your registered email address.</p>
                                <button
                                    onClick={closeBookingModal}
                                    style={{ backgroundColor: colors.primary, color: colors.darkText }}
                                    className="px-6 py-2 rounded-md hover:opacity-90 transition duration-300 font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 style={{ color: colors.darkText }} className="text-xl font-bold">Book Appointment</h3>
                                    <button
                                        onClick={closeBookingModal}
                                        style={{ color: colors.lightText }}
                                        className="hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={bookingTherapist.imageUrl}
                                            alt={bookingTherapist.name}
                                            style={{ borderColor: colors.light }}
                                            className="w-16 h-16 rounded-full mr-4 object-cover border-2"
                                        />
                                        <div>
                                            <h4 style={{ color: colors.darkText }} className="text-lg font-bold">{bookingTherapist.name}</h4>
                                            <p style={{ color: colors.lightText }}>
                                                {bookingTherapist.specialty === 'cerebral-palsy' ? 'Cerebral Palsy Specialist' :
                                                    bookingTherapist.specialty === 'autism' ? 'Autism Specialist' :
                                                        'CP & Autism Specialist'}
                                            </p>
                                            <p style={{ color: colors.lightText }} className="text-sm">{bookingTherapist.location}</p>
                                        </div>
                                    </div>

                                    {selectedDay && selectedTimeSlot && bookingTherapist.timeSlots[selectedDay]?.find(slot => slot.id === selectedTimeSlot) && (
                                        <div style={{ backgroundColor: colors.light }} className="p-4 rounded-lg mb-4">
                                            <p style={{ color: colors.darkText }} className="font-medium">Selected Appointment:</p>
                                            <p style={{ color: colors.darkText }}>
                                                {selectedDay} at {bookingTherapist.timeSlots[selectedDay].find(slot => slot.id === selectedTimeSlot)?.time}
                                            </p>
                                        </div>
                                    )}

                                    <div className="space-y-4 mt-4">
                                        <div>
                                            <label style={{ color: colors.darkText }} className="block mb-1">Appointment Type</label>
                                            <select
                                                style={{
                                                    borderColor: colors.light,
                                                    color: 'black', // Ensures selected text is black
                                                    backgroundColor: 'white' // Ensures white background
                                                }}
                                                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option>Initial Consultation (60 min)</option>
                                                <option>Follow-up Session (45 min)</option>
                                                <option>Extended Session (90 min)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label style={{ color: colors.darkText }} className="block mb-1">Consultation Format</label>
                                            <div className="flex gap-4">
                                                <label className="flex items-center">
                                                    <input type="radio" name="format" className="mr-2" defaultChecked />
                                                    <span style={{ color: colors.darkText }}>Virtual</span>
                                                </label>
                                                <label className="flex items-center">
                                                    <input type="radio" name="format" className="mr-2" />
                                                    <span style={{ color: colors.darkText }}>In-person</span>
                                                </label>
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ color: colors.darkText }} className="block mb-1">Additional Notes (optional)</label>
                                            <textarea
                                                style={{
                                                    borderColor: colors.light,
                                                    color: 'black', // Ensures selected text is black
                                                    backgroundColor: 'white' // Ensures white background
                                                }}
                                                className="w-full p-2 border rounded-md h-24 resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                                placeholder="Let the therapist know about any specific concerns or questions"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3">
                                    <button
                                        onClick={closeBookingModal}
                                        style={{ borderColor: colors.light, color: colors.darkText }}
                                        className="px-4 py-2 border rounded-md hover:bg-gray-50 transition duration-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleBooking}
                                        style={{ backgroundColor: colors.highlight, color: colors.darkText }}
                                        className="px-6 py-2 rounded-md hover:opacity-90 transition duration-300 font-medium"
                                    >
                                        Confirm Booking
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}