/**
 * Piano roll visualizer
 */
var PianoRoll = function (parent, width, height) {
    this.parent = parent; // Parent dom node
    this.domNode = SVG.makeNode('g');
    
    this._width = width;
    this._height = height;
    
    this.parent.appendChild(this.domNode);
    
    // Info about the range of the viewport
    this._firstTrack;
    this._totalTracks;
    
    this._totalMeasures;
    this._beatsPerMeasure = 4;
    
    // SVG elements for basic
    this._trackContainer = SVG.makeNode('g');
    this.domNode.appendChild(this._trackContainer);
    this._divisionContainer = SVG.makeNode('g');
    this.domNode.appendChild(this._divisionContainer);
    
    this._tracks = [];
    this._divisions = [];
    
    this._notes = [];
    
    // Set default layout
    this.setRange(0, 4);
    this.setDuration(2);
};

PianoRoll.prototype = {
    setRange: function(firstTrack, lastTrack) {
        this._firstTrack = firstTrack;
        this._totalTracks = lastTrack - firstTrack + 1;
        
        while(this._tracks.length > this._totalTracks) {
            var oldTrack = this._tracks.pop();
            this._trackContainer.removeChild(oldTrack);
        }
        
        while(this._tracks.length < this._totalTracks) {
            var newTrack = SVG.makeNode('rect');
            newTrack.classList.add('piano-track');
            newTrack.classList.add(this._tracks.length % 2 == 0 ? 'even' : 'odd');
            this._tracks.push(newTrack);
            this._trackContainer.appendChild(newTrack);
        }
        
        this._layOutRange();
    },
    
    _layOutRange: function() {
        var trackHeight = this._height / this._totalTracks;
        
        for(var i = 0; i < this._tracks.length; ++i) {
            this._tracks[i].setAttributes({x: 0, y: this._height - (i + 1) * trackHeight, width: this._width, height: trackHeight})
        }
    },
    
    setDuration: function(totalMeasures) {
        this._totalMeasures = totalMeasures;
        
        var totalDivisions = this._totalMeasures * this._beatsPerMeasure;
        
        while(this._divisions.length > totalDivisions) {
            var oldDivision = this._divisions.pop();
            this._divisionContainer.removeChild(oldDivision);
        }
        
        while(this._divisions.length < totalDivisions) {
            var newDivision = SVG.makeNode('line');
            this._divisions.push(newDivision);
            this._divisionContainer.appendChild(newDivision);
        }
        
        this._layOutDuration();
    },
    
    _layOutDuration: function() {
        var divWidth = this._width / (this._totalMeasures * this._beatsPerMeasure);
        
        for(var i = 0; i < this._divisions.length; ++i) {
            if(i % this._beatsPerMeasure == 0) {
                this._divisions[i].classList.add('measure-marker');
                var nudge = 2;
            } else {
                this._divisions[i].classList.add('beat-marker');
                nudge = 1;
            }
            this._divisions[i].setAttributes({x1: i * divWidth + nudge, y1: 0, x2: i * divWidth + nudge, y2: this._height})
        }
    },
    
    setNotes: function(track) {
        for(var i = 0; i < track.notes.length; ++i) {
            var noteOn = track.notes[i];
            var noteOff = track.noteOffs[i];
            
            var note = {};
            note.start = noteOn.ticks / 480;
            note.duration = (noteOff.ticks - noteOn.ticks) / 480;
            note.midi = noteOn.midi;
            
            note.node = SVG.makeNode('rect');
            this.domNode.appendChild(note.node);
            
            this._notes.push(note);
        }
        
        this._layOutNotes();
    },
    
    _layOutNotes: function() {
        var trackHeight = this._height / this._totalTracks;
        var divWidth = this._width / (this._totalMeasures * this._beatsPerMeasure);
        
        for(var i = 0; i < this._notes.length; ++i) {
            var note = this._notes[i];
            var notePosition = note.midi - this._firstTrack + 1;
            
            note.node.setAttributes({x: divWidth * note.start,
                                     y: this._height - notePosition * trackHeight,
                                     width: divWidth * note.duration, height: trackHeight});
        }
    },
    
    setActiveNote: function(noteIndex, isActive) {
        if(isActive) {
            this._notes[noteIndex].node.classList.add('active');
        } else {
            this._notes[noteIndex].node.classList.remove('active');
        }
    }
};