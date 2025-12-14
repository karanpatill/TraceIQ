export function BentoGrid({ children, className = "" }) {
  return (
    <div className={`grid grid-cols-3 gap-4 auto-rows-[200px] ${className}`}>
      {children}
    </div>
  );
}

export function BentoCard({
  name,
  description,
  header,
  icon: Icon,
  className = "",
}) {
  return (
    <div
      className={`rounded-lg p-4 bg-gradient-to-br from-[rgba(14,165,165,0.08)] to-[rgba(14,165,165,0.03)] border border-[rgba(14,165,165,0.15)] overflow-hidden group hover:border-[rgba(14,165,165,0.3)] transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex items-start justify-between">
          {Icon && (
            <div className="w-7 h-7 rounded-lg bg-[rgba(14,165,165,0.1)] flex items-center justify-center text-[#0ea5a5]">
              <Icon className="w-3 h-3" />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#e4e4e7]">{name}</h3>
          <p className="text-xs text-[#71838b] mt-1">{description}</p>
        </div>
      </div>
      {header && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
          {header}
        </div>
      )}
    </div>
  );
}
