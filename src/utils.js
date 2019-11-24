import Jager from './components/jager'
import config from './config'
import Sheep from './sprites/Sheep'

export const showMap = (scene) => {
  scene.map = scene.add.tilemap('fieldMap');
  const tileset = scene.map.addTilesetImage('medieval_tilesheet', 'medieval_tilesheet');
  scene.grassLayer = scene.map.createStaticLayer('grass', tileset);
  scene.objectsLayer = scene.map.createStaticLayer('objects', tileset);
  scene.cameras.main.centerOn(scene.map.widthInPixels / 2, scene.map.heightInPixels / 2);
}

export const prepareSymbolRecognition = (scene, callback) => {
  scene.jager = new Jager();
  scene.trackPointer = false;
  scene.lines = null;

  scene.input.on('pointerdown', pointer => {
    scene.trackPointer = true;
    scene.jager.reset();
    scene.jager.pushPoint(scene.jager.point(pointer));
  });
  scene.input.on('pointerup', pointer => {
    scene.trackPointer = false;
    scene.jager.pushPoint(scene.jager.point(pointer));
    if (scene.lines) {
      scene.lines.destroy();
    }
    scene.lines = null;
    callback(scene.jager.recognise(true));
  });
  scene.input.on('pointermove', pointer => {
    if (scene.trackPointer) {
      let sections = scene.jager.addPoint(scene.jager.point(pointer));
      if (sections) {
        const polygon = scene.add
          .polygon(0, 0, scene.jager.path)
          .setClosePath(false)
          .setOrigin(0)
          .setStrokeStyle(10, 0xffffff);
        if (scene.lines) {
          scene.lines.destroy();
        }
        scene.lines = polygon;
      }
    }
  });
}

export const resetGameStat = () => {
  config.gameStat = {
    started: new Date(),
    total: 0,
    completed: 0,
    failed: 0,
    failSequence: 0,
  };
  config.sheepCurrent = 0;
  config.permanentMode = false;
}

export const generateSheep = (scene, count, previousSheep = null) => {
  const sheep = [];
  const positions = {x: {}, y: {}};
  const y = [];
  if (previousSheep === null) {
    for (let i = 0; i < count; i++) {
      y.push(500 + Phaser.Math.Between(0, 30) * 16);
    }
    y.sort((a, b) => a - b);
  }
  for (let i = 0; i < count; i++) {
    let position, frame;
    if (previousSheep === null) {
      do {
        position = { x: 300 + Phaser.Math.Between(0, 20) * 20, y: y[i] };
      } while (position.x in positions.x);
      positions.x[position.x] = 1;
      positions.y[position.y] = 1;
      frame = null;
    } else {
      position = previousSheep[i].getCenter();
      frame = previousSheep[i].frame.name;
    }
    const item = new Sheep(scene, position.x, position.y, frame);
    scene.add.existing(item);
    sheep.push(item);
  }
  return sheep;
}
