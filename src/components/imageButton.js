export default class ImageButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height, frame, image, callback) {
    super(scene, x, y);

    this.frame = frame;
    this.buttonHeight = height;
    this.button = new Phaser.GameObjects.Image(scene, 0, 0, 'ui', this.frame + '.png');
    this.button
      .setDisplaySize(width, height)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.enterButtonActiveState() )
      .on('pointerout', () => this.enterButtonNormalState() )
      .on('pointerup', () => {
        this.enterButtonNormalState();
        callback();
      });

    this.image = new Phaser.GameObjects.Image(scene, 0, 0, image).setDisplaySize(width - 30, height - 30);

    this.add([this.button, this.image]);
    this.isShowed = true;
  }

  setImage(image, frame = null) {
    this.image.setTexture(image, frame);
  }

  enterButtonNormalState() {
    this.button.setFrame(this.frame + '.png');
    this.image.setY(0);
  }

  enterButtonActiveState() {
    this.button.setFrame(this.frame + '_pressed.png');
    this.image.setY(Math.floor(this.buttonHeight / 25));
  }

  show() {
    this.isShowed = true;
    this.scene.tweens.add({
      targets: this,
      alpha: {from: 0, to: 1},
      ease: 'Sine.easeOut',
      duration: 1000,
    });
  }

  hide() {
    this.scene.tweens.add({
      targets: this,
      alpha: {from: 1, to: 0},
      ease: 'Sine.easeOut',
      duration: 1000,
      onComplete: () => {
        this.isShowed = false;
      }
    });
  }
}
