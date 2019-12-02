import Phaser from 'phaser';
import config from '../config';
import { prepareSymbolRecognition } from '../utils';
import Rune from '../sprites/Rune'

export default class Forest extends Phaser.Scene {

  constructor () {
    super({ key: 'ForestScene' });

    this.isTutorial = false;
    this.maxSymbol = null;
    this.timeScale = null;
    this.maxOneTime = null;
    this.itemScore = null;
    this.runesCount = null;

    this.scoreMultipler = 1;
    this.successful = 0;
    this.score = 0;
    this.lastSymbol = -1;
    this.failed = false;

    this.backgroundMask = null;
    this.runes = [];

    this.timer = null;
    this.extraTimer = null;

    this.multiplerText = 0;
    this.multiplerTween = null;
  }
  init () {}
  preload () {}

  create (params) {
    console.log(params);
    this.isTutorial = params && params.tutor ? params.tutor : false;

    this.maxSymbol = params && params.maxSymbol ? params.maxSymbol : 9;
    this.timeScale = params && params.timeScale ? params.timeScale : 2;
    this.maxOneTime = params && params.maxOneTime ? params.maxOneTime : 1;
    this.itemScore = params && params.score ? params.score : 50;
    this.runesCount = params && params.runesCount ? Phaser.Math.Between(params.runesCount[0], params.runesCount[1]) : Phaser.Math.Between(3, 6);

    if (config.relaxMode && this.maxOneTime > 2) {
      this.maxOneTime = 2;
    }

    this.scoreMultipler = 1;
    this.successful = 0;
    this.score = 0;
    this.lastSymbol = -1;
    this.failed = false;

    this.basePosition = {x: this.cameras.main.centerX, y: this.cameras.main.centerY};
    this.additionalPositions = [
      {x: this.cameras.main.centerX - 160, y: this.cameras.main.centerY - 310},
      {x: this.cameras.main.centerX + 160, y: this.cameras.main.centerY - 310},
      {x: this.cameras.main.centerX - 160, y: this.cameras.main.centerY + 310},
      {x: this.cameras.main.centerX + 160, y: this.cameras.main.centerY + 310},
    ];


    this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'forest_background')
      .setDisplaySize(config.gameOptions.maxWidth, config.gameOptions.maxHeight);

    this.backgroundMask = this.add
      .rectangle(0, 0, config.gameOptions.maxWidth, config.gameOptions.maxHeight, 0x000000)
      .setOrigin(0)
      .setAlpha(1)
      .setScrollFactor(0);

    this.tweens.add({
      targets: [this.backgroundMask],
      alpha: 0.35,
      ease: 'Sine.easeOut',
      duration: 1000,
      delay: 0,
    });

    prepareSymbolRecognition(this, (symbol) => { this.applySymbol(symbol); });

    this.runes = [];
    this.timer = this.time.addEvent({
      delay: 250,
      callback: () => {
        let active = 0;
        for (let i = 0; i < this.runes.length; i++) {
          if (this.runes[i].isActive) {
            active++;
          }
        }
        if (this.runes.length < this.runesCount && active === 0) {
          let newSymbol;
          do {
            newSymbol = Phaser.Math.Between(1, this.maxSymbol);
          } while (this.lastSymbol === newSymbol);
          this.lastSymbol = newSymbol
          let stepDuration = config.symbolTime[newSymbol] * this.timeScale;
          if (config.relaxMode) {
            stepDuration *= 2;
          }
          this.runes.push(new Rune(this, this.basePosition.x, this.basePosition.y, -1, newSymbol, stepDuration, () => this.runeMissed()));
          active++;
        }
        if (this.runes.length === this.runesCount && active === 0) {
          this.timer.destroy();
          this.time.addEvent({
              delay: 100,
              callback: () => {
                this.finishTour();
              }
          });
        }
      },
      loop: true
    });
    this.timer.paused = true;

    this.extraTimer = this.time.addEvent({
      delay: 450,
      callback: () => {
        if (Math.random() < 0.6) {
          return;
        }
        let active = 0;
        let failed = false;
        const positions = [];
        let reservedSymbols = [];
        for (let i = 0; i < this.runes.length; i++) {
          if (this.runes[i].isActive) {
            active++;
            positions.push(this.runes[i].position);
            reservedSymbols = reservedSymbols.concat(this.runes[i].symbol, config.dontUseWith[this.runes[i].symbol]);
          }
          if (this.runes[i].isFailed) {
            failed = true;
          }
        }
        if (!failed && this.runes.length < this.runesCount && active && active < this.maxOneTime) {
          let newSymbol, position;
          do {
            newSymbol = Phaser.Math.Between(1, this.maxSymbol);
          } while (reservedSymbols.includes(newSymbol));
          do {
            position = Phaser.Math.Between(0, 3);
          } while (positions.includes(position));
          let stepDuration = config.symbolTime[newSymbol] * this.timeScale * (1 + active * 0.25);
          if (config.relaxMode) {
            stepDuration *= 2;
          }
          this.runes.push(new Rune(this, this.additionalPositions[position].x, this.additionalPositions[position].y, position, newSymbol, stepDuration, () => this.runeMissed()));
        }
        if (this.runes.length === this.runesCount) {
          this.extraTimer.destroy();
        }
      },
      loop: true
    });
    this.extraTimer.paused = true;

    this.time.addEvent({
      delay: 750,
      callback: () => {
        const worldView = this.cameras.main.worldView;
        const style = {fontSize: 40, fontFamily: '"Press Start 2P"'};
        this.multiplerText = this.add.text(worldView.centerX, worldView.top + 50, '', style).setOrigin(0.5);
        this.multiplerTween = this.tweens.add({
          targets: this.multiplerText,
          alpha: {from: 1, to: 0},
          ease: 'Sine.easeOut',
          duration: 1500,
        });
        this.multiplerTween.pause();
        this.multiplerText.setAlpha(0);

        this.timer.paused = false;
        this.extraTimer.paused = false;
      }
    });
  }



  update (time, delta) {
    for (let i = 0; i < this.runes.length; i++) {
      if (this.runes[i].isActive) {
        this.runes[i].update();
      }
    }
  }

  applySymbol(symbols) {
    if (this.failed) {return;}
    let result = false;
    const score = this.isTutorial ? -1 : Math.floor(this.itemScore * (1 + this.scoreMultipler / 10));
    for (let i = 0; i < this.runes.length; i++) {
      if (this.runes[i].isActive) {
        result = this.runes[i].checkSymbol(symbols, score);
        if (result) {
          break;
        }
      }
    }
    if (result) {
      if (this.scoreMultipler > 1 && !this.isTutorial) {
        this.multiplerText.setText(this.scoreMultipler + 'x');
        this.multiplerTween.restart();
      }
      this.successful++;
      this.score += result;
      this.scoreMultipler++;
    } else {
      this.scoreMultipler = 1;
    }
  }

  runeMissed() {
    if (this.failed) {return;}
    this.failed = true;
    this.timer.paused = true
    this.extraTimer.paused = true
    for (let i = 0; i < this.runes.length; i++) {
      if (this.runes[i].isActive && !this.runes[i].isFailed) {
        this.runes[i].hide();
      }
    }
    this.finishTour();
  }

  finishTour() {
    console.log(this.successful);
    if (!this.isTutorial) {
      config.gameStat.total++;
      if (this.successful < this.runesCount) {
        config.gameStat.sheepDelta = 0;
        if (config.permanentMode) {
          config.gameStat.sheepDelta = -config.sheepCurrent;
          config.sheepCurrent = 0;
          config.score = 0;
        }
        config.gameStat.failed++;
        config.gameStat.failSequence++;
        if (config.gameStat.failSequence === 3 && config.sheepCurrent) {
          config.sheepCurrent--;
          config.gameStat.sheepDelta = -1;
        }
      } else {
        config.score += this.score;
        config.sheepCurrent++;
        config.gameStat.sheepDelta = 1;
        config.gameStat.completed++;
        config.gameStat.failSequence = 0;
      }
    }
    this.backToMap()
  }

  backToMap() {
    this.tweens.add({
      targets: [this.backgroundMask],
      alpha: 1,
      ease: 'Sine.easeOut',
      duration: 1000,
      delay: 750,
      onStart: () => {
      },
      onComplete: () => {
        if (this.isTutorial) {
          config.tutorialFinished = this.successful === this.runesCount;
          this.scene.bringToTop('IntroScene');
          this.scene.wake('IntroScene');
          this.scene.stop();
        } else {
          this.scene.start('GameScene', { background: true, progress: this.successful / this.runesCount });
        }
      }
    });
  }

}
