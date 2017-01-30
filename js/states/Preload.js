var SupRun = SupRun || {};

//loading the game assets
SupRun.PreloadState = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(3);

    this.load.setPreloadSprite(this.preloadBar);

    //load game assets    
    this.load.image('floor', 'assets/images/floor.png');
    this.load.image('logo', 'assets/images/supplyRun.png');
    this.load.atlasJSONHash('coin', 'assets/images/coin.png', 'assets/images/coin.json');
    this.load.atlasJSONHash('startButton', 'assets/images/startButton.png', 'assets/images/startButton.json');
    this.load.image('restartButton', 'assets/images/restartButton.png');
    this.load.atlasJSONHash('lives', 'assets/images/lives.png', 'assets/images/lives.json');
    this.load.atlasJSONHash('cash', 'assets/images/cash.png', 'assets/images/cash.json');
    this.load.image('board', 'assets/images/board.png');
    this.load.image('village_fg', 'assets/images/village_fg.png');
    this.load.image('village_mg', 'assets/images/village_mg.png');
    this.load.image('village_bg', 'assets/images/village_bg.png');
    this.load.image('mountains_fg', 'assets/images/mountains_fg.png');
    this.load.image('mountains_mg', 'assets/images/mountains_mg.png');
    this.load.image('mountains_bg', 'assets/images/mountains_bg.png');
    this.load.image('forest_fg', 'assets/images/forest_fg.png');
    this.load.image('forest_mg', 'assets/images/forest_mg.png');
    this.load.image('forest_bg', 'assets/images/forest_bg.png');
    this.load.atlasJSONHash('player', 'assets/images/medusaPlayer.png', 'assets/images/medusaPlayer.json');
    this.load.atlasJSONHash('poison', 'assets/images/poison.png', 'assets/images/poison.json');
    this.load.atlasJSONHash('people', 'assets/images/enemies.png', 'assets/images/enemies.json');
    this.load.audio('coin', ['assets/audio/coin.mp3', 'assets/audio/coin.ogg']);
    
    this.load.bitmapFont('antiqua', 'assets/fonts/antiqua.png', 'assets/fonts/antiqua.xml');
    this.load.bitmapFont('antiquaWhite', 'assets/fonts/antiquaWhite.png', 'assets/fonts/antiquaWhite.xml');
  },
  create: function() {
    this.state.start('Menu');
  }
};