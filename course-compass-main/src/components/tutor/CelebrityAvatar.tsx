interface CelebrityAvatarProps {
  name?: string;
}

export default function CelebrityAvatar({
  name = "AI Tutor",
}: CelebrityAvatarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
        AI
      </div>

      <div>
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-xs text-muted-foreground">
          Your learning assistant
        </p>
      </div>
    </div>
  );
}