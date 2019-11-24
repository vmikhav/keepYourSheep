import Phaser from 'phaser';
import WebFont from 'webfontloader';
import config from '../config';

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'BootScene' })
  }

  preload () {
    this.fontsReady = config.webfonts.length === 0;
    this.fontsLoaded = this.fontsLoaded.bind(this);
    this.add.text(100, 100, 'loading fonts...');

    WebFont.load({
      custom: {
        families: config.webfonts,
        urls: ['css/index.css']
      },
      active: this.fontsLoaded
    });
  }

  update () {
    if (this.fontsReady) {
      this.scene.start('SplashScene')
    }
  }

  fontsLoaded () {
    this.fontsReady = true
  }
}
