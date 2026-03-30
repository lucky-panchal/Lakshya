import { motion } from "framer-motion";

/**
 * Professional Layout Component
 * Demonstrates senior-level alignment patterns: left, center, right positioning
 * with proper vertical spacing and responsive design
 */
export function ProfessionalLayout({ children, className = "", fullWidth = false, compact = false }) {
  const containerClass = fullWidth ? "full-width-container" : "content-container";
  const spacingClass = compact ? "py-4" : "section-spacing";
  
  return (
    <div className={`${containerClass} ${spacingClass} ${className}`}>
      {children}
    </div>
  );
}

// Set as default export as well
export default ProfessionalLayout;

// Professional Header Component - Left title, Right actions
export function ProfessionalHeader({ 
  title, 
  subtitle, 
  leftContent, 
  rightContent, 
  centerContent,
  className = "" 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -16 }} 
      animate={{ opacity: 1, y: 0 }}
      className={`grid grid-cols-3 items-start gap-6 mb-8 ${className}`}
    >
      {/* Left - Title & Subtitle */}
      <div className="flex flex-col justify-start">
        {leftContent || (
          <div>
            {title && (
              <h1 className="text-3xl font-bold text-white tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
            )}
          </div>
        )}
      </div>

      {/* Center - Optional content */}
      <div className="flex items-center justify-center">
        {centerContent}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center justify-end">
        {rightContent}
      </div>
    </motion.div>
  );
}

// Professional Section Component - Flexible alignment
export function ProfessionalSection({ 
  children, 
  alignment = "left", // left, center, right, between
  spacing = "normal", // tight, normal, loose
  className = "" 
}) {
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center", 
    right: "justify-end",
    between: "justify-between"
  };

  const spacingClasses = {
    tight: "space-tight",
    normal: "space-professional", 
    loose: "space-loose"
  };

  return (
    <div className={`flex items-center ${alignmentClasses[alignment]} ${spacingClasses[spacing]} ${className}`}>
      {children}
    </div>
  );
}

// Professional Card Component - Enhanced glass effect
export function ProfessionalCard({ 
  children, 
  hover = true, 
  padding = "normal",
  className = "" 
}) {
  const paddingClasses = {
    tight: "p-4",
    normal: "p-6",
    loose: "p-8"
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      className={`glass rounded-2xl ${paddingClasses[padding]} ${hover ? 'card-hover' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Professional Button Component
export function ProfessionalButton({ 
  children, 
  variant = "primary", // primary, secondary
  size = "normal", // small, normal, large
  onClick,
  disabled = false,
  className = ""
}) {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary"
  };

  const sizeClasses = {
    small: "px-3 py-2 text-sm",
    normal: "px-4 py-2.5 text-sm", 
    large: "px-6 py-3 text-base"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
}

// Professional Grid Component - Responsive grid with proper spacing
export function ProfessionalGrid({ 
  children, 
  cols = "auto", // 1, 2, 3, 4, auto
  gap = "normal", // tight, normal, loose
  className = ""
}) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3", 
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    auto: "grid-cols-1 lg:grid-cols-5" // 3+2 layout like your current design
  };

  const gapClasses = {
    tight: "gap-3",
    normal: "gap-6",
    loose: "gap-8"
  };

  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} items-start ${className}`}>
      {children}
    </div>
  );
}

// Professional Status Badge Component
export function ProfessionalBadge({ 
  children, 
  variant = "default", // default, success, warning, error, info
  size = "normal",
  className = ""
}) {
  const variantClasses = {
    default: "bg-gray-500/15 text-gray-400 border-gray-500/20",
    success: "bg-green-500/15 text-green-400 border-green-500/20",
    warning: "bg-orange-500/15 text-orange-400 border-orange-500/20", 
    error: "bg-red-500/15 text-red-400 border-red-500/20",
    info: "bg-blue-500/15 text-blue-400 border-blue-500/20"
  };

  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    normal: "px-3 py-1.5 text-xs",
    large: "px-4 py-2 text-sm"
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {children}
    </span>
  );
}