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
        ${premium ? "bg-yellow-50" : "bg-white"}
        hover:border-blue-500 hover:shadow
      `}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-neutral-900">{name}</h3>

        {premium && (
          <span className="text-xs font-semibold text-yellow-700 bg-yellow-200 px-2 py-1 rounded">
            Premium
          </span>
        )}
      </div>

      <p className="text-neutral-600 mt-2 text-sm">
        Click to preview this template
      </p>
    </button>
  );
}
