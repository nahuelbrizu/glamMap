// src/components/maps/LocationButton.tsx
interface LocationButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export const LocationButton = ({ onClick, isVisible }: LocationButtonProps) => {
  if (!isVisible) return null;
  return (
    <button
      onClick={onClick}
      className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-primary active:scale-90 transition-transform"
      aria-label="Center map on your location"
    >
      <span className="material-symbols-outlined !text-3xl">my_location</span>
    </button>
  );
};