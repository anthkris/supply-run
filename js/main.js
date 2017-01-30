var SupRun = SupRun || {};

SupRun.game = new Phaser.Game(1920, 1080, Phaser.CANVAS);

SupRun.game.state.add('Boot', SupRun.BootState);
SupRun.game.state.add('Preload', SupRun.PreloadState);
SupRun.game.state.add('Menu', SupRun.MenuState);
SupRun.game.state.add('Game', SupRun.GameState);
SupRun.game.state.add('GameOver', SupRun.GameOverState);

SupRun.game.state.start('Boot');
