import React, { type CSSProperties, type ReactNode } from 'react';
import {
  AbsoluteFill,
  Sequence,
  spring,
  useCurrentFrame,
} from 'remotion';
import {
  blurIn,
  blurRamp,
  Camera,
  Chip,
  FireworksMark,
  Grain,
  Parallax,
  prog,
  Reveal,
  WordSwap,
} from './helpers';
import { SCENES, T } from './tokens';
import Scene1 from './Scene1';
import Scene2 from './Scene2';
import Scene3 from './Scene3';

export const FROM = 836;
export const DUR = 244;

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;

const between = (
  frame: number,
  start: number,
  end: number,
  from: number,
  to: number,
  ease: 'expoOut' | 'cubicInOut' | 'cubicIn' = 'cubicInOut',
): number => lerp(from, to, prog(frame, start, end - start, ease));

const mixHex = (from: string, to: string, progress: number): string => {
  const parse = (hex: string) => {
    const value = hex.replace('#', '');
    return [0, 2, 4].map((offset) =>
      Number.parseInt(value.slice(offset, offset + 2), 16),
    );
  };
  const a = parse(from);
  const b = parse(to);
  return `#${a
    .map((channel, index) =>
      Math.round(lerp(channel, b[index], clamp01(progress)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
};

const centeredText: CSSProperties = {
  fontFamily: T.font.sans,
  fontSize: T.size.statement,
  fontWeight: 500,
  letterSpacing: '-0.025em',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  margin: 0,
};

const Centered: React.FC<{
  x?: number;
  y: number;
  children: ReactNode;
  style?: CSSProperties;
}> = ({ x = 960, y, children, style }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translate(-50%, -50%)',
      ...style,
    }}
  >
    {children}
  </div>
);

const ArrowGlyph: React.FC<{ color?: string; size?: number }> = ({
  color = T.c.purple,
  size = 86,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    aria-hidden="true"
    style={{ display: 'block' }}
  >
    <path
      d="M15 50h66M52 20l30 30-30 30"
      fill="none"
      stroke={color}
      strokeWidth={10}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PipelineChip: React.FC<{
  label: string;
  left: number;
  width: number;
  variant: 'solid' | 'outline';
  opacity?: number;
  scale?: number;
  fontSize?: number;
}> = ({ label, left, width, variant, opacity = 1, scale = 1, fontSize }) => (
  <div
    style={{
      position: 'absolute',
      left,
      top: 524,
      width,
      height: 232,
      opacity,
      transform: `scale(${scale})`,
      transformOrigin: 'center center',
      overflow: 'hidden',
    }}
  >
    <Chip
      variant={variant}
      radius={T.radius.chip}
      fontSize={fontSize ?? (variant === 'solid' ? T.size.chip : T.size.chipSm)}
      padding={0}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: T.radius.chip,
        borderWidth: variant === 'outline' ? 3 : 0,
        overflow: 'hidden',
      }}
    >
      {label}
    </Chip>
  </div>
);

const PipelineArrow: React.FC<{
  frame: number;
  left: number;
  opacity: number;
  springStart: number;
}> = ({ frame, left, opacity, springStart }) => {
  const pop = spring({
    frame: Math.max(0, frame - springStart),
    fps: T.fps,
    config: T.spring.settle,
  });
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top: 524,
        width: 237,
        height: 232,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
        transform: `scale(${0.92 + 0.08 * pop})`,
        transformOrigin: 'center center',
      }}
    >
      <Chip
        variant="solid"
        radius={T.radius.chip}
        padding={0}
        style={{ width: '100%', height: '100%', borderRadius: T.radius.chip }}
      >
        <ArrowGlyph />
      </Chip>
    </div>
  );
};

const PipelineChain: React.FC<{ frame: number }> = ({ frame }) => {
  const layout = prog(frame, 24, 16, 'cubicInOut');
  const collapse = prog(frame, 52, 24, 'cubicInOut');
  const chainOpacity = 1 - collapse;
  const chainScale = 1 - 0.45 * collapse;
  const items = [
    { label: 'PRD', start: 24, width: 240, from: 820, to: -439 },
    { label: 'Tasks', start: 28, width: 280, from: 900, to: -141 },
    { label: 'Track', start: 32, width: 260, from: 970, to: 197 },
    { label: 'Ship', start: 36, width: 260, from: 1030, to: 515 },
  ];
  const arrowFadeOut = 1 - prog(frame, 24, 8, 'cubicInOut');
  const arrowFadeIn = prog(frame, 40, 8, 'expoOut');
  const arrowOpacity = frame < 24 ? 1 : frame < 40 ? arrowFadeOut : arrowFadeIn;
  const arrowLeft = lerp(738, 834, layout);
  const agreementLeft = lerp(42, -1135, layout);
  const launchLeft = lerp(1033, 1128, layout);
  const collapseSpring = spring({
    frame: Math.max(0, frame - 52),
    fps: T.fps,
    config: T.spring.settle,
  });
  const ghostProgress = prog(frame, 76, 12, 'expoOut');
  const onePlanFill = mixHex(T.c.white, T.c.lilac, ghostProgress);
  const onePlanScale = 0.86 + 0.14 * collapseSpring;
  const labelOpacity = prog(frame, 52, 8, 'expoOut') * (1 - prog(frame, 88, 1));

  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: chainOpacity,
          transform: `scale(${chainScale})`,
          transformOrigin: '960px 640px',
        }}
      >
        <PipelineChip
          label="Agreement"
          left={agreementLeft}
          width={638}
          variant="solid"
          fontSize={T.size.chip}
        />
        {items.map((item) => {
          const enter = prog(frame, item.start, 8, 'expoOut');
          const itemSpring = spring({
            frame: Math.max(0, frame - item.start),
            fps: T.fps,
            config: T.spring.settle,
          });
          const left = lerp(item.from, item.to, layout);
          return (
            <PipelineChip
              key={item.label}
              label={item.label}
              left={left}
              width={item.width * enter}
              variant="outline"
              opacity={enter * chainOpacity}
              scale={0.96 + 0.04 * itemSpring}
              fontSize={T.size.chipSm}
            />
          );
        })}
        <PipelineArrow
          frame={frame}
          left={arrowLeft}
          opacity={arrowOpacity * chainOpacity}
          springStart={40}
        />
        <PipelineChip
          label="Launch"
          left={launchLeft}
          width={606}
          variant="solid"
          fontSize={T.size.chip}
        />
      </div>

      {frame >= 52 && frame < 88 && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 960,
              top: 400,
              transform: 'translate(-50%, -50%)',
              opacity: labelOpacity,
              color: T.c.white,
              fontFamily: T.font.sans,
              fontSize: 56,
              fontWeight: 500,
              letterSpacing: '-0.025em',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            IN SYNC
          </div>
          <div
            style={{
              position: 'absolute',
              left: 960,
              top: 640,
              transform: `translate(-50%, -50%) scale(${onePlanScale})`,
              transformOrigin: 'center center',
              opacity: prog(frame, 52, 8, 'expoOut'),
            }}
          >
            <Chip
              variant="solid"
              radius={44}
              fontSize={64}
              padding="0 44px"
              style={{
                width: 650,
                height: 190,
                backgroundColor: onePlanFill,
                color: T.c.purple,
                borderRadius: 44,
                boxShadow: '0 0 0 20px rgba(255,255,255,0.08)',
              }}
            >
              One plan
            </Chip>
          </div>
        </>
      )}
    </>
  );
};

const AgreementToAction: React.FC<{ frame: number }> = ({ frame }) => (
  <Centered
    y={538}
    style={{
      color: T.c.white,
      opacity: prog(frame, 0, 4, 'expoOut'),
      filter: blurIn(frame, 0, 8, 12),
    }}
  >
    <Reveal
      text="Agreement to action"
      start={0}
      perWordStagger={3}
      dur={14}
      y={28}
      blur={12}
      style={{ ...centeredText, color: T.c.white }}
    />
  </Centered>
);

const PipelineHero: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = 1 + 0.08 * prog(frame, 94, 21, 'cubicInOut');
  const pulse = prog(frame, 94, 21, 'cubicInOut');
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 595,
          top: 0,
          width: 1,
          height: T.H,
          backgroundColor: 'rgba(255,255,255,0.35)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 1318,
          top: 0,
          width: 1,
          height: T.H,
          backgroundColor: 'rgba(255,255,255,0.35)',
        }}
      />
      {[327, 738].map((y) => (
        <div
          key={y}
          style={{
            position: 'absolute',
            left: 0,
            top: y,
            width: T.W,
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.35)',
          }}
        />
      ))}
      {[
        { x: 474, y: 538 },
        { x: 1444, y: 538 },
        { x: 960, y: 205 },
        { x: 960, y: 949 },
      ].map(({ x, y }) => (
        <div
          key={`${x}-${y}`}
          style={{
            position: 'absolute',
            left: x - 5,
            top: y - 5,
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: T.c.white,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 640,
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 520,
            height: 250,
            borderRadius: 70,
            backgroundColor: 'rgba(255,255,255,0.08)',
            transform: 'translate(-50%, -50%)',
            opacity: 0.6 + 0.4 * pulse,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 460,
            height: 210,
            borderRadius: 70,
            backgroundColor: 'rgba(255,255,255,0.14)',
            transform: 'translate(-50%, -50%)',
          }}
        />
        <Chip
          variant="solid"
          radius={44}
          fontSize={64}
          padding="0 28px"
          style={{
            position: 'relative',
            width: 437,
            height: 190,
            borderRadius: 44,
            backgroundColor: T.c.white,
            color: T.c.purple,
            boxShadow: '0 22px 70px rgba(29,6,70,0.18)',
          }}
        >
          One plan
        </Chip>
      </div>
    </>
  );
};

type IntegrationName =
  | 'github'
  | 'figma'
  | 'notion'
  | 'linear'
  | 'slack'
  | 'calendar'
  | 'jira'
  | 'email';

const integrationNames: IntegrationName[] = [
  'github',
  'figma',
  'notion',
  'linear',
  'slack',
  'calendar',
  'jira',
  'email',
];

const integrationTileStyle: Record<IntegrationName, CSSProperties> = {
  github: { backgroundColor: '#ffffff', color: '#111111' },
  figma: { backgroundColor: '#ffffff', color: '#111111' },
  notion: { backgroundColor: '#111111', color: '#ffffff' },
  linear: { backgroundColor: '#ffffff', color: '#111111' },
  slack: { backgroundColor: '#ffffff', color: '#111111' },
  calendar: { backgroundColor: '#4285f4', color: '#ffffff' },
  jira: { backgroundColor: '#172b4d', color: '#ffffff' },
  email: { backgroundColor: '#f6f58a', color: '#111111' },
};

const IntegrationGlyph: React.FC<{ name: IntegrationName }> = ({ name }) => {
  if (name === 'github') {
    return (
      <svg width={70} height={70} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="27" fill="#111111" />
        <path
          d="M20 27c0-7 5-12 12-12s12 5 12 12v13c0 5-4 9-9 9h-6c-5 0-9-4-9-9V27Z"
          fill="#ffffff"
        />
        <path d="M23 18 19 9l10 5M41 18l4-9-10 5" fill="#111111" />
        <path d="M27 35v8M37 35v8" stroke="#111111" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'figma') {
    return (
      <svg width={64} height={76} viewBox="0 0 48 72" aria-hidden="true">
        <path d="M24 2H12a10 10 0 0 0 0 20h12V2Z" fill="#f24e1e" />
        <path d="M24 2h12a10 10 0 0 1 0 20H24V2Z" fill="#ff7262" />
        <path d="M12 22a10 10 0 0 0 0 20h12V22H12Z" fill="#a259ff" />
        <circle cx="36" cy="32" r="10" fill="#1abcfe" />
        <path d="M12 42a10 10 0 0 0 0 20h12V42H12Z" fill="#0acf83" />
      </svg>
    );
  }

  if (name === 'notion') {
    return (
      <svg width={70} height={70} viewBox="0 0 64 64" aria-hidden="true">
        <rect x="7" y="7" width="50" height="50" rx="4" fill="#111111" stroke="#ffffff" strokeWidth="2" />
        <path d="M20 46V18l24 28V18" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === 'linear') {
    return (
      <svg width={70} height={70} viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r="27" fill="#111111" />
        <path d="M15 24 40 49M20 16l28 28M30 10l23 23" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'slack') {
    return (
      <svg width={70} height={70} viewBox="0 0 64 64" aria-hidden="true">
        <g strokeWidth="8" strokeLinecap="round">
          <path d="M22 8v20M11 19h20" stroke="#36c5f0" />
          <path d="M42 8v20M31 19h20" stroke="#2eb67d" />
          <path d="M22 36v20M11 47h20" stroke="#ecb22e" />
          <path d="M42 36v20M31 47h20" stroke="#e01e5a" />
        </g>
      </svg>
    );
  }

  if (name === 'calendar') {
    return (
      <svg width={70} height={70} viewBox="0 0 64 64" aria-hidden="true">
        <rect x="8" y="12" width="48" height="44" rx="8" fill="#ffffff" />
        <path d="M8 23h48" stroke="#4285f4" strokeWidth="7" />
        <path d="M20 7v12M44 7v12" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        <path d="M20 34h7M37 34h7M20 45h7M37 45h7" stroke="#4285f4" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === 'jira') {
    return (
      <svg width={70} height={70} viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 5 58 52H38L23 26 32 5Z" fill="#ffffff" />
        <path d="M22 26 8 52h20l10-17-16-9Z" fill="#4c9aff" />
      </svg>
    );
  }

  return (
    <svg width={70} height={70} viewBox="0 0 64 64" aria-hidden="true">
      <rect x="7" y="13" width="50" height="38" rx="7" fill="none" stroke="#111111" strokeWidth="4" />
      <path d="m10 19 22 17 22-17" fill="none" stroke="#111111" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
};

const IntegrationConstellation: React.FC<{ frame: number }> = ({ frame }) => {
  const rotation = 24.75 * prog(frame, 115, 33, 'expoOut');
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        perspective: 1400,
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 750,
          top: 330,
          width: 420,
          height: 420,
          borderRadius: 72,
          backgroundColor: '#f7f7f9',
          transform: 'translateZ(-18px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 740,
          top: 540,
          width: 440,
          height: 1,
          backgroundColor: '#efeff4',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 320,
          width: 1,
          height: 440,
          backgroundColor: '#efeff4',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 740,
          top: 320,
          width: 440,
          height: 440,
          border: '1px solid #efeff4',
          transform: 'rotate(45deg) scale(0.7)',
          transformOrigin: 'center center',
          opacity: 0.5,
        }}
      />
      {[
        { x: 740, y: 320 },
        { x: 1180, y: 320 },
        { x: 740, y: 760 },
        { x: 1180, y: 760 },
      ].map(({ x, y }) => (
        <div
          key={`${x}-${y}`}
          style={{
            position: 'absolute',
            left: x - 3,
            top: y - 3,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: T.c.purple,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 540,
          width: 264,
          height: 269,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 56,
          backgroundColor: T.c.white,
          border: '1px solid #efeff4',
          boxShadow: '0 20px 60px rgba(10,10,10,0.10)',
          transform: 'translate(-50%, -50%) translateZ(22px)',
        }}
      >
        <FireworksMark size={108} color={T.c.purple} />
      </div>
      {integrationNames.map((name, index) => {
        const start = 115 + index * 2;
        const flight = spring({
          frame: Math.max(0, frame - start),
          fps: T.fps,
          config: T.spring.icon,
        });
        const opacity = prog(frame, start, 7, 'expoOut');
        const degrees = -105 + index * 45 + rotation;
        const radians = (degrees * Math.PI) / 180;
        const radius = 422;
        const targetX = 960 + Math.cos(radians) * radius;
        const targetY = 540 + Math.sin(radians) * radius;
        const x = lerp(960, targetX, flight);
        const y = lerp(540, targetY, flight);
        const bob = 4 * Math.sin(((frame - 115) / 24) * Math.PI * 2 + index * 0.8);
        const depth = Math.sin(radians) * 18;

        return (
          <div
            key={name}
            style={{
              position: 'absolute',
              left: x - 68.5,
              top: y - 68.5 + bob,
              width: 137,
              height: 137,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: T.radius.tile,
              boxSizing: 'border-box',
              border: '1px solid #efeff4',
              boxShadow: '0 14px 40px rgba(10,10,10,0.10)',
              opacity,
              transform: `translateZ(${depth}px)`,
              transformStyle: 'preserve-3d',
              ...integrationTileStyle[name],
            }}
          >
            <IntegrationGlyph name={name} />
          </div>
        );
      })}
    </div>
  );
};

const AlignmentBackdrop: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = between(frame, 148, 178, 0, -18, 'cubicInOut');
  const glowOpacity = prog(frame, 148, 12, 'expoOut') * 0.5;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        transform: `translateX(${drift}px)`,
      }}
    >
      <svg
        width={T.W}
        height={T.H}
        viewBox={`0 0 ${T.W} ${T.H}`}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0 }}
      >
        <g fill="none" stroke="#f3f3f6" strokeWidth="2">
          <path d="M-130 140 630 540-130 940" />
          <path d="M2050 140 1290 540 2050 940" />
          <path d="M650 917c0-31 25-56 56-56 12-52 58-88 112-88 45 0 84 25 103 63 47-5 86 32 86 78 0 44-36 80-80 80H730c-44 0-80-34-80-77Z" />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: glowOpacity,
          background:
            'radial-gradient(ellipse 920px 420px at 50% -5%, rgba(236,227,255,0.8), rgba(236,227,255,0) 78%)',
        }}
      />
    </div>
  );
};

const StayInSync: React.FC<{ frame: number }> = ({ frame }) => {
  const textStyle: CSSProperties = { ...centeredText, color: T.c.ink };
  if (frame < 178) {
    return (
      <Centered y={527}>
        <Reveal
          text="Stay in sync"
          start={148}
          perWordStagger={3}
          dur={14}
          y={28}
          blur={12}
          style={textStyle}
        />
      </Centered>
    );
  }
  if (frame < 190) {
    return (
      <Centered y={527}>
        <WordSwap from="Stay in sync" to="Start today" start={178} style={textStyle} />
      </Centered>
    );
  }
  return (
    <Centered y={527}>
      <div style={textStyle}>Start today</div>
    </Centered>
  );
};

const FinalLockup: React.FC<{ frame: number }> = ({ frame }) => {
  const drop = prog(frame, 184, 14, 'expoOut');
  const y = lerp(-40, 95, drop);
  const typed = Math.floor(clamp01((frame - 194) / 24) * 24);
  const label = 'FounderSync / Cofounder OS';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: y,
          opacity: prog(frame, 184, 5, 'expoOut'),
          filter: blurIn(frame, 184, 14, 12),
          transform: 'translate(-50%, -50%)',
        }}
      >
        <FireworksMark size={126} color={T.c.purple} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 990,
          transform: 'translateX(-50%)',
          color: T.c.muted,
          fontFamily: T.font.mono,
          fontSize: T.size.mono,
          fontWeight: 400,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {label.slice(0, typed)}
      </div>
    </div>
  );
};

const PipelineR: React.FC<{ frame: number }> = ({ frame }) => (
  <>
    <PipelineChain frame={frame} />
  </>
);

const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame;
  const background =
    local < 115 ? T.c.purple : local < 148 ? T.c.white : '#fcfcfc';
  const vHoldScale = 1 + 0.04 * prog(local, 208, 36, 'cubicInOut');

  return (
    <AbsoluteFill
      style={{
        width: T.W,
        height: T.H,
        overflow: 'hidden',
        backgroundColor: background,
        fontFamily: T.font.sans,
      }}
    >
      <Camera
        from={{ x: 0, y: 0 }}
        to={{ x: -8, y: 0 }}
        moveStart={0}
        moveDur={DUR}
        moveEase="cubicInOut"
        origin="960px 540px"
      >
        {local >= 148 && local < 178 && (
          <Parallax factor={0.4}>
            <AlignmentBackdrop frame={local} />
          </Parallax>
        )}
        {local >= 115 && local < 148 && (
          <Parallax factor={1}>
            <IntegrationConstellation frame={local} />
          </Parallax>
        )}
        {local >= 148 && local < 178 && (
          <Parallax factor={1}>
            <StayInSync frame={local} />
          </Parallax>
        )}
        {local < 18 && (
          <Parallax factor={1}>
            <AgreementToAction frame={local} />
          </Parallax>
        )}
        {local >= 17 && local < 88 && (
          <Parallax factor={1}>
            <PipelineR frame={local} />
          </Parallax>
        )}
        {local >= 88 && local < 115 && (
          <Parallax factor={1}>
            <PipelineHero frame={local} />
          </Parallax>
        )}
        {local >= 178 && (
          <Parallax factor={1}>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                transform: `scale(${vHoldScale})`,
                transformOrigin: '960px 540px',
              }}
            >
              <StayInSync frame={local} />
              <FinalLockup frame={local} />
            </div>
          </Parallax>
        )}
        <Grain opacity={0.05} seed={37} />
      </Camera>
    </AbsoluteFill>
  );
};

const cutFrames = [27, 46, 98, 153, 248, 430, 688, 836, 951, 984];

const CutSmears: React.FC<{ frame: number }> = ({ frame }) => {
  const activeCut = cutFrames.find((cut) => frame >= cut - 1 && frame <= cut + 2);
  if (activeCut === undefined) return null;

  const progress = clamp01((frame - (activeCut - 1)) / 3);
  const opacity = 0.24 * Math.sin(Math.PI * progress);
  const blur = blurRamp(frame, activeCut - 1, 3, 12);
  const translateX = lerp(-150, 150, prog(frame, activeCut - 1, 3, 'cubicInOut'));

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: -180,
          top: 455,
          width: T.W + 360,
          height: 170,
          opacity,
          filter: blur,
          transform: `translateX(${translateX}px) skewX(-12deg)`,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9) 45%, rgba(255,255,255,0.9) 55%, rgba(255,255,255,0))',
          mixBlendMode: 'screen',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: -220,
          top: 520,
          width: T.W + 440,
          height: 40,
          opacity: opacity * 0.7,
          filter: blur,
          transform: `translateX(${-translateX}px) skewX(18deg)`,
          background:
            'linear-gradient(90deg, rgba(97,8,245,0), rgba(97,8,245,0.75) 50%, rgba(97,8,245,0))',
          mixBlendMode: 'screen',
        }}
      />
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ width: T.W, height: T.H, overflow: 'hidden', backgroundColor: T.c.black }}>
      <Sequence from={SCENES.S1.from} durationInFrames={SCENES.S1.dur}>
        <Scene1 />
      </Sequence>
      <Sequence from={SCENES.S2.from} durationInFrames={SCENES.S2.dur}>
        <Scene2 />
      </Sequence>
      <Sequence from={SCENES.S3.from} durationInFrames={SCENES.S3.dur}>
        <Scene3 />
      </Sequence>
      <Sequence from={SCENES.S4.from} durationInFrames={SCENES.S4.dur}>
        <Scene4 />
      </Sequence>
      <CutSmears frame={frame} />
    </AbsoluteFill>
  );
};

export default Main;
