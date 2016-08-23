/**
 * Scale ring visualizer.
 *
 * This class handles the rendering and (eventually) interaction for the Scale
 * wheel visualization. Ideally, this class should be wrapped in another class
 * that offers a more music theory-friendly API (specifying scale roots and such).
 * For now, that sort of thing is outside the scope of this class.
 */
var ScaleRing = function (parent, radius) {
    this.parent = parent; // Parent dom node
    this.domNode = SVG.makeNode('g');
    this.domNode.setAttribute('transform', 'translate(250, 250)');
    
    this.parent.appendChild(this.domNode);
    
    // Ring data
    this._notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    this._highlights = ['true', 'false', 'true', 'false', 'true', 'true', 'false', 'true', 'false', 'true', 'false', 'true', 'false', 'true']
    this._steps = ['1', '#1/b2', '2', '#2/b3', '3', '4', '#4/b5', '5', '#5/b6', '6', '#6/b7', '7'];
    this._displayOrder;
    
    // General display properties
    this._totalSteps = 12;
    this._radius = radius || 200;
    this._clickable = false;
    
    // SVG nodes
    this._outerRing;
    this._innerRing;
    this._lines = [];
    this._segments = [];
    this._segmentBackgrounds = [];
    this._labels = [];
    this._stepLabels = [];
    
    this.initUI();
    this.setDisplayOrder(ScaleRing.CHROMATIC);
};

// A couple of useful constants
ScaleRing.CHROMATIC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
ScaleRing.CIRCLE_OF_5THS = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];

ScaleRing.prototype = {
    initUI: function() {
        this._outerRing = SVG.makeNode('circle');
        this._outerRing.classList.add('outline');
        this._innerRing = SVG.makeNode('circle');
        this._innerRing.classList.add('outline');
        
        for(var i = 0; i < this._totalSteps; ++i) {
            var line = SVG.makeNode('line');
            line.classList.add('outline');
            var segment = SVG.makeNode('g');
            segment.classList.add('segment');
            var segmentBackground = SVG.makeNode('path');
            
            var label = SVG.makeNode('foreignObject', {'width': 60, 'height': 60});
            label.classList.add('label');
            label.classList.add('note-label');
            
            var stepLabel = SVG.makeNode('foreignObject', {'width': 60, 'height': 60});
            stepLabel.classList.add('label');
            stepLabel.classList.add('step-label');
            
            segment.appendChild(segmentBackground);
            segment.appendChild(label)
            segment.appendChild(stepLabel)
            
            this._lines.push(line);
            this._segments.push(segment);
            this._segmentBackgrounds.push(segmentBackground);
            this._labels.push(label);
            this._stepLabels.push(stepLabel);
        }
        
        // Now, add all the segments to the main node
        for(var i = 0; i < this._totalSteps; ++i) {
            this.domNode.appendChild(this._segments[i]);
        }
        
        for(var i = 0; i < this._totalSteps; ++i) {
            this.domNode.appendChild(this._lines[i]);
        }
        
        this.domNode.appendChild(this._innerRing);
        this.domNode.appendChild(this._outerRing);
        
        this.updateUI();
    },
    
    updateUI: function() {
        var r1 = this._radius - 80;
        var r2 = this._radius;
        var r3 = (r1 + r2) / 2; // note label center
        var r4 = r2 + 30; // step label center
        
        this._outerRing.setAttribute('r', this._radius);
        this._innerRing.setAttribute('r', this._radius - 80);
        
        for(var i = 0; i < this._totalSteps; ++i) {
            var startAng = (i - 0.5) * Math.PI / (this._totalSteps / 2);
            var endAng = (i + 0.5) * Math.PI / (this._totalSteps / 2);
            var midAng = i * Math.PI / (this._totalSteps / 2);
            
            var startX = Math.sin(startAng);
            var startY = -Math.cos(startAng);
            var endX = Math.sin(endAng);
            var endY = -Math.cos(endAng);
            
            this._lines[i].setAttributes({'x1': endX * r1, 'y1': endY * r1,
                                          'x2': endX * r2, 'y2': endY * r2});
            
            var desc = 'M ' + (startX * r2) + ' ' + (startY * r2) + ' ';
            desc += 'A ' + r2 + ' ' + r2 + ' 0 0 1 ' + (endX * r2) + ' ' + (endY * r2) + ' ';
            desc += 'L ' + (endX * r1) + ' ' + (endY * r1) + ' ';
            desc += 'A ' + r1 + ' ' + r1 + ' 0 0 0 ' + (startX * r1) + ' ' + (startY * r1) + ' Z';
            this._segmentBackgrounds[i].setAttribute('d', desc);
            
            this._labels[i].setAttributes({'x': Math.sin(midAng) * r3 - 30,
                                           'y': -Math.cos(midAng) * r3 - 30});
            this._stepLabels[i].setAttributes({'x': Math.sin(midAng) * r4 - 30,
                                           'y': -Math.cos(midAng) * r4 - 30});
        }
    },
    
    setPosition: function(x, y) {
        this.domNode.setAttribute('transform', 'translate(' + x + ', ' + y + ')');
    },
    
    /**
     * Set the note labels that correspond to each scale degree.
     * @param  {Array} notes Array of 12 strings, each naming the notes of this
     *                       scale in order.
     */
    setNotes: function(notes) {
        if(notes) {
            this._notes = notes;
        }
        
        for(var i = 0; i < this._totalSteps; ++i) {
            var label = this._notes[this._displayOrder[i]].replace('#', '♯');
            label = label.replace('b', '♭');
            if(label.indexOf('/') !== -1) {
                label = label.replace('/', '<br/>');
                this._labels[i].classList.add('double');
            } else {
                this._labels[i].classList.remove('double');
            }
            
            this._labels[i].innerHTML = label;
        }
    },
    
    setHighlighting: function(highlights) {
        if(highlights) {
            this._highlights = highlights;
        }
        
        for(var i = 0; i < this._totalSteps; ++i) {
            if(this._highlights[this._displayOrder[i]]) {
                this._segments[i].classList.remove('disabled');
            } else {
                this._segments[i].classList.add('disabled');
            }
        }
    },
    
    setSteps: function(steps) {
        if(steps) {
            this._steps = steps;
        }
        
        for(var i = 0; i < this._totalSteps; ++i) {
            var stepLabel = this._steps[this._displayOrder[i]].replace('#', '♯');
            stepLabel = stepLabel.replace('b', '♭');
            if(stepLabel.indexOf('/') !== -1) {
                stepLabel = stepLabel.replace('/', '<br/>');
                this._stepLabels[i].classList.add('double');
            } else {
                this._stepLabels[i].classList.remove('double');
            }
            
            this._stepLabels[i].innerHTML = stepLabel;
        }
    },
    
    /**
     * Specify a mapping of scale degrees to positions around the circle. Two
     * default mappings are ScaleRing.CHROMATIC and ScaleRing.CIRCLE_OF_5THS,
     * but a custom mapping can also be specified.
     * @param  {Array} displayOrder Array of 12 integers, 0 through 11, in the order
     *                              that scale degrees will map to positions in the circle.
     */
    setDisplayOrder: function(displayOrder) {
        this._displayOrder = displayOrder;
        
        this.setNotes();
        this.setSteps();
        this.setHighlighting();
    },
    
    setActiveNote: function(scaleDegree, isActive) {
        for(var i = 0; i < this._totalSteps; ++i) {
            if(this._displayOrder[i] == scaleDegree) {
                if(isActive) {
                    this._segments[i].classList.add('active');
                } else {
                    this._segments[i].classList.remove('active');
                }
            }
        }
    },
};

Object.defineProperty(ScaleRing.prototype, 'clickable', {
    get: function() {
        return this._clickable;
    },
    
    set: function(value) {
        this._clickable = value;
        
        if(this._clickable) {
            this.domNode.classList.add('clickable');
        } else {
            this.domNode.classList.remove('clickable');
        }
    }
});