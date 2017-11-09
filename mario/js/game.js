'use strict'

var player
var cursors
var background
var collections
var slower
var faster
var enemy
var enemy3
var respawTime = 5
var textScore
var textTime
var score = 0
var tempo = 0
var timeGame = 60
var slowEvent = 0
var slowEnable = 0
var fastEvent = 0
var fastEnable = 0
var hardEnable = 0

class Game extends Phaser.Game {
    constructor() {
        super(800, 600, Phaser.CANVAS, 'game-container', null, false, true)
        this.state.add('Play', PlayState, false)
        this.state.add('Title', TitleState, false)
        this.state.add('GameOver', GameOverState, false)
        this.state.start('Title')
    }
}

class PlayState extends Phaser.State {

	preload() {
        this.game.load.image('background', 'assets/bg2.png')
        this.game.load.image('collection','assets/collection.png')
        this.game.load.image('slower', 'assets/slow.png')
        this.game.load.spritesheet('player', 'assets/player.png', 22, 28)
        this.game.load.spritesheet('faster', 'assets/faster.png', 33, 24)
        this.game.load.spritesheet('enemy','assets/enemy.png', 32, 32)
        this.game.load.spritesheet('enemy3','assets/enemy3.png', 27, 20)
	}

	create() {
		super.create()

        this.game.physics.startSystem(Phaser.Physics.ARCADE)
        
        background = this.game.add.sprite(0, 0, 'background')
        background.scale.x = this.game.width/background.width
        background.scale.y = this.game.height/background.height
    
        //player
        player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'player')
        this.game.physics.enable(player, Phaser.Physics.ARCADE)
        player.scale.setTo(1.5,1.5)
        player.anchor.setTo(0.5,0.5)
        player.animations.add('idleP', [0,1,2], 5, true)
        player.animations.play('idleP')
    
        //enemy 
        enemy = this.game.add.group()
        enemy.enableBody = true
        enemy.physicsBodyType = Phaser.Physics.ARCADE
        enemy.createMultiple(10, 'enemy')
        enemy.setAll('anchor.x', 0.5)
        enemy.setAll('anchor.y', 0.5)
        enemy.setAll('scale.x', 1.5)
        enemy.setAll('scale.y', 1.5)
        enemy.setAll('angle', 180)

        collections = this.game.add.sprite(this.game.rnd.integerInRange(10,790), this.game.rnd.integerInRange(10,590), 'collection')
        collections.anchor.setTo(0.5, 0.5)
        collections.scale.setTo(.1, .1)
        this.game.physics.enable(collections, Phaser.Physics.ARCADE)

        slower = this.game.add.sprite(1000, 1000,'slower')
        slower.anchor.setTo(0.5, 0.5)
        this.game.physics.enable(slower, Phaser.Physics.ARCADE)

        faster = this.game.add.sprite(1000, 1000, 'faster')
        this.game.physics.enable(faster, Phaser.Physics.ARCADE)
        faster.animations.add('idle',[0,1],12,true)
        faster.animations.play('idle')
    
        textScore = this.game.add.text(this.game.width*1/9, 50, 'PONTOS: 0', { font: "bold 24px Arial", fill: "#ffffff", align: "left" })
        textScore.anchor.setTo(0.5, 0.5)
        textTime = this.game.add.text(this.game.width*1/9, 80, 'TEMPO: 60', { font: "bold 24px Arial", fill: "#ffffff", align: "left" })
        textTime.anchor.setTo(0.5, 0.5)
        this.game.time.events.loop(Phaser.Timer.SECOND, this.updateCounter, this)
    
        this.game.time.events.add(1000, this.respawEnimies, this)
        this.game.time.events.add(5000, this.respawCollections, this)
	}

	createMap() {
		this.map = this.game.add.tilemap('level1')
        this.map.addTilesetImage('tiles')
        this.map.addTilesetImage('objects')
        this.map.addTilesetImage('checkpoint')

        this.mapLayer = this.map.createLayer('Tile Layer')

        this.map.setCollisionBetween(1, 13, true, 'Tile Layer')
        this.map.setCollisionBetween(16, 18, true, 'Tile Layer')
        this.map.setCollisionBetween(237, 239, true, 'Tile Layer')
        this.map.setCollisionBetween(269, 271, true, 'Tile Layer')
        this.map.setCollisionBetween(301, 303, true, 'Tile Layer')

        this.mapLayer.resizeWorld()

        this.trapsLayer = this.map.createLayer('Trap Layer')
        this.map.setCollision([14], true, 'Trap Layer')
        this.map.setCollision([19], true, 'Trap Layer')
	}

	update() {
        //  only move when you click
        if (this.game.input.mousePointer.isDown){
            if(slowEvent == 1){
                this.game.physics.arcade.moveToPointer(player, 100)
                if (Phaser.Rectangle.contains(player.body, this.game.input.x, this.game.input.y)){
                    player.body.velocity.setTo(0, 0)
                }   
            } else if (fastEvent == 1) {
                this.game.physics.arcade.moveToPointer(player, 600)
                if (Phaser.Rectangle.contains(player.body, this.game.input.x, this.game.input.y)){
                    player.body.velocity.setTo(0, 0)
                }
            } else {
                this.game.physics.arcade.moveToPointer(player, 400)
                //  if it's overlapping the mouse, don't move any more
                if (Phaser.Rectangle.contains(player.body, this.game.input.x, this.game.input.y)){
                    player.body.velocity.setTo(0, 0)
                }
            }
            if(player.body.velocity.x > 0){
                player.scale.setTo(1.5, 1.5)
            } else if (player.body.velocity.x < 0){
                player.scale.setTo(-1.5, 1.5)
            }
        } else {
            player.body.velocity.setTo(0, 0)
        }

        this.game.physics.arcade.overlap(player, enemy, this.destroyPlayer, null, this)
        this.game.physics.arcade.overlap(player, enemy3, this.destroyPlayer, null, this)
        this.game.physics.arcade.overlap(player, slower, this.slowerEvent, null, this)
        this.game.physics.arcade.overlap(player, faster, this.fasterEvent, null, this)
        this.game.physics.arcade.overlap(player, collections, this.getCollections, null, this)
	}

    respawEnimies(){
        var respaw = enemy.getFirstExists(false)
        if (respaw) {
            var dir = this.game.rnd.integerInRange(1, 2)
            if( dir == 1) {
                respaw.reset(this.game.rnd.integerInRange(0, this.game.width), 0)
                respaw.body.velocity.x = this.game.rnd.integerInRange(-300, 300)
                respaw.body.velocity.y = 300
                respaw.body.drag.x = 100
                respaw.update = function(){
                    respaw.angle = 180 - this.game.math.radToDeg(Math.atan2(respaw.body.velocity.x, respaw.body.velocity.y))
                    if (respaw.y > this.game.height + 200) {
                        respaw.kill()
                        respaw.y = -20
                    }
                }
            } else {
                respaw.reset(this.game.rnd.integerInRange(0, this.game.width), this.game.height)
                respaw.body.velocity.x = this.game.rnd.integerInRange(-300, 300)
                respaw.body.velocity.y = -300
                respaw.body.drag.x = 100
                respaw.update = function(){
                    respaw.angle = 180 - this.game.math.radToDeg(Math.atan2(respaw.body.velocity.x, respaw.body.velocity.y))
                    if (respaw.y < -200) {
                        respaw.kill()
                    }
                }
            }  
        }
        this.game.time.events.add(this.game.rnd.integerInRange(respawTime, respawTime + 1000), this.respawEnimies, this)
    }

    respawEnimies2(){
        var respaw = enemy.getFirstExists(false)
        if (respaw) {
            var dir = this.game.rnd.integerInRange(1, 2)
            console.log('Liberando', dir)
            if (dir == 1) {
                respaw.reset(0, this.game.rnd.integerInRange(0, this.game.height))
                //x positivo vai pra direita
                respaw.body.velocity.x = 300
                respaw.body.velocity.y = this.game.rnd.integerInRange(-300, 300)
                respaw.body.drag.y = 100
                respaw.update = function(){
                    respaw.angle = 180 - this.game.math.radToDeg(Math.atan2(respaw.body.velocity.x, respaw.body.velocity.y))
                    if (respaw.x > this.game.width + 200) {
                        respaw.kill()
                    }
                }
            } else {
                respaw.reset(this.game.width, this.game.rnd.integerInRange(0, this.game.height))
                respaw.body.velocity.x = -300
                respaw.body.velocity.y = this.game.rnd.integerInRange(-300, 300)
                respaw.body.drag.y = 100
                respaw.update = function(){
                    respaw.angle = 180 - this.game.math.radToDeg(Math.atan2(respaw.body.velocity.x, respaw.body.velocity.y))
                    if (respaw.x < -200) {
                        respaw.kill()
                    }
                }
            }
        }
    }

    respawCollections(){
        collections.kill()
        collections = this.game.add.sprite(this.game.rnd.integerInRange(10,790), this.game.rnd.integerInRange(10,590), 'collection')
        collections.anchor.setTo(0.5, 0.5)
        collections.scale.setTo(.1, .1)
        this.game.physics.enable(collections, Phaser.Physics.ARCADE)
        this.game.time.events.add(5000, this.respawCollections, this)
    }

    respawSlower(){
        console.log("Slower Liberado")
        slower.kill()
        slower = this.game.add.sprite(this.game.rnd.integerInRange(10,790), this.game.rnd.integerInRange(10,590), 'slower')
        slower.anchor.setTo(0.5, 0.5)
        slower.scale.setTo(1.5, 1.5)
        this.game.physics.enable(slower, Phaser.Physics.ARCADE)
        this.game.time.events.add(5000, this.respawSlower, this)
    }

    respawFaster(){
        console.log("Faster Liberado")
        faster.kill()
        faster = this.game.add.sprite(this.game.rnd.integerInRange(10,790), this.game.rnd.integerInRange(10,590), 'faster')
        faster.anchor.setTo(0.5, 0.5)
        faster.scale.setTo(1.5, 1.5)
        this.game.physics.enable(faster, Phaser.Physics.ARCADE)
        faster.animations.add('idle', [0,1], 12, true)
        faster.animations.play('idle')
        this.game.time.events.add(5000, this.respawFaster, this)
    }

    updateCounter() {
        timeGame--
        tempo++
        textTime.setText('TEMPO: ' + timeGame)

        if(timeGame < 1){
            player.kill()
            this.game.state.start('GameOver')            
        }

        if(tempo > 40){
            if(fastEnable == 0){
                fastEnable = 1
                this.game.time.events.add(1000, this.respawFaster, this)
            }
        }
        if(tempo > 50){
            if(tempo%5 == 0){
                this.tweenEnemy()
            }
        }
        if(tempo > 60){
            if(hardEnable == 0){
                hardEnable = 1
                this.loopHard()
            }
        }
    }

    loopHard(){
        //this.game.time.events.add(1000, this.respawEnimies2, this)
    }

    tweenEnemy(){
        console.log('Tween liberado')
        var auxY = this.game.rnd.integerInRange(0,600)
        enemy3 = this.game.add.sprite(-5, auxY, 'enemy3')
        this.game.physics.enable(enemy3, Phaser.Physics.ARCADE)
        enemy3.scale.setTo(1.5,1.5)
        enemy3.animations.add('idleE', [0,1,2,3], 5, true)
        enemy3.animations.play('idleE')
        this.game.add.tween(enemy3.body)
            .to( { x: 800, y: auxY}, 2000)
            .start()
    }
    
    destroyPlayer(player,enemy){
        enemy.kill()
        player.kill()
        this.game.state.start('GameOver')
    }
    
    getCollections(){
        slowEvent = 0
        fastEvent = 0
        collections.kill()
        score++
        timeGame += 5
        textScore.setText('PONTOS: ' + score)
        textTime.setText('TEMPO: ' + timeGame)
        if(score > 5){
            if(slowEnable == 0){
                slowEnable = 1
                this.game.time.events.add(1000, this.respawSlower, this)
            }
        }
    }

    slowerEvent(){
        slower.kill()
        slowEvent = 1;
        if(fastEvent == 1)
            fastEvent = 0
    }

    fasterEvent(){
        faster.kill()
        fastEvent = 1;
        if(slowEvent == 1)
            slowEvent = 0
    }
}

const GAME = new Game()