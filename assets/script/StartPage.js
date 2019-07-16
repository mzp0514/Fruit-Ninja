// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
        var doubleRing = cc.find('dojo', this.node),
            newGameRing = cc.find('new-game', this.node),
            quitRing = cc.find('quit', this.node),
            doubleButton = cc.find('empty', this.node),
            newGameButton = cc.find('melon', this.node),
            quitButton = cc.find('boom', this.node)
        this.buttons = [doubleButton, newGameButton, quitButton]
        this.rings = [doubleRing, newGameRing, quitRing]

        let rotate1 = cc.rotateBy(1, -90)
        let rotate2 = cc.rotateBy(1, 90)

        for(let i = 0; i < 3; i++){
            this.rings[i].runAction(rotate1.clone().repeatForever())
            this.buttons[i].runAction(rotate2.clone().repeatForever())
        }
        
        this.node.on('touchmove', this.onTouchMove, this)
     },

    onTouchMove: function(touch, event) {
        let touchLoc = touch.getLocation();
    
        if(this.buttons[1].getBoundingBoxToWorld().contains(touchLoc)){
            this.stopActions()

            let loc = this.buttons[1].getPosition();

            let width = this.buttons[1].width;
            let height = this.buttons[1].height;
            
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

            this.buttons[1].destroy()
            
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
