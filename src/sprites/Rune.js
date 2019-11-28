import config from '../config'
import Phaser from "phaser"

export default class Rune extends Phaser.GameObjects.Container {
  constructor(scene, x, y, position, symbol, time, onFail = () => {}) {
    super(scene, x, y);

    this.position = position;

    this.timerTotal = 350;
    this.dangerZone = 280;
    this.warningZone = 220;

    this.setAlpha(0);

    this.onFail = onFail;
    this.timerDelay = 25;
    this.timerDelta = 1;
    this.timerPosition = 0;
    this.symbol = symbol;
    this.drawTimer = false;
    this.changeTimer = false;
    this.timerColor = config.normalTimerColor;

    this.timerGraphics = new Phaser.GameObjects.Graphics(scene);
    this.rune = new Phaser.GameObjects.Image(scene,0, 0, 'runes', 'rune_' + this.symbol)
      .setDisplaySize(140, 233);


    const style = {fontSize: 32, fontFamily: '"Press Start 2P"'};
    this.text = new Phaser.GameObjects.Text(scene, 0, -130, '', style).setOrigin(0.5);
    this.text.setVisible(false);

    this.add([this.timerGraphics, this.rune, this.text]);
    this.isShowed = true;
    this.isActive = true;
    this.isSucessful = false;
    this.isFailed = false;

    this.stepDuration = time;
    this.timerDelta = this.timerTotal / (this.stepDuration / this.timerDelay);

    this.timer = scene.time.addEvent({
      delay: this.timerDelay,
      callback: () => {
        if (!this.changeTimer) { return; }
        this.timerPosition += this.timerDelta;
        if (this.timerPosition >= this.timerTotal) {
          this.runeMissed();
        } else if (this.timerPosition >= this.dangerZone) {
          this.timerColor = config.errorTimerColor;
        } else if (this.timerPosition >= this.warningZone) {
          this.timerColor = config.warningTimerColor;
        }
      },
      callbackScope: this,
      loop: true
    });

    scene.add.existing(this);
    this.show();
  }

  update(args) {
    this.timerGraphics.clear();
    if (this.drawTimer) {
      this.timerGraphics.lineStyle(8, this.timerColor, 1);
      this.timerGraphics.beginPath();

      this.timerGraphics.arc(0, 0, 150, Phaser.Math.DegToRad(270), Phaser.Math.DegToRad(280 + this.timerPosition), true);
      this.timerGraphics.strokePath();
    }
  }

  checkSymbol(symbols, score = 0) {
    let result = false;
    for(const symbol of symbols) {
      if (symbol.index === this.symbol) {
        result = true;
        this.isSucessful = true;
        this.changeTimer = false;
        this.timerColor = config.normalTimerColor;
        if (score > -1) {
          if (this.timerPosition >= this.dangerZone) {
            const dangerTotal = this.timerTotal - this.dangerZone;
            const dangerCurrent = this.timerPosition - this.dangerZone;
            score += Math.floor(score * (dangerCurrent / dangerTotal));
          } else {
            score = Math.floor(score * (1 - (this.timerPosition / this.timerTotal)));
          }
          this.text.setText(score).setVisible(true);
          this.scene.tweens.add({
            targets: this.text,
            y: '-=75',
            alpha: { from: 1, to: 0.75 },
            ease: 'Sine.easeOut',
            duration: 1000,
          });
        }
        this.scene.time.addEvent({
          delay: 500,
          callback: () => {
            this.hide();
          }
        });
        break;
      }
    }
    return result ? score : false;
  }

  runeMissed() {
    this.isFailed = true;
    this.onFail();
    this.changeTimer = false;
    this.timerPosition = -9.99;
    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.hide();
      }
    });
  }

  show() {
    this.isActive = true;
    this.isShowed = true;
    this.drawTimer = true;
    this.scene.tweens.add({
      targets: this,
      alpha: {from: 0, to: 1},
      ease: 'Sine.easeOut',
      duration: 250,
      onComplete: () => {
        this.changeTimer = true;
      },
    });
  }

  hide() {
    this.timer.destroy();
    this.changeTimer = false;
    this.scene.tweens.add({
      targets: [this, this.timerGraphics],
      alpha: {from: 1, to: 0},
      ease: 'Sine.easeOut',
      duration: 250,
      onComplete: () => {
        this.isActive = false;
        this.isShowed = false;
        this.destroy();
      }
    });
  }
}
