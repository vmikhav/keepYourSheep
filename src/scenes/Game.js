import Phaser from 'phaser';
import config from '../config';
import { generateSheep, showMap } from '../utils'
import Button from '../components/button'
import Panel from '../components/panel'
import ImageButton from '../components/imageButton'
import Cloud from '../sprites/Cloud'

export default class extends Phaser.Scene {
  constructor () {
    super({ key: 'GameScene' });
  }
  init () {}
  preload () {}

  create (params) {
    if (!config.music) {
      config.music = this.sound.add('music', config.musicParams);
      config.music.play();
      config.musicMuted = localStorage[config.localStorageName + '.muted'] === 'true';
      if (config.musicMuted) {
        this.changeMuteState(config.musicMuted);
      }
    }
    this.needBackground = params && params.background;
    this.progress = params && params.progress ? params.progress : -1;
    this.gameOver = config.sheepCurrent === config.sheepTotal;
    if (this.gameOver) {
      this.duration = Math.floor(((new Date()) - config.gameStat.started)/1000);
    } else {
      this.selectLevelDifficult()
    }
    showMap(this);
    this.sheep = generateSheep(this, config.sheepCurrent, null, config.gameStat.sheepDelta);
    this.clouds = [];
    for (let i = 0; i < 3; i++) {
      this.clouds.push(new Cloud(this, i + 1));
      this.add.existing(this.clouds[i]);
    }

    const worldView = this.cameras.main.worldView;

    this.time.addEvent({
      delay: 100,
      callback: () => {
        this.muteButton = new ImageButton(this, worldView.left + 60, worldView.top + 60, 80, 80,
          'buttonSquare_brown', config.musicMuted ? 'musicOff' : 'musicOn', () => {this.changeMuteState(!config.musicMuted);}).setAlpha(0);
        this.add.existing(this.muteButton);
        this.muteButton.show();

        this.panel = new Panel(this, worldView.centerX, worldView.bottom - 200, 600, 300);
        this.add.existing(this.panel);

        if (this.gameOver) {
          this.button = new Button(this, worldView.centerX, worldView.top - 100, 300, 120, config.lang.menu, 'buttonLong_brown', () => this.openMenu());
          this.add.existing(this.button);
          this.tweens.add({
            targets: this.button,
            y: worldView.centerY - 200,
            ease: 'Sine.easeOut',
            duration: 1500,
          });
          let scoreLabel = '.high_score';
          if (config.permanentMode) {
            scoreLabel = '.expert_high_score';
          } else if (config.relaxMode) {
            scoreLabel = '.relax_high_score';
          }
          let text = config.lang.score + ': ' + config.score + '\n\n';
          if (config.score > parseInt(localStorage[config.localStorageName + scoreLabel] || 0)) {
            localStorage[config.localStorageName + scoreLabel] = config.score;
            text += config.lang.newHighScore + '!';
          } else {
            text += config.lang.highScore + ': ' + (localStorage[config.localStorageName + scoreLabel] || 0);
          }
          this.panel.show(2, text);
        } else {
          this.button = new Button(this, worldView.centerX, worldView.centerY, 300, 120, config.lang.search, 'buttonLong_brown', () => this.startTour());
          this.button.setAlpha(0);
          this.add.existing(this.button);
          this.tweens.add({
            targets: this.button,
            alpha: 1,
            ease: 'Sine.easeOut',
            duration: 1500,
          });
          this.countPanel = new Panel(this, worldView.right - 220, worldView.top + 85, 400, 125, 'panelInset_brown', '#fff', 30);
          this.add.existing(this.countPanel);
          const text = config.lang.sheep + ': ' + config.sheepCurrent + ' / ' + config.sheepTotal + '\n' + config.lang.score + ': ' + config.score;
          this.countPanel.show(null, text);

          if (config.sheepCurrent === 0) {
            if (config.gameStat.total && config.gameStat.total === config.gameStat.failed) {
              this.panel.show(0, config.lang.intro7);
            } else if (config.permanentMode && config.gameStat.failSequence < config.gameStat.total) {
              this.panel.show(2, config.lang.lostSheep);
            }
          }
        }
      }
    });

    this.backgroundMask = this.add
      .rectangle(0, 0, config.gameOptions.maxWidth, config.gameOptions.maxHeight, 0x000000)
      .setOrigin(0)
      .setAlpha(this.needBackground ? 1 : 0)
      .setScrollFactor(0);

    if (this.needBackground) {
      this.tweens.add({
        targets: [this.backgroundMask],
        alpha: { from: 1, to: 0 },
        ease: 'Sine.easeOut',
        duration: 1000,
        onComplete: () => {

        }
      });
    }
  }

  changeMuteState(status) {
    config.musicMuted = status;
    localStorage[config.localStorageName + '.muted'] = config.musicMuted;
    config.music.setMute(config.musicMuted);
    if (config.musicMuted) {
      config.music.pause();
    } else {
      config.music.resume();
    }
    if (this.muteButton) {
      this.muteButton.setImage(config.musicMuted ? 'musicOff' : 'musicOn');
    }
  }

  selectLevelDifficult() {
    let level = config.sheepCurrent;
    if (config.gameStat.failSequence >= 2) {
      level -= 2
    }
    switch (level) {
      case -2: case -1: case 0: case 1:
        this.preset = config.presets.easy0; break;
      case 2: case 3:
        this.preset = config.presets.easy1; break;
      case 4: case 5:
        this.preset = config.presets.easy2; break;
      case 6: case 7: case 8:
        this.preset = config.presets.easy3; break;
      case 9: case 10: case 11:
        this.preset = config.presets.middle0; break;
      case 12: case 13: case 14:
        this.preset = config.presets.middle1; break;
      default:
        this.preset = config.presets.hard0;
    }
  }

  startTour() {
    this.button.hide();
    this.muteButton.hide();
    this.panel.hide();
    this.countPanel.hide();
    this.tweens.add({
      targets: this.backgroundMask,
      alpha: 1,
      ease: 'Sine.easeOut',
      duration: 1500,
      delay: 500,
      onComplete: () => {
        this.scene.start('ForestScene', this.preset);
      }
    });
  }

  openMenu() {
    this.button.hide();
    this.muteButton.hide();
    this.panel.hide();
    this.tweens.add({
      targets: this.backgroundMask,
      alpha: 1,
      ease: 'Sine.easeOut',
      duration: 1500,
      delay: 500,
      onComplete: () => {
        config.music.stop();
        config.music = null;
        this.scene.start('MainMenuScene');
      }
    });
  }

}
