import Phaser from 'phaser';

import BootScene from './scenes/Boot';
import SplashScene from './scenes/Splash';
import MainMenuScene from './scenes/MainMenu';
import IntroScene from './scenes/Intro';
import GameScene from './scenes/Game';
import ForestScene from './scenes/Forest';
import ForestGroupScene from './scenes/ForestGroup';

import config from './config';
import lang from './lang';

const gameConfig = Object.assign(config, {
  scene: [BootScene, SplashScene, MainMenuScene, IntroScene, GameScene, ForestScene, ForestGroupScene]
})

class Game extends Phaser.Game {
  constructor () {
    super(gameConfig);

    const userLang = (navigator.language || navigator.userLanguage).split('-')[0];
    if (userLang in lang) {
      config.lang = lang[userLang];
    }

    const resize = () => {
      const w = window.innerWidth;
      let h;
      if (!window.cordova) {
        h = window.innerHeight;// * window.devicePixelRatio;
      } else {
        h = (window.innerHeight + 20);// * window.devicePixelRatio;
      }

      const scaleMode = 'FIT';
      const DEFAULT_WIDTH = gameConfig.gameOptions.width;
      const DEFAULT_HEIGHT = gameConfig.gameOptions.height;
      const MAX_WIDTH = gameConfig.gameOptions.maxWidth;
      const MAX_HEIGHT = gameConfig.gameOptions.maxHeight;

      let scale = Math.min(w / DEFAULT_WIDTH, h / DEFAULT_HEIGHT);
      let newWidth = Math.min(w / scale, MAX_WIDTH);
      let newHeight = Math.min(h / scale, MAX_HEIGHT);

      let defaultRatio = DEFAULT_WIDTH / DEFAULT_HEIGHT;
      let maxRatioWidth = MAX_WIDTH / DEFAULT_HEIGHT;
      let maxRatioHeight = DEFAULT_WIDTH / MAX_HEIGHT;

      // smooth scaling
      let smooth = 1;
      if (scaleMode === 'SMOOTH') {
        const maxSmoothScale = 1.15;
        const normalize = (value, min, max) => {
          return (value - min) / (max - min);
        }
        if (DEFAULT_WIDTH / DEFAULT_HEIGHT < w / h) {
          smooth =
            -normalize(newWidth / newHeight, defaultRatio, maxRatioWidth) / (1 / (maxSmoothScale - 1)) + maxSmoothScale;
        } else {
          smooth =
            -normalize(newWidth / newHeight, defaultRatio, maxRatioHeight) / (1 / (maxSmoothScale - 1)) + maxSmoothScale;
        }
      }

      // resize the game
      this.scale.resize(Math.floor(newWidth * smooth), Math.floor(newHeight * smooth));

      // scale the width and height of the css
      this.canvas.style.width = Math.floor(newWidth * scale) + 'px';
      this.canvas.style.height = Math.floor(newHeight * scale) + 'px';

      // center the game with css margin
      this.canvas.style.marginTop = `${Math.floor((h - newHeight * scale) / 2)}px`;
      this.canvas.style.marginLeft = `${Math.floor((w - newWidth * scale) / 2)}px`;
    }
    window.addEventListener('resize', event => {
      resize()
    })
    setTimeout(() => {
      resize()
    }, 10);
  }

  create () {
  }
}

if (!window.cordova) {
  window.game = new Game();
} else {
  var app = {
    initialize: function () {
      document.addEventListener(
        'deviceready',
        this.onDeviceReady.bind(this),
        false
      );
      //document.addEventListener("pause", this.onPause.bind(this), false);
      //document.addEventListener("resume", this.onResume.bind(this), false);
    },

    // deviceready Event Handler
    //
    onDeviceReady: function () {
      this.receivedEvent('deviceready');

      // When the device is ready, start Phaser Boot state.
      window.game = new Game();
    },

    receivedEvent: function (id) {
      console.log('Received Event: ' + id);
    },

    onPause: function() {
      window.game.paused = true;
    },

    onResume: function() {
      window.game.paused = false;
    },
  }

  app.initialize()
}


if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registered: ', registration)
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError)
    })
  })
}

