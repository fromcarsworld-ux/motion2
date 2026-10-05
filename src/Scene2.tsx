import React, { type CSSProperties, type ReactNode } from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import {
  blurIn,
  blurOut,
  Camera,
  Chip,
  DirBlur,
  FireworksMark,
  Grain,
  Parallax,
  PlusPattern,
  prog,
  random,
  Reveal,
  WordSwap,
} from './helpers';
import { T } from './tokens';

export const FROM = 248;
export const DUR = 280;

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

const headingStyle: CSSProperties = {
  fontFamily: T.font.sans,
  fontSize: T.size.statement,
  fontWeight: 500,
  letterSpacing: '-0.025em',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  margin: 0,
};

type Mode = 'align' | 'plan' | 'track' | 'launch';

const ModeGlyph: React.FC<{ mode: Mode }> = ({ mode }) => {
  const common = {
    fill: 'none',
    stroke: T.c.white,
    strokeWidth: 5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (mode === 'align') {
    return (
      <svg width={46} height={46} viewBox="0 0 64 64" aria-hidden="true">
        <g {...common}>
          <path d="M9 15h29a7 7 0 0 1 7 7v13a7 7 0 0 1-7 7H25L14 51v-9H9a7 7 0 0 1-7-7V22a7 7 0 0 1 7-7Z" />
          <path d="m20 29 6 6 12-13" />
          <path d="M46 25h8a7 7 0 0 1 7 7v13a7 7 0 0 1-7 7h-5" />
        </g>
      </svg>
    );
  }

  if (mode === 'plan') {
    return (
      <svg width={46} height={46} viewBox="0 0 64 64" aria-hidden="true">
        <g {...common}>
          <path d="M17 6h21l11 11v41H17a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6Z" />
          <path d="M38 7v12h11M21 31h23M21 41h23M21 51h14" />
        </g>
      </svg>
    );
  }

  if (mode === 'track') {
    return (
      <svg width={46} height={46} viewBox="0 0 64 64" aria-hidden="true">
        <g {...common}>
          <path d="M8 53V11M8 53h49" />
          <path d="m15 42 12-12 9 7 17-20" />
          <path d="M43 17h10v10" />
        </g>
      </svg>
    );
  }

  return (
    <svg width={46} height={46} viewBox="0 0 64 64" aria-hidden="true">
      <g {...common}>
        <path d="M7 33h40" />
        <path d="m34 17 16 16-16 16" />
        <path d="M8 13h17M8 53h17" />
      </g>
    </svg>
  );
};

const ModeTile: React.FC<{ mode: Mode; size?: number }> = ({ mode, size = 80 }) => (
  <div
    style={{
      width: size,
      height: size,
      flex: `0 0 ${size}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: T.radius.icon,
      backgroundColor: T.c.purple,
    }}
  >
    <ModeGlyph mode={mode} />
  </div>
);

const HPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const drift = between(frame, 0, 64, 0, 18, 'cubicInOut');
  const opacity = 1 - prog(frame, 64, 18, 'expoOut');
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 560,
          width: 970,
          height: 520,
          backgroundColor: T.c.panel,
          borderTop: `1px solid ${T.c.hair}`,
          borderRight: `1px solid ${T.c.hair}`,
          opacity,
          transform: `translateY(${drift}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 970,
          top: 560,
          width: 30,
          height: 520,
          backgroundColor: T.c.panel,
          borderTop: `1px solid ${T.c.hair}`,
          borderRight: `1px solid ${T.c.hair}`,
          opacity,
          transform: `translateY(${drift}px)`,
        }}
      />
    </>
  );
};

const ModeList: React.FC<{ frame: number; overallOpacity: number }> = ({
  frame,
  overallOpacity,
}) => {
  const modes: Mode[] = ['align', 'plan', 'track', 'launch'];
  const labels = ['Align', 'Plan', 'Track', 'Launch'];
  const step = Math.min(3, Math.max(0, Math.floor((frame - 4) / 12)));
  const stepStart = 4 + step * 12;
  const previousIndex = Math.max(0, step - 1);
  const scrollProgress = step === 0 ? 0 : prog(frame, stepStart, 7, 'cubicInOut');
  const centerIndex = lerp(previousIndex, step, scrollProgress);
  const highlightProgress = step === 0 ? 1 : prog(frame, stepStart, 6, 'expoOut');
  const listDim = 1 - 0.65 * prog(frame, 58, 6, 'expoOut');
  const fallProgress = prog(frame, 58, 6, 'cubicInOut');

  return (
    <>
      {modes.map((mode, index) => {
        const previousDistance = Math.abs(index - previousIndex);
        const currentDistance = Math.abs(index - step);
        const opacityAt = (distance: number) =>
          distance < 0.5 ? 1 : distance < 1.5 ? 0.35 : 0.2;
        const rowOpacity =
          lerp(opacityAt(previousDistance), opacityAt(currentDistance), highlightProgress) *
          overallOpacity *
          listDim;
        const rowY = 575 + (index - centerIndex) * 146;
        return (
          <React.Fragment key={mode}>
            <div
              style={{
                position: 'absolute',
                left: 1122,
                top: rowY - 40,
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                opacity: rowOpacity,
              }}
            >
              <div style={{ opacity: index === 3 ? 1 - fallProgress : 1 }}>
                <ModeTile mode={mode} />
              </div>
              <div
                style={{
                  color: T.c.purple,
                  fontFamily: T.font.sans,
                  fontSize: 110,
                  fontWeight: 500,
                  letterSpacing: '-0.025em',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                }}
              >
                {labels[index]}
              </div>
            </div>
            {index === 3 && frame >= 58 && frame < 64 && (
              <div
                style={{
                  position: 'absolute',
                  left: 1122,
                  top: 535,
                  opacity: overallOpacity * listDim,
                  transform: `translateY(${250 * fallProgress}px)`,
                }}
              >
                <DirBlur x={0} y={8 * Math.sin(Math.PI * fallProgress)}>
                  <ModeTile mode="launch" />
                </DirBlur>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

const HContent: React.FC<{ frame: number }> = ({ frame }) => {
  const transition = prog(frame, 64, 18, 'expoOut');
  const overallOpacity = 1 - transition;
  const phraseWidth =
    frame < 58 ? 850 : between(frame, 58, 64, 850, 110, 'cubicInOut');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: overallOpacity,
        filter: frame >= 64 ? blurOut(frame, 64, 18, 10) : 'blur(0px)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 68,
          top: 538,
          width: phraseWidth,
          overflow: 'hidden',
          transform: 'translateY(-50%)',
          color: T.c.ink,
        }}
      >
        {frame < 40 ? (
          <div style={{ ...headingStyle, color: T.c.ink }}>One platform</div>
        ) : (
          <WordSwap
            from="One platform"
            to="to build & launch"
            start={40}
            style={{ ...headingStyle, color: T.c.ink }}
          />
        )}
      </div>
      <ModeList frame={frame} overallOpacity={overallOpacity} />
    </div>
  );
};

const OrbitRings: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = prog(frame, 68, 16, 'expoOut');
  const fade = 1 - prog(frame, 106, 12, 'expoOut');
  const scale = lerp(0.6, 1, appear);
  const opacity = appear * fade;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: '960px 540px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 960 - 316,
          top: 540 - 316,
          width: 632,
          height: 632,
          borderRadius: '50%',
          border: '1px solid #efeff5',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 960 - 237,
          top: 540 - 237,
          width: 474,
          height: 474,
          borderRadius: '50%',
          border: '1px solid #efeff5',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 960 - 148,
          top: 540 - 148,
          width: 296,
          height: 296,
          borderRadius: '50%',
          backgroundColor: '#f4f4f4',
          border: '1px solid #ececf3',
        }}
      />
    </div>
  );
};

const OrbitIcons: React.FC<{ frame: number }> = ({ frame }) => {
  const modes: Mode[] = ['align', 'plan', 'track', 'launch'];
  const angles = [-71.6, 17.7, 107, 195.4];
  const orbitRotation = 58 * prog(frame, 76, 36, 'expoOut');
  const orbitRadius = 380;

  return (
    <>
      {modes.map((mode, index) => {
        const start = 64 + index * 3;
        const flight = spring({
          frame: Math.max(0, frame - start),
          fps: T.fps,
          config: T.spring.icon,
        });
        const opacity = prog(frame, start, 7, 'expoOut') * (1 - prog(frame, 106, 12, 'expoOut'));
        const startX = 1162;
        const startY = 575 + (index - 3) * 146;
        const angle = ((angles[index] + orbitRotation) * Math.PI) / 180;
        const targetX = 960 + Math.cos(angle) * orbitRadius;
        const targetY = 540 + Math.sin(angle) * orbitRadius;
        const x = lerp(startX, targetX, flight);
        const y = lerp(startY, targetY, flight);

        return (
          <div
            key={mode}
            style={{
              position: 'absolute',
              left: x - 37,
              top: y - 37,
              width: 74,
              height: 74,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 18,
              backgroundColor: T.c.purple,
              opacity,
            }}
          >
            <ModeGlyph mode={mode} />
          </div>
        );
      })}
    </>
  );
};

const OrbitScene: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeIn = prog(frame, 64, 18, 'expoOut');
  const fadeOut = prog(frame, 106, 12, 'expoOut');
  const opacity = fadeIn * (1 - fadeOut);
  const markSpring = spring({
    frame: Math.max(0, frame - 64),
    fps: T.fps,
    config: T.spring.overshoot,
  });

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        filter: frame < 82 ? blurIn(frame, 64, 18, 12) : blurOut(frame, 106, 12, 10),
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 539,
          width: T.W,
          height: 1,
          backgroundColor: T.c.hair,
          opacity: 0.85,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 959,
          top: 0,
          width: 1,
          height: T.H,
          backgroundColor: T.c.hair,
          opacity: 0.85,
        }}
      />
      <OrbitRings frame={frame} />
      <OrbitIcons frame={frame} />
      <Square x={957} y={127} color={T.c.purple} size={6} opacity={opacity} />
      <Square x={1367} y={537} color={T.c.purple} size={6} opacity={opacity} />
      <Square x={957} y={947} color={T.c.purple} size={6} opacity={opacity} />
      <Square x={547} y={537} color={T.c.purple} size={6} opacity={opacity} />
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 540,
          transform: `translate(-50%, -50%) scale(${0.82 + 0.18 * markSpring})`,
          transformOrigin: 'center center',
        }}
      >
        <FireworksMark size={70} color={T.c.ink} />
      </div>
    </div>
  );
};

const PaleSignalBars: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = prog(frame, 106, 12, 'expoOut');
  const seedStep = Math.floor(frame / 8);
  const block = (left: number, width: number, seed: string) => {
    const rows: ReactNode[] = [];
    for (let row = 0; row < Math.ceil(T.H / 38) + 1; row++) {
      const lit = random(`${seed}-${row}-${seedStep}`) < 0.14;
      rows.push(
        <div
          key={`${seed}-${row}`}
          style={{
            position: 'absolute',
            left: 0,
            top: row * 38 + (38 - (lit ? 20 : 1)) / 2,
            width: '100%',
            height: lit ? 20 : 1,
            backgroundColor: lit ? '#e9e9e9' : '#f1f1f1',
          }}
        />,
      );
    }
    return (
      <div
        key={seed}
        style={{
          position: 'absolute',
          left,
          top: 0,
          width,
          height: T.H,
          opacity,
          overflow: 'hidden',
        }}
      >
        {rows}
      </div>
    );
  };

  return (
    <>
      {block(0, 275, 'left-pale')}
      {block(1407, 513, 'right-pale')}
    </>
  );
};

const CofounderPill: React.FC<{ frame: number }> = ({ frame }) => {
  const entrance = spring({
    frame: Math.max(0, frame - 150),
    fps: T.fps,
    config: T.spring.settle,
  });
  const opacity = prog(frame, 150, 8, 'expoOut');
  const lineProgress = prog(frame, 136, 14, 'cubicInOut');
  const lineHeight = 206 * lineProgress;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 959,
          top: 669,
          width: 1,
          height: lineHeight,
          backgroundColor: 'rgba(97,8,245,0.32)',
          transform: 'translateX(-50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 875,
          transform: `translate(-50%, -50%) scale(${0.92 + 0.08 * entrance})`,
          opacity,
        }}
      >
        <Chip
          variant="ghost"
          radius={10}
          fontSize={T.size.mono}
          padding="16px 20px"
          style={{
            backgroundColor: '#f4efff',
            color: T.c.purple,
            border: '1px solid rgba(97,8,245,0.3)',
            fontFamily: T.font.mono,
            fontWeight: 400,
            letterSpacing: 0,
          }}
        >
          Founder operating system
        </Chip>
      </div>
    </>
  );
};

const FounderBox: React.FC<{ frame: number }> = ({ frame }) => {
  const appear = prog(frame, 106, 12, 'expoOut');
  const expansion = prog(frame, 136, 14, 'cubicInOut');
  const boxWidth = lerp(890, 1523, expansion);
  const suffixProgress = prog(frame, 138, 12, 'expoOut');
  const boxOpacity = appear;
  const markSpring = spring({
    frame: Math.max(0, frame - 106),
    fps: T.fps,
    config: T.spring.settle,
  });
  const hairOpacity = prog(frame, 118, 8, 'expoOut');
  const suffixWidth = 560 * suffixProgress;

  return (
    <>
      <PaleSignalBars frame={frame} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 406,
          width: T.W,
          height: 1,
          backgroundColor: T.c.hair,
          opacity: hairOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 669,
          width: T.W,
          height: 1,
          backgroundColor: T.c.hair,
          opacity: hairOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 406,
          width: 1,
          height: 30,
          backgroundColor: T.c.hair,
          opacity: hairOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 639,
          width: 1,
          height: 30,
          backgroundColor: T.c.hair,
          opacity: hairOpacity,
        }}
      />
      <Square x={957} y={403} size={6} color={T.c.purple} opacity={hairOpacity} />
      <Square x={957} y={666} size={6} color={T.c.purple} opacity={hairOpacity} />
      <div
        style={{
          position: 'absolute',
          left: 960,
          top: 538,
          width: boxWidth,
          height: 263,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 28,
          boxSizing: 'border-box',
          padding: '0 58px',
          border: `1px solid ${T.c.hair}`,
          borderRadius: 12,
          backgroundColor: '#f7f7f7',
          opacity: boxOpacity,
          filter: blurIn(frame, 106, 12, 12),
          transform: `translate(-50%, -50%) scale(${0.86 + 0.14 * appear})`,
          transformOrigin: 'center center',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: '0 0 auto',
            gap: 28,
            transform: `scale(${0.92 + 0.08 * markSpring})`,
            transformOrigin: 'center center',
          }}
        >
          <FireworksMark size={70} color={T.c.purple} />
          <div
            style={{
              color: T.c.purple,
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
            width: 1,
            height: 92,
            backgroundColor: T.c.hair,
            opacity: suffixProgress,
            flex: `0 0 ${suffixProgress > 0 ? 1 : 0}px`,
          }}
        />
        <div
          style={{
            width: suffixWidth,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            color: T.c.purple,
            fontFamily: T.font.sans,
            fontSize: T.size.brand,
            fontWeight: 500,
            letterSpacing: '-0.025em',
            lineHeight: 1,
            opacity: suffixProgress,
          }}
        >
          Cofounder OS
        </div>
      </div>
      <CofounderPill frame={frame} />
    </>
  );
};

const HorizontalSwap: React.FC<{
  frame: number;
  from: string;
  to: string;
  start: number;
  style?: CSSProperties;
}> = ({ frame, from, to, start, style }) => {
  const out = prog(frame, start, 12, 'expoOut');
  const incoming = prog(frame, start, 12, 'expoOut');
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          opacity: 1 - out,
          transform: `translate3d(${-40 * out}px, 0, 0)`,
          filter: `blur(${(8 * out).toFixed(2)}px)`,
          whiteSpace: 'nowrap',
        }}
      >
        {from}
      </span>
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          opacity: incoming,
          transform: `translate3d(${24 * (1 - incoming)}px, 0, 0)`,
          filter: `blur(${(12 * (1 - incoming)).toFixed(2)}px)`,
          whiteSpace: 'nowrap',
        }}
      >
        {to}
      </span>
    </div>
  );
};

const LoopGrid: React.FC<{ frame: number }> = ({ frame }) => {
  const opacity = 1 - prog(frame, 264, 16, 'expoOut');
  const drift = between(frame, 182, 280, 0, -30, 'cubicInOut');
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        transform: `translateX(${drift}px)`,
        pointerEvents: 'none',
      }}
    >
      {[342, 733].map((y) => (
        <React.Fragment key={`h-${y}`}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: y,
              width: T.W,
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 142,
              top: y - 5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: T.c.white,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 1773,
              top: y - 5,
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: T.c.white,
            }}
          />
        </React.Fragment>
      ))}
      {[142, 1778].map((x) => (
        <div
          key={`v-${x}`}
          style={{
            position: 'absolute',
            left: x,
            top: 0,
            width: 1,
            height: T.H,
            backgroundColor: 'rgba(255,255,255,0.4)',
          }}
        />
      ))}
    </div>
  );
};

const ProcessFlow: React.FC<{ frame: number }> = ({ frame }) => {
  const exit = prog(frame, 264, 16, 'expoOut');
  const opacity = prog(frame, 182, 8, 'expoOut') * (1 - exit);
  const translateY = -24 * exit;
  const pulseIn = prog(frame, 263, 4, 'expoOut');
  const pulseOut = 1 - prog(frame, 267, 4, 'cubicInOut');
  const pulse = 1 + 0.02 * Math.max(0, Math.min(pulseIn, pulseOut));
  const textDrift = between(frame, 182, 280, 0, -30, 'cubicInOut') * 0.6;
  const textTransform = `translate3d(${textDrift}px, ${translateY}px, 0) scale(${pulse})`;
  const textStyle: CSSProperties = {
    fontFamily: T.font.sans,
    fontSize: T.size.statement,
    fontWeight: 500,
    letterSpacing: '-0.025em',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    color: T.c.white,
  };

  let activeWord = 'agreement';
  let activeNode: ReactNode = activeWord;
  if (frame >= 198 && frame < 220) {
    activeWord = 'plan';
    activeNode = <HorizontalSwap frame={frame} from="agreement" to="plan" start={198} />;
  } else if (frame >= 220 && frame < 244) {
    activeWord = 'tasks';
    activeNode = <HorizontalSwap frame={frame} from="plan" to="tasks" start={220} />;
  } else if (frame >= 244 && frame < 256) {
    activeWord = 'launch';
    activeNode = <HorizontalSwap frame={frame} from="tasks" to="launch" start={244} />;
  } else if (frame >= 256) {
    activeWord = 'launch';
    activeNode = 'launch';
  }

  const nextWord = frame < 198 ? 'plan' : frame < 220 ? 'tasks' : frame < 244 ? 'launch' : '';
  const ghostStart = frame < 198 ? 184 : frame < 220 ? 198 : 220;
  const ghostNextStart = frame < 198 ? 198 : frame < 220 ? 220 : 244;
  const ghostOpacity =
    nextWord === ''
      ? 0
      : prog(frame, ghostStart, 8, 'expoOut') *
        (1 - prog(frame, ghostNextStart - 3, 3, 'cubicIn')) *
        (1 - exit);
  const widths: Record<string, number> = {
    agreement: 600,
    plan: 260,
    tasks: 330,
    launch: 360,
  };
  const ghostX = 640 + widths[activeWord] + 24;

  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 540,
          width: 84,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.4)',
          opacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: between(frame, 182, 212, 90, 163, 'cubicInOut'),
          top: 535,
          width: 10,
          height: 10,
          backgroundColor: T.c.white,
          opacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 332,
          top: 527,
          transform: textTransform,
          transformOrigin: 'left center',
          opacity,
          filter: blurOut(frame, 264, 16, 10),
          ...textStyle,
        }}
      >
        Your
      </div>
      <div
        style={{
          position: 'absolute',
          left: 640,
          top: 527,
          width: 1280,
          height: 140,
          overflow: 'hidden',
          transform: textTransform,
          transformOrigin: 'left center',
          opacity,
          filter: blurOut(frame, 264, 16, 10),
          ...textStyle,
        }}
      >
        {frame >= 198 && frame < 220 ? (
          <HorizontalSwap frame={frame} from="agreement" to="plan" start={198} style={textStyle} />
        ) : frame >= 220 && frame < 244 ? (
          <HorizontalSwap frame={frame} from="plan" to="tasks" start={220} style={textStyle} />
        ) : frame >= 244 && frame < 256 ? (
          <HorizontalSwap frame={frame} from="tasks" to="launch" start={244} style={textStyle} />
        ) : (
          <div style={{ position: 'absolute', left: 0, top: 0 }}>{activeNode}</div>
        )}
      </div>
      {nextWord && (
        <div
          style={{
            position: 'absolute',
            left: ghostX,
            top: 527,
            opacity: ghostOpacity,
            color: T.c.ghost,
            transform: textTransform,
            transformOrigin: 'left center',
            filter: blurOut(frame, 264, 16, 10),
            ...textStyle,
          }}
        >
          {nextWord}
        </div>
      )}
    </>
  );
};

const backgroundForFrame = (frame: number): string =>
  frame < 182 ? T.c.white : T.c.purple;

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame;

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
        from={{ x: 14, y: 0 }}
        to={{ x: -14, y: 0 }}
        moveStart={0}
        moveDur={DUR}
        moveEase="cubicInOut"
        origin="960px 540px"
        pushIn={{ from: 1, to: 1.04, start: 64, dur: 48, ease: 'cubicInOut' }}
      >
        {local < 82 && (
          <Parallax factor={0.4}>
            <HPanel frame={local} />
          </Parallax>
        )}
        {local < 82 && (
          <Parallax factor={1}>
            <HContent frame={local} />
          </Parallax>
        )}
        {local >= 64 && local < 118 && (
          <Parallax factor={0.4}>
            <PlusPattern start={64} duration={18} opacity={0.55} color={T.c.hair} />
          </Parallax>
        )}
        {local >= 64 && local < 118 && (
          <Parallax factor={0.7}>
            <OrbitScene frame={local} />
          </Parallax>
        )}
        {local >= 106 && local < 182 && (
          <Parallax factor={0.4}>
            <FounderBox frame={local} />
          </Parallax>
        )}
        {local >= 182 && (
          <Parallax factor={0.4}>
            <LoopGrid frame={local} />
          </Parallax>
        )}
        {local >= 182 && (
          <Parallax factor={1}>
            <ProcessFlow frame={local} />
          </Parallax>
        )}
        <Grain opacity={0.05} seed={12} />
      </Camera>
    </AbsoluteFill>
  );
};

export default Scene2;
