import Phaser from 'phaser'

export default class extends Phaser.GameObjects.Sprite {
  constructor (scene, x, y, frame = null) {
    super(scene, x, y, 'sheep', frame === null ? Phaser.Math.Between(0, 5) : frame);
    this.setDisplaySize(32, 32);
  }
}
