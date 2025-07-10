import { calculateProfileCompletion } from '../../../utils/profileCompletion';

/**
 * SettingsHeader - Header component for settings pages
 * Features profile completion status and responsive design
 */
const SettingsHeader = ({ 
  profile,
  title = "Settings",
  subtitle = "Manage your profile and account preferences",
  showCompletion = true 
}) => {
  const profileCompletion = calculateProfileCompletion(profile);

  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl font-['Lora'] font-bold text-[var(--primary)] mb-2">
        {title}
      </h1>
      <p className="text-xs sm:text-sm text-[var(--text)] font-['Open_Sans']">
        {subtitle}
      </p>

      {/* Profile Completion Status */}
      {showCompletion && profile && (
        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-xs sm:text-sm font-bold">
                {profileCompletion.percentage}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-medium text-blue-800">Profile Completion</h3>
              <p className="text-xs text-blue-600 truncate">
                {profileCompletion.missing_fields.length} fields remaining
                {profileCompletion.missing_fields.length > 0 && (
                  <span className="hidden sm:inline ml-2 text-orange-600">
                    ({profileCompletion.missing_fields.slice(0, 2).map(f => f.label).join(', ')}
                    {profileCompletion.missing_fields.length > 2 && `, +${profileCompletion.missing_fields.length - 2} more`})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsHeader;
