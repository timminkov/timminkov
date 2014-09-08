(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'homebreaker');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  game.state.add('win', require('./states/win'));
  

  game.state.start('boot');
};
},{"./states/boot":2,"./states/gameover":3,"./states/menu":4,"./states/play":5,"./states/preload":6,"./states/win":7}],2:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],3:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX/2,100, 'Game Over!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX/2, 200, 'You lose!', { font: '32px Arial', fill: '#ffffff', align: 'center'});
    this.congratsText.anchor.setTo(0.5, 0.5);

  },
  update: function () {
  }
};
module.exports = GameOver;

},{}],4:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.sprite = this.game.add.sprite(this.game.world.centerX, 138, 'yeoman');
    this.sprite.anchor.setTo(0.5, 0.5);

    this.titleText = this.game.add.text(this.game.world.centerX, 300, '\'Allo, \'Allo!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.instructionsText = this.game.add.text(this.game.world.centerX, 400, 'Click anywhere to play "Click The Yeoman Logo"', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionsText.anchor.setTo(0.5, 0.5);

    this.sprite.angle = -20;
    this.game.add.tween(this.sprite).to({angle: 20}, 1000, Phaser.Easing.Linear.NONE, true, 0, 1000, true);
  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};

module.exports = Menu;

},{}],5:[function(require,module,exports){

  'use strict';
  function Play() {}
  Play.prototype = {
    create: function() {

      this.cursors = this.input.keyboard.createCursorKeys();
      this.flashlightKey = this.input.keyboard.addKey(Phaser.Keyboard.F);
      this.flashlightKey.onDown.add(function() {
        if (this.flashlight === true) {
          this.flashlight = false;
        } else {
          this.flashlight = true;
        }
      }, this);
      this.wasd = {
        up: this.input.keyboard.addKey(Phaser.Keyboard.W),
        down: this.input.keyboard.addKey(Phaser.Keyboard.S),
        left: this.input.keyboard.addKey(Phaser.Keyboard.A),
        right: this.input.keyboard.addKey(Phaser.Keyboard.D),
      };

      this.map = this.game.add.tilemap('map');
      this.map.addTilesetImage('tileset-standard', 'tileset');
      var backgroundLayer = this.map.createLayer('Background');
      backgroundLayer.resizeWorld();
      var roadLayer = this.map.createLayer('Road');
      roadLayer.resizeWorld();
      this.wallLayer = this.map.createLayer('Walls');
      this.map.setCollision(53, true, this.wallLayer);
      this.map.setCollision(52, true, this.wallLayer);
      this.map.setCollision(51, true, this.wallLayer);
      this.map.setCollision(41, true, this.wallLayer);
      this.map.setCollision(42, true, this.wallLayer);
      this.map.setCollision(43, true, this.wallLayer);
      this.map.setCollision(33, true, this.wallLayer);
      this.map.setCollision(32, true, this.wallLayer);

      this.surpriseLayer = this.map.createLayer('Surprise');
      this.map.setCollision(85, true, this.surpriseLayer);
      this.surpriseLayer.visible = false;

      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      //this.player = this.game.add.sprite(800, 2300, 'player');
      this.player = this.game.add.sprite(275, 3050, 'player');
      this.player.animations.add('run');
      this.player.inputEnabled = true;
      this.player.anchor.setTo(0.5, 0.5);

      this.createPartyMembers();
      this.createCoins();

      this.LIGHT_RADIUS = 100;
      this.shadowTexture = this.game.add.bitmapData(1600, 3200);
      var lightSprite = this.game.add.image(0, 0, this.shadowTexture);
      lightSprite.blendMode = Phaser.blendModes.MULTIPLY;

      this.game.physics.arcade.enable(this.player);
      this.player.body.collideWorldBounds = true;

      this.game.camera.follow(this.player);

      if (this.flashlightKey.isDown) {
        this.text.text = 'pressing f';
        if (this.flashlight === true) {
          this.flashlight = false;
        } else {
          this.flashlight = true;
        }
      }

      var style = { font: "90px Arial", fill: "#ff0044", align: "center" };
      this.text = this.add.text(150, 200, "", style);
      this.text.fixedToCamera = true;
    },

    totalCoins: 0,

    update: function() {
      this.game.physics.arcade.collide(this.player, this.wallLayer);
      if (this.game.physics.arcade.overlap(this.player, this.surpriseLayer)) {
        this.map.setCollision(85, false, this.surpriseLayer);
        this.gameOver();
      }

      //this.text.text = this.game.input.activePointer.worldX + ' ' + this.game.input.activePointer.worldY;
      this.player.body.velocity.y = 0;
      this.player.body.velocity.x = 0;

      if (!this.gameIsOver) {

        if (this.cursors.up.isDown || this.wasd.up.isDown) {
          this.player.body.velocity.y = -150;
        }

        if (this.cursors.left.isDown || this.wasd.left.isDown) {
          this.player.body.velocity.x = -150;
        }

        if (this.cursors.right.isDown || this.wasd.right.isDown) {
          this.player.body.velocity.x = 150;
        }

        if (this.cursors.down.isDown || this.wasd.down.isDown) {
          this.player.body.velocity.y = 150;
        }

      }

      if (this.player.body.velocity.y > 0 ||
            this.player.body.velocity.x > 0 ||
            this.player.body.velocity.x < 0 ||
            this.player.body.velocity.y < 0) {
        this.player.animations.play('run', 15, false);
      }

      if (this.checkOverlap(this.player, this.coin)) {
        this.text.text = "You got it!";
        this.gameIsOver = true;
        this.game.time.events.add(Phaser.Timer.SECOND * 3, function() {
          this.game.state.start('win');
        }, this);
      }

      this.updateShadowTexture();

      this.player.angle = this.getAngleForSprite() + 90;
    },

    checkOverlap: function(spriteA, spriteB) {
      var boundsA = spriteA.getBounds();
      var boundsB = spriteB.getBounds();

      return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    gameOver: function() {
      this.gameIsOver = true;
      this.text.text = 'SURPRISE!';
      this.game.time.events.add(Phaser.Timer.SECOND * 3, this.gameOverState, this);
    },

    gameOverState: function() {
      this.game.state.start('gameover');
    },

    gameIsOver: false,

    createCoins: function() {
      this.coin = this.game.add.sprite(720, 1800, 'goldCoin');
    },

    createPartyMembers: function() {
      var sprite = this.game.add.sprite(1400, 1800, 'partyman');
      sprite.anchor.setTo(0.5, 0.5);
      sprite.angle = this.getAngleToDoor(sprite);

      var sprite = this.game.add.sprite(1150, 1900, 'partyman');
      sprite.anchor.setTo(0.5, 0.5);
      sprite.angle = this.getAngleToDoor(sprite);

      var sprite = this.game.add.sprite(1250, 2000, 'partyman');
      sprite.anchor.setTo(0.5, 0.5);
      sprite.angle = this.getAngleToDoor(sprite);

      var sprite = this.game.add.sprite(1300, 2150, 'partyman');
      sprite.anchor.setTo(0.5, 0.5);
      sprite.angle = this.getAngleToDoor(sprite);

      var sprite = this.game.add.sprite(1200, 2100, 'partyman');
      sprite.anchor.setTo(0.5, 0.5);
      sprite.angle = this.getAngleToDoor(sprite);

      var sprite = this.game.add.sprite(1100, 2200, 'partyman');
      sprite.anchor.setTo(0.5, 0.5);
      sprite.angle = this.getAngleToDoor(sprite);

      var sprite = this.game.add.sprite(1000, 1950, 'partyman');
      sprite.anchor.setTo(0.5, 0.5);
      sprite.angle = this.getAngleToDoor(sprite);
    },

    getAngleToDoor: function(sprite) {
      var dx = sprite.x - 896;
      var dy = sprite.y - 2250;

      return ((Math.atan2(dy, dx) * (180/Math.PI)) - 90);
    },

    getAngleForSprite: function() {
      var dx = this.game.input.activePointer.worldX - this.player.x;
      var dy = this.game.input.activePointer.worldY - this.player.y;

      return (Math.atan2(dy, dx) * (180/Math.PI));
    },

    flashlight: false,

    updateShadowTexture: function() {
      // Draw shadow
      this.shadowTexture.context.fillStyle = 'rgb(100, 100, 100)';
      this.shadowTexture.context.fillRect(0, 0, 1600, 3200);

      this.shadowTexture.context.fillStyle = 'rgb(0, 0, 0)';
      //left side
      this.shadowTexture.context.fillRect(240, 1104, 576, 1148);
      //right side
      this.shadowTexture.context.fillRect(816, 1104, 320, 512);
      //living room
      if (this.gameIsOver) {
        this.shadowTexture.context.fillStyle = 'rgb(255, 255, 255)';
        this.shadowTexture.context.fillRect(816, 1616, 700, 636);
      } else {
        this.shadowTexture.context.fillRect(816, 1616, 700, 636);
      }


      if (this.flashlight) {
        // Draw flashlight
        this.shadowTexture.context.beginPath();
        this.shadowTexture.context.fillStyle = 'rgb(255, 255, 255)';
        this.shadowTexture.context.strokeStyle = 'rgb(255, 255, 255)';
        this.shadowTexture.context.lineWidth = 50;
        //this.shadowTexture.context.moveTo(this.game.input.activePointer.x - 20, this.game.input.activePointer.y);
        //this.shadowTexture.context.lineTo(this.game.input.activePointer.x + 20, this.game.input.activePointer.y);
        //this.shadowTexture.context.lineTo(this.player.x + 20, this.player.y);
        //this.shadowTexture.context.lineTo(this.player.x - 20, this.player.y);
        this.shadowTexture.context.moveTo(this.player.x, this.player.y);
        this.shadowTexture.context.lineTo(this.game.input.activePointer.worldX, this.game.input.activePointer.worldY);
        //this.shadowTexture.context.lineTo(this.player.x + 1000 * Math.cos(this.getAngleForSprite() / 100), this.player.y + 500 * Math.sin(this.getAngleForSprite() / 100));
        //this.shadowTexture.context.lineTo(this.player.x + 1000 * Math.cos(this.getAngleForSprite() / 100), this.player.y + 500 * Math.sin(this.getAngleForSprite() / 100));

        //this.shadowTexture.context.fill();
        this.shadowTexture.context.stroke();
      }

      // This just tells the engine it should update the texture cache
      this.shadowTexture.dirty = true;
    }
  };

  module.exports = Play;

},{}],6:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.atlasJSONHash('player', 'assets/bandit-move.png', 'assets/bandit-move.json');
    this.load.image('partyman', 'assets/partyman.png');
    this.load.image('goldCoin', 'assets/goldCoin.png');

    this.load.tilemap('map', 'assets/map.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.image('tileset', 'assets/tileset.png');

    //this.load.image('yeoman', 'assets/yeoman-logo.png', 5, 5);

  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}],7:[function(require,module,exports){

'use strict';
function Win() {}

Win.prototype = {
  preload: function () {

  },
  create: function () {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX/2,100, 'Game Over!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX/2, 200, 'You Win!', { font: '32px Arial', fill: '#ffffff', align: 'center'});
    this.congratsText.anchor.setTo(0.5, 0.5);

  },
  update: function () {
  }
};
module.exports = Win;

},{}]},{},[1])