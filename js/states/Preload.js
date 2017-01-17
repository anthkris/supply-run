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
    this.load.image('playerDead', 'assets/images/player_dead.png');
    this.load.image('floor', 'assets/images/floor.png');
    this.load.image('water', 'assets/images/water.png');
    this.load.image('coin', 'assets/images/coin.png');
    this.load.image('background', 'assets/images/village.png');
    this.load.atlasJSONHash('player', 'assets/images/medusaPlayer.png', 'assets/images/medusaPlayer.json');
    this.load.atlasJSONHash('people', 'assets/images/enemies.png', 'assets/images/enemies.json');
    this.load.audio('coin', ['assets/audio/coin.mp3', 'assets/audio/coin.ogg']);
  },
  create: function() {
    this.state.start('Game');
  }
};