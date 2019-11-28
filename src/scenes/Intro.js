import Phaser from 'phaser';
import config from '../config';
import { generateSheep, resetGameStat, showMap } from '../utils'
import Panel from '../components/panel'
import Button from '../components/button'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'IntroScene' });
  }
  init () {}
  preload () {}

  create (params) {
    showMap(this);
    this.sheep = generateSheep(this, config.sheepTotal, params.sheep);

    const worldView = this.cameras.main.worldView;

    this.time.addEvent({
      delay: 100,
      callback: () => {
        this.skipButton = new Button(this, worldView.right - 135, worldView.top - 100, 250, 80, config.lang.skip, 'buttonLong_brown', () => this.startGame());
        this.add.existing(this.skipButton);
        this.tweens.add({
          targets: this.skipButton,
          y: worldView.top + 60,
          ease: 'Expo.easeOut',
          duration: 3000,
        });

        this.panel = new Panel(this, worldView.centerX, worldView.bottom - 200, 600, 300);
        this.add.existing(this.panel);

        this.backgroundMask = [
          this.add
            .rectangle(0, 0, worldView.width, worldView.height, 0x000000)
            .setOrigin(0, 1)
            .setScrollFactor(0),
          this.add
            .rectangle(0, worldView.bottom, worldView.width, worldView.height, 0x000000)
            .setOrigin(0, 0)
            .setScrollFactor(0)
        ];
        this.sceneTransitionState = 2;

        this.introStep0();
      }
    });
  }

  update() {
    if (this.sceneTransitionState < 2) {
      if (this.sceneTransitionState === 1) {
        this.onReturnFromTutorial();
      }
      this.sceneTransitionState++;
    }
  }

  introStep0() {
    this.panel.show(0, config.lang.intro0, config.lang.next, () => this.introStep1());
  }

  introStep1() {
    this.panel.show(0, config.lang.intro1, config.lang.next, () => this.introStep2());
  }

  introStep2() {
    this.panel.show(2, config.lang.intro2, config.lang.next, () => this.closeEyes());
  }

  introStep3() {
    this.panel.show(0, config.lang.intro3, config.lang.next, () => this.introStep4());
  }

  introStep4() {
    this.panel.show(2, config.lang.intro4, config.lang.next, () => this.introStep5());
  }

  introStep5() {
    this.panel.show(0, config.lang.intro5, config.lang.next, () => this.introStep6());
  }

  introStep6() {
    this.panel.show(0, config.lang.intro6, config.lang.tutorial, () => this.startTutorial());
  }

  introStep7() {
    this.panel.show(0, config.lang.intro7, config.lang.tutorial, () => this.startTutorial());
  }

  introStep8() {
    this.panel.show(0, config.lang.intro8, config.lang.play, () => this.startGame());
  }

  closeEyes() {
    this.panel.hide();

    this.tweens.add({
      targets: this.backgroundMask,
      y: this.cameras.main.centerY,
      ease: 'Bounce',
      duration: 3000,
      delay: 1000,
      onComplete: () => {
        for (let i = 0; i < this.sheep.length; i++) {
          this.sheep[i].destroy();
        }
        this.tweens.add({
          targets: this.backgroundMask[0],
          y: 0,
          ease: 'Cubic.easeIn',
          duration: 1000,
          delay: 2000,
          onComplete: () => {
            this.backgroundMask[0] =this.backgroundMask[0].setAlpha(0).setOrigin(0).setPosition(0, 0)
              .setDisplaySize(config.gameOptions.maxWidth, config.gameOptions.maxHeight);
            this.introStep3();
          }
        });
        this.tweens.add({
          targets: this.backgroundMask[1],
          y: this.cameras.main.worldView.bottom,
          ease: 'Cubic.easeIn',
          duration: 1000,
          delay: 2000,
        });
      }
    });
  }

  startTutorial() {
    this.panel.hide();
    this.tweens.add({
      targets: this.backgroundMask[0],
      alpha: 1,
      ease: 'Sine.easeOut',
      duration: 1500,
      delay: 500,
      onComplete: () => {
        this.scene.sleep();
        this.scene.launch('ForestScene', config.presets.tutorial);
        this.sceneTransitionState = 0;
      }
    });
  }

  onReturnFromTutorial() {
    this.tweens.add({
      targets: this.backgroundMask[0],
      alpha: 0,
      ease: 'Sine.easeOut',
      duration: 1500,
      delay: 500,
      onComplete: () => {
        if (config.tutorialFinished) {
          this.introStep8();
        } else {
          this.introStep7();
        }
      }
    });
  }

  startGame() {
    config.tutorialFinished = true;
    localStorage[config.localStorageName + '.tutorialFinished'] = config.tutorialFinished;
    for (let i = 0; i < this.sheep.length; i++) {
      this.sheep[i].destroy;
    }
    this.panel.hide();
    this.tweens.add({
      targets: this.skipButton,
      alpha: 0,
      ease: 'Sine.easeOut',
      duration: 800,
      onComplete: () => {
        resetGameStat();
        this.scene.start('GameScene');
      }
    });
  }

}
