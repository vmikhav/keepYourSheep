export default class Button extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height, text, frame, callback) {
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

    const style = {fontSize: Math.floor(this.buttonHeight / 4), fontFamily: '"Press Start 2P"'};
    this.text = new Phaser.GameObjects.Text(scene, 0, 0, text, style).setOrigin(0.5);

    this.add([this.button, this.text]);
    this.isShowed = true;
  }

  enterButtonNormalState() {
    this.button.setFrame(this.frame + '.png');
    this.text.setY(0);
  }

  enterButtonActiveState() {
    this.button.setFrame(this.frame + '_pressed.png');
    this.text.setY(Math.floor(this.buttonHeight / 25));
  }

  setText(text) {
    this.text.setText(text);
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
