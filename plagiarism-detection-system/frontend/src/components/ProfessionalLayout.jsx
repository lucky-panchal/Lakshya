import { motion } from "framer-motion";

export function ProfessionalLayout({ children, className = "", fullWidth = false, compact = false }) {
  const containerClass = fullWidth ? "full-width-container" : "content-container";
  const spacingClass = compact ? "py-4" : "section-spacing";
  return (
    <div className={`${containerClass} ${spacingClass} ${className}`}>
      {children}
    </div>
  );
}

export default ProfessionalLayout;

// Header — stacks on mobile: title top, actions below
export function ProfessionalHeader({ title, subtitle, leftContent, rightContent, centerContent, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 sm:mb-8 ${className}`}
    >
      {/* Mobile: stacked. Desktop: 3-col grid */}
      <div className="flex flex-col sm:grid sm:grid-cols-3 sm:items-start gap-3 sm:gap-6">
        {/* Left */}
        <div className="flex flex-col justify-start">
          {leftContent || (
            <div>
              {title && <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>}
              {subtitle && <p className="text-gray-500 text-xs sm:text-sm mt-1">{subtitle}</p>}
            </div>
          )}
        </div>
        {/* Center */}
        <div className="hidden sm:flex items-center justify-center">{centerContent}</div>
        {/* Right */}
        <div className="flex items-center justify-start sm:justify-end flex-wrap gap-2">
          {rightContent}
        </div>
      </div>
    </motion.div>
  );
}

// Section — flex row, wraps on mobile
export function ProfessionalSection({ children, alignment = "left", spacing = "normal", className = "", style }) {
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };
  const spacingClasses = {
    tight: "gap-2",
    normal: "gap-4",
    loose: "gap-6",
  };
  return (
    <div
      style={style}
      className={`flex items-center flex-wrap ${alignmentClasses[alignment]} ${spacingClasses[spacing]} ${className}`}
    >
      {children}
    </div>
  );
}

// Card — consistent glass card
export function ProfessionalCard({ children, hover = true, padding = "normal", className = "", ...rest }) {
  const paddingClasses = { tight: "p-3 sm:p-4", normal: "p-4 sm:p-6", loose: "p-6 sm:p-8" };
  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      className={`glass rounded-2xl ${paddingClasses[padding]} ${hover ? "card-hover" : ""} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// Button
export function ProfessionalButton({ children, variant = "primary", size = "normal", onClick, disabled = false, className = "" }) {
  const base = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap";
  const variants = { primary: "btn-primary", secondary: "btn-secondary" };
  const sizes = { small: "px-3 py-2 text-xs sm:text-sm", normal: "px-4 py-2.5 text-sm", large: "px-5 py-3 text-sm sm:text-base" };
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
    >
      {children}
    </motion.button>
  );
}

// Grid — fully responsive
export function ProfessionalGrid({ children, cols = "auto", gap = "normal", className = "" }) {
  const colClasses = {
    1:    "grid-cols-1",
    2:    "grid-cols-1 sm:grid-cols-2",
    3:    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4:    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    auto: "grid-cols-1 lg:grid-cols-5",   // 3+2 split
  };
  const gapClasses = { tight: "gap-3", normal: "gap-4 sm:gap-6", loose: "gap-6 sm:gap-8" };
  return (
    <div className={`grid ${colClasses[cols]} ${gapClasses[gap]} items-start ${className}`}>
      {children}
    </div>
  );
}

// Badge
export function ProfessionalBadge({ children, variant = "default", size = "normal", className = "" }) {
  const variants = {
    default: "bg-gray-500/15 text-gray-400 border-gray-500/20",
    success: "bg-green-500/15 text-green-400 border-green-500/20",
    warning: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    error:   "bg-red-500/15 text-red-400 border-red-500/20",
    info:    "bg-blue-500/15 text-blue-400 border-blue-500/20",
  };
  const sizes = { small: "px-2 py-0.5 text-xs", normal: "px-3 py-1 text-xs", large: "px-4 py-1.5 text-sm" };
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
