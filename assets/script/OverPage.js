
cc.Class({
    extends: cc.Component,

    properties: {

        scoreLabel:{
            default: null,
            type: cc.Label
        },

        homeButton: {
            default: null,
            type: cc.Button
        },

        againButton: {
            default: null,
            type: cc.Button
        }

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.scoreLabel.string = window.score

        this.homeButton.node.on('click', function (button) {
            cc.director.loadScene('StartPage')
        })

        this.againButton.node.on('click', function (button) {
            cc.director.loadScene('Game')
        })

        window.score = 0
    },

    start () {
        
    },

    // update (dt) {},
});
