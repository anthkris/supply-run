var SupRun = SupRun || {};

//setting game configuration and loading the assets for the loading screen
SupRun.BootState = {
  init: function() {
    //loading screen will have a white background
    this.game.stage.backgroundColor = '#002c00';  
    
    //scaling options
    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    //have the game centered horizontally
    this.scale.pageAlignHorizontally = true;
    this.scale.pageAlignVertically = true;

    //physics system
    this.game.physics.startSystem(Phaser.Physics.ARCADE);    
  },
  preload: function() {
    //assets we'll use in the loading screen
    this.load.bitmapFont('antiquaWhite', 'assets/fonts/antiquaWhite.png', 'assets/fonts/antiquaWhite.xml');
    this.load.image('preloadbar', 'assets/images/preloadBar.png');
  },
  create: function() {
    this.state.start('Preload');
  }
};