/**
 * ProfileNavigation - Mobile-optimized navigation tabs component
 * Features responsive design with icons on mobile and full labels on desktop
 */
const ProfileNavigation = ({ 
  sections, 
  activeTab, 
  onTabChange,
  className = ""
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex justify-center gap-3 sm:gap-2 p-1 rounded-lg" style={{ backgroundColor: 'var(--neutral-100)' }}>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onTabChange(section.id)}
            className={`flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-3 sm:py-2 rounded-md font-['Open_Sans'] font-medium text-xs sm:text-sm transition-all duration-200 min-w-[60px] sm:min-w-auto ${
              activeTab === section.id
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--primary)] hover:text-[var(--accent)] hover:bg-white/50'
            }`}
            title={section.label} // Tooltip for mobile users
          >
            <span className="text-lg sm:text-base">{section.icon}</span>
            <span className="hidden sm:inline text-xs sm:text-sm">{section.label}</span>
            {/* Show label below icon on mobile only when active */}
            <span className={`sm:hidden text-xs mt-1 transition-all duration-200 ${
              activeTab === section.id ? 'opacity-100' : 'opacity-0'
            }`}>
              {section.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileNavigation;
