var knob = (function (global) {

    // default configuration of knob/gauge
    const DEFAULT_CONFIG = {
        value: 0.5,
        radius: 120,
        fontSize: 24,
        lineWidth: 10,
        fontFamily: 'segoe ui',
        rangeStrokeColor: '#0af',
        indicatorStrokeColor: '#fc1',
        backdropStrokeColor: '#424242'
    };

    /**
     * @constructor
     * @constructs Knob
     * @description function construction
     * @param {string} id identifier of new element
     * @param {HTMLElement} parent host of new element
     */
    const Knob = function (id, parent) {
        return new Knob.init(id, parent);
    }

    /**
     * @constructor
     * @constructs Knob
     * @description function constructor
     * @param {string} id identifier of new element
     * @param {HTMLElement} parent host of new element
     */
    Knob.init = function(id, parent) {
        this.id = id;
        this.ctx = null;
        this.element = null;
        this.displayValue = null;

        // copy config
        this.config = { 
            ... DEFAULT_CONFIG
        };
        this.value = this.config.value;

        // create canvas
        this.element = global.document.createElement("canvas");
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

    Knob.prototype = {

        /**
         * @method render
         * @description (re)render knob/gauge
         * @return {Knob} this
         */
        render: function () {       
            // clear
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            
            let size = this.ctx.canvas.width / 2;
            let angle = (2 * Math.PI) * this.value + Math.PI / 2;
            
            // display text
            this.ctx.font = `${this.config.fontSize}px ${this.config.fontFamily}`;
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(
                this.displayFunction().toFixed(0), 
                size, 
                size
            );
            
            // backdrop
            this.ctx.lineWidth = this.config.lineWidth;
            this.ctx.strokeStyle = this.config.backdropStrokeColor;
            this.ctx.beginPath();
            this.ctx.arc(size, size, size - (this.config.lineWidth / 2), 0, 2 * Math.PI);
            this.ctx.stroke();

            // value indicator
            this.ctx.lineWidth = this.config.lineWidth - 4;
            this.ctx.strokeStyle = this.config.rangeStrokeColor;
            this.ctx.beginPath();
            this.ctx.arc(size, size, size - (this.config.lineWidth / 2), Math.PI / 2, angle);
            this.ctx.stroke();

            this.ctx.lineWidth = this.config.lineWidth - 4;
            this.ctx.strokeStyle = this.config.indicatorStrokeColor;
            this.ctx.beginPath();
            this.ctx.arc(size, size, size - (this.config.lineWidth / 2), angle - 0.05, angle + 0.05);
            this.ctx.stroke();

            // trigger callbacks
            this.onChange(this.value, this.displayValue, this);

            return this;
        },

        /**
         * @method configure
         * @description update configuration of knob/gauge
         * @param {object} config new (or partial) configuration
         * @returns {Knob} this
         */
        configure: function (config) {
            this.config = { 
                ... this.config,
                ... config
            };
            this.value = this.config.value;
            this.element.width = this.config.radius;
            this.element.height = this.config.radius;
            this.ctx.canvas.width = this.element.clientWidth;
            this.ctx.canvas.height = this.element.clientHeight;
            this.render();
            return this;
        },

        /**
         * @method displayFunction
         * @description function between internal and display value
         * @returns {string} display value
         */
        displayFunction: function () {
            this.displayValue = Math.pow(this.value * 10, 2);
            return this.displayValue;
        },

        /**
         * @method mouseDragHandler
         * @description process mouse drag event
         * @param {MouseEvent} event mouse event
         */
        mouseDragHandler: function (event) {
            event = event || global.event;
            
            let initX = event.clientX;
            let initY = event.clientY;

            global.document.onmouseup = (e) => {
                global.document.onmouseup = null;
                global.document.onmousemove = null;
            };
            
            global.document.onmousemove = (e) => {
                if (e.clientY > initY) {
                    this.value -= 0.025;
                } else {
                    this.value += 0.025;
                }
                initY = e.clientY;
                initX = e.clientX;
                this.value = this.value >= 1 ? 1 : this.value;
                this.value = this.value <= 0 ? 0 : this.value;
                this.render();
            };      
        },

        /**
         * @method setValue
         * @description update value/progress
         * @param {number} value new value
         * @return {Knob} this
         */
        setValue: function (value) {
            this.value = value;
            this.render();
            return this;
        },

        /**
         * @method onChange
         * @description called with value changed
         * @param {number} value current value
         * @param {string} displayValue display value
         * @param {Knob} self this
         */
        onChange: ((value, displayValue, self) => {}),

        /**
         * @method deactivate
         * @description disable knob/gauge
         * @returns {Knob} this
         */
        deactivate: function () {
            this.element.onmousedown = null;
            return this;
        },

        /**
         * @method activate
         * @description enable knob/gauge
         * @returns {Knob} this
         */
        activate: function () {
            this.element.onmousedown = this.mouseDragHandler.bind(this);
            return this;
        }
    };

    // configure prototype chain
    Knob.init.prototype = Knob.prototype;

    // expose api
    global.Knob = Knob;

})


// auto-init in browser env
if (typeof exports === 'undefined') {
    knob(window);
} 
// manual load in node env (mock window)
else {
    function load (window) {
        knob(window);
    }
    exports.KnobMock = load;    
}