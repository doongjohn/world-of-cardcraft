import 'phaser'
import * as Game from './game'
import * as Scenes from './scenes'
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js'

function main() {
  new Phaser.Game({
    type: Phaser.AUTO,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    width: Game.w,
    height: Game.h,
    backgroundColor: '#65a4db',
    scene: [Scenes.Match],
    plugins: {
      scene: [
        {
          key: 'rexUI',
          plugin: RexUIPlugin,
          mapping: 'rexUI',
        },
      ],
    },
  })
}

main()
