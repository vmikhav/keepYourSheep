export default class TextButton extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, style, callback) {
    super(scene, x, y, text, style);

    this.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.enterButtonNormalState() )
      .on('pointerout', () => this.enterButtonNormalState() )
      .on('pointerup', () => {
        this.enterButtonNormalState();
        callback();
      });
  }

  enterButtonNormalState() {
    this.setStyle({ fill: '#ff0'});
  }

  enterButtonActiveState() {
    this.setStyle({ fill: '#0ff' });
  }
}
