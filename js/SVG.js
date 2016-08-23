/**
 * SVG Niceness
 */
var SVG = {
    makeNode: function(tagName, attributes) {
        var svgNode = document.createElementNS('http://www.w3.org/2000/svg', tagName);
        
        // Inject nicer methods for nicer API
        svgNode.setAttributes = function(attributes) {
            for(var attrName in attributes) {
                this.setAttribute(attrName, attributes[attrName]);
            }
        };
        
        if(attributes) {
            svgNode.setAttributes(attributes);
        }
        
        return svgNode;
    }
};