var SupRun = SupRun || {};

SupRun.GameState = {

  init: function(level, levelSpeed, bgGroup, enemySprite, lives, coins) {
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
    this.bgGroup = bgGroup || ['village_fg', 'village_mg', 'village_bg'];
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
    this.foreGround = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, this.bgGroup[0]);
    this.middleGround = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, this.bgGroup[1]);
    this.backGround = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, this.bgGroup[2]);
    this.game.world.sendToBack(this.foreGround);
    this.game.world.sendToBack(this.middleGround);
    this.game.world.sendToBack(this.backGround);
    this.foreGround.fixedToCamera = true;
    this.middleGround.fixedToCamera = true;
    this.backGround.fixedToCamera = true;
    
    
    /* CAMERA  */
    this.game.camera.bounds = null;
    
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
    this.playerHitAnim.onLoop.add(this.hitAnimationLooped, this);
    this.shootAnim.onComplete.add(this.shootAnimComplete, this); 
    
    //player physics
    this.game.physics.arcade.enable(this.player);
    this.player.body.setSize(89, 98, 70, 70); //change player bounding box

    //play running animation
    this.player.play('running');
    
    /* LIVES */
    this.livesLabel = this.game.add.sprite(200, 70, 'lives', 'life.png');
    this.livesLabel.anchor.setTo(0.5);
    this.livesLabel.fixedToCamera = true;
    this.livesLabel.cameraOffset.x = 70;
    this.livesLabel.cameraOffset.y = 70;
    
    this.playerLivesContainer = this.game.add.group();
    this.playerLivesContainer.createMultiple(this.maxLives, 'lives', 'red-bar-container.png', true);
    this.playerLivesContainer.align(-1, 1, 86, 96, Phaser.RIGHT_CENTER, 0);
    this.playerLivesContainer.fixedToCamera = true;
    //When fixedToCamera, position uses cameraOffset
    this.playerLivesContainer.cameraOffset.x = 100;
    this.playerLivesContainer.cameraOffset.y = 20;
    
    this.playerLives = this.game.add.group();
    this.playerLives.createMultiple(this.myLivesLeft, 'lives', 'red-bar-full.png', true);
    this.playerLives.align(-1, 1, 86, 96, Phaser.RIGHT_CENTER, 0);
    this.playerLives.fixedToCamera = true;
    //When fixedToCamera, position uses cameraOffset
    this.playerLives.cameraOffset.x = 100;
    this.playerLives.cameraOffset.y = 20;
    
    /* AUDIO BUTTON */
		SupRun.game.audioButton = SupRun.game.add.button(540, 50, 'audioButton', SupRun.game.global.muteAudio, this, "audioOn.png", "audioOn.png", "audioOn.png", "audioOn.png");
		SupRun.game.audioButton.anchor.setTo(0.5);
		SupRun.game.audioButton.fixedToCamera = true;
		SupRun.game.audioButton.cameraOffset.x = 60;
		SupRun.game.audioButton.cameraOffset.y = this.game.world.height - 76;
    
    /* COINS */
    this.coinContainer = this.game.add.sprite(14600, this.game.height - 100, 'cash', 'cash-container.png');
    this.coinContainer.fixedToCamera = true;
    //When fixedToCamera, position uses cameraOffset
    this.coinContainer.cameraOffset.x = 1460;
    this.coinContainer.cameraOffset.y = this.game.height - 100;
    
    this.coinsCountIcon = this.game.add.sprite(1880, this.game.height - 76, 'cash', 'coin-label.png');
    this.coinsCountIcon.fixedToCamera = true;
    this.coinsCountIcon.anchor.setTo(0.5);
    this.coinsCountIcon.cameraOffset.x = 1880;
    this.coinsCountIcon.cameraOffset.y = this.game.height - 76;
    
    /* PLATFORMS */
    //hard-code first platform
    this.currentPlatform = new SupRun.Platform(this.game, this.floorPool, 20, 0, 600, -this.levelSpeed, this.coinsPool, this.enemiesPool, this.lifePool, this.enemySprite, this.player, true);
    this.platformPool.add(this.currentPlatform);

    /* LOAD LEVEL */  
    this.loadLevel();

    /* SOUNDS */
    this.coinSound = this.add.audio('coin');
    this.lifeSound = this.add.audio('life');
    this.hitSound = this.add.audio('hit');
    this.jumpSound = this.add.audio('jump');
    this.shootSound = this.add.audio('shootSound');
    this.rumbleSound = this.add.audio('rumble');
    
    /* LEVEL TIMERS */
    this.nextLevelTimer = this.game.time.events.add(Phaser.Timer.SECOND * 50, this.nextLevel, this);
    this.speedUpTimer = this.game.time.create(false);
    this.speedUpTimer.loop(1500, this.goFaster, this);
    this.speedUpTimer.start();
    this.nextLevelTimer.timer.start();
    
    /* TEXT */
    var style = {font: '30px Arial', fill: '#fff'};
    this.coinsCountLabel = this.add.bitmapText(60, 20, 'antiquaWhite', this.myCoins + '');
    this.coinsCountLabel.anchor.setTo(0.5);
    this.coinsCountLabel.fixedToCamera = true;
    this.coinsCountLabel.cameraOffset.x = 1500;
    this.coinsCountLabel.cameraOffset.y = this.game.height - 80;
    
    this.countdownLabel = this.add.bitmapText(1400, 20, 'antiquaWhite', 'Time until Transport: 0');
    this.countdownLabel.fixedToCamera = true;
    this.countdownLabel.visible = false;
    
    
    
    this.game.camera.flash(0xffffff, 2000);
  },   
  update: function() {
    if (this.player.alive) {
      this.player.body.velocity.x = this.levelSpeed;
      this.game.camera.x = this.player.x - 400;
      //create moving background
      this.updateLayers(this.game.camera.x);
      this.timeToTransport(this.nextLevelTimer.timer.duration);
      
      /* COLLISION WITH POOLS */
      this.platformPool.forEachAlive(function(platform, index) {
        this.game.physics.arcade.collide(this.player, platform, this.hitWall, null, this);
        
        this.projectilesPool.forEachAlive(function(projectile, index) {
          this.game.physics.arcade.collide(projectile, platform, this.projectileSplat);
        }, this);
        
        this.enemiesPool.forEachAlive(function(enemy, index) {
          this.game.physics.arcade.collide(enemy, platform);
        }, this);
        
        //check if platform needs to be killed
        if(platform.length && platform.children[platform.length - 1].right < this.game.camera.x) {
          //console.log('killed platform');
          platform.kill();
        }
      }, this);
      
      // custom collision with coins and lives
      this.coinsPool.forEachAlive(function(coin) {
        this.checkCoinOverlap(this.player, coin);
      }, this);
      
      this.lifePool.forEachAlive(function(life) {
        this.checkLifeOverlap(this.player, life);
      }, this);
      
      this.game.physics.arcade.overlap(this.player, this.enemiesPool, this.hurtPlayer, null, this);
      this.game.physics.arcade.collide(this.enemiesPool, this.projectilesPool, this.killEnemy, null, this);
      
      this.processDelayedEffects();
      
      if (this.player.body.touching.down && !this.isHit && !this.isShooting) {
        this.isJumping = false;
        this.player.play('running');
      }
      
      /* CHECK PLAYER BOOLEANS */
      
      if (!this.player.body.touching.down && this.isJumping) {
        //if up in the air
        this.canShoot = true;
      }
      
      if (this.isShooting && this.player.body.touching.down) {
        //if shooting
        this.isShooting = false;
        this.isJumping = false;
      } 
      
      /* CONTROLS */
      if(this.cursors.up.isDown || this.game.input.activePointer.isDown) {
        this.playerJump();
      } else if (this.cursors.up.isUp || this.game.input.activePointer.isUp) {
        this.isJumping = false;
      }
      if(this.spaceKey.isDown) {
        this.shoot();
      }

      /* PLATFORM CREATION */
      //if the last sprite in the platform group is in the camera, then create a new platform
      if(this.currentPlatform.length && this.currentPlatform.children[this.currentPlatform.length - 1].inCamera) {
        this.createPlatform();
      }
      
      /* KILL SWITCH */
      //kill coins that leave the screen
      this.coinsPool.forEachAlive(function(coin) {
        if (coin.right <= this.game.camera.x) {
          //console.log('killed coin');
          coin.kill();
        }
      }, this);
      
      //kill lives that leave the screen
      this.lifePool.forEachAlive(function(life) {
        if (life.right <= this.game.camera.x) {
          //console.log('killed life');
          life.kill();
        }
      }, this);
      
      //kill enemies that leave the screen
      this.enemiesPool.forEachAlive(function(enemy) {
        if (enemy.right <= this.game.camera.x || enemy.top >= this.game.world.height ) {
          //console.log('killed enemy');
          enemy.kill();
        }
      }, this);
    
    }
    
    /* ALLOW ENEMIES TO REMAIN ON PLATFORMS AFTER DEATH  */
    this.platformPool.forEachAlive(function(platform, index){
        this.game.physics.arcade.collide(this.player, platform);
        this.enemiesPool.forEachAlive(function(enemy, index){
          this.game.physics.arcade.collide(enemy, platform);
        }, this);
      }, this);
    
    /* CHECK IF PLAYER NEEDS TO DIE */
    if(this.player.top >= this.game.world.height || this.player.left <= 0 || this.myLivesLeft <= 0) {
      //alpha doesn't work when bitmapData sprite is continuously redrawn
      //so only run gameOver once
      
      if(this.gameOverCounter <= 0) {
        this.hitSound.play();
        this.player.play('dying');
        this.player.body.velocity.x = 0;
        this.playerLives.destroy(true, true);
        this.speedUpTimer.stop();
        this.nextLevelTimer.timer.stop();
        this.gameOver();
        this.gameOverCounter++;
      }
      
    }
  },
  checkCoinOverlap (player, coin) {
    if (player.x + 30 > coin.left && coin.right > player.x - 30 && coin.bottom > player.y - 35 && player.y - 35 > coin.top) {
      this.collectCoin(player, coin);
    }
  },
  checkLifeOverlap (player, life) {
    if (player.x + 30 > life.left &&  life.right > player.x - 30 && life.bottom > player.y - 35 && player.y - 35 > life.top) {
      //console.log('overlap life');
      this.collectLife(player, life);
    }
  },
  collectCoin: function(player, coin) {
    //kill coin, update coin count, and play sound
    coin.kill();
    this.myCoins++;
    this.coinSound.play();
    this.coinsCountLabel.text = this.myCoins;
  },
  collectLife: function(player, life) {
    life.kill();
    this.lifeSound.play();
    if (this.myLivesLeft < this.maxLives) {
      this.playerLives.create(this.playerLives.getChildAt(this.myLivesLeft - 1).x + 86, this.playerLives.getChildAt(this.myLivesLeft - 1).y, 'lives', 'red-bar-full.png');
      this.myLivesLeft++;
      //console.log("gained a life! Now at " + this.myLivesLeft);
    } else {
      //console.log("reached max lives");
    }
  },
  createPlatform: function() {
    var nextPlatformData = this.generateRandomPlatform();
    //separation between platforms should now be measured from the rightmost 
    //pixel of the last tile of the current platform
    var lastPlatform = this.currentPlatform.children[this.currentPlatform.length - 1].right;
    
     if (nextPlatformData) {
       this.currentPlatform = this.platformPool.getFirstDead();
       if (!this.currentPlatform) {
         this.currentPlatform = new SupRun.Platform(this.game, this.floorPool, nextPlatformData.numTiles, 
                                                 lastPlatform + nextPlatformData.separation, nextPlatformData.y, -this.levelSpeed, this.coinsPool, this.enemiesPool, this.lifePool, this.enemySprite, this.player, false);
       } else {
        this.currentPlatform.prepare(nextPlatformData.numTiles, lastPlatform + nextPlatformData.separation, 
                                      nextPlatformData.y, -this.levelSpeed, this.coinsPool, this.enemiesPool, this.lifePool, this.enemySprite, this.player, false);
        this.currentPlatform.checked = false;
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
    this.game.camera.fade(0x000000, 2000);
    this.game.state.start('GameOver', true, false, this.highScore, this.myCoins, this.maxLives);
  },
  generateRandomPlatform: function() {
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
  goFaster: function() {
      //console.log('speed it up!');
      this.levelSpeed += 10;
  },
  hitAnimationLooped: function(sprite, animation) {
    this.isHit = false;
    this.canShoot = true;
    this.player.play('running');
  },
  hitWall: function(player, floor) {
    if (floor.body.touching.left) {
      //console.log('hit floor');
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
    enemy.play('attacking');
    player.play('hit');
    if (enemy.body.touching.left && !enemy.body.touching.up) {
      this.hitSound.play();
      this.canShoot = false;
      if (this.ghostUntil && this.ghostUntil > this.time.now) {
        return;
      }
      this.ghostUntil = this.game.time.now + this.PLAYER_GHOST_TIME;
      this.isHit = true;
      this.canShoot = false;
    
      var life = this.playerLives.getChildAt(this.myLivesLeft - 1);
      if (life !== null) { 
        
        life.destroy();
        this.myLivesLeft--;
        //console.log("lost a life! Now at " + this.myLivesLeft);
      }
    } else if (enemy.body.touching.up) {
      enemy.kill();
    }
  },
  killEnemy: function(enemy, projectile) {
      enemy.kill();
      projectile.kill();
  },
  loadLevel: function() {
    this.createPlatform();
  },
  nextLevel: function() {
    this.rumbleSound.play();
    if (this.currentLevel === 'level1') {
      this.game.state.start('Game', true, false, 'level2', this.levelSpeed, ['mountains_fg', 'mountains_mg', 'mountains_bg'], 'dwarf_1_', this.myLivesLeft, this.myCoins);
    } else if (this.currentLevel === 'level2') {
      this.game.state.start('Game', true, false, 'level3', this.levelSpeed, ['forest_fg', 'forest_mg', 'forest_bg'], 'barbarian_1_', this.myLivesLeft, this.myCoins);
    } else {
      this.game.state.start('Game', true, false, 'level1', this.levelSpeed, ['village_fg', 'village_mg', 'village_bg'], 'knight_', this.myLivesLeft, this.myCoins);
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
      this.player.body.velocity.y = -400;
      this.jumpSound.play();
    } else if (this.isJumping && !this.jumpPeaked){
      var distanceJumped = this.startJumpY - this.player.y;
      if (distanceJumped <= this.maxJumpDistance) {
        this.player.play('jumping');
        this.player.body.velocity.y = -400;
        this.jumpSound.play();
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
  projectileSplat: function(projectile, platform) {
    projectile.kill();
  },
  render: function() {
    /* DEBUG PLAYER  */
    // this.game.debug.body(this.player);
    //this.game.debug.bodyInfo(this.player, 0, 30);
    
    /* DEBUG PLATFORM  */
    // this.platformPool.forEach(function(platform){
  
    //   platform.forEach(function(floor) {
    //     this.game.debug.bodyInfo(floor, 0, 30);
    //     this.game.debug.body(floor);
        
    //   }, this);
    // }, this);
    
    /* DEBUG COINS */
    // this.coinsPool.forEach(function(coin) {
    //   this.game.debug.body(coin);
    // }, this);
    
    /* DEBUG LIVES */
    // this.lifePool.forEach(function(life) {
    //   this.game.debug.body(life);
    // }, this);
      
    /* DEBUG ENEMIES */
    // this.enemiesPool.forEach(function(enemy){
    // this.game.debug.body(enemy);
    // //this.game.debug.bodyInfo(enemy, 0, 30);
    // }, this);
  },
  restart: function() {
    this.game.state.start('Game', true, false, '', 300, '', '', this.maxLives, 0);
  },
  shoot: function() {
    if (this.canShoot) {
      this.isShooting = true;
        if (this.attackTimer < this.game.time.now) {
            this.attackTimer = this.game.time.now + 200;
            var projectile = this.projectilesPool.getFirstExists(false);
            if (!projectile) {
              projectile = this.projectilesPool.create(
                  this.player.body.x + this.player.body.width/2,
                  this.player.body.y + this.player.body.height/2,
                  'poison');
            } else {
              projectile.reset(
                this.player.body.x + this.player.body.width/2,
                this.player.body.y + this.player.body.height/2,
                'poison');
            }

            this.game.physics.arcade.enable(projectile);
            //projectile.checkWorldBounds = true;
            //projectile.outOfBoundsKill = true;
            projectile.anchor.setTo(0.5, 0.5);
            projectile.body.setSize(74, 44, 30, 10);
            projectile.allowGravity = false;
            projectile.body.velocity.x = 2000;
            this.player.play('attacking');
            this.shootSound.play();
            //console.log(this.projectilesPool);
        }
    }
  },
  shootAnimComplete: function(sprite, animation){
    this.isShooting = false;
    this.player.play('running');
  },
  timeToTransport: function (nextLevelTimerDuration) {
    var secondsToNextLevel = parseInt(nextLevelTimerDuration / 1000);
    if ( secondsToNextLevel <= 20 ) {
      this.countdownLabel.visible = true;
      this.countdownLabel.text =  'Time until Transport: ' + secondsToNextLevel;
    }
    
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
  updateLayers: function(cameraX) {
    this.foreGround.tilePosition.x = -cameraX * 0.8;
    this.middleGround.tilePosition.x = -cameraX * 0.5;
    this.backGround.tilePosition.x = -cameraX * 0.25;
  }
}