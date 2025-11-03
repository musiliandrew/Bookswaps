/**
 * SettingsNavigation - Navigation tabs component for settings pages
 * Features mobile-optimized design with status indicators and responsive layout
 */
const SettingsNavigation = ({ 
  sections, 
  activeSection, 
  onSectionChange,
  className = ""
}) => {
  return (
    <div className={`mb-4 sm:mb-6 ${className}`}>
      <div className="flex justify-center gap-3 sm:gap-2 p-1 card rounded-lg">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`relative flex flex-col sm:flex-row items-center gap-1 sm:gap-1.5 px-3 sm:px-3 md:px-4 py-3 sm:py-2 rounded-md font-['Open_Sans'] font-medium text-xs sm:text-sm transition-all duration-200 min-w-[60px] sm:min-w-auto ${
              activeSection === section.id
                ? 'bg-[var(--accent)] text-[var(--primary)] shadow-sm'
                : 'text-[var(--text)] hover:text-[var(--primary)] hover:bg-white/50'
            }`}
            title={section.label} // Tooltip for mobile users
          >
            <span className="text-lg sm:text-base">{section.icon}</span>
            <span className="hidden sm:inline text-xs sm:text-sm">{section.label}</span>
            {/* Show label below icon on mobile only when active */}
            <span className={`sm:hidden text-xs mt-1 transition-all duration-200 ${
              activeSection === section.id ? 'opacity-100' : 'opacity-0'
            }`}>
              {section.label}
            </span>

            {/* Status indicators */}
            {section.status === 'incomplete' && section.count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {section.count}
              </span>
            )}
            {section.status === 'danger' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsNavigation;
