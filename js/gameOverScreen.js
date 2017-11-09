// Tela de título
class GameOverState extends Phaser.State {
    
        create() {
            super.create()

            var txtLabirinto = this.game.add.text(this.game.world.centerX,150,'GAME OVER',{font:'40px emulogic',fill:'#fff'});
            txtLabirinto.anchor.set(.5);
            
            var txtPressStart = this.game.add.text(this.game.world.centerX,250,'PRESS ENTER TO RESTART',{font:'20px emulogic',fill:'#fff'});
                txtPressStart.anchor.set(.5);
            
            this.game.add.tween(txtPressStart).to({alpha:0},1000).to({alpha:1},1000).loop().start();
            
            var txtPoints = this.game.add.text(this.game.world.centerX-100,350, 'PONTOS: ' + score,{font:'20px emulogic',fill:'#fff'});
                txtPoints.anchor.set(.5);
            
            var txtTime = this.game.add.text(this.game.world.centerX+100,350, 'TEMPO: ' + tempo,{font:'20px emulogic',fill:'#fff'});
                txtTime.anchor.set(.5);

            this.game.time.events.add(1000,function(){
                var enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
                    enterKey.onDown.addOnce(this.startGame,this);
            },this);
        }
    
        startGame(){
            score = 0
            tempo = 0
            timeGame = 60
            slowEvent = 0
            slowEnable = 0
            fastEvent = 0
            fastEnable = 0
            hardEnable = 0
            this.game.state.start('Play')
        }
    
    }