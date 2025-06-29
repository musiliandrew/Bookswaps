import {
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  MapPinIcon,
  GlobeAltIcon,
  CameraIcon,
  PencilIcon,
  TagIcon
} from '@heroicons/react/24/outline';

/**
 * Calculate profile completion details from user profile
 * @param {Object} profile - User profile object
 * @returns {Object} Completion details with percentage, missing fields, etc.
 */
export const calculateProfileCompletion = (profile) => {
  if (!profile) {
    return {
      percentage: 0,
      completedWeight: 0,
      totalWeight: 100,
      missing_fields: [],
      isCompleted: false,
      completedFields: 0,
      totalFields: 0
    };
  }

  const fields = {
    // Essential (40 points total)
    username: {
      completed: !!profile.username,
      label: 'Username',
      description: 'Your unique identifier on BookSwaps',
      category: 'essential',
      weight: 20,
      icon: UserIcon,
      action: 'Edit in Profile Settings'
    },
    email: {
      completed: !!profile.email,
      label: 'Email Address',
      description: 'For notifications and account security',
      category: 'essential',
      weight: 20,
      icon: EnvelopeIcon,
      action: 'Update in Account Settings'
    },

    // Personal (30 points total)
    birth_date: {
      completed: !!profile.birth_date,
      label: 'Birth Date',
      description: 'Helps us recommend age-appropriate books',
      category: 'personal',
      weight: 15,
      icon: CalendarIcon,
      action: 'Add in Profile Settings'
    },
    gender: {
      completed: !!profile.gender,
      label: 'Gender',
      description: 'Optional demographic information',
      category: 'personal',
      weight: 15,
      icon: UserIcon,
      action: 'Select in Profile Settings'
    },

    // Location (20 points total)
    city: {
      completed: !!profile.city,
      label: 'City',
      description: 'Connect with local readers',
      category: 'location',
      weight: 10,
      icon: MapPinIcon,
      action: 'Add in Profile Settings'
    },
    country: {
      completed: !!profile.country,
      label: 'Country',
      description: 'Find readers in your region',
      category: 'location',
      weight: 10,
      icon: GlobeAltIcon,
      action: 'Add in Profile Settings'
    },

    // Social (30 points total)
    profile_picture: {
      completed: !!profile.profile_picture,
      label: 'Profile Picture',
      description: 'Help others recognize you',
      category: 'social',
      weight: 15,
      icon: CameraIcon,
      action: 'Upload in Profile Settings'
    },
    about_you: {
      completed: !!profile.about_you && profile.about_you.length > 20,
      label: 'Bio/About You',
      description: 'Tell others about your reading interests (min 20 characters)',
      category: 'social',
      weight: 15,
      icon: PencilIcon,
      action: 'Write in Profile Settings'
    },

    // Preferences (20 points total)
    favorite_genres: {
      completed: !!profile.favorite_genres && 
                (Array.isArray(profile.favorite_genres) ? profile.favorite_genres.length > 0 : 
                 profile.favorite_genres.length > 0),
      label: 'Favorite Genres',
      description: 'Get personalized book recommendations',
      category: 'preferences',
      weight: 20,
      icon: TagIcon,
      action: 'Select in Profile Settings'
    }
  };

  // Calculate totals
  const totalWeight = Object.values(fields).reduce((sum, field) => sum + field.weight, 0);
  const completedWeight = Object.values(fields)
    .filter(field => field.completed)
    .reduce((sum, field) => sum + field.weight, 0);
  
  const percentage = Math.round((completedWeight / totalWeight) * 100);

  // Group by categories
  const categories = {};
  Object.entries(fields).forEach(([key, field]) => {
    if (!categories[field.category]) {
      categories[field.category] = [];
    }
    categories[field.category].push({ ...field, field: key });
  });

  // Get missing fields sorted by weight (importance)
  const missingFields = Object.entries(fields)
    .filter(([_, field]) => !field.completed)
    .map(([key, field]) => ({ ...field, field: key }))
    .sort((a, b) => b.weight - a.weight);

  // Get completed fields count
  const completedFields = Object.values(fields).filter(f => f.completed).length;
  const totalFields = Object.keys(fields).length;

  return {
    percentage,
    completedWeight,
    totalWeight,
    categories,
    missing_fields: missingFields,
    fields_info: fields,
    isCompleted: percentage >= 100,
    completedFields,
    totalFields
  };
};

/**
 * Get completion level information based on percentage
 * @param {number} percentage - Completion percentage
 * @returns {Object} Level information with color, icon, etc.
 */
export const getCompletionLevel = (percentage) => {
  if (percentage >= 100) return { 
    level: 'Complete', 
    color: 'text-green-600', 
    bgColor: 'bg-green-100', 
    borderColor: 'border-green-200',
    emoji: '🏆',
    message: 'All features unlocked!'
  };
  if (percentage >= 80) return { 
    level: 'Advanced', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100', 
    borderColor: 'border-blue-200',
    emoji: '⭐',
    message: 'Almost perfect!'
  };
  if (percentage >= 60) return { 
    level: 'Good', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100', 
    borderColor: 'border-yellow-200',
    emoji: '🔥',
    message: 'Making great progress!'
  };
  if (percentage >= 40) return { 
    level: 'Intermediate', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100', 
    borderColor: 'border-orange-200',
    emoji: '📚',
    message: 'Good start!'
  };
  return { 
    level: 'Basic', 
    color: 'text-red-600', 
    bgColor: 'bg-red-100', 
    borderColor: 'border-red-200',
    emoji: '⚠️',
    message: "Let's build your profile!"
  };
};

/**
 * Get next milestone information
 * @param {number} percentage - Current completion percentage
 * @returns {Object} Next milestone information
 */
export const getNextMilestone = (percentage) => {
  if (percentage < 40) return { 
    target: 40, 
    reward: 'Unlock basic recommendations',
    pointsNeeded: Math.ceil((40 - percentage) * 1.4) // Rough calculation
  };
  if (percentage < 60) return { 
    target: 60, 
    reward: 'Unlock advanced matching',
    pointsNeeded: Math.ceil((60 - percentage) * 1.4)
  };
  if (percentage < 80) return { 
    target: 80, 
    reward: 'Unlock premium features',
    pointsNeeded: Math.ceil((80 - percentage) * 1.4)
  };
  if (percentage < 100) return { 
    target: 100, 
    reward: 'Profile mastery achieved!',
    pointsNeeded: Math.ceil((100 - percentage) * 1.4)
  };
  return { 
    target: 100, 
    reward: 'Profile complete!',
    pointsNeeded: 0
  };
};
