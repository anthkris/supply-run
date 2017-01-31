var SupRun = SupRun || {};

//loading the game assets
SupRun.PreloadState = {
  preload: function() {
    /* LOADING BAR ASSETS */
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'preloadbar');
    this.preloadBar.anchor.setTo(0.5);
    this.load.setPreloadSprite(this.preloadBar);
    
    this.loadingText = this.add.bitmapText(this.game.world.centerX, this.game.world.centerY + 150, 'antiquaWhite', '0%', 40);
    this.loadingText.anchor.x = 0.5;
    this.game.load.onFileComplete.add(this.fileComplete, this);

    /* IMAGES */  
    this.load.image('floor', 'assets/images/floor.png');
    this.load.image('logo', 'assets/images/supplyRun.png');
    this.load.atlasJSONHash('coin', 'assets/images/coin.png', 'assets/images/coin.json');
    this.load.atlasJSONHash('startButton', 'assets/images/startButton.png', 'assets/images/startButton.json');
    this.load.image('restartButton', 'assets/images/restartButton.png');
    this.load.atlasJSONHash('lives', 'assets/images/lives.png', 'assets/images/lives.json');
    this.load.atlasJSONHash('cash', 'assets/images/cash.png', 'assets/images/cash.json');
    this.load.atlasJSONHash('audioButton', 'assets/images/audioButton.png', 'assets/images/audioButton.json');
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
    this.load.image('wizard', 'assets/images/wizard.png');
    this.load.atlasJSONHash('player', 'assets/images/medusaPlayer.png', 'assets/images/medusaPlayer.json');
    this.load.atlasJSONHash('poison', 'assets/images/poison.png', 'assets/images/poison.json');
    this.load.atlasJSONHash('people', 'assets/images/enemies.png', 'assets/images/enemies.json');
    
    /* AUDIO */
    this.load.audio('coin', ['assets/audio/coin.mp3', 'assets/audio/coin.ogg']);
    this.load.audio('jump', ['assets/audio/jump.mp3', 'assets/audio/jump.ogg']);
    this.load.audio('hit', ['assets/audio/hit2.mp3', 'assets/audio/hit2.ogg']);
    this.load.audio('click', ['assets/audio/click.mp3', 'assets/audio/click.ogg']);
    this.load.audio('shootSound', ['assets/audio/laser.mp3', 'assets/audio/laser.ogg']);
    this.load.audio('life', ['assets/audio/pickup.mp3', 'assets/audio/pickup.ogg']);
    this.load.audio('rumble', ['assets/audio/rumble.mp3', 'assets/audio/rumble.ogg']);
    this.load.audio('adventureMusic', ['assets/audio/AdventureLoop.mp3', 'assets/audio/adventureLoop.ogg']);
    
    /* FONTS */
    this.load.bitmapFont('antiqua', 'assets/fonts/antiqua.png', 'assets/fonts/antiqua.xml');
    this.load.bitmapFont('antiquaWhite', 'assets/fonts/antiquaWhite.png', 'assets/fonts/antiquaWhite.xml');
  },
  create: function() {
    this.time.events.add(500, function() {
      this.state.start('Menu');
    }, this);
  },
  update: function() {},
  fileComplete: function(progress, cacheKey, success, totalLoaded, totalFiles) {
    this.loadingText.text = progress + "%";
  }
  
};