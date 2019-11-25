import Phaser from 'phaser'
import lang from './lang'

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 1136;
const MAX_WIDTH = 960;
const MAX_HEIGHT = 1400;

export default {
  type: Phaser.AUTO,
  parent: 'content',
  scale: {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    mode: Phaser.Scale.NONE,
    parent: 'content',
  },
  webfonts: ['Press Start 2P'],
  gameOptions: {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    maxWidth: MAX_WIDTH,
    maxHeight: MAX_HEIGHT,
  },
  lang: lang.en,
  normalTimerColor: 0x70B731,
  warningTimerColor: 0xFFA300,
  errorTimerColor: 0xD80000,
  symbolTime: [
    null, 750, 750, 1000, 1000, 1000, 1000, 1250, 1400, 1250,
  ],
  presets: {
    tutorial: {maxSymbol: 4, timeScale: 10, runesCount: [2, 2], tutor: true},
    easy0: {maxSymbol: 4, timeScale: 3, runesCount: [4, 6]},
    easy1: {maxSymbol: 6, timeScale: 2.75, runesCount: [4, 6]},
    easy2: {maxSymbol: 7, timeScale: 2.5, runesCount: [6, 8]},
    easy3: {maxSymbol: 9, timeScale: 2.25, runesCount: [6, 8]},
    middle0: {maxSymbol: 9, timeScale: 2, runesCount: [7, 10]},
    middle1: {maxSymbol: 9, timeScale: 1.75, runesCount: [8, 12]},
    middle2: {maxSymbol: 9, timeScale: 1.5, runesCount: [8, 12]},
    hard0: {maxSymbol: 9, timeScale: 1.2, runesCount: [12, 15]},
  },
  tutorialFinished: false,
  gameStat: {
    started: new Date(),
    total: 0,
    completed: 0,
    failed: 0,
    failSequence: 0,
  },
  permanentMode: false,
  sheepTotal: 15,
  sheepCurrent: 15,
  music: null,
  musicMuted: false,
  musicParams: {
    mute: false,
    volume: .5,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: true,
    delay: 500
  },
  localStorageName: 'keep_your_sheep'
}
