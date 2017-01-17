var SupRun = SupRun || {};

SupRun.GameState = {

  init: function() {
    //pool of floor sprites
    this.floorPool = this.add.group();
    
    //pool of platforms
    this.platformPool = this.add.group();
    
    //pool of coins
    this.coinsPool = this.add.group();
    this.coinsPool.enableBody = true;
    
    //pool of enemies
    this.enemiesPool = this.add.group();
    this.enemiesPool.enableBody = true;
    
    //gravity
    this.game.physics.arcade.gravity.y = 1000; 
    
    //max jumping distance
    this.maxJumpDistance = 120;
    
    //enable cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    
    //coin count
    this.myCoins = 0;
    
    //level speed
    this.levelSpeed = 200;
  },
  create: function() {
 
    //hard-code first platform
    this.currentPlatform = new SupRun.Platform(this.game, this.floorPool, 20, 0, 600, -this.levelSpeed, this.coinsPool, this.enemiesPool);
    this.platformPool.add(this.currentPlatform);
    
    //create moving background
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'background');
    this.background.autoScroll(-this.levelSpeed/6, 0);
    this.game.world.sendToBack(this.background);
    
    
    //create player
    this.player = this.game.add.sprite(400, 300, 'player', 'medusa.png');
    //this.player = this.add.sprite(50, 50, 'player');
    this.player.anchor.setTo(0.5);
    this.player.animations.add('running', Phaser.Animation.generateFrameNames('medusa_run_', 1, 8, '.png', 3), 10, true, false);
    this.player.animations.add('jumping', Phaser.Animation.generateFrameNames('medusa_jump_', 1, 4, '.png', 3), 10, false, false);
    this.playerHitAnim = this.player.animations.add('hit', Phaser.Animation.generateFrameNames('medusa_die_', 1, 3, '.png', 3), 10, true, false);
    this.game.physics.arcade.enable(this.player);
    
    this.playerHitAnim.onLoop.add(this.hitAnimationLooped, this);

    //change player bounding box
    //this.player.body.setSize(89, 98, 70, 70);
    this.player.play('running');
    
    //create moving water
   // this.water = this.add.tileSprite(0, this.game.world.height - 96, this.game.world.width, 96, 'water');
    //this.water.autoScroll(this.levelSpeed/2, 0);
    
    
    this.coinSound = this.add.audio('coin');
    this.gameOverCounter = 0;
    this.loadLevel();
    
    //show number of coins
    var style = {font: '30px Arial', fill: '#fff'};
    this.coinsCountLabel = this.add.text(10, 20, '0', style);
  },   
  update: function() {
    if (this.player.alive) {
      this.platformPool.forEachAlive(function(platform, index){
        this.game.physics.arcade.collide(this.player, platform);
        
        this.enemiesPool.forEachAlive(function(enemy, index){
          this.game.physics.arcade.collide(enemy, platform);
          //this.game.physics.arcade.collide(enemy, this.player);
        }, this);
        
        //check if platform needs to be killed
        if(platform.length && platform.children[platform.length - 1].right < 0) {
          platform.kill();
        }
      }, this);
      
      
      this.game.physics.arcade.overlap(this.player, this.coinsPool, this.collectCoin, null, this);
      this.game.physics.arcade.overlap(this.player, this.enemiesPool, this.hurtPlayer, null, this);
      
      if (this.player.body.touching.down && !this.isHit) {
        this.player.play('running');
        this.player.body.velocity.x = this.levelSpeed;
      }
      else {
        this.player.body.velocity.x = 0;
      }
      
      if(this.cursors.up.isDown || this.game.input.activePointer.isDown){
        this.playerJump();
      } else if (this.cursors.up.isUp || this.game.input.activePointer.isUp) {
        this.isJumping = false;
      }
      
      //if the last sprite in the platform group is showing, then create a new platform
      if(this.currentPlatform.length && this.currentPlatform.children[this.currentPlatform.length - 1].right < this.game.world.width) {
        this.createPlatform();
      }
      
      //kill coins that leave the screen
      this.coinsPool.forEachAlive(function(coin){
        if (coin.right <= 0){
          coin.kill();
        }
      }, this);
      
      //kill enemies that leave the screen
      this.enemiesPool.forEachAlive(function(enemy){
        if (enemy.right <= 0){
          enemy.kill();
        }
      }, this);
    }
    
    //check if the player needs to die
    if(this.player.top >= this.game.world.height || this.player.left <= 0) {
      //console.log(this.player.top);
      console.log(this.player.left);
      //alpha doesn't work when bitmapData sprite is continuously redrawn
      //so only run gameOver once
      if(this.gameOverCounter <= 0) {
        this.gameOver();
        this.gameOverCounter++;
      }
      
    }
  },
  render: function(){
    //this.game.debug.bodyInfo(this.player, 0, 30);
    this.game.debug.body(this.player);
    this.enemiesPool.forEach(function(enemy){
      this.game.debug.body(enemy);
      this.game.debug.bodyInfo(enemy, 0, 30);
    }, this);
  },
  playerJump: function(){
    if(this.player.body.touching.down) {
      //starting point of the jump
      this.startJumpY = this.player.y;
      this.player.play('jumping');
      //keep track of the fact that you are jumping
      this.isJumping = true;
      this.jumpPeaked = false;
      
      this.player.body.velocity.y = -300;
    } else if (this.isJumping && !this.jumpPeaked){
      var distanceJumped = this.startJumpY - this.player.y;
      if (distanceJumped <= this.maxJumpDistance) {
        this.player.play('jumping');
        this.player.body.velocity.y = -300;
      } else {
        this.jumpPeaked = true;
      }
    }
  },
  loadLevel: function() {
    //this.currIndex = 0;
    this.createPlatform();
  },
  createPlatform: function(){
    var nextPlatformData = this.generateRandomPlatform();
    
     if (nextPlatformData) {
       this.currentPlatform = this.platformPool.getFirstDead();
       if (!this.currentPlatform) {
         this.currentPlatform = new SupRun.Platform(this.game, this.floorPool, nextPlatformData.numTiles, 
                                                 this.game.world.width + nextPlatformData.separation, nextPlatformData.y, -this.levelSpeed, this.coinsPool, this.enemiesPool);
       } else {
         this.currentPlatform.prepare(nextPlatformData.numTiles, this.game.world.width + nextPlatformData.separation, 
                                      nextPlatformData.y, -this.levelSpeed, this.coinsPool, this.enemiesPool);
       }
       
       this.platformPool.add(this.currentPlatform);
       this.currIndex++;
     }
  },
  generateRandomPlatform: function(){
    var data = {};
    //generate separation/ distance from prev platform
    var minSeparation = 120;
    var maxSeparation = 300;
    data.separation = minSeparation + Math.random() * (maxSeparation - minSeparation);
    
    //y, in regards to the prev platform
    var minDifY = -120;
    var maxDifY = 120;
    //data.y = 900;
     data.y = this.currentPlatform.children[0].y + minDifY + Math.random() * (maxDifY - minDifY);
    //set absolute max and min for platforms to overwrite random gen, if necessary
    data.y = Math.max(864, data.y);
    data.y = Math.min(this.game.world.height - 288, data.y);
    
    //number of tiles
    var minTiles = 4;
    var maxTiles = 15;
    data.numTiles = minTiles + Math.random() * (maxTiles - minTiles);
    
    return data;
  },
  collectCoin: function(player, coin) {
    //kill coin, update coin count, and play sound
    coin.kill();
    this.myCoins++;
    this.coinSound.play();
    this.coinsCountLabel.text = this.myCoins;
  },
  gameOver: function() {
    this.player.kill();
    this.updateHighScore();
    //game over overlay
    this.overlay = this.game.add.bitmapData(this.game.width, this.game.height);
    this.overlay.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this.overlay.ctx.fillRect(0, 0, this.game.width, this.game.height);
    //sprite for the overlay
    this.panel = this.game.add.sprite(0, this.game.height, this.overlay);
    //this.panel.alpha = 0.55;
    
    //overlay raising tween animation
    var gameOverPanel = this.game.add.tween(this.panel);
    gameOverPanel.to({y: 0}, 500);
    
    //stop all movement after the overlay reaches the top
    gameOverPanel.onComplete.add(function(){
      this.background.stopScroll();
      
      //Add text to overlay
      
      //Game Over message
      var style = {font: '30px Arial', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2, 'GAME OVER', style).anchor.setTo(0.5);
      
      //High Score show
      style = {font: '20px Arial', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2 + 50, 'High Score: ' + this.highScore, style).anchor.setTo(0.5);
      //Your Score show
      style = {font: '20px Arial', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2 + 80, 'Your Score: ' + this.myCoins, style).anchor.setTo(0.5);
      //How to restart text
      style = {font: '14px Arial', fill: '#fff'};
      this.add.text(this.game.width/2, this.game.height/2 + 120, 'Tap to Play Again', style).anchor.setTo(0.5);
      //Allow tap or click to restart
      this.game.input.onDown.addOnce(this.restart, this);
      
    }, this);
    
    gameOverPanel.start();
  },
  restart: function() {
    this.game.state.start('Game');
  },
  updateHighScore: function() {
    //read from storage first
    this.highScore = localStorage.getItem('highScore');
    
    if(this.highScore === 'undefined') {
      this.highScore = 0;
    }
    
    if(this.highScore < this.myCoins) {
      this.highScore = this.myCoins;
      //save in local storage
      localStorage.setItem('highScore', this.highScore);
    }
    //console.log(this.highScore);
  },
  hurtPlayer: function(player, enemy) {
    this.isHit = true;
    enemy.play('attacking');
    player.body.checkCollision.left = false;
    player.body.checkCollision.right = false;
    player.play('hit');
    
    //console.log('ouch');
    //this.isHit = false;
  },
  hitAnimationLooped: function(sprite, animation) {
     if (animation.loopCount === 1) {
      this.isHit = false;
      sprite.body.checkCollision.left = true;
      sprite.body.checkCollision.right = true;
      sprite.body.velocity.x = this.levelSpeed;
    }
  }
}
