import Image from "next/image";

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
  priority?: boolean;
};

function initialsFor(name: string) {
  return name
    .trim()
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "GS";
}

export function Avatar({ name, src, size = 36, className = "", priority = false }: AvatarProps) {
  if (src) {
    return (
      <span className={`gs-avatar ${className}`} style={{ width: size, height: size }}>
        <Image src={src} alt={`${name} avatar`} width={size} height={size} priority={priority} className="gs-avatar-image" />
      </span>
    );
  }

  return (
    <span className={`gs-avatar gs-avatar-initials ${className}`} style={{ width: size, height: size }} aria-label={name} title={name}>
      {initialsFor(name)}
    </span>
  );
}
