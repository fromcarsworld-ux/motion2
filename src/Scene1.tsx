import React, { type CSSProperties, type ReactNode } from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import {
  blurIn,
  Camera,
  Chip,
  FireworksMark,
  GlowBottom,
  GlowTop,
  Grain,
  Parallax,
  PlusPattern,
  prog,
  random,
  Reveal,
  WordSwap,
} from './helpers';
import { T } from './tokens';

// Audio extraction: ffmpeg -i next4.mp4 -vn -c:a aac public/audio.m4a
export const FROM = 0;
export const DUR = 248;

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

const heroStyle: CSSProperties = {
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

const Square: React.FC<{
  x: number;
  y: number;
  color: string;
  size?: number;
  opacity?: number;
}> = ({ x, y, color, size = 8, opacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      backgroundColor: color,
      opacity,
    }}
  />
);

const HeroQuestion: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = between(frame, 0, 14, 1.14, 1, 'expoOut');
  return (
    <Centered
      y={538}
      style={{
        color: T.c.white,
        filter: blurIn(frame, 0, 12, 14),
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      <Reveal
        text="You agreed on 50/50"
        start={-5}
        perWordStagger={3}
        dur={14}
        y={28}
        blur={12}
        style={{ ...heroStyle, color: T.c.white }}
      />
    </Centered>
  );
};

const FairQuestion: React.FC<{ frame: number }> = ({ frame }) => {
  const y = between(frame, 28, 46, 511, 548, 'cubicInOut');
  return (
    <Centered
      y={y}
      style={{
        color: T.c.ink,
        opacity: prog(frame, 28, 8, 'expoOut'),
        filter: blurIn(frame, 28, 8, 10),
      }}
    >
      <div style={{ ...heroStyle, color: T.c.ink }}>But did you?</div>
    </Centered>
  );
};

const PurpleRimRetreat: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = 1 - prog(frame, 28, 16, 'expoOut');
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        pointerEvents: 'none',
        background: [
          'radial-gradient(ellipse 900px 260px at 0% 0%, rgba(97,8,245,0.48), rgba(97,8,245,0) 72%)',
          'radial-gradient(ellipse 900px 260px at 100% 0%, rgba(97,8,245,0.42), rgba(97,8,245,0) 72%)',
          'radial-gradient(ellipse 1000px 300px at 0% 100%, rgba(97,8,245,0.42), rgba(97,8,245,0) 72%)',
          'radial-gradient(ellipse 1000px 300px at 100% 100%, rgba(97,8,245,0.48), rgba(97,8,245,0) 72%)',
        ].join(', '),
      }}
    />
  );
};

const WhiteFlood: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = prog(frame, 22, 8, 'expoIn');
  const radius = Math.max(1, 2400 * progress);
  const diameter = radius * 2;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 960,
        top: 538,
        width: diameter,
        height: diameter,
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        background:
          'radial-gradient(circle, #ffffff 0%, #ffffff calc(100% - 160px), #6108f5 100%)',
        pointerEvents: 'none',
      }}
    />
  );
};

type BenefitIconName = 'roles' | 'hours' | 'decisions';

const BenefitIcon: React.FC<{ name: BenefitIconName }> = ({ name }) => {
  const shared = {
    fill: 'none',
    stroke: T.c.ink,
    strokeWidth: 5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (name === 'roles') {
    return (
      <svg width={84} height={84} viewBox="0 0 100 100" aria-hidden="true">
        <g {...shared}>
          <circle cx="38" cy="31" r="13" />
          <circle cx="67" cy="37" r="10" />
          <path d="M14 79c2-17 10-26 24-26s22 9 24 26" />
          <path d="M59 58c13-4 24 4 27 18" />
        </g>
      </svg>
    );
  }

  if (name === 'hours') {
    return (
      <svg width={84} height={84} viewBox="0 0 100 100" aria-hidden="true">
        <g {...shared}>
          <circle cx="50" cy="51" r="33" />
          <path d="M50 30v23l17 11" />
          <path d="M50 8v8M8 51h8M84 51h8" />
        </g>
      </svg>
    );
  }

  return (
    <svg width={84} height={84} viewBox="0 0 100 100" aria-hidden="true">
      <g {...shared}>
        <path d="M50 82V53M50 53 27 30M50 53l23-23" />
        <rect x="13" y="13" width="28" height="25" rx="5" />
        <rect x="59" y="13" width="28" height="25" rx="5" />
        <rect x="36" y="70" width="28" height="19" rx="5" />
      </g>
    </svg>
  );
};

const BenefitChip: React.FC<{
  frame: number;
  name: BenefitIconName;
  start: number;
  end: number;
  lilac?: boolean;
}> = ({ frame, name, start, end, lilac = false }) => {
  if (frame < start || frame >= end) return null;
  const springProgress = spring({
    frame: Math.max(0, frame - start),
    fps: T.fps,
    config: T.spring.overshoot,
  });
  const fadeIn = prog(frame, start, 7, 'expoOut');
  const fadeOut = prog(frame, end - 3, 3, 'cubicIn');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: fadeIn * (1 - fadeOut),
        transform: `scale(${0.9 + 0.1 * springProgress})`,
        transformOrigin: 'center center',
      }}
    >
      <Chip
        variant={lilac ? 'ghost' : 'solid'}
        radius={44}
        padding={0}
        style={{
          width: 184,
          height: 184,
          backgroundColor: lilac ? T.c.lilac : T.c.white,
          boxShadow:
            '0 0 0 12px rgba(255,255,255,0.25), 0 0 60px rgba(160,120,255,0.6)',
        }}
      >
        <BenefitIcon name={name} />
      </Chip>
    </div>
  );
};

const Benefits: React.FC<{ frame: number }> = ({ frame }) => {
  let word: ReactNode = <span>Roles</span>;
  if (frame >= 58 && frame < 70) {
    word = (
      <WordSwap
        from="Roles"
        to="Hours"
        start={58}
        style={{ ...heroStyle, color: T.c.white }}
      />
    );
  } else if (frame >= 70) {
    word = (
      <WordSwap
        from="Hours"
        to="Decisions"
        start={70}
        style={{ ...heroStyle, color: T.c.white }}
      />
    );
  }

  return (
    <Centered
      y={538}
      style={{ display: 'flex', alignItems: 'center', gap: 64, color: T.c.white }}
    >
      <div style={{ ...heroStyle, color: T.c.white }}>{word}</div>
      <div
        style={{
          position: 'relative',
          flex: '0 0 184px',
          width: 184,
          height: 184,
        }}
      >
        <BenefitChip frame={frame} name="roles" start={49} end={61} />
        <BenefitChip frame={frame} name="hours" start={61} end={73} />
        <BenefitChip frame={frame} name="decisions" start={73} end={98} lilac />
      </div>
    </Centered>
  );
};

const FounderSyncButton: React.FC<{ frame: number }> = ({ frame }) => {
  const buttonSpring = spring({
    frame: Math.max(0, frame - 98),
    fps: T.fps,
    config: T.spring.overshoot,
  });
  const expansion = prog(frame, 104, 12, 'cubicInOut');
  const shrink = prog(frame, 120, 12, 'cubicInOut');
  const buttonWidth = lerp(485, 922, expansion);
  const buttonScale = (0.97 + 0.03 * buttonSpring) * (1 - 0.88 * shrink);
  const buttonY = lerp(538, 263, shrink);
  const visibleNameWidth = lerp(60, 570, expansion);
  const buttonOpacity = 1 - shrink;
  const monoOpacity = prog(frame, 120, 12, 'expoOut') * 0.6;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: buttonY,
          width: buttonWidth,
          height: 295,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 34,
          borderRadius: T.radius.button,
          backgroundColor: T.c.purple,
          color: T.c.white,
          opacity: buttonOpacity,
          transform: `translate(-50%, -50%) scale(${buttonScale})`,
          transformOrigin: 'center center',
          overflow: 'hidden',
        }}
      >
        <FireworksMark size={150} color={T.c.white} />
        <div
          style={{
            width: visibleNameWidth,
            overflow: 'hidden',
            flex: '0 0 auto',
            fontFamily: T.font.sans,
            fontSize: T.size.brand,
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          FounderSync
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 1400,
          top: 538,
          width: 40,
          height: 1,
          backgroundColor: T.c.hair,
          opacity: prog(frame, 112, 4, 'expoOut') * (1 - shrink),
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 263,
          transform: 'translate(-50%, -50%)',
          opacity: monoOpacity,
          color: 'rgba(10,10,10,0.6)',
          fontFamily: T.font.mono,
          fontSize: T.size.mono,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        FounderSync
      </div>
    </>
  );
};

const BrandTagline: React.FC<{ frame: number }> = ({ frame }) => {
  const x = between(frame, 124, 153, 960, 918, 'cubicInOut');
  return (
    <>
      <Centered x={x} y={538} style={{ color: T.c.ink }}>
        <Reveal
          text="Build trust with data."
          start={124}
          perWordStagger={3}
          dur={14}
          y={28}
          blur={12}
          style={{ ...heroStyle, color: T.c.ink }}
        />
      </Centered>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 540,
          width: 84,
          height: 1,
          backgroundColor: T.c.hair,
        }}
      />
      <Square
        x={between(frame, 120, 150, 90, 163, 'cubicInOut')}
        y={536}
        size={8}
        color={T.c.ink}
      />
    </>
  );
};

const SignalColumn: React.FC<{
  frame: number;
  side: 'left' | 'right';
  width: number;
  columnIndex: number;
  rowPitch: number;
  cellHeight: number;
}> = ({ frame, side, width, columnIndex, rowPitch, cellHeight }) => {
  if (width <= 0.5) return null;
  const enter = prog(frame, 153 + columnIndex * 3, 12, 'expoOut');
  const reshuffleStep =
    frame < 213 ? Math.floor(frame / 8) : 1000 + Math.floor((frame - 213) / 6);
  const rowCount = Math.ceil(T.H / rowPitch) + 1;
  const cells: ReactNode[] = [];

  for (let row = 0; row < rowCount; row++) {
    const lit = random(`${side}-${columnIndex}-${row}-${reshuffleStep}`) < 0.14;
    cells.push(
      <div
        key={`${side}-${columnIndex}-${row}`}
        style={{
          position: 'absolute',
          left: 0,
          top: row * rowPitch + (rowPitch - (lit ? cellHeight : 1)) / 2,
          width: '100%',
          height: lit ? cellHeight : 1,
          backgroundColor: lit ? T.c.white : 'rgba(255,255,255,0.45)',
        }}
      />,
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height: T.H,
        overflow: 'hidden',
        transform: `scaleX(${enter})`,
        transformOrigin: side === 'left' ? 'left center' : 'right center',
      }}
    >
      {cells}
    </div>
  );
};

const SignalBars: React.FC<{ frame: number }> = ({ frame }) => {
  const reflow = prog(frame, 192, 20, 'cubicInOut');
  const leftWidth = lerp(205, 563, reflow);
  const rightWidth = lerp(207, 0, reflow);
  const rowPitch = lerp(38, 44, reflow);
  const cellHeight = lerp(20, 28, reflow);
  const gap = 5;
  const leftColumnWidth = Math.max(0, (leftWidth - gap) / 2);
  const rightColumnWidth = Math.max(0, (rightWidth - gap) / 2);

  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 0, width: leftWidth, height: T.H }}>
        <SignalColumn
          frame={frame}
          side="left"
          width={leftColumnWidth}
          columnIndex={0}
          rowPitch={rowPitch}
          cellHeight={cellHeight}
        />
        <div style={{ position: 'absolute', left: leftColumnWidth + gap, top: 0 }}>
          <SignalColumn
            frame={frame}
            side="left"
            width={leftColumnWidth}
            columnIndex={1}
            rowPitch={rowPitch}
            cellHeight={cellHeight}
          />
        </div>
      </div>
      {rightWidth > 0.5 && (
        <div
          style={{
            position: 'absolute',
            left: T.W - rightWidth,
            top: 0,
            width: rightWidth,
            height: T.H,
          }}
        >
          <SignalColumn
            frame={frame}
            side="right"
            width={rightColumnWidth}
            columnIndex={0}
            rowPitch={rowPitch}
            cellHeight={cellHeight}
          />
          <div style={{ position: 'absolute', left: rightColumnWidth + gap, top: 0 }}>
            <SignalColumn
              frame={frame}
              side="right"
              width={rightColumnWidth}
              columnIndex={1}
              rowPitch={rowPitch}
              cellHeight={cellHeight}
            />
          </div>
        </div>
      )}
    </>
  );
};

const SignalStatement: React.FC<{ frame: number }> = ({ frame }) => {
  const isSharedExpectation = frame >= 201;
  const reflow = prog(frame, 192, 20, 'cubicInOut');
  const drift = prog(frame, 212, 36, 'cubicInOut');
  const zeroX = frame < 212 ? lerp(980, 1296, reflow) : lerp(1296, 1238, drift);
  const rightDotOpacity = 1 - prog(frame, 192, 20, 'cubicInOut');
  const leftDotX = frame < 192 ? 300 : lerp(300, 669, reflow);
  const labelOpacity = 1 - prog(frame, 196, 6, 'expoOut');

  return (
    <>
      <SignalBars frame={frame} />
      {!isSharedExpectation ? (
        <>
          <Centered
            y={258}
            style={{
              color: 'rgba(255,255,255,0.6)',
              opacity: labelOpacity,
              fontFamily: T.font.mono,
              fontSize: T.size.mono,
              fontWeight: 400,
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            GITHUB / FIGMA / NOTION / LINEAR
          </Centered>
          <Centered y={538}>
            <Reveal
              text="Work, made visible"
              start={155}
              perWordStagger={3}
              dur={14}
              y={28}
              blur={12}
              style={{ ...heroStyle, color: T.c.white }}
            />
          </Centered>
          <Square x={300} y={536} color={T.c.white} size={8} />
          <Square x={1613} y={536} color={T.c.white} size={8} opacity={rightDotOpacity} />
        </>
      ) : (
        <Centered x={zeroX} y={538}>
          <Reveal
            text="Less guesswork"
            start={201}
            perWordStagger={3}
            dur={11}
            y={28}
            blur={12}
            style={{ ...heroStyle, color: T.c.white }}
          />
        </Centered>
      )}
      {isSharedExpectation && <Square x={leftDotX} y={536} color={T.c.white} size={8} />}
    </>
  );
};

const DipOverlay: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = frame === 44 ? 0.28 : frame === 45 ? 0.46 : frame === 46 ? 0.68 : 0;
  if (opacity <= 0) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: T.c.black,
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

const backgroundForFrame = (frame: number): string => {
  if (frame < 28) return T.c.black;
  if (frame < 46) return T.c.white;
  if (frame < 98) return T.c.black;
  if (frame < 153) return T.c.white;
  return T.c.black;
};

const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame - FROM;

  return (
    <AbsoluteFill
      style={{
        width: T.W,
        height: T.H,
        overflow: 'hidden',
        backgroundColor: backgroundForFrame(local),
        fontFamily: T.font.sans,
      }}
    >
      <Camera
        from={{ x: 0, y: 0 }}
        to={{ x: 0, y: 0 }}
        origin="960px 540px"
        pushIn={{ from: 1, to: 1.03, start: 0, dur: DUR, ease: 'cubicInOut' }}
      >
        <Parallax factor={0.4}>
          {local < 28 && (
            <GlowTop
              cx={960}
              cy={-50}
              rx={1300}
              ry={620}
              start={0}
              duration={24}
              fromOpacity={0.55}
              toOpacity={1}
              ease="expoOut"
            />
          )}
          {local >= 46 && local < 98 && (
            <GlowBottom
              cx={960}
              cy={1180}
              rx={1250}
              fromRy={local < 84 ? 640 : 760}
              toRy={local < 84 ? 760 : 2600}
              start={local < 84 ? 46 : 84}
              duration={local < 84 ? 38 : 14}
              ease={local < 84 ? 'cubicInOut' : 'cubicIn'}
            />
          )}
          {local >= 98 && local < 153 && (
            <PlusPattern start={100} duration={10} color={T.c.hair} />
          )}
        </Parallax>

        <Parallax factor={0.7}>
          {local >= 28 && local < 46 && <PurpleRimRetreat frame={local} />}
        </Parallax>

        <Parallax factor={1}>
          {local < 28 && <HeroQuestion frame={local} />}
          {local >= 22 && local < 31 && <WhiteFlood frame={local} />}
          {local >= 28 && local < 46 && <FairQuestion frame={local} />}
          {local >= 46 && local < 98 && <Benefits frame={local} />}
          {local >= 98 && local < 120 && <FounderSyncButton frame={local} />}
          {local >= 120 && local < 153 && (
            <>
              <FounderSyncButton frame={local} />
              <BrandTagline frame={local} />
            </>
          )}
          {local >= 153 && local < DUR && <SignalStatement frame={local} />}
          <DipOverlay frame={local} />
        </Parallax>

        <Grain opacity={0.05} seed={3} />
      </Camera>
    </AbsoluteFill>
  );
};

export default Scene1;
