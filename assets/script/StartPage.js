cc.Class({
    extends: cc.Component,

    properties: {
        doubleRing:{
            default: null,
            type: cc.Node
        },
        newGameRing:{
            default: null,
            type: cc.Node
        },
        quitRing:{
            default: null,
            type: cc.Node
        },
        doubleButton:{
            default: null,
            type: cc.Node
        },
        newGameButton:{
            default: null,
            type: cc.Node
        },
        quitButton:{
            default: null,
            type: cc.Node
        },
        splatterAudio:{
            default: null,
            type: cc.AudioClip
        },
        bgAudio:{
            default: null,
            type: cc.AudioClip
        }
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        this.buttons = [this.doubleButton, this.newGameButton, this.quitButton]
        this.rings = [this.doubleRing, this.newGameRing, this.quitRing]

        let rotate1 = cc.rotateBy(1, -90)
        let rotate2 = cc.rotateBy(1, 90)

        for(let i = 0; i < 3; i++){
            this.rings[i].runAction(rotate1.clone().repeatForever())
            this.buttons[i].runAction(rotate2.clone().repeatForever())
        }
        
        cc.audioEngine.playMusic(this.bgAudio, true);

        cc.audioEngine.setEffectsVolume(1);

        this.node.on('touchmove', this.onTouchMove, this)
     },

    onTouchMove: function(touch, event) {
        let touchLoc = touch.getLocation();
    
        if(this.newGameButton.getBoundingBoxToWorld().contains(touchLoc)){
            this.stopActions()
            
            cc.audioEngine.stopMusic()
            cc.audioEngine.playEffect(this.splatterAudio, false)

            let loc = this.newGameButton.getPosition();

            let width = this.newGameButton.width;
            let height = this.newGameButton.height;
            
            let melon1 = new cc.Node('melon1');
            melon1.parent = this.node;
            melon1.setPosition(loc.sub(cc.v2(60, 0)))
            melon1.width = width * 0.8
            melon1.height = height

            let sprite1 = melon1.addComponent(cc.Sprite)
            sprite1.sizeMode = 'custom'

            let melon2 = new cc.Node('melon2')
            melon2.parent = this.node;
            melon2.setPosition(loc.add(cc.v2(60, 0)))
            melon2.width = width * 0.8
            melon2.height = height
        
            let sprite2 = melon2.addComponent(cc.Sprite)
            sprite2.sizeMode = 'custom'

            cc.loader.loadRes('images/fruit/melon-1', cc.SpriteFrame, function(err, spriteFrame) {          
                sprite1.spriteFrame = spriteFrame
            });   
            
            cc.loader.loadRes('images/fruit/melon-2', cc.SpriteFrame, function(err, spriteFrame) {          
                sprite2.spriteFrame = spriteFrame
            });   

            this.newGameButton.destroy()
            
            this.node.off('touchmove', this.onTouchMoved, this)
            
            let pos = this.node.convertToWorldSpaceAR(loc)

            let bezier1 = [cc.v2(0, 0), cc.v2(0, 0), cc.v2(0.5*(-pos.y-100), -pos.y-100)]
            let bezierAction1 = cc.bezierBy(0.5, bezier1)
            let rotate1 = cc.rotateBy(0.5, -90)
            melon1.runAction(cc.spawn(bezierAction1, rotate1) )

            let bezier2 = [cc.v2(0, 0), cc.v2(0, 0), cc.v2(0.5*(pos.y+100), -pos.y-100)]
            let bezierAction2 = cc.bezierBy(0.5, bezier2)
            let rotate2 = cc.rotateBy(0.5, 90)
            melon2.runAction(cc.sequence(cc.spawn(bezierAction2, rotate2), cc.callFunc(this.shiftScene)))
            
        }
      
    },

    stopActions: function(){
        for(let i = 0; i < 3; i++){
            this.rings[i].stopAllActions()
            this.buttons[i].stopAllActions()
        }
    },

    shiftScene: function(){
        cc.director.loadScene('Game')
    },

    start () {

    },

    // update (dt) {},
});
