import Phaser from 'phaser'
import config from '../config';
import Button from '../components/button'
import { generateSheep, resetGameStat, showMap } from '../utils'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'MainMenuScene' });
  }
  init () {}
  preload () {}

  create () {
    showMap(this);
    this.sheep = generateSheep(this, config.sheepTotal);

    const worldView = this.cameras.main.worldView;
    this.backgroundMask = this.add
      .rectangle(0, 0, config.gameOptions.maxWidth, config.gameOptions.maxHeight, 0x000000)
      .setOrigin(0)
      .setAlpha(1)
      .setScrollFactor(0);

    this.tweens.add({
      targets: this.backgroundMask,
      alpha: 0.35,
      ease: 'Sine.easeOut',
      duration: 1500,
      delay: 0,
      onComplete: () => {
        this.moveDistance = (worldView.centerY - 200) - (worldView.top - 300);
        this.startButton = new Button(this, worldView.centerX, worldView.top - 300, 500, 150, config.lang.play, 'buttonLong_brown', () => this.start());
        this.add.existing(this.startButton);
        this.expertButton = new Button(this, worldView.centerX, worldView.top - 100, 500, 100, config.lang.expertMode, 'buttonLong_brown', () => this.start('expert'));
        this.add.existing(this.expertButton);
        this.tweens.add({
          targets: [this.startButton, this.expertButton],
          y: '+=' + this.moveDistance,
          ease: 'Sine.easeOut',
          duration: 1000,
        });
      }
    });
  }

  start(mode = 'normal') {
    const worldView = this.cameras.main.worldView;
    this.tweens.add({
      targets: [this.startButton, this.expertButton],
      y: '-=' + this.moveDistance,
      ease: 'Sine.easeIn',
      duration: 1000,
    });
    this.tweens.add({
      targets: this.backgroundMask,
      alpha: 0,
      ease: 'Sine.easeOut',
      duration: 1500,
      delay: 500,
      onComplete: () => {
        if (mode === 'expert') {
          resetGameStat();
          config.permanentMode = true;
          this.scene.start('GameScene');
        } else {
          if (config.tutorialFinished) {
            resetGameStat();
            this.scene.start('GameScene');
          } else {
            this.scene.start('IntroScene', {sheep: this.sheep});
          }
        }
      }
    });
  }

}
