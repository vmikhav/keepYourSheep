import Phaser from 'phaser'

export default class extends Phaser.GameObjects.Sprite {
  constructor (scene, order) {
    super(scene, -400, 300, 'clouds', 0);
    this.isShowed = true;
    this.step(order * 5800);
  }

  step(startDelay = null) {
    const worldView = this.scene.cameras.main.worldView;
    this.scene.time.addEvent({
      delay: startDelay === null ? Phaser.Math.Between(0, 8) * 1800 : startDelay,
      callback: () => {
        const frame = Phaser.Math.Between(0, 2);
        const scale = Phaser.Math.Between(2, 6) / 5;
        const width = Math.floor(400 * scale);
        this.setDisplaySize(width, Math.floor(166 * scale));
        const step = 185;
        const height = Math.ceil((worldView.height - 150) / step);
        const y = Math.floor(worldView.top + 50 + (Phaser.Math.Between(0, height) + Phaser.Math.Between(0, height)) / 2 * step);
        this.setY(y);
        this.setFrame(frame);
        this.scene.tweens.add({
          targets: this,
          x: {from: worldView.left - width, to: worldView.right + width},
          duration: Math.floor((3 - scale) * 13000),
          onComplete: () => {
            this.step();
          }
        });
      }
    });
  }

  hide() {
    if (this.isShowed) {
      this.scene.tweens.add({
        targets: this,
        alpha: {from: 1, to: 0},
        ease: 'Sine.easeOut',
        duration: 1000,
        onComplete: () => {
          this.setVisible(false);
          this.isShowed = false;
        }
      });
    }
  }
}
