import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import Main from './DesignMe';
import { T } from './tokens';

loadInter('normal', {
  weights: ['500'],
  subsets: ['latin'],
});

loadJetBrainsMono('normal', {
  weights: ['400'],
  subsets: ['latin'],
});

const RemotionRoot: React.FC = () => (
  <Composition
    id="Next4"
    component={Main}
    durationInFrames={T.DUR}
    fps={T.fps}
    width={T.W}
    height={T.H}
  />
);

registerRoot(RemotionRoot);
