import Phaser from 'phaser'

export default class extends Phaser.GameObjects.Sprite {
  constructor (scene) {
    super(scene, -400, 300, 'clouds', 0);
    this.isShowed = true;
    this.step();
  }

  step() {
    const worldView = this.scene.cameras.main.worldView;
    this.scene.time.addEvent({
      delay: Phaser.Math.Between(0, 6) * 1300,
      callback: () => {
        const scale = Phaser.Math.Between(2, 15) / 10;
        this.setDisplaySize(Math.floor(400 * scale), Math.floor(166 * scale));
        const step = 125;
        const height = Math.ceil((worldView.height - 150) / step);
        this.setY(worldView.top + 50 + Phaser.Math.Between(0, height) * step);
        this.setFrame(Phaser.Math.Between(0, 2));
        this.scene.tweens.add({
          targets: this,
          x: {from: worldView.left - 400, to: worldView.right + 300},
          duration: Phaser.Math.Between(12, 28) * 750,
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
