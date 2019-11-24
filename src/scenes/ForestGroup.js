import Phaser from 'phaser';
import config from '../config';
import { prepareSymbolRecognition } from '../utils';

export default class extends Phaser.Scene {

  constructor () {
    super({ key: 'ForestGroupScene' })
  }
  init () {}
  preload () {}

  create () {
    this.runesCount = Phaser.Math.Between(3, 6);
    this.timerDelay = 25;
    this.gameDuration = this.runesCount * 1000 + 1000;
    this.timerDelta = 350 / (this.gameDuration / this.timerDelay);
    this.gameStep = 0;
    this.successful = 0;

    this.drawTimer = false;
    this.changeTimer = false;
    this.canRecognize = false;
    this.timerPosition = 0;
    this.currentSymbol = 0;

    this.timerColor = config.normalTimerColor;

    this.basePosition = {x: this.cameras.main.centerX, y: Math.ceil(this.cameras.main.centerY - (this.cameras.main.height / 4))};

    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'forest_background')
      .setDisplaySize(config.gameOptions.maxWidth, config.gameOptions.maxHeight);

    this.backgroundMask = this.add
      .rectangle(0, 0, config.gameOptions.maxWidth, config.gameOptions.maxHeight, 0x000000)
      .setOrigin(0)
      .setAlpha(1)
      .setScrollFactor(0);

    this.timerGraphics = this.add.graphics();
    this.rune = this.add.image(this.basePosition.x, -250, 'runes', 'rune_1')
      .setDisplaySize(140, 233);

    this.tweens.add({
      targets: [this.backgroundMask],
      alpha: { from: 1, to: 0.25 },
      ease: 'Sine.easeOut',
      duration: 1000,
      delay: 0,
      onComplete: () => {
        this.step();
      }
    });

    prepareSymbolRecognition(this, (symbol) => { this.applySymbol(symbol); });

    this.tweenIn = this.tweens.add({
      targets: [this.rune],
      y: { from: -250, to: this.basePosition.y },
      ease: 'Sine.easeOut',
      duration: 550,
      delay: 10,
      onComplete: () => {
        this.runStep();
      }
    });
    this.tweenIn.pause();
    this.tweenOut = this.tweens.add({
      targets: [this.rune],
      y: { from: this.basePosition.y, to: -250 },
      ease: 'Sine.easeOut',
      duration: 550,
      delay: 200,
    });
    this.tweenOut.pause();


    this.timer = this.time.addEvent({
      delay: this.timerDelay,
      callback: () => {
        if (!this.changeTimer) { return; }
        this.timerPosition += this.timerDelta;
        if (this.timerPosition >= 350) {
          this.runeMissed();
        } else if (this.timerPosition >= 275) {
          this.timerColor = config.errorTimerColor;
        } else if (this.timerPosition >= 200) {
          this.timerColor = config.warningTimerColor;
        }
      },
      callbackScope: this,
      loop: true
    });
    this.timer.paused = true;


    this.timerIn = this.time.addEvent({
      delay: 600,
      callback: () => {
        this.timerIn.paused = true;
        this.tweenIn.restart();
        let newSymbol;
        do {
          newSymbol = Phaser.Math.Between(1, 15);
          if (newSymbol > 6) {
            newSymbol -= 6;
          }
        } while (this.currentSymbol === newSymbol);
        this.currentSymbol = newSymbol;
        this.rune.setFrame('rune_' + this.currentSymbol);
        this.canRecognize = true;
      },
      callbackScope: this,
      loop: true
    });
    this.timerIn.paused = true;
  }



  update (time, delta) {
    this.timerGraphics.clear();
    if (this.drawTimer) {
      this.timerGraphics.lineStyle(8, this.timerColor, 1);
      this.timerGraphics.beginPath();

      this.timerGraphics.arc(this.basePosition.x, this.basePosition.y, 150, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(280 + this.timerPosition), true);
      this.timerGraphics.strokePath();
    }
  }

  applySymbol(symbol) {
    if (this.canRecognize && symbol.name) {
      if (symbol.index === this.currentSymbol) {
        this.successful++;
        this.canRecognize = false;
        this.changeTimer = false;
        this.step();
      }
    }
  }

  step() {
    if (this.gameStep) {
      this.tweenOut.restart();
    }
    if (this.gameStep < this.runesCount) {
      this.timerIn.paused = false;
    } else {
      this.drawTimer = false;
      this.finishTour();
    }
    this.gameStep++;
  }

  runStep() {
    this.timerColor = config.normalTimerColor;
    this.drawTimer = true;
    this.changeTimer = true;
    this.timer.paused = false;
  }

  runeMissed() {
    this.timer.paused = true;
    this.canRecognize = false;
    this.timerPosition = -9.99;
    // this.step();
    this.finishTour();
  }

  finishTour() {
    console.log(this.successful);
    this.backToMap()
  }

  backToMap() {
    this.tweens.add({
      targets: [this.backgroundMask],
      alpha: { from: 0.25, to: 1 },
      ease: 'Sine.easeOut',
      duration: 1000,
      delay: 1500,
      onStart: () => {
        this.drawTimer = false;
        this.rune.setY(-250);
      },
      onComplete: () => {
        // this.scene.start('GameScene', { background: true });
        this.scene.start('MainMenuScene');
      }
    });
  }

}
