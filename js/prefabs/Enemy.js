var SupRun = SupRun || {};

SupRun.Enemy = function (game, x, y, key, velocity, tilemap) {
    Phaser.Sprite.call(this, game, x, y, key);
    this.game = game;
    this.tilemap = tilemap;
    this.anchor.setTo(0.5);
    
    //give it a random speed, if velocity is not a number or none given
    if (isNaN(velocity) || !velocity) {
        //also randomize direction
        velocity = (40 + Math.random() * 20) * (Math.random < 0.5 ? 1: -1);
    }
    
    this.game.physics.arcade.enableBody(this);
    this.body.collideWorldBounds = true;
    //Will change direction once it hits an edge or a wall
    this.body.bounce.set(1, 0);
    this.body.velocity.x = velocity;
};

SupRun.Enemy.prototype = Object.create(Phaser.Sprite.prototype);
SupRun.Enemy.prototype.constructor = SupRun.Enemy;

SupRun.Enemy.prototype.update = function() {
    //make it look in the direction it is moving
    if(this.body.velocity.x > 0) {
        this.scale.setTo(-1,1);
        var direction = 1;
    } else {
        this.scale.setTo(1,1);
        direction = -1;
    }
    
    //view ahead and detect cliffs
    
    // To get the lookahead, can't use this.right and this.left because the values
    // will flip when we flip the sprite
    // So we take the x (which is the anchor in the middle of the body)
    // Add the direction multiplied by half the entire witdth to get to the
    // rightmost or leftmost point and add 1 to look ahead
    // Note: width needs to be absolute as it will become positive or negative
    // when the sprite is flipped
    var nextX = this.x + direction * (Math.abs(this.width) / 2 + 1);
    var nextY = this.bottom + 1;
    
    //getTileWorldXY lets you see where the tiles are on a tilemap
    var nextTile = this.tilemap.getTileWorldXY(
            nextX, nextY, this.tilemap.tileWidth, this.tilemap.tileHeight, 'collisionLayer'
        );
        
    if (!nextTile && this.body.blocked.down) {
        this.body.velocity.x *= -1;
    }
};