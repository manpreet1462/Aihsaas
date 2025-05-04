// lib/communityData.ts
export const defaultGroups = [
    {
      name: "Cerebral Palsy Support Network",
      description: "A community for parents of children with cerebral palsy to share experiences and advice",
      tags: ["Cerebral Palsy", "Physical Therapy", "Mobility"],
      isPrivate: false
    },
    {
      name: "Autism Parents United",
      description: "Support group for parents navigating autism spectrum disorders",
      tags: ["Autism", "ASD", "Sensory Processing"],
      isPrivate: false
    },
    {
      name: "Developmental Delays Support",
      description: "For parents of children with various developmental delays",
      tags: ["Developmental Delay", "Speech Delay", "Motor Skills"],
      isPrivate: false
    }
  ];
  
  export const conditionTags = {
    "Cerebral Palsy": ["Mobility", "Physical Therapy", "Occupational Therapy"],
    "Autism Spectrum Disorder": ["ASD", "Sensory Processing", "Communication"],
    "Down Syndrome": ["Trisomy 21", "Development", "Healthcare"],
    "ADHD": ["Attention", "Behavior", "Focus"],
    "Developmental Delay": ["Milestones", "Early Intervention", "Progress"],
    "Speech Delay": ["Communication", "Language", "Speech Therapy"],
    "Sensory Processing Disorder": ["SPD", "Sensory Integration", "Regulation"]
  };