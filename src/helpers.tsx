import React, {
  createContext,
  useContext,
  useId,
  type CSSProperties,
  type ReactNode,
} from 'react';
import {
  Easing,
  interpolate,
  random as remotionRandom,
  useCurrentFrame,
} from 'remotion';
import { T } from './tokens';

export type EaseName = keyof typeof T.ease;
export type Point = { x: number; y: number };

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, progress: number): number =>
  from + (to - from) * progress;
const useUniqueId = (prefix: string): string =>
  `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

export const ez = (name: EaseName) => {
  const [x1, y1, x2, y2] = T.ease[name] as readonly [
    number,
    number,
    number,
    number,
  ];
  return Easing.bezier(x1, y1, x2, y2);
};

export const prog = (
  frame: number,
  start: number,
  dur: number,
  easeName: EaseName = 'expoOut',
): number => {
  if (dur <= 0) return frame < start ? 0 : 1;
  return interpolate(frame, [start, start + dur], [0, 1], {
    easing: ez(easeName),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

type CameraMotion = {
  x: number;
  y: number;
  scale: number;
};

const CameraMotionContext = createContext<CameraMotion>({
  x: 0,
  y: 0,
  scale: 1,
});

type PushInConfig = {
  from?: number;
  to: number;
  start?: number;
  dur?: number;
  ease?: EaseName;
};

type CameraProps = {
  children: ReactNode;
  from?: Point;
  to?: Point;
  origin?: string;
  moveStart?: number;
  moveDur?: number;
  moveEase?: EaseName;
  pushIn?: number | PushInConfig;
  pushInStart?: number;
  pushInDur?: number;
  pushInEase?: EaseName;
  style?: CSSProperties;
};

export const Camera: React.FC<CameraProps> = ({
  children,
  from = { x: 0, y: 0 },
  to = from,
  origin = '50% 50%',
  moveStart = 0,
  moveDur = 96,
  moveEase = 'cubicInOut',
  pushIn,
  pushInStart = 0,
  pushInDur = 96,
  pushInEase = 'cubicInOut',
  style,
}) => {
  const frame = useCurrentFrame();
  const moveProgress = prog(frame, moveStart, moveDur, moveEase);
  const x = lerp(from.x, to.x, moveProgress);
  const y = lerp(from.y, to.y, moveProgress);

  let scale = 1;
  if (typeof pushIn === 'number') {
    scale = lerp(1, pushIn, prog(frame, pushInStart, pushInDur, pushInEase));
  } else if (pushIn) {
    scale = lerp(
      pushIn.from ?? 1,
      pushIn.to,
      prog(
        frame,
        pushIn.start ?? 0,
        pushIn.dur ?? 96,
        pushIn.ease ?? 'cubicInOut',
      ),
    );
  }

  const motion = { x, y, scale };
  return (
    <CameraMotionContext.Provider value={motion}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'visible',
          ...style,
          transformOrigin: origin,
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </CameraMotionContext.Provider>
  );
};

type ParallaxProps = {
  factor: number;
  children: ReactNode;
  style?: CSSProperties;
};

export const Parallax: React.FC<ParallaxProps> = ({
  factor,
  children,
  style,
}) => {
  const { x, y, scale } = useContext(CameraMotionContext);
  const correctionX = scale === 0 ? 0 : ((factor - 1) * x) / scale;
  const correctionY = scale === 0 ? 0 : ((factor - 1) * y) / scale;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        ...style,
        transform: `translate3d(${correctionX}px, ${correctionY}px, 0)${
          style?.transform ? ` ${style.transform}` : ''
        }`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};

export const blurIn = (
  frame: number,
  start: number,
  dur: number,
  from = 12,
): string => `blur(${(from * (1 - prog(frame, start, dur, 'expoOut'))).toFixed(2)}px)`;

export const blurOut = (
  frame: number,
  start: number,
  dur: number,
  to = 10,
): string => `blur(${(to * prog(frame, start, dur, 'expoIn')).toFixed(2)}px)`;

export const blurRamp = (
  frame: number,
  start: number,
  dur: number,
  peak: number,
): string => {
  if (dur <= 0) return 'blur(0px)';
  const progress = clamp01((frame - start) / dur);
  const amount = peak * Math.sin(Math.PI * progress);
  return `blur(${Math.max(0, amount).toFixed(2)}px)`;
};

type DirBlurProps = {
  x: number;
  y: number;
  children: ReactNode;
  style?: CSSProperties;
};

export const DirBlur: React.FC<DirBlurProps> = ({ x, y, children, style }) => {
  const filterId = useUniqueId('foundersync-dir-blur');
  const deviationX = Math.max(0, Math.abs(x));
  const deviationY = Math.max(0, Math.abs(y));

  return (
    <>
      <svg
        aria-hidden="true"
        focusable="false"
        width={0}
        height={0}
        style={{ position: 'absolute', overflow: 'hidden' }}
      >
        <defs>
          <filter
            id={filterId}
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation={`${deviationX} ${deviationY}`} />
          </filter>
        </defs>
      </svg>
      <div style={{ ...style, filter: `url(#${filterId})` }}>{children}</div>
    </>
  );
};

type RevealProps = {
  text: string;
  start: number;
  perWordStagger?: number;
  dur?: number;
  y?: number;
  blur?: number;
  style?: CSSProperties;
  className?: string;
};

export const Reveal: React.FC<RevealProps> = ({
  text,
  start,
  perWordStagger = 3,
  dur = 14,
  y = 28,
  blur = 12,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const chunks = text.split(/(\s+)/).filter((chunk) => chunk.length > 0);
  let wordIndex = 0;

  return (
    <div
      className={className}
      aria-label={text}
      style={{
        display: 'block',
        whiteSpace: 'pre-wrap',
        ...style,
      }}
    >
      {chunks.map((chunk, chunkIndex) => {
        if (/^\s+$/.test(chunk)) {
          return (
            <span key={`space-${chunkIndex}`} style={{ whiteSpace: 'pre' }}>
              {chunk}
            </span>
          );
        }

        const index = wordIndex++;
        const progress = prog(frame, start + index * perWordStagger, dur, 'expoOut');
        const opacity = progress;
        const translateY = y * (1 - progress);
        const currentBlur = blur * (1 - progress);

        return (
          <React.Fragment key={`word-${chunkIndex}`}>
            <span
              style={{
                display: 'inline-block',
                overflow: 'hidden',
                verticalAlign: 'top',
                paddingBottom: '0.08em',
                marginBottom: '-0.08em',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  opacity,
                  transform: `translate3d(0, ${translateY}px, 0)`,
                  filter: `blur(${currentBlur.toFixed(2)}px)`,
                  willChange: 'transform, filter, opacity',
                }}
              >
                {chunk}
              </span>
            </span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

type WordSwapProps = {
  from: string;
  to: string;
  start: number;
  outDur?: number;
  inDur?: number;
  y?: number;
  outBlur?: number;
  inBlur?: number;
  style?: CSSProperties;
  className?: string;
};

export const WordSwap: React.FC<WordSwapProps> = ({
  from,
  to,
  start,
  outDur = 7,
  inDur = 10,
  y = 34,
  outBlur = 10,
  inBlur = 12,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const outProgress = prog(frame, start, outDur, 'cubicIn');
  const inProgress = prog(frame, start, inDur, 'expoOut');

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateAreas: '"swap"',
        position: 'relative',
        overflow: 'hidden',
        isolation: 'isolate',
        contain: 'paint',
        verticalAlign: 'top',
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          gridArea: 'swap',
          display: 'block',
          opacity: 1 - outProgress,
          transform: `translate3d(0, ${-y * outProgress}px, 0)`,
          filter: `blur(${(outBlur * outProgress).toFixed(2)}px)`,
          willChange: 'transform, filter, opacity',
          backfaceVisibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {from}
      </span>
      <span
        style={{
          gridArea: 'swap',
          display: 'block',
          opacity: inProgress,
          transform: `translate3d(0, ${y * (1 - inProgress)}px, 0)`,
          filter: `blur(${(inBlur * (1 - inProgress)).toFixed(2)}px)`,
          willChange: 'transform, filter, opacity',
          backfaceVisibility: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {to}
      </span>
    </div>
  );
};

type PlusPatternProps = {
  start?: number;
  duration?: number;
  opacity?: number;
  color?: string;
  pitch?: number;
  size?: number;
  strokeWidth?: number;
  style?: CSSProperties;
};

export const PlusPattern: React.FC<PlusPatternProps> = ({
  start = 0,
  duration = 0,
  opacity = 1,
  color = T.c.hair,
  pitch = T.grid.plusPitch,
  size = 14,
  strokeWidth = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const patternId = useUniqueId('foundersync-plus-pattern');
  const fade = duration > 0 ? prog(frame, start, duration, 'expoOut') : 1;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={T.W}
      height={T.H}
      viewBox={`0 0 ${T.W} ${T.H}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: opacity * fade,
        pointerEvents: 'none',
        ...style,
      }}
    >
      <defs>
        <pattern
          id={patternId}
          width={pitch}
          height={pitch}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${size / 2} 0 V ${size} M 0 ${size / 2} H ${size}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
          />
        </pattern>
      </defs>
      <rect width={T.W} height={T.H} fill={`url(#${patternId})`} />
    </svg>
  );
};

const mixHex = (from: string, to: string, progress: number): string => {
  const parse = (hex: string) => {
    const normalized = hex.replace('#', '');
    return [0, 2, 4].map((offset) =>
      Number.parseInt(normalized.slice(offset, offset + 2), 16),
    );
  };
  const fromRgb = parse(from);
  const toRgb = parse(to);
  const mixed = fromRgb.map((channel, index) =>
    Math.round(lerp(channel, toRgb[index], clamp01(progress))),
  );
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
};

type RingPatternProps = {
  start?: number;
  duration?: number;
  opacity?: number;
  pitch?: number;
  diameter?: number;
  strokeWidth?: number;
  centerColor?: string;
  edgeColor?: string;
  style?: CSSProperties;
};

export const RingPattern: React.FC<RingPatternProps> = ({
  start = 0,
  duration = 24,
  opacity = 0.4,
  pitch = T.grid.ringPitch,
  diameter = 14,
  strokeWidth = 2,
  centerColor = '#8c6cf2',
  edgeColor = '#dcdcea',
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = prog(frame, start, duration, 'expoOut');
  const maxDistance = Math.hypot(T.W / 2, T.H / 2);
  const waveFront = progress * (maxDistance + pitch * 2) - pitch * 2;
  const circles: ReactNode[] = [];

  for (let y = pitch / 2; y <= T.H + pitch / 2; y += pitch) {
    for (let x = pitch / 2; x <= T.W + pitch / 2; x += pitch) {
      const distance = Math.hypot(x - T.W / 2, y - T.H / 2);
      const normalizedDistance = clamp01(distance / maxDistance);
      const waveOpacity = clamp01((waveFront - distance + pitch * 1.25) / (pitch * 1.25));
      const radialOpacity = 1 - normalizedDistance * 0.22;
      circles.push(
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={diameter / 2}
          fill="none"
          stroke={mixHex(centerColor, edgeColor, normalizedDistance)}
          strokeWidth={strokeWidth}
          strokeOpacity={opacity * radialOpacity * waveOpacity}
        />,
      );
    }
  }

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={T.W}
      height={T.H}
      viewBox={`0 0 ${T.W} ${T.H}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {circles}
    </svg>
  );
};

type GlowProps = {
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  fromRy?: number;
  toRy?: number;
  start?: number;
  duration?: number;
  fromOpacity?: number;
  toOpacity?: number;
  opacity?: number;
  ease?: EaseName;
  style?: CSSProperties;
};

type GlowFieldProps = GlowProps & {
  defaultCenter: Point;
  defaultRx: number;
  defaultRy: number;
};

const GlowField: React.FC<GlowFieldProps> = ({
  cx,
  cy,
  rx,
  ry,
  fromRy,
  toRy,
  start = 0,
  duration = 1,
  fromOpacity = 1,
  toOpacity = 1,
  opacity,
  ease = 'cubicInOut',
  defaultCenter,
  defaultRx,
  defaultRy,
  style,
}) => {
  const frame = useCurrentFrame();
  const progress = prog(frame, start, duration, ease);
  const centerX = cx ?? defaultCenter.x;
  const centerY = cy ?? defaultCenter.y;
  const radiusX = rx ?? defaultRx;
  const radiusY =
    ry ??
    (fromRy !== undefined || toRy !== undefined
      ? lerp(fromRy ?? defaultRy, toRy ?? fromRy ?? defaultRy, progress)
      : defaultRy);
  const resolvedOpacity = opacity ?? lerp(fromOpacity, toOpacity, progress);
  const stops = T.c.glow
    .map((color, index) => `${color} ${T.c.glowStops[index] * 100}%`)
    .join(', ');

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        opacity: resolvedOpacity,
        pointerEvents: 'none',
        background: `radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${centerX}px ${centerY}px, ${stops})`,
        ...style,
      }}
    />
  );
};

export const GlowTop: React.FC<GlowProps> = (props) => (
  <GlowField
    defaultCenter={{ x: 960, y: -50 }}
    defaultRx={1300}
    defaultRy={620}
    {...props}
  />
);

export const GlowBottom: React.FC<GlowProps> = (props) => (
  <GlowField
    defaultCenter={{ x: 960, y: 1180 }}
    defaultRx={1250}
    defaultRy={640}
    {...props}
  />
);

type GrainProps = {
  opacity?: number;
  seed?: number;
  baseFrequency?: number;
  numOctaves?: number;
  style?: CSSProperties;
};

export const Grain: React.FC<GrainProps> = ({
  opacity = 0.05,
  seed = 0,
  baseFrequency = 0.8,
  numOctaves = 2,
  style,
}) => {
  const frame = useCurrentFrame();
  const filterId = useUniqueId('foundersync-grain');
  const turbulenceSeed = seed + Math.floor(frame / 2);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={T.W}
      height={T.H}
      viewBox={`0 0 ${T.W} ${T.H}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
        mixBlendMode: 'soft-light',
        ...style,
      }}
    >
      <defs>
        <filter
          id={filterId}
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves={numOctaves}
            seed={turbulenceSeed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 1" />
          </feComponentTransfer>
        </filter>
      </defs>
      <rect width={T.W} height={T.H} filter={`url(#${filterId})`} />
    </svg>
  );
};

type FireworksMarkProps = {
  size: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};

export const FireworksMark: React.FC<FireworksMarkProps> = ({
  size,
  color = T.c.purple,
  className,
  style,
}) => {
  const centerX = size / 2;
  const baseY = size * 0.9;
  const strokeWidth = size * 0.09;
  const angles = [-60, -30, 0, 30, 60];
  const rays = angles.map((angle) => {
    const radians = (angle * Math.PI) / 180;
    const sin = Math.sin(radians);
    const length =
      Math.abs(sin) < 0.001
        ? size * 0.83
        : Math.min(size * 0.83, (size * 0.38) / Math.abs(sin));
    const x2 = centerX + sin * length;
    const y2 = baseY - Math.cos(radians) * length;
    return `M ${centerX} ${baseY} L ${x2} ${y2}`;
  });

  return (
    <svg
      className={className}
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', overflow: 'visible', ...style }}
    >
      <g
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {rays.map((path, index) => (
          <path key={`ray-${index}`} d={path} />
        ))}
        <path
          d={`M ${size * 0.32} ${size * 0.8} Q ${size * 0.41} ${size * 0.87} ${centerX} ${baseY} Q ${size * 0.59} ${size * 0.87} ${size * 0.68} ${size * 0.8}`}
        />
      </g>
    </svg>
  );
};

type ChipVariant = 'solid' | 'outline' | 'ghost';

type ChipProps = {
  children: ReactNode;
  variant?: ChipVariant;
  radius?: number | string;
  fontSize?: number;
  padding?: CSSProperties['padding'];
  style?: CSSProperties;
  className?: string;
};

const chipVariantStyles: Record<ChipVariant, CSSProperties> = {
  solid: {
    backgroundColor: T.c.white,
    border: '1px solid transparent',
    color: T.c.purple,
  },
  outline: {
    backgroundColor: 'transparent',
    border: `3px solid ${T.c.white}`,
    color: T.c.white,
  },
  ghost: {
    backgroundColor: 'rgba(239,230,255,0.6)',
    border: '1px solid rgba(97,8,245,0.12)',
    color: T.c.purple,
  },
};

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'solid',
  radius = T.radius.chip,
  fontSize = T.size.chipSm,
  padding = '16px 28px',
  style,
  className,
}) => (
  <div
    className={className}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      borderRadius: radius,
      padding,
      fontFamily: T.font.sans,
      fontSize,
      fontWeight: 500,
      lineHeight: 1,
      letterSpacing: '-0.025em',
      whiteSpace: 'nowrap',
      ...chipVariantStyles[variant],
      ...style,
    }}
  >
    {children}
  </div>
);

export const random = (seed: number | string): number => remotionRandom(seed);
