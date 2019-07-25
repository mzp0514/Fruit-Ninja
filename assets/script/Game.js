window.score = 0

var fruitInfo = [
  // peach
  { imageSrc: 'images/fruit/peach', width: 100, height: 90 },
  // melon
  { imageSrc: 'images/fruit/melon', width: 180, height: 165 },
  // apple
  { imageSrc: 'images/fruit/apple', width: 100, height: 100 },
  // basaha
  { imageSrc: 'images/fruit/basaha', width: 90, height: 100 },
  // banana
  { imageSrc: 'images/fruit/banana', width: 180, height: 75 },
  // boom
  { imageSrc: 'images/fruit/boom', width: 100, height: 105 },
  // nuclear
  { imageSrc: 'images/fruit/nuclear', width: 80, height: 150 }
]

cc.Class({
  extends: cc.Component,

  properties: {
    fruitPrefab: {
      default: null,
      type: cc.Prefab
    },

    fruit1Prefab: {
      default: null,
      type: cc.Prefab
    },

    fruit2Prefab: {
      default: null,
      type: cc.Prefab
    },

    meolonJuicePrefab: {
      default: null,
      type: cc.Prefab
    },

    appleJuicePrefab: {
      default: null,
      type: cc.Prefab
    },

    peachJuicePrefab: {
      default: null,
      type: cc.Prefab
    },

    bombPrefab: {
      default: null,
      type: cc.Prefab
    },

    comboPrefab: {
      default: null,
      type: cc.Prefab
    },

    scoreLabel: {
      default: null,
      type: cc.Label
    },

    scorePic: {
      default: null,
      type: cc.Node
    },

    xlabel1: {
      default: null,
      type: cc.Node
    },

    xlabel2: {
      default: null,
      type: cc.Node
    },

    xlabel3: {
      default: null,
      type: cc.Node
    },

    ruleNode: {
      default: null,
      type: cc.Node
    },

    goButton: {
      default: null,
      type: cc.Button
    },

    homeButton: {
      default: null,
      type: cc.Button
    },

    pauseButton: {
      default: null,
      type: cc.Button
    },

    startAudio: {
      default: null,
      type: cc.AudioClip
    },

    throwAudio: {
      default: null,
      type: cc.AudioClip
    },

    splatterAudio: {
      default: null,
      type: cc.AudioClip
    },

    boomAudio: {
      default: null,
      type: cc.AudioClip
    },

    nuclearAudio: {
      default: null,
      type: cc.AudioClip
    },

    bgmAudio: {
      default: null,
      type: cc.AudioClip
    },

    comboAudio: {
      default: null,
      type: cc.AudioClip
    },

    overAudio: {
      default: null,
      type: cc.AudioClip
    }
  },

  // LIFE-CYCLE CALLBACKS:

  onLoad () {
    cc.audioEngine.playEffect(this.startAudio, false)

    // 水果、碎片的结点池
    this.pools = new Array(7)
    this.piece1Pools = new Array(5)
    this.piece2Pools = new Array(5)

    // 绘制刀光的点集
    this.points = new Array(0)

    this.xlabels = [this.xlabel1, this.xlabel2, this.xlabel3]
    this.miss = 0

    this.comboCnt = 0
    this.scoreLabel.string = window.score.toString()

    // 加载结点池
    this.initPools()

    // 页面效果结点
    this.effectNode = new cc.Node()
    this.node.addChild(this.effectNode)
    this.ctx = this.effectNode.addComponent(cc.Graphics)
    this.ctx.lineJoin = cc.Graphics.LineJoin.BEVEL

    // 音乐 音效
    cc.audioEngine.setMusicVolume(1.5)
    cc.audioEngine.setEffectsVolume(1)

    // 难度
    this.stage = 0
    // 回合
    this.round = 0
    // 水果大小
    this.fruitScale = 1

    // 是否产生核弹
    this.hasNuclear = 0

    cc.director.preloadScene('OverPage')

    this.goButton.node.on('click', function (button) {
      this.startGame()
      this.ruleNode.destroy()
    }.bind(this))

    this.homeButton.node.on('click', function (button) {
      cc.director.loadScene('StartPage')
    })

    this.state = 0
    this.pauseButton.node.on('click', function (button) {
      this.shiftState()
    }.bind(this))
  },

  shiftState: function () {
    const node = this.pauseButton.node.getChildByName('Background')
    const sprite = node.getComponent(cc.Sprite)

    if (this.state === 0) {
      cc.director.pause()
      node.width = 200
      cc.loader.loadRes('images/continue', cc.SpriteFrame, function (err, spriteFrame) {
        if (!err) { sprite.spriteFrame = spriteFrame }
      })
      this.state = 1
    } else {
      cc.director.resume()
      node.width = 80
      cc.loader.loadRes('images/pause', cc.SpriteFrame, function (err, spriteFrame) {
        if (!err) { sprite.spriteFrame = spriteFrame }
      })
      this.state = 0
    }
  },

  startGame: function () {
    this.node.on('touchstart', this.onTouchStart, this)
    this.node.on('touchmove', this.onTouchMove, this)
    this.node.on('touchend', this.onTouchEnd, this)

    this.schedule(this.attackControl, 5, cc.macro.REPEAT_FOREVER, 1)
  },

  attackControl: function () {
    this.attack(this.randomNum(0, 4 + this.stage))
    if (++this.round >= 4 && this.stage < 3) {
      this.stage++
      if (this.stage === 1) {
        cc.audioEngine.playMusic(this.bgmAudio, true)
      }
      if (this.stage >= 2) {
        const rdm = this.randomNum(0, 1)
        if (rdm === 1) {
          this.hasNuclear = 1
        } else {
          this.hasNuclear = 0
        }
      }
      this.round = 0
    }
  },

  initPools: function () {
    for (let i = 0; i < 7; i++) {
      this.pools[i] = new cc.NodePool()

      if (i < 5) {
        this.piece1Pools[i] = new cc.NodePool()
        this.piece2Pools[i] = new cc.NodePool()
      }

      for (let j = 0; j < 6; j++) {
        const item = cc.instantiate(this.fruitPrefab)
        item.Name = i.toString()
        item.getComponent(cc.Sprite).sizeMode = 'custom'
        cc.loader.loadRes(fruitInfo[i]['imageSrc'], cc.SpriteFrame,
          function (err, spriteFrame) {
            if (!err) { item.getComponent(cc.Sprite).spriteFrame = spriteFrame }
          })
        item.width = fruitInfo[i]['width']
        item.height = fruitInfo[i]['height']
        this.pools[i].put(item)

        if (i < 5) {
          const item1 = cc.instantiate(this.fruit1Prefab)
          item1.getComponent(cc.Sprite).sizeMode = 'custom'
          cc.loader.loadRes(fruitInfo[i]['imageSrc'] + '-1', cc.SpriteFrame,
            function (err, spriteFrame) {
              if (!err) { item1.getComponent(cc.Sprite).spriteFrame = spriteFrame }
            })
          item1.width = fruitInfo[i]['width'] * 0.8
          item1.height = fruitInfo[i]['height']
          this.piece1Pools[i].put(item1)

          const item2 = cc.instantiate(this.fruit2Prefab)
          item2.getComponent(cc.Sprite).sizeMode = 'custom'
          cc.loader.loadRes(fruitInfo[i]['imageSrc'] + '-2', cc.SpriteFrame,
            function (err, spriteFrame) {
              if (!err) { item2.getComponent(cc.Sprite).spriteFrame = spriteFrame }
            })
          item2.width = fruitInfo[i]['width'] * 0.8
          item2.height = fruitInfo[i]['height']
          this.piece2Pools[i].put(item2)
        }
      }
    }
  },

  randomNum: function (min, max) {
    const num = Math.floor(Math.random() * (max - min + 1) + min)
    return num
  },

  attack: function (id) {
    if (id === 0) {
      const count = this.randomNum(3 + 2 * this.stage, 3 + this.stage * 3)
      for (let i = 0; i < count; i++) {
        const fruit = this.randomNum(0, 5 + this.hasNuclear)
        const stx = this.randomNum(-650, 650)
        const edx = this.randomNum(-650, 650)
        this.produceFruit(fruit, stx, -400, edx, -400, 0)
      }
    } else if (id === 1) {
      const count = this.randomNum(5 + 2 * this.stage, 5 + this.stage * 3)
      this.schedule(function () {
        const fruit = this.randomNum(0, 5 + this.hasNuclear)
        const stx = this.randomNum(-650, 650)
        const edx = this.randomNum(-650, 650)
        this.produceFruit(fruit, stx, -400, edx, -400, 0)
      }.bind(this), 0.8 - this.stage * 0.2, count)
    } else if (id === 2) {
      const count = this.randomNum(4 + 2 * this.stage, 4 + this.stage * 3)
      this.schedule(function () {
        const fruit = this.randomNum(0, 5 + this.hasNuclear)
        this.produceFruit(fruit, -600, -400, 1000, -400, 0)
        this.produceFruit(fruit, 600, -400, -1000, -400, 0)
      }.bind(this), 0.8 - this.stage * 0.2, count)
    } else if (id === 3) {
      for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
          const fruit = this.randomNum(0, 5 + this.hasNuclear)
          const shift = this.randomNum(0, 1)
          let stx = 700; const sty = 150 * j
          if (shift && j === 0) {
            stx = -stx
          }
          this.produceFruit(fruit, stx, sty, 200 * i, sty, 1)
        }
      }
    } else if (id === 4) {
      for (let i = -1; i <= 1; i++) {
        if (i === 0) continue
        for (let j = -2; j <= 2; j++) {
          const fruit = this.randomNum(0, 5 + this.hasNuclear)
          this.produceFruit(fruit, 700 * i, 100 * i, 150 * j, 100 * i, 1)
        }
      }
    } else if (id === 5) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -2; j <= 2; j++) {
          const fruit = this.randomNum(0, 5 + this.hasNuclear)
          this.produceFruit(fruit, -700, 150 * i, 150 * j, 150 * i, 1)
        }
      }
    } else if (id === 6) {
      for (let i = -2; i <= 2; i++) {
        for (let j = Math.abs(i) - 2; j <= -(Math.abs(i) - 2); j++) {
          const fruit = this.randomNum(0, 5 + this.hasNuclear)
          this.produceFruit(fruit, 700, 150 * i, 150 * j, 150 * i, 1)
        }
      }
    }
  },

  // param: fruit-id, pos_st, pos_ed, curve(0:bezier 1:straight l-r 2:straight u-d)
  produceFruit: function (id, xst, yst, xed, yed, type) {
    cc.audioEngine.playEffect(this.throwAudio, false)

    let item = null

    if (this.pools[id].size() > 0) {
      item = this.pools[id].get()
    } else {
      return
    }

    item.scale = this.fruitScale

    this.node.addChild(item)
    item.setPosition(xst, yst)
    let action = null

    if (type === 0) {
      const height = this.randomNum(700, 1200)
      const time = 2.5 - 0.4 * this.stage
      const bezier = [cc.v2(xst, yst), cc.v2((xst + xed) / 2, height), cc.v2(xed, yed)]
      const bezierAction = cc.bezierTo(time, bezier)
      let rotate = null

      if (xst < xed) {
        rotate = cc.rotateBy(time, -360)
      } else {
        rotate = cc.rotateBy(time, 360)
      }

      action = cc.spawn(bezierAction, rotate)
    } else if (type === 1) {
      const moveAction1 = cc.moveTo(0.5, xed, yed)
      const rotate1 = cc.rotateBy(3 - this.stage * 0.6, 2 * 360)
      const moveAction2 = cc.moveTo(0.5, -xst, yst)
      const rotate2 = cc.rotateBy(0.5, 180)
      action = cc.sequence(cc.spawn(moveAction1, rotate1), cc.spawn(moveAction2, rotate2))
    }

    item.runAction(cc.sequence(action, cc.callFunc(function () {
      if (item) item.scale = 1
      this.pools[id].put(item)
      if (id !== 5) {
        if (this.miss < 3) {
          this.missAdd()
        } else if (this.miss === 3) {
          this.miss++
          this.gameOver()
        }
      }
    }.bind(this))))
  },

  produceJuice: function (id, loc) {
    let juice = null
    if (id === 0) {
      juice = cc.instantiate(this.peachJuicePrefab)
    } else if (id === 1 || id === 3) {
      juice = cc.instantiate(this.meolonJuicePrefab)
    } else if (id === 2) {
      juice = cc.instantiate(this.appleJuicePrefab)
    } else {
      return
    }

    this.node.addChild(juice)
    juice.setPosition(loc)
  },

  producePieces: function (id, loc) {
    cc.audioEngine.playEffect(this.splatterAudio, false)

    if (this.piece1Pools[id].size() === 0 || this.piece2Pools[id].size() === 0) {
      return
    }

    const piece1 = this.piece1Pools[id].get()
    const piece2 = this.piece2Pools[id].get()

    piece1.scale = this.fruitScale
    piece2.scale = this.fruitScale

    piece1.setPosition(loc.sub(cc.v2(60, 0)))
    piece2.setPosition(loc.add(cc.v2(60, 0)))

    this.node.addChild(piece1)
    this.node.addChild(piece2)

    const pos = this.node.convertToWorldSpaceAR(loc)

    const bezier1 = [cc.v2(0, 0), cc.v2(0, 0), cc.v2(0.5 * (-pos.y - 100), -pos.y - 100)]
    const bezierAction1 = cc.bezierBy(1, bezier1)
    const rotate1 = cc.rotateBy(1, -90)
    piece1.runAction(cc.sequence(cc.spawn(bezierAction1, rotate1), cc.callFunc(function () {
      if (piece1) piece1.scale = 1
      this.piece1Pools[id].put(piece1)
    }.bind(this))))

    const bezier2 = [cc.v2(0, 0), cc.v2(0, 0), cc.v2(0.5 * (pos.y + 100), -pos.y - 100)]
    const bezierAction2 = cc.bezierBy(1, bezier2)
    const rotate2 = cc.rotateBy(1, 90)
    piece2.runAction(cc.sequence(cc.spawn(bezierAction2, rotate2), cc.callFunc(function () {
      if (piece2) piece2.scale = 1
      this.piece2Pools[id].put(piece2)
    }.bind(this))))
  },

  updateScore: function () {
    if (this.comboCnt >= 3) {
      window.score += this.comboCnt * this.comboCnt
      this.comboAdd()
    } else {
      window.score += this.comboCnt
    }
    this.scoreLabel.string = window.score.toString()
    this.comboCnt = 0
  },

  missAdd: function () {
    this.fruitScale = 1

    const sprite = this.xlabels[this.miss].getComponent(cc.Sprite)
    cc.loader.loadRes('images/' + this.miss.toString(), cc.SpriteFrame, function (err, spriteFrame) {
      if (!err) { sprite.spriteFrame = spriteFrame }
    })
    this.miss++
  },

  recover: function (num) {
    while (num-- > 0 && this.miss > 0) {
      this.miss--
      const sprite = this.xlabels[this.miss].getComponent(cc.Sprite)
      cc.loader.loadRes('images/x' + this.miss.toString(), cc.SpriteFrame, function (err, spriteFrame) {
        if (!err) { sprite.spriteFrame = spriteFrame }
      })
    }
  },

  comboAdd: function () {
    cc.audioEngine.playEffect(this.comboAudio, false)
    this.recover(Math.min(3, this.comboCnt - 2))
    this.fruitScale = Math.max(this.fruitScale, 1 + (this.comboCnt - 3) / 10)

    const combo = cc.instantiate(this.comboPrefab)
    combo.Name = 'combo'
    combo.scale = this.comboCnt / 8
    this.node.addChild(combo)
    this.scheduleOnce(function () { combo.destroy() }, 2)
  },

  boom: function (loc) {
    this.fruitScale = 1

    cc.audioEngine.playEffect(this.boomAudio, false)
    const bomb = cc.instantiate(this.bombPrefab)
    this.node.addChild(bomb)
    bomb.setPosition(loc)
  },

  nuclearBoom: function (loc) {
    this.unscheduleAllCallbacks()
    cc.audioEngine.stopMusic()
    cc.audioEngine.stopAllEffects()

    this.pauseButton.interactable = false
    this.homeButton.interactable = false

    const fruits = this.node.children

    for (let i = fruits.length - 1; i >= 0; i--) {
      if (fruits[i] && fruits[i].Name && fruits[i].Name.length === 1) {
        fruits[i].stopAllActions()
      }
    }

    this.miss = 0x3f3f3f3f

    this.scheduleOnce(function () {
      this.pauseButton.node.destroy()
      this.homeButton.node.destroy()
      this.scoreLabel.destroy()
      this.scorePic.destroy()
      this.xlabel1.destroy()
      this.xlabel2.destroy()
      this.xlabel3.destroy()

      for (let i = fruits.length - 1; i >= 0; i--) {
        if (fruits[i] && fruits[i].Name) {
          fruits[i].destroy()
        }
      }
    }.bind(this), 3)

    this.node.off('touchstart', this.onTouchStart, this)
    this.node.off('touchmove', this.onTouchMove, this)
    this.node.off('touchend', this.onTouchEnd, this)

    const over = cc.audioEngine.playEffect(this.nuclearAudio, false)
    cc.audioEngine.setFinishCallback(over, function () {
      cc.director.loadScene('OverPage')
    })

    this.ctx.clear()
    this.ctx.fillColor = new cc.Color(130, 17, 31)

    let cnt = 0
    this.schedule(function () {
      this.drawLight(loc, ++cnt * 30)
    }.bind(this), 0.1, 100, 3)
  },

  onTouchStart: function (touch, event) {
    this.points.push(touch.getLocation())

    this.comboCnt = 0

    this.schedule(this.updateScore, 0.75, cc.macro.REPEAT_FOREVER, 0.75)
  },

  onTouchMove: function (touch, event) {
    const end = touch.getLocation()
    const start = touch.getPreviousLocation()

    const distance = end.sub(start).mag()
    if (distance > 1) {
      const d = Math.ceil(distance)
      for (let i = 0; i < d; i++) {
        const difx = end.x - start.x
        const dify = end.y - start.y
        const delta = i / distance
        const p = cc.v2(start.x + (difx * delta), start.y + (dify * delta))

        this.points.push(p)
      }
    }

    const fruits = this.node.children

    for (let i = fruits.length - 1; i >= 0; i--) {
      if (fruits[i].getBoundingBoxToWorld().contains(end) && fruits[i].Name && fruits[i].Name.length === 1) {
        this.cut(fruits[i])
      }
    }
  },

  cut: function (fruit) {
    const loc = fruit.getPosition()
    const id = parseInt(fruit.Name)
    fruit.stopAllActions()

    if (id < 5) {
      this.pools[id].put(fruit)
      this.producePieces(id, loc)
      this.produceJuice(id, loc)
      this.comboCnt++
    } else if (id === 5) {
      this.pools[id].put(fruit)
      this.boom(loc)
      this.comboCnt = 0
      window.score = Math.max(0, window.score - 10)
      this.scoreLabel.string = window.score.toString()
    } else if (id === 6) {
      this.nuclearBoom(loc)
    }
  },

  onTouchEnd: function (touch, event) {
    this.points.length = 0
    this.unschedule(this.updateScore)
    this.updateScore()
  },

  gameOver: function () {
    this.unscheduleAllCallbacks()
    cc.audioEngine.stopMusic()
    cc.audioEngine.stopAllEffects()

    this.pauseButton.interactable = false
    this.homeButton.interactable = false

    this.node.off('touchstart', this.onTouchStart, this)
    this.node.off('touchmove', this.onTouchMove, this)
    this.node.off('touchend', this.onTouchEnd, this)

    const over = cc.audioEngine.playEffect(this.overAudio, false)
    cc.audioEngine.setFinishCallback(over, function () {
      cc.director.loadScene('OverPage')
    })
  },

  drawKnife: function () {
    let linewidth = 40
    const linewidthinc = 1
    let linewidth2 = 1

    let pointdrawcount = 1
    const pointlistsize = this.points.length

    for (let i = pointlistsize - 2; i >= 0; i--) {
      pointdrawcount++

      // 控制线段的粗细，使达到两头细中间粗的效果
      if (pointdrawcount < 70) {
        linewidth = linewidth2
        linewidth2 += linewidthinc
      } else {
        linewidth = linewidth - linewidth * 2 / (pointlistsize)
      }

      const pos0 = this.node.convertToNodeSpaceAR(this.points[i + 1])
      const pos = this.node.convertToNodeSpaceAR(this.points[i])

      this.ctx.moveTo(pos0.x, pos0.y)
      this.ctx.lineTo(pos.x, pos.y)
      this.ctx.lineWidth = linewidth

      this.ctx.stroke()
    }
  },

  drawLight: function (pos, radius) {
    this.ctx.circle(pos.x, pos.y, radius)
    this.ctx.fill()
  },

  start () {

  },

  update (dt) {
    // 当滑动速度很慢时，不至于很快消失
    if (this.points.length < 30) {
      for (let i = 0; i < 1; i++) {
        if (this.points.length > 0) {
          this.points.shift()
        } else {
          break
        }
      }
    } else {
      for (let i = 0; i < 9; i++) {
        if (this.points.length > 0) {
          this.points.shift()
        } else {
          break
        }
      }

      // 为了使线段不过长
      while (this.points.length > 400) {
        this.points.shift()
      }
    }

    this.ctx.clear()
    const rgb = [this.randomNum(0, 255),
      this.randomNum(0, 200),
      this.randomNum(150, 255)]
    this.ctx.strokeColor = new cc.Color(rgb[0], rgb[1], rgb[2])
    this.drawKnife()
  }
})
