import Phaser from 'phaser'

export default class extends Phaser.GameObjects.Sprite {
  constructor (scene, x, y) {
    super(scene, x, y, 'boom', 0);
  }
}
