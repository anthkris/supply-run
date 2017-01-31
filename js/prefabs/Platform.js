var SupRun = SupRun || {};

SupRun.Platform = function(game, floorPool, numTiles, x, y, speed, coinsPool, enemiesPool, lifePool, enemySprite, player, firstPlatform) {
  Phaser.Group.call(this, game);
  this.game = game;
  this.floorPool = floorPool;
  this.coinsPool = coinsPool;
  this.lifePool = lifePool;
  this.enemiesPool = enemiesPool;
  this.enemySprite = enemySprite;
  this.player = player;
  this.tileSize = 96;
  this.enableBody = true;
  this.speed = speed;
  this.firstPlatform = firstPlatform;
  this.prepare(numTiles, x, y, speed, player);
};

SupRun.Platform.prototype = Object.create(Phaser.Group.prototype);
SupRun.Platform.prototype.constructor = SupRun.Platform;
//create new method in order to reposition dead sprites as well as new sprites
//speed passed here so that dead sprites can be revived with new speed
SupRun.Platform.prototype.prepare = function(numTiles, x, y, speed, player) {
  this.alive = true;
  
  var i = 0;
  while(i < numTiles){
    
    var floorTile = this.floorPool.getFirstExists(false);
    if (!floorTile){
      floorTile = new Phaser.Sprite(this.game, x + i * this.tileSize, y, 'floor');
    } else {
      floorTile.reset(x + i * this.tileSize, y);
    }
    this.add(floorTile);
    
    i++;
  }
  //set physics properties
  this.setAll('body.immovable', true);
  this.setAll('body.allowGravity', false);
  
  this.addCoins();
  this.addEnemies(speed, this.player);
  this.addLifeUps();
  
};

SupRun.Platform.prototype.update = function() {
  //Check distance of player from enemy
  this.enemiesPool.forEachAlive(function(enemy) {
    if (enemy.x <= this.player.x + 700 && !enemy.checked) {
      this.enemyMove(enemy, enemy.checked, this.speed);
    }
  }, this);
}

SupRun.Platform.prototype.kill = function() {
  this.alive = false;
  //call the kill method on each individual sprite in the group
  this.callAll('kill');
  var sprites = [];
  
  //send each sprite back to floorPool
  //using sprites array as an intermediary to prevent issue with modifying group while iterating through it.
  this.forEach(function(tile){
    sprites.push(tile);
  });
  
  sprites.forEach(function(tile){
     this.floorPool.add(tile);          
  }, this);
};

SupRun.Platform.prototype.addCoins = function() {
  //create coins in relation to tile position
  var coinsY = 90 + Math.random() * 110;
  var hasCoin;
  this.forEach(function(tile){
    //40% chance of a coin
    hasCoin = Math.random() <= 0.4;
    if (hasCoin){
      var coin = this.coinsPool.getFirstExists(false);
      if (!coin){
        coin = new Phaser.Sprite(this.game, tile.x, tile.y - coinsY, 'coin', 'coin_001.png');
        coin.animations.add('turning', Phaser.Animation.generateFrameNames('coin_', 1, 4, '.png', 3), 10, true, false);
        this.coinsPool.add(coin);
      } else {
        coin.reset(tile.x, tile.y - coinsY);
      }
      coin.body.allowGravity = false;
      //coin.anchor.setTo(0.5);
      coin.body.setSize(56, 56, 20, 20);
      coin.play('turning');
    }
  }, this);
};
  
SupRun.Platform.prototype.addEnemies = function(speed, player) {
  //create enemies in relation to tile position
  
  this.player = player;
  var enemiesX = Math.floor(Math.random() * (700 - 200 + 1)) + 200;
  var coinFlip = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
  if (!this.firstPlatform) {
    this.forEach(function(tile) {
      //40% chance of an enemy on a tile
      hasEnemy = Math.random() <= 0.4;
      
      if (hasEnemy) {
        var enemy = this.enemiesPool.getFirstExists(false);
        
        if (!enemy) {
          enemy = this.game.add.sprite(tile.x + enemiesX, 400, 'people', this.enemySprite + 'attack_001.png');
          enemy.checked = false;
          var enemyAttackAnim = enemy.animations.add('attacking', Phaser.Animation.generateFrameNames(this.enemySprite + 'attack_', 1, 3, '.png', 3), 10, false, false);
          enemy.animations.add('walking', Phaser.Animation.generateFrameNames(this.enemySprite + 'walk_', 1, 5, '.png', 3), 15, true, false);
          this.enemiesPool.add(enemy);
          enemyAttackAnim.onComplete.add(function(sprite, animation){
            sprite.frameName = this.enemySprite + "walk_001.png";
          }, this);
          enemy.frameName = this.enemySprite + "walk_001.png";
          enemy.body.velocity.x = 0;
          enemy.scale.setTo(-1, 1);
        } else {
          enemy.reset(tile.x + enemiesX, 400);
          enemy.checked = false;
          enemy.animations.stop();
          enemy.frameName = this.enemySprite + "walk_001.png";
        }
        enemy.direction = coinFlip === 0 ? 1 : -1;
        enemy.body.setSize(56, 90, 85, 62);
        enemy.anchor.setTo(0.5);
        enemy.body.gravity.y = 5000;
      }
    }, this);
  }
};

SupRun.Platform.prototype.enemyMove = function(enemy, checked, speed) {
  if (!checked) {
    var coinFlip = Math.floor(Math.random() * (1 - 0 + 1)) + 0; 
    //Choose whether or not enemy should move, and if so, in what direction
    if (coinFlip === 0) {
      if (enemy.direction === 1) {
        //console.log('walking left');
        enemy.scale.setTo(-1, 1);
        enemy.body.velocity.x = speed;
        enemy.play('walking');
      } else {
        //console.log('walking right');
        enemy.scale.setTo(1, 1);
        enemy.body.velocity.x = -speed;
        enemy.play('walking');
      }
      
    } else {
      enemy.animations.stop();
      enemy.frameName = this.enemySprite + "walk_001.png";
    }
    enemy.checked = true;
  }
};

SupRun.Platform.prototype.addLifeUps = function() {
  //create coins in relation to tile position
  var lifeUpY = 90 + Math.random() * 110;
  var hasLifeUp;
  this.forEach(function(tile) {
    //1% chance of a coin
    hasLifeUp = Math.random() <= 0.01;
    if (hasLifeUp) {
      var lifeUp = this.lifePool.getFirstExists(false);
      if (!lifeUp) {
        lifeUp = new Phaser.Sprite(this.game, tile.x, tile.y - lifeUpY, 'lives', 'life.png');
        this.lifePool.add(lifeUp);
        
      } else {
        lifeUp.reset(tile.x, tile.y - lifeUpY);
      }
      lifeUp.body.allowGravity = false;
      lifeUp.body.setSize(60, 56, 0, 0);
    }
  }, this);
};
  
