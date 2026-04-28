"use client";

interface TemplateWrapperProps {
  name: string;
  premium: boolean;
  selected: boolean;
  onClick: () => void;
}

export default function TemplateWrapper({
  name,
  premium,
  selected,
  onClick,
}: TemplateWrapperProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full p-5 rounded-lg border text-left transition
        ${selected ? "border-blue-600 shadow-lg" : "border-neutral-300"}
        ${premium ? "bg-yellow-50 hover:border-amber-400" : "bg-white hover:border-blue-500"}
        hover:shadow
      `}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-neutral-900">{name}</h3>

        {premium ? (
          <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded">
            Premium
          </span>
        ) : (
          <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded">
            Standard
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-neutral-500 text-sm">Click to preview</p>
        <p className={`text-sm font-semibold ${premium ? "text-amber-600" : "text-blue-600"}`}>
          {premium ? "Unlock with Bundle — $29.99" : "Unlock — $14.99"}
        </p>
      </div>
    </button>
  );
}
