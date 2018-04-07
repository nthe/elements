const common = require('../common/common');
const utils = require('../utils/utils');
"use strict";

// default configuration of knob/gauge
const DEFAULT_CIRCLE_CONFIG = {
    value: 0.18,
    radius: 120,
    lineWidth: 16,
    startAngle: 180,
    sweepAngle: 360,
    backdropPadding: 4,
    showHandle: true,
    handleRadius: 2,
    handleColor: '#333',
    rangeColor: '#fc1',
    backdropColor: '#330',
    indicatorColor: '#333',
    rounded: true,
};

/**
 * @function toRadians
 * @description convert angle from degrees to radians
 * @param {number} degrees angle in degress
 */
const toRadians = (degrees) => degrees * (Math.PI / 180);

/**
 * @constructor
 * @constructs Circle
 * @description function construction
 * @param {string} id identifier of new element
 * @param {HTMLElement} parent host of new element
 */
const Circle = function (id, parent) {
    return new Circle.init(id, parent);
}

/**
 * @constructor
 * @constructs Circle
 * @description function constructor
 * @param {string} id identifier of new element
 * @param {HTMLElement} parent host of new element
 */
Circle.init = function (id, parent) {

    if (typeof id === 'undefined') {
        throw '(Circle) id is required';
    }

    parent = parent || window.document.body;

    this.id = id;
    this.ctx = null;
    this.element = null;
    this.subscribers = [];

    this.config = Object.assign({}, DEFAULT_CIRCLE_CONFIG);

    this.value = this.config.value;

    // create canvas
    this.element = window.document.createElement("canvas");
    this.element.id = this.id;
    this.ctx = this.element.getContext("2d");
    parent.appendChild(this.element);

    // (re)configure
    this.configure();

    // (pre)render
    this.render();

    // attach listener
    this.activate();
}

Circle.prototype = {

    /**
     * @method render
     * @description (re)render knob/gauge
     * @return {Circle} this
     */
    render: function () {
        // clear
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        let size = this.ctx.canvas.width / 2;
        let angle = toRadians(this.config.sweepAngle) *
            this.value + toRadians(this.config.startAngle);

        // backdrop
        this.ctx.lineWidth = this.config.lineWidth;
        this.ctx.strokeStyle = this.config.backdropColor;
        this.ctx.beginPath();
        this.ctx.arc(
            size,
            size,
            size - (this.config.lineWidth / 2),
            toRadians(this.config.startAngle) - 0.04,
            toRadians((this.config.startAngle + this.config.sweepAngle)) + 0.04
        );
        this.ctx.stroke();

        // value indicator
        this.ctx.lineWidth = this.config.lineWidth - this.config.backdropPadding * 2;
        this.ctx.strokeStyle = this.config.rangeColor;
        this.ctx.beginPath();
        this.ctx.arc(
            size,
            size,
            size - (this.config.lineWidth / 2),
            toRadians(this.config.startAngle),
            angle
        );
        this.ctx.stroke();

        if (this.config.showHandle) {
            this.ctx.beginPath();
            this.ctx.lineWidth = this.config.handleRadius * 2;
            this.ctx.arc(
                size,
                size,
                size - (this.config.lineWidth / 2),
                angle - 0.01,
                angle + 0.01
            );
            this.ctx.strokeStyle = this.config.indicatorColor;
            this.ctx.stroke();
        }

        // trigger callbacks
        // this.onChange(this.value, this);
        this.emit(this.value);
        return this;
    },

    /**
     * @method configure
     * @description update configuration of knob/gauge
     * @param {object} config new (or partial) configuration
     * @returns {Circle} this
     */
    configure: function (config) {
        this.config = Object.assign(this.config, config);
        this.value = this.config.value;
        this.element.width = this.config.radius;
        this.element.height = this.config.radius;
        this.ctx.canvas.width = this.element.clientWidth;
        this.ctx.canvas.height = this.element.clientHeight;
        this.ctx.lineCap = this.config.rounded ? 'round' : 'butt';
        this.render();
        return this;
    },

    /**
     * @method mouseDragHandler
     * @description process mouse drag event
     * @param {MouseEvent} event mouse event
     */
    mouseDragHandler: function (event) {
        event.preventDefault();
        let initY = event.clientY;

        window.onmouseup = (e) => {
            e.preventDefault();
            window.onmouseup = null;
            window.onmousemove = null;
        };

        window.onmousemove = (e) => {
            e.preventDefault();
            // const rect = this.element.getBoundingClientRect();
            // const center = {
            //     x: rect.left + (rect.width / 2),
            //     y: rect.top + (rect.height / 2)
            // };
            
            // const firstLeg = {
            //     x: center.x + 1,
            //     y: center.y
            // };

            // const secondLeg = {
            //     x: e.clientX,
            //     y: e.clientY
            // };

            // const deg = utils.angle(center, firstLeg, secondLeg); 
            // console.log(center, firstLeg, secondLeg, deg);

            if (e.clientY > initY) {
                this.value -= 0.025;
            } else {
                this.value += 0.025;
            }
            initY = e.clientY;
            this.value = this.value >= 1 ? 1 : this.value;
            this.value = this.value <= 0 ? 0 : this.value;
            this.render();
        };
    },

    /**
     * @method setValue
     * @description update value/progress
     * @param {number} value new value
     * @return {Circle} this
     */
    setValue: function (value) {
        this.value = value;
        this.render();
        return this;
    },

    subscribe: common.events.subscribe,
    unsubscribe: common.events.unsubscribe,
    emit: common.events.emit,

    /**
     * @method deactivate
     * @description disable knob/gauge
     * @returns {Circle} this
     */
    deactivate: function () {
        this.element.onmousedown = null;
        return this;
    },

    /**
     * @method activate
     * @description enable knob/gauge
     * @returns {Circle} this
     */
    activate: function () {
        this.element.onmousedown = this.mouseDragHandler.bind(this);
        return this;
    }
};

// configure prototype chain
Circle.init.prototype = Circle.prototype;

// expose api
module.exports = Circle;
