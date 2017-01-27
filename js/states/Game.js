var SupRun = SupRun || {};

SupRun.GameState = {

  init: function(level, levelSpeed, bgSprite, enemySprite, lives, coins) {
    /* OBJECT POOLS */
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
    
    //pool of extra lives
    this.lifePool = this.add.group();
    this.lifePool.enableBody = true;
    
    //pool of projectiles
    this.projectilesPool = this.add.group();

    /* INPUT */
    
    //enable cursor keys
    this.cursors = this.game.input.keyboard.createCursorKeys();
    this.spaceKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    /* GLOBAL GAME VARIABLES */
    this.gameOverCounter = 0;
    this.game.physics.arcade.gravity.y = 1000; 
    
    //max jumping distance
    this.maxJumpDistance = 140;

    /* LEVEL VARIABLES */
    this.currentLevel = level || 'level1';
    this.bgSprite = bgSprite || 'background';
    this.enemySprite = enemySprite || 'knight_';
    this.levelSpeed = levelSpeed || 300;

    /* GAME COLLECTIBLES */
    
    //coin count
    this.myCoins = coins || 0;
    
    //lives count
    this.myLivesLeft = lives || 4;
    this.maxLives = 4;

    /* PROJECTILE VARIABLES */
    this.attackTimer = 0;
    this.canShoot = true;
    this.isShooting = false;
    this.isHit = false;
    
  },
  create: function() {
    /* BACKGROUND */
    //create moving background
    this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, this.bgSprite);
    this.background.autoScroll(-this.levelSpeed/6, 0);
    this.game.world.sendToBack(this.background);
    
    
    /* PLAYER */
    this.player = this.game.add.sprite(400, 300, 'player', 'medusa.png');
    this.player.anchor.setTo(0.5);
    this.PLAYER_GHOST_TIME = 1000;
   
    //player animations
    this.player.animations.add('running', Phaser.Animation.generateFrameNames('medusa_run_', 1, 8, '.png', 3), 10, true, false);
    this.playerJumpAnim = this.player.animations.add('jumping', Phaser.Animation.generateFrameNames('medusa_jump_', 1, 4, '.png', 3), 12, false, false);
    this.shootAnim = this.player.animations.add('attacking', Phaser.Animation.generateFrameNames('medusa_attack2_', 1, 3, '.png', 3), 12, false, false);
    this.playerHitAnim = this.player.animations.add('hit', Phaser.Animation.generateFrameNames('medusa_die_', 1, 3, '.png', 3), 10, true, false);
    this.playerDieAnim = this.player.animations.add('dying', Phaser.Animation.generateFrameNames('medusa_die_', 1, 8, '.png', 3), 10, false, false);
    this.playerDieAnim.onComplete.add(this.dieAnimComplete, this);
    this.playerJumpAnim.onComplete.add(this.jumpAnimComplete, this);
    this.playerHitAnim.onLoop.add(this.hitAnimationLooped, this);
    this.shootAnim.onComplete.add(this.shootAnimComplete, this); 
    
    //player physics
    this.game.physics.arcade.enable(this.player);
    this.player.body.setSize(89, 98, 70, 70); //change player bounding box

    //play running animation
    this.player.play('running');
    
    /* LIVES */
    this.playerLives = this.game.add.group();
    this.playerLives.createMultiple(this.myLivesLeft, 'heart', 0, true);
    this.playerLives.align(-1, 1, 86, 96, Phaser.RIGHT_CENTER, 0);
    this.playerLives.x = 200;
    this.playerLives.y = 24;
    // this.life1 = this.playerLives.create(200, 20, 'heart');
    // this.life2 = this.playerLives.create(20, 20, 'heart').alignTo(this.life1, Phaser.RIGHT_CENTER, -10);
    // this.life3 = this.playerLives.create(20, 20, 'heart').alignTo(this.life2, Phaser.RIGHT_CENTER, -10);
    // this.playerLives.create(20, 20, 'heart').alignTo(this.life3, Phaser.RIGHT_CENTER, -10);
    
    /* PLATFORMS */
    //hard-code first platform
    this.currentPlatform = new SupRun.Platform(this.game, this.floorPool, 20, 0, 600, -this.levelSpeed, this.coinsPool, this.enemiesPool, this.lifePool, this.enemySprite, this.player, true);
    this.platformPool.add(this.currentPlatform);

    /* LOAD LEVEL */  
    this.loadLevel();

    /* COINS */
    this.coinSound = this.add.audio('coin');
    //show number of coins
    var style = {font: '30px Arial', fill: '#fff'};
    this.coinsCountIcon = this.game.add.sprite(22, 20, 'coin');
    this.coinsCountLabel = this.add.text(80, 20, '0', style).alignTo(this.coinsCountIcon, Phaser.RIGHT_CENTER, 20);
    
    /* LEVEL TIMER */
    this.nextLevelTimer = this.game.time.events.add(Phaser.Timer.SECOND * 20, this.nextLevel, this);
    this.speedUpTimer = this.game.time.create(false);
    this.speedUpTimer.loop(1500, this.goFaster, this);
    this.speedUpTimer.start();
    
    this.game.camera.flash(0xffffff, 1000);
  },   
  update: function() {
    
    /* COLLISION WITH POOLS */
    if (this.player.alive) {
      //this.player.x = 400;
      this.platformPool.forEachAlive(function(platform, index) {
        this.game.physics.arcade.collide(this.player, platform, this.hitWall, null, this);
        this.enemiesPool.forEachAlive(function(enemy, index) {
          this.game.physics.arcade.collide(enemy, platform);
        }, this);
        
        // update floor tile speed constantly
        platform.forEach(function(floor) {
          floor.body.velocity.x = -this.levelSpeed;
        }, this);
        
        //check if platform needs to be killed
        if(platform.length && platform.children[platform.length - 1].right < 0) {
          platform.kill();
        }
      }, this);
      
      // update coin and life sprite speed constantly
      this.coinsPool.forEachAlive(function(coin) {
         coin.body.velocity.x = -this.levelSpeed;
      }, this);
      
      this.lifePool.forEachAlive(function(life) {
          life.body.velocity.x = -this.levelSpeed;
      }, this);
      
      this.game.physics.arcade.overlap(this.player, this.coinsPool, this.collectCoin, null, this);
      this.game.physics.arcade.overlap(this.player, this.lifePool, this.collectLife, null, this);
      this.game.physics.arcade.overlap(this.player, this.enemiesPool, this.hurtPlayer, null, this);
      this.game.physics.arcade.collide(this.enemiesPool, this.projectilesPool, this.killEnemy, null, this);
      
      
      this.processDelayedEffects();
      
      /* CHECK PLAYER BOOLEANS */
      if (this.player.body.touching.down && !this.isHit && !this.isShooting) {
        this.player.play('running');
        this.player.body.velocity.x = this.levelSpeed;
      }
      
      if (!this.player.body.touching.down) {
        this.player.body.velocity.x = 0;
      }
      
      if (!this.player.body.touching.down && this.isJumping) {
        //if up in the air
        //console.log('player is in the air');
        
        //this.player.x = 400;
        this.canShoot = true;
      }
      
      if (this.isShooting && this.player.body.touching.down) {
        //if shooting
        this.isShooting = false;
        this.player.body.velocity.x = this.levelSpeed;
      } 
      
      /* CONTROLS */
      if(this.cursors.up.isDown || this.game.input.activePointer.isDown){
        this.playerJump();
      } else if (this.cursors.up.isUp || this.game.input.activePointer.isUp) {
        this.isJumping = false;
      }
      if(this.spaceKey.isDown){
        this.shoot();
      }

      /* PLATFORM CREATION */
      //if the last sprite in the platform group is showing, then create a new platform
      //console.log(this.currentPlatform.children);
      if(this.currentPlatform.length && this.currentPlatform.children[this.currentPlatform.length - 1].right < this.game.world.width) {
        this.createPlatform();
      }
      
      /* KILL SWITCH */
      //kill coins that leave the screen
      this.coinsPool.forEachAlive(function(coin){
        if (coin.right <= 0){
          coin.kill();
        }
      }, this);
      
      //kill enemies that leave the screen
      this.enemiesPool.forEachAlive(function(enemy){
        if (enemy.right <= 0 || enemy.left <= 200){
          enemy.kill();
        }
      }, this);
    
    }
    
    /* ALLOW ENEMIES TO REMAIN ON PLATFORMS AFTER DEATH  */
    this.platformPool.forEachAlive(function(platform, index){
        this.enemiesPool.forEachAlive(function(enemy, index){
          this.game.physics.arcade.collide(enemy, platform);
        }, this);
      }, this);
    
    /* CHECK IF PLAYER NEEDS TO DIE */
    if(this.player.top >= this.game.world.height || this.player.left <= 0 || this.myLivesLeft <= 0) {
      //alpha doesn't work when bitmapData sprite is continuously redrawn
      //so only run gameOver once
      this.player.play('dying');
      this.playerLives.destroy(true, true);
      this.speedUpTimer.destroy();
      this.nextLevelTimer.timer.destroy();
      if(this.gameOverCounter <= 0) {
        this.gameOver();
        this.gameOverCounter++;
      }
      
    }
  },
  collectCoin: function(player, coin) {
    //kill coin, update coin count, and play sound
    coin.kill();
    this.myCoins++;
    //this.coinSound.play();
    this.coinsCountLabel.text = this.myCoins;
  },
  collectLife: function(player, life) {
    life.kill();
    if (this.myLivesLeft < this.maxLives) {
      if (this.myLivesLeft<=3) {
        this.playerLives.create(this.playerLives.getChildAt(this.myLivesLeft - 1).x + 86, this.playerLives.getChildAt(this.myLivesLeft - 1).y, 'heart');
      }
      this.myLivesLeft++;
    }
    console.log(this.myLivesLeft);
  },
  createPlatform: function(){
    var nextPlatformData = this.generateRandomPlatform();
    
     if (nextPlatformData) {
       this.currentPlatform = this.platformPool.getFirstDead();
       if (!this.currentPlatform) {
         this.currentPlatform = new SupRun.Platform(this.game, this.floorPool, nextPlatformData.numTiles, 
                                                 this.game.world.width + nextPlatformData.separation, nextPlatformData.y, -this.levelSpeed, this.coinsPool, this.enemiesPool, this.lifePool, this.enemySprite, this.player, false);
       } else {
         this.currentPlatform.prepare(nextPlatformData.numTiles, this.game.world.width + nextPlatformData.separation, 
                                      nextPlatformData.y, -this.levelSpeed, this.coinsPool, this.enemiesPool, this.lifePool, this.enemySprite, this.player, false);
       }
       
       this.platformPool.add(this.currentPlatform);
       this.currIndex++;
     }
  },
  dieAnimComplete: function() {
    this.player.frameName = 'medusa_die_008.png';
  },
  gameOver: function() {
    //alive to false preserves rendering
    this.player.alive = false;
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
    //console.log(this.currentPlatform.children[0].y);
    //set absolute max and min for platforms to overwrite random gen, if necessary
    data.y = Math.max(470, data.y);
    data.y = Math.min(this.game.world.height - 288, data.y);
    
    //number of tiles
    var minTiles = 7;
    var maxTiles = 15;
    data.numTiles = minTiles + Math.random() * (maxTiles - minTiles);
    //console.log(data);
    return data;
  },
  goFaster: function(){
    console.log('speed it up!');
      this.levelSpeed += 10;
    if (this.speedUpTimer.ms >= this.goFasterTime) {
      
    }
  },
  hitAnimationLooped: function(sprite, animation) {
    this.isHit = false;
    this.canShoot = true;
    this.player.play('running');
     if (animation.loopCount >= 1) {
      
    }
  },
  hitWall: function(player, floor) {
    if (floor.body.touching.left) {
      console.log('hit floor');
      player.play('dying');
      this.playerLives.destroy(true, true);
      player.body.gravity.y = 10000;
    }
    
  },
  hurtPlayer: function(player, enemy) {
    //only destroy a heart the first time you contact the enemy
    //enemy should detract 1 heart at most
    //Taken from here: https://leanpub.com/html5shootemupinanafternoon/read#leanpub-auto-player-lives
    // check first if this.ghostUntil is not not undefined or null 
    //console.log(enemy.body.touching);
    if (enemy.body.touching.left && !enemy.body.touching.up) {
      enemy.play('attacking');
      player.play('hit');
      this.canShoot = false;
      if (this.ghostUntil && this.ghostUntil > this.time.now) {
        return;
      }
      this.ghostUntil = this.game.time.now + this.PLAYER_GHOST_TIME;
      this.isHit = true;
      this.canShoot = false;
    
      var life = this.playerLives.getChildAt(this.myLivesLeft - 1);
      if (life !== null) { 
        life.kill();
        this.myLivesLeft--;
      }
    } else if (enemy.body.touching.up) {
      enemy.kill();
    }
    
    
  },
  jumpAnimComplete: function(sprite, animation){
      //this.player.frameName = "medusa_run_001.png";
  },
  killEnemy: function(enemy, projectile) {
      enemy.kill();
      projectile.kill();
  },
  loadLevel: function() {
    //this.currIndex = 0;
    this.createPlatform();
  },
  nextLevel: function() {
    //console.log(this.levelSpeed);
    
    if (this.currentLevel === 'level1') {
      this.game.state.start('Game', true, false, 'level2', this.levelSpeed, 'background2', 'dwarf_1_', this.myLivesLeft, this.myCoins);
    } else if (this.currentLevel === 'level2') {
      this.game.state.start('Game', true, false, 'level3', this.levelSpeed, 'background3', 'barbarian_1_', this.myLivesLeft, this.myCoins);
    } else {
      this.game.state.start('Game', true, false, 'level1', this.levelSpeed, 'background', 'knight_', this.myLivesLeft, this.myCoins);
    }
  },
  playerJump: function() {
    if(this.player.body.touching.down) {
      //starting point of the jump
      this.startJumpY = this.player.y;
      //keep track of the fact that you are jumping
      this.isJumping = true;
      this.player.play('jumping');
      this.jumpPeaked = false;
      this.player.body.velocity.x = 0;
      this.player.body.velocity.y = -400;
    } else if (this.isJumping && !this.jumpPeaked){
      var distanceJumped = this.startJumpY - this.player.y;
      if (distanceJumped <= this.maxJumpDistance) {
        this.player.play('jumping');
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = -400;
      } else {
        this.jumpPeaked = true;
      }
    }
  },
  processDelayedEffects: function() {
    //Taken from here: https://leanpub.com/html5shootemupinanafternoon/read#leanpub-auto-player-lives
    // reset ghostUntil in update
    if (this.ghostUntil && this.ghostUntil < this.game.time.now) {
      this.ghostUntil = null;
      this.player.play('running');
      this.isHit = false;
      this.canShoot = true;
    }
  },
  render: function() {
    
    // this.game.debug.body(this.player);
    // this.platformPool.forEach(function(platform){
      
    //   platform.forEach(function(floor) {
    //     this.game.debug.bodyInfo(floor, 0, 30);
    //     this.game.debug.body(floor);
        
    //   }, this);
      
    // }, this);
    // this.enemiesPool.forEach(function(enemy){
    // this.game.debug.body(enemy);
    // //this.game.debug.bodyInfo(enemy, 0, 30);
    // }, this);
  },
  restart: function() {
    this.game.state.start('Game', true, false, '', 200, '', '', this.maxLives, 0);
  },
  shoot: function() {
    if (this.canShoot) {
      this.isShooting = true;
        if (this.attackTimer < this.game.time.now) {
            this.attackTimer = this.game.time.now + 200;
            var projectile = this.projectilesPool.getFirstExists(false);
            if (!projectile) {
              projectile = this.projectilesPool.create(
                  this.player.body.x + this.player.body.width  / 2,
                  this.player.body.y + this.player.body.height / 2,
                  'poison');
            } else {
              projectile.reset(
                this.player.body.x + this.player.body.width  / 2,
                this.player.body.y + this.player.body.height / 2,
                'poison');
            }

            this.game.physics.arcade.enable(projectile);
            projectile.checkWorldBounds = true;
            projectile.outOfBoundsKill = true;
            projectile.anchor.setTo(0.5, 0.5);
            projectile.body.setSize(74, 44, 30, 10);
            projectile.allowGravity = false;
            projectile.body.velocity.x = 1000;
            this.player.play('attacking');
            //console.log(this.projectilesPool);
        }
    }
  },
  shootAnimComplete: function(sprite, animation){
    this.isShooting = false;
    this.player.play('running');
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
}