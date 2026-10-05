import React, { type CSSProperties, type ReactNode } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import {
  blurIn,
  blurOut,
  Camera,
  Grain,
  Parallax,
  PlusPattern,
  prog,
  random,
  Reveal,
  RingPattern,
  WordSwap,
} from './helpers';
import { T } from './tokens';

export const FROM = 528;
export const DUR = 308;

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

const centeredStyle: CSSProperties = {
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

const varyLuma = (hex: string, amount: number): string => {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((offset) =>
    Number.parseInt(value.slice(offset, offset + 2), 16),
  );
  return `#${channels
    .map((channel) =>
      Math.round(Math.max(0, Math.min(255, channel * (1 + amount))))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
};

const mosaicCellSize = (frame: number): number => {
  if (frame < 132) return 120;
  if (frame < 136) return 160;
  if (frame < 140) return 200;
  return 237;
};

const PixelMosaic: React.FC<{ frame: number }> = ({ frame }) => {
  const tileSize = mosaicCellSize(frame);
  const columns = Math.ceil(T.W / tileSize);
  const rows = Math.ceil(T.H / tileSize);
  const maxGridDistance = Math.hypot(columns - 1, rows - 1) || 1;
  const sweep = between(frame, 36, 144, 0.15, 1.2, 'cubicInOut');
  const cycle = Math.floor(frame / 9);
  const cycleFrame = frame - cycle * 9;
  const twinkleA = {
    col: 8 + Math.floor(random(`mosaic-twinkle-a-${cycle}`) * Math.max(1, columns - 8)),
    row: 4 + Math.floor(random(`mosaic-twinkle-ar-${cycle}`) * Math.max(1, rows - 4)),
  };
  const twinkleB = {
    col: 8 + Math.floor(random(`mosaic-twinkle-b-${cycle}`) * Math.max(1, columns - 8)),
    row: 4 + Math.floor(random(`mosaic-twinkle-br-${cycle}`) * Math.max(1, rows - 4)),
  };
  const cells: ReactNode[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const distance = Math.hypot(col, row) / maxGridDistance;
      const darkness = clamp01((sweep - distance) * 2.2);
      const quantizedDarkness = Math.round(darkness * 5) / 5;
      const base = mixHex(T.c.purple, T.c.darkPurple, quantizedDarkness);
      const lumaNoise = (random(`mosaic-noise-${col}-${row}`) - 0.5) * 0.08;
      const twinkle =
        cycleFrame < 6 &&
        ((col === twinkleA.col && row === twinkleA.row) ||
          (col === twinkleB.col && row === twinkleB.row));
      const color = twinkle ? '#8b3dff' : varyLuma(base, lumaNoise);

      cells.push(
        <div
          key={`${col}-${row}`}
          style={{
            position: 'absolute',
            left: col * tileSize,
            top: row * tileSize,
            width: tileSize,
            height: tileSize,
            backgroundColor: color,
          }}
        />,
      );
    }
  }

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        backgroundColor: T.c.purple,
      }}
    >
      {cells}
    </div>
  );
};

const AlignmentCopy: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 30) {
    return (
      <Centered y={540} style={{ color: T.c.white }}>
        <Reveal
          text="Start with alignment"
          start={0}
          perWordStagger={3}
          dur={14}
          y={28}
          blur={12}
          style={{ ...centeredStyle, color: T.c.white }}
        />
      </Centered>
    );
  }

  if (frame < 84) {
    return (
      <Centered y={527} style={{ color: T.c.white }}>
        <WordSwap
          from="Start with alignment"
          to="and a living agreement."
          start={30}
          style={{ ...centeredStyle, color: T.c.white }}
        />
      </Centered>
    );
  }

  const exit = prog(frame, 128, 16, 'expoOut');
  const currentLine = (
    <WordSwap
      from="and a living agreement."
      to="See the work behind it."
      start={84}
      style={{ ...centeredStyle, color: T.c.white }}
    />
  );

  return (
    <Centered
      y={527}
      style={{
        color: T.c.white,
        opacity: 1 - exit,
        filter: blurOut(frame, 128, 16, 10),
        clipPath: `inset(0 ${exit * 100}% 0 0)`,
      }}
    >
      {currentLine}
    </Centered>
  );
};

const ExpandingSquare: React.FC<{ frame: number }> = ({ frame }) => {
  if (frame < 120 || frame >= 159) return null;

  const size =
    frame < 132
      ? between(frame, 120, 132, 63, 137, 'cubicInOut')
      : between(frame, 132, 144, 137, 237, 'cubicInOut');
  const centerX =
    frame < 132 ? 1386 : between(frame, 132, 144, 1386, 985, 'cubicInOut');
  const centerY =
    frame < 132 ? between(frame, 120, 132, 242, 285, 'cubicInOut') : between(frame, 132, 144, 285, 539, 'cubicInOut');
  const flood = prog(frame, 144, 15, 'expoIn');
  const floodScale = 1 + 8.5 * flood;

  return (
    <>
      {frame >= 132 && frame < 144 && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 1535,
            top: centerY,
            width: size,
            height: size,
            transform: 'translate(-50%, -50%)',
            backgroundColor: T.c.darkPurple,
          }}
        />
      )}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: centerX,
          top: centerY,
          width: size,
          height: size,
          transform: `translate(-50%, -50%) scale(${floodScale})`,
          transformOrigin: 'center center',
          backgroundColor: T.c.white,
        }}
      />
    </>
  );
};

const WordSlot: React.FC<{
  frame: number;
  from: string;
  to: string;
  start: number;
  width: number;
  horizontal?: boolean;
}> = ({ frame, from, to, start, width, horizontal = false }) => {
  const progress = prog(frame, start, 16, 'cubicInOut');
  const outgoingTransform = horizontal
    ? `translate3d(${-40 * progress}px, 0, 0)`
    : `translate3d(0, ${-34 * progress}px, 0)`;
  const incomingTransform = horizontal
    ? `translate3d(${-40 * (1 - progress)}px, 0, 0)`
    : `translate3d(0, ${34 * (1 - progress)}px, 0)`;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        flex: `0 0 ${width}px`,
        width,
        height: 138,
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          opacity: 1 - progress,
          transform: outgoingTransform,
          filter: `blur(${(10 * progress).toFixed(2)}px)`,
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
          opacity: progress,
          transform: incomingTransform,
          filter: `blur(${(12 * (1 - progress)).toFixed(2)}px)`,
          whiteSpace: 'nowrap',
        }}
      >
        {to}
      </span>
    </span>
  );
};

const TrustWordDiff: React.FC<{ frame: number }> = ({ frame }) => {
  const style: CSSProperties = {
    fontFamily: T.font.sans,
    fontSize: T.size.statement,
    fontWeight: 500,
    letterSpacing: '-0.025em',
    lineHeight: 1,
    whiteSpace: 'nowrap',
    color: T.c.ink,
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: 960,
        top: 540,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transform: 'translate(-50%, -50%)',
        ...style,
      }}
    >
      <WordSlot frame={frame} from="The" to="is the" start={248} width={350} horizontal />
      <WordSlot frame={frame} from="work" to="trust" start={248} width={300} />
      <span style={{ display: 'inline-block', flex: '0 0 175px', width: 175 }}>you</span>
      <WordSlot frame={frame} from="share" to="build" start={248} width={340} />
    </div>
  );
};

const ProgressiveClearLine: React.FC<{ frame: number }> = ({ frame }) => {
  const scale = between(frame, 156, 160, 1.06, 1, 'expoOut');
  const opacity = prog(frame, 156, 4, 'expoOut');
  const suffixProgress = prog(frame, 160, 18, 'expoOut');
  const suffixWidth = 620 * suffixProgress;

  return (
    <Centered
      y={540}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: T.c.ink,
        opacity,
        filter: blurIn(frame, 156, 8, 12),
        transform: `translate(-50%, -50%) scale(${scale})`,
        transformOrigin: 'center center',
        ...centeredStyle,
      }}
    >
      <span>Clear</span>
      <span
        style={{
          width: suffixWidth,
          overflow: 'hidden',
          flex: `0 0 ${suffixWidth}px`,
          whiteSpace: 'nowrap',
        }}
      >
        {' agreements'}
      </span>
    </Centered>
  );
};

const WhiteStatements: React.FC<{ frame: number }> = ({ frame }) => {
  const textStyle: CSSProperties = { ...centeredStyle, color: T.c.ink };

  return (
    <>
      {frame >= 156 && frame < 178 && <ProgressiveClearLine frame={frame} />}
      {frame >= 178 && frame < 190 && (
        <Centered y={540}>
          <WordSwap
            from="Clear agreements"
            to="More alignment"
            start={178}
            style={textStyle}
          />
        </Centered>
      )}
      {frame >= 190 && frame < 214 && (
        <Centered y={540}>
          <WordSwap
            from="More alignment"
            to="Earlier check-ins"
            start={190}
            style={textStyle}
          />
        </Centered>
      )}
      {frame >= 214 && frame < 248 && (
        <Centered y={540}>
          <Reveal
            text="The work you share"
            start={214}
            perWordStagger={3}
            dur={14}
            y={28}
            blur={12}
            style={textStyle}
          />
        </Centered>
      )}
      {frame >= 248 && frame < 264 && <TrustWordDiff frame={frame} />}
      {frame >= 264 && (
        <Centered y={540}>
          <div style={textStyle}>is the trust you build.</div>
        </Centered>
      )}
    </>
  );
};

const backgroundForFrame = (frame: number): string =>
  frame < 160 ? T.c.purple : T.c.white;

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const local = frame;
  const ringBreathe =
    local >= 264
      ? 1 + 0.02 * Math.sin(((local - 264) / 44) * Math.PI * 2)
      : 1;

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
        to={{ x: -18, y: 10 }}
        moveStart={0}
        moveDur={DUR}
        moveEase="cubicInOut"
        origin="960px 540px"
        pushIn={{ from: 1, to: 1.035, start: 264, dur: 44, ease: 'cubicInOut' }}
      >
        {local >= 36 && local < 160 && (
          <Parallax factor={0.4}>
            <PixelMosaic frame={local} />
          </Parallax>
        )}
        {local >= 214 && local < DUR && (
          <Parallax factor={0.4}>
            <RingPattern
              start={216}
              duration={26}
              opacity={0.4}
              centerColor="#8c6cf2"
              edgeColor="#dcdcea"
              style={{ transform: `scale(${ringBreathe})`, transformOrigin: 'center center' }}
            />
          </Parallax>
        )}
        {local >= 214 && local < DUR && (
          <Parallax factor={0.4}>
            <PlusPattern start={214} duration={8} color={T.c.hair} opacity={0.8} />
          </Parallax>
        )}
        {local < 144 && (
          <Parallax factor={1}>
            <AlignmentCopy frame={local} />
          </Parallax>
        )}
        {local >= 156 && local < DUR && (
          <Parallax factor={1}>
            <WhiteStatements frame={local} />
          </Parallax>
        )}
        {local >= 120 && local < 160 && (
          <Parallax factor={1}>
            <ExpandingSquare frame={local} />
          </Parallax>
        )}
        <Grain opacity={0.05} seed={23} />
      </Camera>
    </AbsoluteFill>
  );
};

export default Scene3;
