// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

window.fruitInfo = [
    //peach
    { imageSrc: "images/fruit/peach", width: 62, height: 59 },
    //melon
    { imageSrc: "images/fruit/melon", width: 98, height: 85 } ,
    //apple
    { imageSrc: "images/fruit/apple", width: 66, height: 66 } ,
    //basaha
    { imageSrc: "images/fruit/basaha", width: 68, height: 72 } ,
    //banana
    { imageSrc: "images/fruit/banana", width: 126, height: 50 } ,
    //boom
    { imageSrc: "images/fruit/boom", width: 66, height:68 }
]


cc.Class({
    extends: cc.Component,

    properties: {
        fruitPrefab: {
            default: null,
            type: cc.Prefab
        },

        fruit1Prefab:{
            default: null,
            type: cc.Prefab
        },

        fruit2Prefab:{
            default: null,
            type: cc.Prefab
        },

        meolonJuicePrefab:{
            default: null,
            type: cc.Prefab
        },

        appleJuicePrefab:{
            default: null,
            type: cc.Prefab
        },

        peachJuicePrefab:{
            default: null,
            type: cc.Prefab
        },

        bombPrefab:{
            default: null,
            type: cc.Prefab
        },

        scoreLabel:{
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getPhysicsManager().enabled = true;
        
        this.pools = new Array(6);
        this.points = new Array(0);
        
        this.piece1Pools = new Array(5)
        this.piece2Pools = new Array(5)

        this.score = 0
        this.cnt = 0
        this.scoreLabel.string = this.score.toString()

        this.initPools()

        this.node.on('touchstart', this.onTouchStart, this)
        this.node.on('touchmove', this.onTouchMove, this)
        //this.node.on('touchcancel', this.onTouchCancel, this);
        this.node.on('touchend', this.onTouchEnd, this);
        
        this.effectNode = new cc.Node('effect')
        this.node.addChild(this.effectNode)
        this.ctx = this.effectNode.addComponent(cc.Graphics)
        this.ctx.fillColor = cc.Color.WHITE
        this.ctx.strokeColor = cc.Color.WHITE

        // this.ctx.strokeColor = new cc.Color(36, 134, 185, 32)
        // this.ctx.fillColor = new cc.Color(82, 82, 136, 32)
        this.schedule(function(){
            this.attack(0)
        }, 5);
    },

    initPools: function(){
        for(let i = 0; i < 6; i++){
            this.pools[i] = new cc.NodePool()

            if(i < 5){
                this.piece1Pools[i] = new cc.NodePool()
                this.piece2Pools[i] = new cc.NodePool()
            }
            
            for(let j = 0; j < 8; j++){
                let item = cc.instantiate(this.fruitPrefab) 
                item.Name = i.toString()
                item.getComponent(cc.Sprite).sizeMode = 'custom'
                cc.loader.loadRes(window.fruitInfo[i]['imageSrc'], cc.SpriteFrame, 
                    function(err, spriteFrame) {          
                        item.getComponent(cc.Sprite).spriteFrame = spriteFrame
                })
                item.width = window.fruitInfo[i]['width'] * 1.5
                item.height = window.fruitInfo[i]['height'] * 1.5
                this.pools[i].put(item)
                
                if(i < 5){
                    let item1 = cc.instantiate(this.fruit1Prefab) 
                    item1.getComponent(cc.Sprite).sizeMode = 'custom'
                    cc.loader.loadRes(window.fruitInfo[i]['imageSrc'] + '-1', cc.SpriteFrame, 
                        function(err, spriteFrame) {          
                            item1.getComponent(cc.Sprite).spriteFrame = spriteFrame
                    })
                    item1.width = window.fruitInfo[i]['width'] * 1.5
                    item1.height = window.fruitInfo[i]['height'] * 1.5
                    this.piece1Pools[i].put(item1)

                    let item2 = cc.instantiate(this.fruit2Prefab) 
                    item2.getComponent(cc.Sprite).sizeMode = 'custom'
                    cc.loader.loadRes(window.fruitInfo[i]['imageSrc'] + '-2', cc.SpriteFrame, 
                        function(err, spriteFrame) {          
                            item2.getComponent(cc.Sprite).spriteFrame = spriteFrame
                    })
                    item2.width = window.fruitInfo[i]['width'] * 1.5
                    item2.height = window.fruitInfo[i]['height'] * 1.5
                    this.piece2Pools[i].put(item2)
                }
                
            }
        }
    },

    attack: function(id){
        if(id === 0){
            this.produceFruit(1, -200, -400, 100, -400, 0)
            this.produceFruit(2, -700, 0, 100, 0, 1)
            this.produceFruit(3, -100, -500, 300, -500, 0)
            this.produceFruit(0, -700, -100, 0, -100, 1)
            this.produceFruit(4, -700, 100, 0, 100, 1)
            this.produceFruit(5, -400, -500, 400, -500, 0)
        }
    },

    //param: fruit-id, pos_st, pos_ed, curve(0:bezier 1:straight l-r 2:straight u-d)
    produceFruit: function(id, xst, yst, xed, yed, type){
    
        let item = null

        if (this.pools[id].size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            item = this.pools[id].get();
            
        } else { // 如果没有空闲对象
            //item = cc.instantiate(this.enemyPrefab);
            return
        }
        
        this.node.addChild(item)
        item.setPosition(xst, yst)
        let action = null
        
        if(type === 0){
            let bezier = [cc.v2(xst, yst), cc.v2((xst + xed)/2, 700), cc.v2(xed, yed)]
            let bezierAction = cc.bezierTo(1.5, bezier)
            let rotate = null

            if(xst < xed){
                rotate = cc.rotateBy(1.5, -180)
            } else {
                rotate = cc.rotateBy(1.5, 180)
            }

            action = cc.spawn(bezierAction, rotate)
        } 

        else if (type === 1) {
            let moveAction1 = cc.moveTo(0.5, xed, yed)
            let rotate1 = cc.rotateBy(2, 2 * 360)
            let moveAction2 = cc.moveTo(0.5, -xst, yst)
            let rotate2 = cc.rotateBy(0.5, 180)
            action = cc.sequence(cc.spawn(moveAction1, rotate1), cc.spawn(moveAction2, rotate2))
        }

        else if (type === 2) {
             
        }

        item.runAction(cc.sequence(action, cc.callFunc(function(){
            this.pools[id].put(item)
        }.bind(this))))

    },

    produceJuice: function(id, loc){
        let juice = null
        if(id === 0){
            juice = cc.instantiate(this.peachJuicePrefab) 
        }
        else if (id === 1 || id === 3){
            juice = cc.instantiate(this.meolonJuicePrefab)
        }
        else if(id === 2){
            juice = cc.instantiate(this.appleJuicePrefab)
        }
        
        this.node.addChild(juice)
        juice.setPosition(loc)
    },

    producePieces: function(id, loc, angle = 0) {
        let piece1 = this.piece1Pools[id].get()
        let piece2 = this.piece2Pools[id].get()
        
        //piece1.rotation = angle
        //piece2.rotation = angle

        piece1.setPosition(loc.sub(cc.v2(60, 0)))
        piece2.setPosition(loc.add(cc.v2(60, 0)))

        this.node.addChild(piece1)
        this.node.addChild(piece2)

        let pos = this.node.convertToWorldSpaceAR(loc)

        let bezier1 = [cc.v2(0, 0), cc.v2(0, 0), cc.v2(0.5*(-pos.y-100), -pos.y-100)]
        let bezierAction1 = cc.bezierBy(1, bezier1)
        let rotate1 = cc.rotateBy(1, -90)
        piece1.runAction(cc.sequence(cc.spawn(bezierAction1, rotate1), cc.callFunc(function(){
            this.piece1Pools[id].put(piece1)
        }.bind(this))))

        let bezier2 = [cc.v2(0, 0), cc.v2(0, 0), cc.v2(0.5*(pos.y+100), -pos.y-100)]
        let bezierAction2 = cc.bezierBy(1, bezier2)
        let rotate2 = cc.rotateBy(1, 90)
        piece2.runAction(cc.sequence(cc.spawn(bezierAction2, rotate2), cc.callFunc(function(){
            this.piece2Pools[id].put(piece2)
        }.bind(this))))
    },

    boom: function(loc){
        let bomb = cc.instantiate(this.bombPrefab) 
        this.node.addChild(bomb)
        bomb.setPosition(loc)
    },

    onTouchStart: function(touch, event){
        this.points.push(touch.getLocation())
        this.cnt = 0
    },

    onTouchMove: function(touch, event){
	    let end = touch.getLocation()	
	    let start = touch.getPreviousLocation()
        
        //刀光轨迹
	    let distance = end.sub(start).mag();
	    if ( distance > 1 ) {
		    let d = Math.ceil(distance);
		    for (let i = 0; i < d; i++) {
			    let difx = end.x - start.x;
			    let dify = end.y - start.y;
			    let delta = i / distance;
			    let p = cc.v2(start.x + (difx * delta), start.y + (dify * delta));
			
			    this.points.push(p);
		    }
        }
        
        //切
        let fruits = this.node.children
        
        for(let i = fruits.length - 1; i >= 0; i--){
            if(fruits[i].getBoundingBoxToWorld().contains(end) && fruits[i].Name && fruits[i].Name.length === 1){
                let loc = fruits[i].getPosition()
                let id = parseInt(fruits[i].Name)
                fruits[i].stopAllActions()
                this.pools[id].put(fruits[i])
                if(id < 5) {
                    this.producePieces(id, loc)
                    this.produceJuice(id, loc)
                    this.cnt++
                }
                else{
                    this.boom(loc)
                }
            }
            
        }

    },

    onTouchEnd: function(touch, event){
        this.points.length = 0
        this.score += this.cnt * this.cnt
        this.scoreLabel.string = this.score.toString()
    },

    draw: function() {
        let linewidth = 15
	    let linewidthinc = 0.2
	    let linewidth2 = 0.2

	    let pointdrawcount = 1
	    let pointlistsize = this.points.length
	
	    for(let i = pointlistsize - 2; i >= 0; i--) {
		    
		    pointdrawcount++
		
		    //控制线段的粗细，使达到两头细中间粗的效果
		    if ( pointdrawcount < 70 ) {
			      linewidth = linewidth2;
			      linewidth2 += linewidthinc;
			 } else {
		        linewidth = linewidth - linewidth * 2 / (pointlistsize);
		    }
            
            let pos0 = this.node.convertToNodeSpaceAR(this.points[i+1])
            let pos = this.node.convertToNodeSpaceAR(this.points[i])
            
            this.ctx.moveTo(pos0.x, pos0.y)
            this.ctx.lineTo(pos.x, pos.y)
            this.ctx.lineWidth = linewidth

            this.ctx.stroke()
	    }
    },

    start () {

    },

    update (dt) {
        //当滑动速度很慢时，不至于很快消失
	    if ( this.points.length < 30 ) {
		    for (let i = 0; i < 1; i++) {
			    if (this.points.length >0) {
				    this.points.shift();
			    } else {
				    break;
			    }
		    }
		    
	    } else {
	
	        for (let i = 0; i < 9 ; i++) {
		        if (this.points.length > 0) {
		            this.points.shift();
		        } else {
			        break;
		        }
	        }

	        //为了使线段不过长
	        while (this.points.length > 400) {
		        this.points.shift();
            }
        }
        this.ctx.clear();
        this.draw()
    },
});
