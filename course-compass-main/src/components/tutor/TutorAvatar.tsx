import "./TutorAvatar.css";

export type TutorState =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking";

interface TutorAvatarProps {
  state?: TutorState;
  mouthLevel?: number;
  fallbackAnimation?: boolean;
  name?: string;
}

const TutorAvatar = ({
  state = "idle",
  mouthLevel = 0,
  fallbackAnimation = false,
  name = "Virtual Tutor",
}: TutorAvatarProps) => {
  const level = Math.max(0, Math.min(1, mouthLevel));

  const mouthHeight =
    state === "speaking"
      ? fallbackAnimation
        ? 9
        : level > 0.55
          ? 12
          : level > 0.2
            ? 7
            : 2
      : 2;

  const stateLabels: Record<TutorState, string> = {
    idle: "Ready to help",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Speaking...",
  };

  return (
    <div
      className={`tutor-avatar tutor-avatar--${state} ${
        fallbackAnimation ? "tutor-avatar--fallback" : ""
      }`}
      role="img"
      aria-label={`${name}, ${stateLabels[state]}`}
    >
      <div className="tutor-avatar__illustration">
        <svg
          viewBox="0 0 160 180"
          className="tutor-avatar__svg"
          aria-hidden="true"
        >
          {/* Neck */}
          <rect x="65" y="125" width="30" height="30" rx="10" fill="#D99A70" />

          {/* Clothes */}
          <path
            d="M25 180 Q30 135 65 140 L80 155 L95 140 Q130 135 135 180 Z"
            fill="#5145CD"
          />

          {/* Face */}
          <ellipse cx="80" cy="83" rx="43" ry="52" fill="#E8AD83" />

          {/* Hair */}
          <path
            d="M37 78 Q30 20 80 24 Q132 20 123 78
               L112 57 Q95 44 80 49 Q55 45 45 68 Z"
            fill="#29243B"
          />

          {/* Ears */}
          <ellipse cx="37" cy="87" rx="7" ry="12" fill="#D99A70" />
          <ellipse cx="123" cy="87" rx="7" ry="12" fill="#D99A70" />

          {/* Eyes */}
          <ellipse cx="64" cy="84" rx="4" ry="5" fill="#29243B" />
          <ellipse cx="96" cy="84" rx="4" ry="5" fill="#29243B" />

          {/* Nose */}
          <path
            d="M80 87 L76 101 Q80 105 84 101"
            fill="none"
            stroke="#BD805F"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Audio-reactive mouth */}
          <ellipse
            className="tutor-avatar__mouth"
            cx="80"
            cy="116"
            rx="9"
            ry={mouthHeight}
            fill="#672F3B"
          />

          {/* Collar */}
          <path d="M65 140 L80 155 L95 140" fill="none" stroke="#FFFFFF" strokeWidth="4" />
        </svg>
      </div>

      <div className="tutor-avatar__info">
        <strong>{name}</strong>
        <span>{stateLabels[state]}</span>
      </div>

      {state === "thinking" && (
        <div className="tutor-avatar__thinking" aria-label="Thinking">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
};

export default TutorAvatar;