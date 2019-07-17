var fruitInfo = [
    //peach
    { imageSrc: "images/fruit/peach", width: 62, height: 59 },
    //melon
    { imageSrc: "images/fruit/melon", width: 120, height: 110 } ,
    //apple
    { imageSrc: "images/fruit/apple", width: 66, height: 66 } ,
    //basaha
    { imageSrc: "images/fruit/basaha", width: 68, height: 72 } ,
    //banana
    { imageSrc: "images/fruit/banana", width: 120, height: 50 } ,
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

        comboPrefab:{
            default: null,
            type: cc.Prefab
        },

        scoreLabel:{
            default: null,
            type: cc.Label
        },

        xlabel1:{
            default: null,
            type: cc.Node
        },

        xlabel2:{
            default: null,
            type: cc.Node
        },

        xlabel3:{
            default: null,
            type: cc.Node
        },

        startAudio:{
            default: null,
            type: cc.AudioClip
        },

        throwAudio:{
            default: null,
            type: cc.AudioClip
        },

        splatterAudio:{
            default: null,
            type: cc.AudioClip
        },

        boomAudio:{
            default: null,
            type: cc.AudioClip
        },

        bgmAudio:{
            default: null,
            type: cc.AudioClip
        },

        comboAudio:{
            default: null,
            type: cc.AudioClip
        },

        overAudio:{
            default: null,
            type: cc.AudioClip
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
        cc.audioEngine.playEffect(this.startAudio, false)
        
        this.pools = new Array(6);
        this.points = new Array(0);
        
        this.piece1Pools = new Array(5)
        this.piece2Pools = new Array(5)
     
        this.xlabels = [this.xlabel1, this.xlabel2, this.xlabel3]
        this.miss = 0

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
        this.ctx.lineJoin = cc.Graphics.LineJoin.BEVEL;

        cc.audioEngine.setMusicVolume(1.5)
        cc.audioEngine.setEffectsVolume(1)

        this.stage = 0
        this.round = 0
        
        this.schedule(function(){
            this.attack(this.randomNum(0, 3 + this.stage))
            if(++this.round >= 4 && this.stage < 2){
                this.stage++
                if(this.stage === 1){
                    cc.audioEngine.playMusic(this.bgmAudio, true)
                }
                this.round = 0
            }
        }, 6);
    },

    initPools: function(){
        for(let i = 0; i < 6; i++){
            this.pools[i] = new cc.NodePool()

            if(i < 5){
                this.piece1Pools[i] = new cc.NodePool()
                this.piece2Pools[i] = new cc.NodePool()
            }
            
            for(let j = 0; j < 6; j++){
                let item = cc.instantiate(this.fruitPrefab) 
                item.Name = i.toString()
                item.getComponent(cc.Sprite).sizeMode = 'custom'
                cc.loader.loadRes(fruitInfo[i]['imageSrc'], cc.SpriteFrame, 
                    function(err, spriteFrame) {          
                        item.getComponent(cc.Sprite).spriteFrame = spriteFrame
                })
                item.width = fruitInfo[i]['width'] * 1.5
                item.height = fruitInfo[i]['height'] * 1.5
                this.pools[i].put(item)
                
                if(i < 5){
                    let item1 = cc.instantiate(this.fruit1Prefab) 
                    item1.getComponent(cc.Sprite).sizeMode = 'custom'
                    cc.loader.loadRes(fruitInfo[i]['imageSrc'] + '-1', cc.SpriteFrame, 
                        function(err, spriteFrame) {          
                            item1.getComponent(cc.Sprite).spriteFrame = spriteFrame
                    })
                    item1.width = fruitInfo[i]['width']* 1.25
                    item1.height = fruitInfo[i]['height'] *1.5
                    this.piece1Pools[i].put(item1)

                    let item2 = cc.instantiate(this.fruit2Prefab) 
                    item2.getComponent(cc.Sprite).sizeMode = 'custom'
                    cc.loader.loadRes(fruitInfo[i]['imageSrc'] + '-2', cc.SpriteFrame, 
                        function(err, spriteFrame) {          
                            item2.getComponent(cc.Sprite).spriteFrame = spriteFrame
                    })
                    item2.width = fruitInfo[i]['width'] * 1.25
                    item2.height = fruitInfo[i]['height'] * 1.5
                    this.piece2Pools[i].put(item2)
                }
                
            }
        }
    },

    randomNum: function(min, max) {
        let num = Math.floor(Math.random() * (max - min + 1) + min)
        return num
    },

    attack: function(id){
        // 群1
        if(id === 0){
            let count = this.randomNum(3 + 2 * this.stage, 4 + this.stage * 4)
            for(let i = 0; i < count; i++){
                let fruit = this.randomNum(0, 5)
                let stx = this.randomNum(-650, 650)
                let edx = this.randomNum(-650, 650)
                this.produceFruit(fruit, stx, -400, edx, -400, 0) 
            }
        }
        // 连续1
        else if(id === 1){
            let count = this.randomNum(5 + 2 * this.stage, 4 + this.stage * 4)
            this.schedule( function(){
                let fruit = this.randomNum(0, 5)
                let stx = this.randomNum(-650, 650)
                let edx = this.randomNum(-650, 650)
                this.produceFruit(fruit, stx, -400, edx, -400, 0) 
            }.bind(this), 0.75 - this.stage * 0.25, count)
        }

        // 3 * 3 
        else if(id === 2){
            for(let i = -1; i < 2; i++){
                for(let j = -1; j < 2; j++){
                    let fruit = this.randomNum(0, 5)
                    let shift = this.randomNum(0, 1)
                    let stx = 700, sty = 150 * j
                    if(shift && j === 0){
                        stx = -stx
                    }
                    this.produceFruit(fruit, stx, sty, 200 * i, sty, 1) 
                }
            }
        }

        // 2 * 5 
        else if(id === 3){
            for(let i = -1; i <= 1; i++){
                if(i === 0) continue
                for(let j = -2; j <= 2; j++){
                    let fruit = this.randomNum(0, 5)
                    this.produceFruit(fruit, 700 * i, 100 * i, 150 * j, 100 * i, 1)
                }
            }
        }

        // 3 * 5
        else if(id === 4){
            for(let i = -1; i <= 1; i++){
                for(let j = -2; j <= 2; j++){
                    let fruit = this.randomNum(0, 5)
                    this.produceFruit(fruit, -700, 150 * i, 150 * j, 150 * i, 1)
                }
            }
        }
        //-2: 0    -1: -1 0 1   0: -2 -1 0 1 2 
        else if(id === 5){
            for(let i = -2; i <= 2; i++){
                for(let j = Math.abs(i) - 2; j <= -(Math.abs(i) - 2); j++){
                    let fruit = this.randomNum(0, 5)
                    this.produceFruit(fruit, 700, 150 * i, 150 * j, 150 * i, 1)
                }
            }
        }

    },

    //param: fruit-id, pos_st, pos_ed, curve(0:bezier 1:straight l-r 2:straight u-d)
    produceFruit: function(id, xst, yst, xed, yed, type){

        cc.audioEngine.playEffect(this.throwAudio, false)

        let item = null

        if (this.pools[id].size() > 0) { 
            item = this.pools[id].get();
        } else { // 如果没有空闲对象
            return
        }

        this.node.addChild(item)
        item.setPosition(xst, yst)
        let action = null
        
        if(type === 0){
            let height = this.randomNum(700, 1200)
            let time = 2.5 - 0.5 * this.stage
            let bezier = [cc.v2(xst, yst), cc.v2((xst + xed)/2, height), cc.v2(xed, yed)]
            let bezierAction = cc.bezierTo(time, bezier)
            let rotate = null

            if(xst < xed){
                rotate = cc.rotateBy(time, -360)
            } else {
                rotate = cc.rotateBy(time, 360)
            }

            action = cc.spawn(bezierAction, rotate)
        } 

        else if (type === 1) {
            let moveAction1 = cc.moveTo(0.5, xed, yed)
            let rotate1 = cc.rotateBy(3 - this.stage, 2 * 360)
            let moveAction2 = cc.moveTo(0.5, -xst, yst)
            let rotate2 = cc.rotateBy(0.5, 180)
            action = cc.sequence(cc.spawn(moveAction1, rotate1), cc.spawn(moveAction2, rotate2))
        }

        item.runAction(cc.sequence(action, cc.callFunc(function(){
            this.pools[id].put(item)
            if(id !== 5){
                if(this.miss < 3){
                    this.missAdd()
                }
                else{
                    this.gameOver()
                }
            }
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
        else{
            return
        }
        
        this.node.addChild(juice)
        juice.setPosition(loc)
    },

    producePieces: function(id, loc, angle = 0) {
        cc.audioEngine.playEffect(this.splatterAudio, false)

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

    missAdd: function(){
        let sprite = this.xlabels[this.miss].getComponent(cc.Sprite)
        cc.loader.loadRes('images/' + this.miss.toString(), cc.SpriteFrame, function(err, spriteFrame) {          
            sprite.spriteFrame = spriteFrame
        });  
        this.miss ++
    },

    recover: function(num){
    
        while(num-- > 0 && this.miss > 0){
            this.miss--
            let sprite = this.xlabels[this.miss].getComponent(cc.Sprite)
            cc.loader.loadRes('images/x' + this.miss.toString(), cc.SpriteFrame, function(err, spriteFrame) {          
                sprite.spriteFrame = spriteFrame
            }); 
        } 
    },

    comboAdd: function(){
        let combo = cc.instantiate(this.comboPrefab)
        let comboLabel = combo.getComponent(cc.Label)
        comboLabel.string += ' ' + this.cnt.toString()
        combo.color = new cc.Color(255, 204, 0)
        this.node.addChild(combo)
        this.scheduleOnce(function(){combo.destroy()}, 2)
    },

    boom: function(loc){
        cc.audioEngine.playEffect(this.boomAudio, false)
        let bomb = cc.instantiate(this.bombPrefab) 
        this.node.addChild(bomb)
        bomb.setPosition(loc)
    },

    onTouchStart: function(touch, event){
        this.points.push(touch.getLocation())

        this.cnt = 0
        this.callbackfunc = function(){
            this.score += this.cnt * this.cnt
            this.scoreLabel.string = this.score.toString()
            if(this.cnt >= 3){
                cc.audioEngine.playEffect(this.comboAudio, false)
                this.recover(Math.min(3, this.cnt - 2))
                this.comboAdd()
            }
            this.cnt = 0
        }.bind(this)

        this.schedule(this.callbackfunc, 0.75)
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
                    this.cnt = 0
                    this.score = Math.max(0, this.score - 10)
                    this.scoreLabel.string = this.score.toString()
                }
            }
            
        }

    },

    onTouchEnd: function(touch, event){
        this.points.length = 0
        this.unschedule(this.callbackfunc)
        this.score += this.cnt
        this.scoreLabel.string = this.score.toString()
    },

    gameOver: function(){
       // cc.audioEngine.stopMusic(this.bgmAudio)
        cc.audioEngine.playEffect(this.overAudio, false)
        //
        //
        //
        //
    },

    draw: function() {
        let linewidth = 40
	    let linewidthinc = 1
	    let linewidth2 = 1

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
        let rgb = [this.randomNum(0, 255),
                   this.randomNum(0, 200), 
                   this.randomNum(150, 255)]
        this.ctx.strokeColor = new cc.Color(rgb[0], rgb[1], rgb[2])
        this.draw()
    },
});
