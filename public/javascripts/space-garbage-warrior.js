(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'spacegarbagewarrior2988');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('intro', require('./states/intro'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));


  game.state.start('boot');
};
},{"./states/boot":8,"./states/gameover":9,"./states/intro":10,"./states/menu":11,"./states/play":12,"./states/preload":13}],2:[function(require,module,exports){
function BlackHole(game) {
  this.game = game;
  this.sprite = null;
}

BlackHole.prototype = {
  preload: function() {
    // this.game.load.spritesheet('blackhole', 'assets/blackhole.png', 64, 64, 4);
  },

  create: function() {
    this.sprite = this.game.add.sprite(this.game.input.activePointer.worldX, this.game.input.activePointer.worldY, 'blackhole');
    this.sprite.scale.setTo(0.2);

    this.sprite.animations.add('pulse');
    this.sprite.animations.play('pulse', 12, true);

    this.game.physics.p2.enable(this.sprite);

    this.sprite.body.setCircle(32, 0, 0, 0);

    this.sprite.object = this;
    this.timeCreated = this.game.time.now;
    this.game.time.events.add(6000, this.collapse, this);

    this.fireSound = this.game.add.audio('blackhole');
    this.fireSound.play();

    return this.sprite;
  },

  update: function() {
    if (this.sprite.scale.x < 2) {
      this.sprite.scale.x += 0.02;
      this.sprite.scale.y += 0.02;
    }

    this.sprite.body.velocity.y = 0;
    this.sprite.body.velocity.x = 0;
    this.sprite.body.reset(this.sprite.x, this.sprite.y);


    if ((this.game.time.elapsedSecondsSince(this.timeCreated)) > 5) {
      this.sprite.scale.x -= 0.05;
      this.sprite.scale.y -= 0.05;
    }
  },

  collapse: function() {
    this.fireSound.stop();
    this.sprite.kill();
    this.sprite.destroy();
  },
};

module.exports = BlackHole;

},{}],3:[function(require,module,exports){
var Shop = require('../objects/shop.js');

function Hud(game, player) {
  this.game = game;
  this.sprite = null;
  this.player = player;
  this.shopButtonExists = false;
}

Hud.prototype = {
  preload: function() {
    this.game.load.image('power', '../assets/power_bar_battery.png');
  },

  create: function() {
    this.power = this.game.add.sprite(-110, 270, 'power');

    this.cropPower = new Phaser.Rectangle(0, 0, this.power.width, 320);
    this.power.crop(this.cropPower);
    this.powerSize = 320;

    var style = { font: "65px arcade-classic", fill: "#ff0044", align: "center" };
    this.coins = this.game.add.text(100, 540, "0", style);

    var style2 = { font: "40px arcade-classic", fill: "#790091", align: "center" };
    this.powerText = this.game.add.text(34, 540, "P   O   W   E   R", style2);
    this.powerText.angle = 270;

    return this;
  },

  update: function() {
    this.power.y = 600 - this.powerSize;
    this.cropPower.setTo(0, 0, this.power.width, this.powerSize);
    this.powerSize = this.player.power * 3.2;
    this.coins.text = this.player.cash;
  },

  createShopButton: function() {
    if (this.shopButtonExists === false) {
      this.shopButtonExists = true;
      this.shopButton = this.game.add.button(200, 500, 'green-button', this.openShop, this, 0, 1, 2, 1);
      this.shopButton.scale.setTo(2, 2);

      var style = { font: "32px arcade-classic", fill: "#000000", align: "center" };
      this.shopText = this.game.add.text(230, 540, "SHOP", style);
    }
  },

  openShop: function() {
    this.shopButton.destroy();
    this.shopText.destroy();
    this.shopButtonExists = false;

    if (this.player.shopping === false) {
      new Shop(this.game, this.player).create();
    }
  }
};

module.exports = Hud;

},{"../objects/shop.js":5}],4:[function(require,module,exports){
function Player(game) {
  this.game = game;
  this.sprite = null;
  this.power = 100;
  this.cash = 0;
  this.reloadSpeed = 2;
  this.hasReloadUpgrade = false;
  this.shopping = false;
}

Player.prototype = {
  preload: function() {
    this.game.load.spritesheet('crosshair', '../assets/crosshair.png', 32, 32);
  },

  create: function() {
    this.sprite = this.game.add.sprite(this.game.input.activePointer.worldX - 32, this.game.input.activePointer.worldY - 32, 'crosshair');
    this.sprite.animations.add('pulse', [1,2,3], 4, true);

    this.reloadAnimation = this.sprite.animations.add('reload', [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19], this.reloadSpeed, false);
    this.reloadAnimation.onComplete.add(this.pulseLoaded, this);

    this.sprite.animations.play('pulse');

    this.sprite.scale.setTo(2);
    this.object = this;
    this.siren = this.game.add.audio('siren');
    this.siren.volume = 0.5;

    this.game.time.events.loop(Phaser.Timer.SECOND, function() {
     this.power -= 2;
      if (this.power <= 10) {
        if (this.sirenPlaying === false) {
          this.siren.play();
        }
        this.sirenPlaying = true;
      } else  {
        this.siren.stop();
        this.sirenPlaying = false;
      }
    }, this);

    this.reloadSound = this.game.add.audio('reload');
    return this.sprite;
  },

  update: function() {
    this.sprite.x = this.game.input.activePointer.worldX - 32;
    this.sprite.y = this.game.input.activePointer.worldY - 32;
  },

  sirenPlaying: false,

  reload: function() {
    this.sprite.animations.play('reload');
  },

  pulseLoaded: function(sprite, animation) {
    this.reloadSound.play();
    sprite.animations.play('pulse');
  },

  setReloadSpeed: function(speed) {
    this.reloadAnimation.speed = speed;
  },
};

module.exports = Player;

},{}],5:[function(require,module,exports){
function Shop(game, player) {
  this.game = game;
  this.player = player;
  this.sprite = null;
  this.reloadAvailable = player.hasReloadUpgrade;
}

Shop.prototype = {
  preload: function() {

  },

  create: function() {
    this.player.shopping = true;
    this.shopBackground = this.game.add.sprite(this.game.world.centerX, 450, 'shop');
    this.shopBackground.anchor.setTo(0.5, 1);
    this.shopBackground.height = 0;

    var tween = this.game.add.tween(this.shopBackground).to( { height: 300}, 2000, Phaser.Easing.Bounce.Out, false, 0, 0).start();
    tween.onComplete.add(this.createButtonsAndText, this);
  },

  update: function() {

  },

  createButtonsAndText: function() {
    if (this.player.hasReloadUpgrade === false) {
      this.reloadButton = this.game.add.button(226, 330, 'black-button', this.buyReloadUpgrade, this, 0, 1, 2, 1);
      var reloadTextStyle = { font: "20px arcade-classic", fill: "#000000", align: "center" };
      this.reloadText = this.game.add.text(300, 350, "Upgrade reload speed (50)", reloadTextStyle);
    }
    var style = { font: "40px arcade-classic", fill: "#FF0000", align: "center" };
    this.shopTitle = this.game.add.text(350, 160, "S  H  O  P", style);

    this.closeButton = this.game.add.button(340, 355, 'close-button', this.closeShop, this, 1, 0, 2);
    this.closeButton.scale.setTo(2, 2);
  },

  buyReloadUpgrade: function() {
    this.reloadText.destroy();
    this.reloadButton.destroy();
    if (this.player.cash >= 50) {
      this.player.hasReloadUpgrade = true;
      this.player.cash -= 50;
      this.player.setReloadSpeed(4);
      this.button.kill();
    }
  },

  closeShop: function() {
    this.reloadButton.destroy();
    this.shopTitle.destroy();
    this.shopBackground.destroy();
    this.closeButton.destroy();
    this.reloadText.destroy();
    this.player.shopping = false;
  },
};

module.exports = Shop;

},{}],6:[function(require,module,exports){
var Trash = require('../objects/trash.js');

function TrashSpawner(game, player, trashGroup) {
  this.game = game;
  this.sprite = null;
  this.player = player;
  this.trashGroup = trashGroup;
}

TrashSpawner.prototype = {
  SPRITES: [
    'trash-hamburger',
    'trash-pipe',
    'trash-cash'
  ],

  preload: function() {

  },

  create: function() {
    this.x = 850;
    this.y = Math.floor((Math.random() * 600) + 1);
    this.game.time.events.repeat(300, 5, this.createTrash, this);
    this.timeCreated = this.game.time.now;
    this.object = this;

    return this;
  },

  update: function() {
  },

  createTrash: function() {
    var y = Math.floor((Math.random() * 25) + this.y);
    var trash = new Trash(this.game, this.player, this.getRandomTrash()).create(this.x, y);
    this.trashGroup.add(trash);
  },

  getRandomTrash: function() {
    var randomSprite = this.game.rnd.integerInRange(0, this.SPRITES.length - 1);
    return this.SPRITES[randomSprite];
  }
};

module.exports = TrashSpawner;

},{"../objects/trash.js":7}],7:[function(require,module,exports){
function Trash(game, player, trashType) {
  this.game = game;
  this.sprite = null;
  this.pointValue = 10;
  this.cashAmount = 0;
  this.healAmount = 2;
  if (trashType === 'trash-battery') {
    this.healAmount = 20;
  } else if (trashType ==='trash-cash') {
    this.cashAmount = 1;
    this.healAmount = 0;
  }
  this.player = player;
  this.trashType = trashType;
}

Trash.prototype = {
  preload: function() {
    // this.game.load.image('trash', 'assets/battery.png');
  },

  create: function(x, y) {
    var y = Math.floor((Math.random() * 600) + 1)

    this.sprite = this.game.add.sprite(850, y, this.trashType);

    this.game.physics.p2.enable(this.sprite);
    this.sprite.body.collideWorldBounds = false;
    this.sprite.object = this;

    var randomVelocity = (Math.random() * 800) + 100;
    this.sprite.body.velocity.x = -200;

    var rotation = Math.random() * 360;
    this.sprite.body.rotation = rotation;

    return this.sprite;
  },

  update: function() {
  },


  accelerateTo: function(blackhole, speed) {
    if (typeof speed === 'undefined') { speed = 60; }

    var angle = Math.atan2(blackhole.y - this.sprite.y, blackhole.x - this.sprite.x);

    var distance = this.distanceTo(blackhole);
    this.sprite.body.force.x = Math.cos(angle) * (speed / Math.log(Math.pow(distance, (1 / 10))));
    this.sprite.body.force.y = Math.sin(angle) * ((speed / Math.log(Math.pow(distance, (1 / 10)))));
  },

  shrink: function(blackhole) {
    var distance = this.distanceTo(blackhole);

    if (distance < 300) {
      this.sprite.scale.setTo(0.02 * distance/6);
    }
  },

  distanceTo: function(blackhole) {
    var a = blackhole.x - this.sprite.body.x;
    var b = blackhole.y - this.sprite.body.y;
    return Math.sqrt(a*a + b*b);
  }
};

module.exports = Trash;

},{}],8:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', '../assets/preloader.gif');
    this.game.add.text(0, 0, "fix", {font:"1px arcade-classic", fill:"#FFFFFF"});
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],9:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },

  create: function () {
    var style2 = { font: "100px arcade-classic", fill: "#790091", align: "center" };
    this.powerText = this.game.add.text(400, 300, "GAME OVER", style2);
    this.powerText.anchor.setTo(0.5);
  },

  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('intro');
    }
  }
};
module.exports = GameOver;

},{}],10:[function(require,module,exports){
'use strict';
function Intro() {}

Intro.prototype = {
  preload: function () {

  },

  create: function () {
    this.game.load.spritesheet('opening-text', '../assets/opening-text.png', 32, 32);
    this.openingText = this.game.add.sprite(0, 600, 'opening-text');
    this.sound = this.game.add.audio('intro', 1, true);
    this.sound.play();
  },

  update: function () {
    if (this.openingText.y > 7) {
      this.openingText.y -= 0.85;
    }

    if (this.game.input.activePointer.justPressed()) {
      this.sound.stop();
      this.game.state.start('menu');
    }
  }
};
module.exports = Intro;

},{}],11:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },

  create: function() {
    this.starfield = this.game.add.tileSprite(0, 0, 3200, 2400, 'starfield');
    this.starfield2 = this.game.add.tileSprite(-400, 0, 3200, 2400, 'starfield');

    var sprite = this.game.add.sprite(0, 0, 'title');
    sprite.alpha = 0;

    this.game.add.tween(sprite).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 0);
    this.sound = this.game.add.audio('menu');
    this.sound.play();

  },

  update: function() {
    this.starfield.tilePosition.y -= 0.1;
    this.starfield2.tilePosition.y -= 0.15;

    if(this.game.input.activePointer.justPressed()) {
      this.sound.stop();
      this.game.state.start('play');
    }
  }
};

module.exports = Menu;

},{}],12:[function(require,module,exports){
  var BlackHole = require('../objects/black-hole.js');
  var Trash = require('../objects/trash.js');
  var Player = require('../objects/player.js');
  var Hud = require('../objects/hud.js');
  var TrashSpawner = require('../objects/trash-spawner.js');
  var Shop = require('../objects/shop.js');

  'use strict';
  function Play() {}
  Play.prototype = {
    create: function() {
      this.game.physics.startSystem(Phaser.Physics.P2JS);

      this.game.physics.p2.setImpactEvents(true);

      this.timer = this.game.time.create(true);
      this.timer.start();
      this.timer.loop(1000, this.createTrash, this);

      this.game.stage.setBackgroundColor = '#ffffff';
      this.starfield = this.game.add.tileSprite(0, 0, 3200, 2400, 'starfield');
      this.starfield2 = this.game.add.tileSprite(0, -400, 3200, 2400, 'starfield');

      this.blackholeCollisionGroup = this.game.physics.p2.createCollisionGroup();
      this.trashCollisionGroup = this.game.physics.p2.createCollisionGroup();

      this.game.physics.p2.updateBoundsCollisionGroup();

      this.blackholes = this.game.add.group();
      this.blackholes.enableBody = true;
      this.blackholes.physicsBodyType = Phaser.Physics.P2JS;

      this.trash = this.game.add.group();
      this.trash.enableBody = true;
      this.trash.physicsBodyType = Phaser.Physics.P2JS;

      this.player = new Player(this.game);
      this.player.create();

      this.trashSpawner = this.createTrashSpawner();
      this.timer.loop(5000, this.createTrashSpawner, this);

      this.game.input.onDown.add(this.createBlackHole, this);

      this.hud = new Hud(this.game, this.player).create();

      this.playMusic = this.game.add.audio('play');
      this.playMusic.play();

      this.trashHitSound = this.game.add.audio('trash-hit');
      this.siren = this.game.add.audio('siren');
      this.coinSound = this.game.add.audio('coin');

      this.timer.loop(30000, this.shopAlert, this);
    },

    update: function() {
      if (this.player.power <= 0) {
        this.playMusic.stop();
        this.game.state.start('gameover');
      }
      this.player.sprite.bringToTop();
      this.starfield.tilePosition.x -= 1;
      this.starfield2.tilePosition.x -= 1.5;
      this.trash.forEachAlive(this.moveTrash, this);
      this.trash.forEachAlive(this.shrink, this);
      this.trash.forEach(this.updateTrash, this);
      this.hud.update();

      this.player.update();
      this.trashSpawner.update();

      if (typeof this.blackhole !== 'undefined') { this.blackhole.object.update(); }
    },

    shopAlert: function() {
      var style = { font: "40px arcade-classic", fill: "#FF0000", align: "center" };
      this.powerText = this.game.add.text(400, 300, "SHOP AVAILABLE", style);
      this.powerText.anchor.setTo(0.5);
      this.game.time.events.repeat(500, 11, this.flashShopText, this);

      this.hud.createShopButton();
    },

    flashShopText: function() {
      if (this.powerText.text === " ") {
        this.powerText.text = "SHOP AVAILABLE";
      } else {
        this.powerText.text = " ";
      }
    },

    updateTrash: function(trash) {
      if(trash.x < -18 || trash.y < -30 || trash.y > 630) {
        if (trash.alive) {
          trash.kill();
        }
      }
    },

    damagePlayer: function(trash) {
      this.player.changeHealth(trash.object.damageAmount);
    },

    createTrash: function() {
      var trash = new Trash(this.game, this.player, this.trashSpawner.getRandomTrash()).create();

      trash.body.setCollisionGroup(this.trashCollisionGroup);
      trash.body.collides(this.blackholeCollisionGroup);

      this.trash.add(trash);
    },

    createTrashSpawner: function() {
      return new TrashSpawner(this.game, this.player, this.trash).create();
    },

    shrink: function(trash) {
      if (typeof this.blackhole !== 'undefined' && this.blackhole.alive) {
        trash.object.shrink(this.blackhole);
      }
    },

    moveTrash: function(trash) {
      if (typeof this.blackhole !== 'undefined' && this.blackhole.alive) {
        trash.object.accelerateTo(this.blackhole, 30);
      }
    },

    createBlackHole: function() {
      if (this.player.sprite.animations.currentAnim.name === "reload") {
        return false;
      }

      if (typeof this.blackhole !== 'undefined') {
        this.blackhole.destroy();
      }

      if (this.player.shopping === false) {
        this.blackhole = new BlackHole(this.game).create();

        this.blackhole.body.setCollisionGroup(this.blackholeCollisionGroup);
        this.blackhole.body.collides(this.trashCollisionGroup, this.consumeTrash, this);

        this.blackholes.add(this.blackhole);

        this.player.reload();
      }
    },

    sirenPlaying: false,

    consumeTrash: function(body1, body2) {
      // Possible bug: This seems to get called twice sometimes, so don't want
      // it destroying something that's null.
      if (body2.sprite) {
        if (body2.sprite.object.player.power) {
          body2.sprite.object.player.power += body2.sprite.object.healAmount;
          body2.sprite.object.player.cash += body2.sprite.object.cashAmount;
          console.log(body2.sprite.object.cashAmount);
          if(body2.sprite.object.cashAmount > 0) {
            this.coinSound.volume = 0.2;
            this.coinSound.play();
          }
        } else {
          body2.sprite.object.player.power = 100;
        }

        this.trashHitSound.volume = 0.2;
        this.trashHitSound.play();
        body2.sprite.destroy();
      }
    }
  };

  module.exports = Play;

},{"../objects/black-hole.js":2,"../objects/hud.js":3,"../objects/player.js":4,"../objects/shop.js":5,"../objects/trash-spawner.js":6,"../objects/trash.js":7}],13:[function(require,module,exports){

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

    this.load.spritesheet('blackhole', '../assets/blackhole.png', 64, 64, 4);

    this.load.image('trash-pipe', '../assets/trash/space_pipe.png');
    this.load.image('trash-battery', '../assets/battery.png');
    this.load.image('trash-hamburger', '../assets/trash/hamburger.png');
    this.load.image('trash-cash', '../assets/trash/coin.png');

    this.load.image('opening-text', '../assets/opening-text.png');
    this.game.load.image('starfield', '../assets/space_background-01.png');
    this.game.load.spritesheet('crosshair', '../assets/crosshair.png', 32, 32, 20);
    this.game.load.image('power', '../assets/power_bar_battery.png');
    this.game.load.image('title', '../assets/title.png');

    this.game.load.audio('blackhole', '../assets/sounds/blackhole.ogg');
    this.game.load.audio('play', '../assets/sounds/play.ogg');
    this.game.load.audio('trash-hit', '../assets/sounds/hit3.wav');
    this.game.load.audio('siren', '../assets/sounds/siren.mp3');
    this.game.load.audio('coin', '../assets/sounds/coin.wav');
    this.game.load.audio('reload', '../assets/sounds/reload.wav');
    this.game.load.audio('intro', '../assets/sounds/intro.ogg');
    this.game.load.audio('menu', '../assets/sounds/playmenu2.ogg');


    this.game.load.image('shop', '../assets/shop.png');
    this.game.load.spritesheet('black-button', '../assets/black_button.png', 64, 64);
    this.game.load.spritesheet('close-button', '../assets/closebutton.png', 64, 64);
    this.game.load.spritesheet('green-button', '../assets/green_button.png', 64, 64);
  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('intro');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[1])
