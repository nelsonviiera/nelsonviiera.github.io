// Tela de título
class TitleState extends Phaser.State {

    create() {
        super.create()

        var txtLabirinto = this.game.add.text(this.game.world.centerX,150,'MARIO ESCAPE',{font:'40px emulogic',fill:'#fff'});
        txtLabirinto.anchor.set(.5);

        var txtFullScreen = this.game.add.text(this.game.world.centerX,250,'PRESS 1 TO FULLSCREEN',{font:'20px emulogic',fill:'#fff'});
            txtFullScreen.anchor.set(.5);
        
        var txtPressStart = this.game.add.text(this.game.world.centerX,550,'PRESS ENTER TO START',{font:'20px emulogic',fill:'#fff'});
            txtPressStart.anchor.set(.5);

        this.game.add.tween(txtPressStart).to({y:350},1000).start();

        this.game.time.events.add(1000,function(){
            var enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
                enterKey.onDown.addOnce(this.startGame,this);
        },this);

        var fullScreenButton = this.game.input.keyboard.addKey(Phaser.Keyboard.ONE);
        fullScreenButton.onDown.add(this.toggleFullScreen, this)
    }

    toggleFullScreen(){
        this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT
        if(this.game.scale.isFullScreen){
            this.game.scale.stopFullScreen()
        } else {
            this.game.scale.startFullScreen(false)
        }
    }

    startGame(){
        this.game.state.start('Play')
    }

}