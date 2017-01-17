var SupRun = SupRun || {};

SupRun.Platform = function(game, floorPool, numTiles, x, y, speed, coinsPool, enemiesPool) {
  Phaser.Group.call(this, game);
  this.game = game;
  this.floorPool = floorPool;
  this.coinsPool = coinsPool;
  this.enemiesPool = enemiesPool;
  this.tileSize = 96;
  this.enableBody = true;
  this.prepare(numTiles, x, y, speed);
 
};

SupRun.Platform.prototype = Object.create(Phaser.Group.prototype);
SupRun.Platform.prototype.constructor = SupRun.Platform;
//create new method in order to reposition dead sprites as well as new sprites
//speed passed here so that dead sprites can be revived with new speed
SupRun.Platform.prototype.prepare = function(numTiles, x, y, speed){
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
  this.setAll('body.velocity.x', speed);
  
  this.addCoins(speed);
  this.addEnemies(speed);
};

SupRun.Platform.prototype.kill = function(){
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

SupRun.Platform.prototype.addCoins = function(speed) {
  //create coins in relation to tile position
  var coinsY = 90 + Math.random() * 110;
  var hasCoin;
  this.forEach(function(tile){
    //40% chance of a coin
    hasCoin = Math.random() <= 0.4;
    if (hasCoin){
      var coin = this.coinsPool.getFirstExists(false);
      if (!coin){
        coin = new Phaser.Sprite(this.game, tile.x, tile.y - coinsY, 'coin');
        this.coinsPool.add(coin);
      } else {
        coin.reset(tile.x, tile.y - coinsY);
      }
      coin.body.velocity.x = speed;
      coin.body.allowGravity = false;
    }
  }, this);
};
  
  SupRun.Platform.prototype.addEnemies = function(speed) {
  //create coins in relation to tile position
  var enemiesX = 300 + Math.random() * 500;
  this.forEach(function(tile){
    //5% chance of an enemy on a tile
    hasEnemy = Math.random() <= 0.1;
    if (hasEnemy){
      var enemy = this.enemiesPool.getFirstExists(false);
      if (!enemy){
        //enemy = new Phaser.Sprite(this.game, 600, tile.y, 'people', 'barbarian_1_attack_001.png');
        enemy = this.game.add.sprite(tile.x + enemiesX, 300, 'people', 'barbarian_1_attack_001.png');
        enemy.animations.add('attacking', Phaser.Animation.generateFrameNames('barbarian_1_attack_', 1, 3, '.png', 3), 10, false, false);
        enemy.animations.add('walking', Phaser.Animation.generateFrameNames('barbarian_1_walk_', 1, 5, '.png', 3), 10, true, false)
        this.enemiesPool.add(enemy);
        
        //walk
        enemy.play('walking');
      } else {
        enemy.reset(tile.x + enemiesX, 300);
        enemy.play('walking');
      }
      enemy.body.setSize(56, 90, 85, 62);
      enemy.scale.setTo(-1, 1);
      enemy.body.velocity.x = speed;
      //enemy.body.allowGravity = false;
      enemy.body.gravity.x = 10;
      enemy.body.gravity.y = 100;
      console.log(this.enemiesPool);
      
    }
  }, this);
};