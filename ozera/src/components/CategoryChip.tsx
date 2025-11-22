interface CategoryChipProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
}

export default function CategoryChip({
  name,
  isActive,
  onClick,
}: CategoryChipProps) {
  return (
    <button
      onClick={onClick}
      className={`category-chip px-5 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
        isActive
          ? "bg-primary text-primary-content shadow-md"
          : "bg-base-200 text-base-content hover:bg-base-300"
      }`}
      aria-pressed={isActive}
      aria-label={`فئة ${name}`}
    >
      {name}
    </button>
  );
}
