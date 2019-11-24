import Button from './button'

export default class Panel extends Phaser.GameObjects.Container {
  constructor(scene, x, y, width, height, frame = 'panelInset_beigeLight', color = '#000', topOffset = 50) {
    super(scene, x, y);

    this.width = width;
    this.height = height;
    this.top = Math.ceil(-this.height / 2);
    this.bottom = Math.ceil(this.height / 2);
    this.left = Math.ceil(-this.width / 2);
    this.right = Math.ceil(this.width / 2);

    this.portrait = new Phaser.GameObjects.Sprite(scene, this.left + 10,this.top + 10, 'portraits', 0)
      .setOrigin(0, 1)
      .setDisplaySize(128, 128);
    this.panel = new Phaser.GameObjects.Image(scene, this.left, this.top, 'ui', frame + '.png')
      .setOrigin(0, 0)
      .setDisplaySize(this.width, this.height);

    this.portraitTween = scene.tweens.add({
      targets: this.portrait,
      y: this.top + 6,
      duration: 350,
      ease: 'linear',
      yoyo: true,
      delay: 500
    }).pause();

    this.portraitTweenTimer = scene.time.addEvent({
      delay: 5000,
      callback: () => {
        this.portraitTween.restart();
      },
      loop: true
    });

    const style = {fontSize: 24, fontFamily: '"Press Start 2P"', color};
    this.text = new Phaser.GameObjects.Text(scene, this.left + 50, this.top + topOffset, '', style);
    this.text.lineSpacing = 20;

    this.button = new Button(scene, this.right - 100, this.top - 50, 200, 80, 'Ok', 'buttonMiddle_brown', () => this.clickCallback());

    this.add([this.portrait, this.panel, this.text, this.button]);
    this.setVisible(false);
    this.isShowed = false;
    this.setAlpha(0);
    this.buttonCallback = () => {};
  }

  clickCallback() {
    this.buttonCallback();
  }

  show(frame, text, buttonText = null, buttonCallback = () => {}) {
    this.button.setAlpha(0);
    this.buttonCallback = buttonCallback;

    if (!this.isShowed) {
      this.scene.tweens.add({
        targets: this,
        alpha: {from: 0, to: 1},
        ease: 'Sine.easeOut',
        duration: 1000,
      });
    }
    if (frame === null) {
      this.portrait.setVisible(false);
    } else {
      this.portrait.setVisible(true);
      this.portrait.setFrame(frame);
    }
    this.text.setText(text);
    if (buttonText) {
      this.button.setText(buttonText);
      this.scene.tweens.add({
        targets: this.button,
        alpha: 1,
        duration: 500,
        ease: 'Sine.easeOut',
        delay: this.isShowed ? 1000 : 2000
      });
    }
    this.isShowed = true;
    this.setVisible(true);
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
