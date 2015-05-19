var draggedEl;
var newId = 0;
var currentObjectDragging;
var dataSourceJson;
var currentModRoot;
var currentModChild;


 
$(document).ready(function(){
    
    $('#btnSaveJson').click(function(){

        if(currentModRoot != null && currentModChild != null)
        {

            for(var i = 0; i < dataSourceJson[currentModRoot][0][currentModChild].atributos.length; i++)
            {
                var currentAttr = dataSourceJson[currentModRoot][0][currentModChild].atributos[i];
                
                var valueInputed = $('#' + currentModChild + '_' +currentAttr.name + '_value').val();
                
                
                dataSourceJson[currentModRoot][0][currentModChild].atributos[i].default = valueInputed;
                
                
            }
            
        }
        
        currentModRoot = null;
        currentModChild = null;
    });
    
    
    
    
    
});

function allowDrop(ev){
    ev.preventDefault();
}

function drag(ev){
    draggedEl = ev.target.cloneNode(true);
    draggedEl.id = draggedEl.id+(newId++);
    draggedEl.ondrop = undefined;
    draggedEl.ondragover = undefined;
    draggedEl.ondragstart = undefined;
    currentObjectDragging = ev.target.id;
}

function drop(ev){
    ev.preventDefault();

    var el = ev.target;

    //if you inccidently drop the element inside an element which is inside the drop box,
    // navigate up to the drop box inorder to append
    if(el.id != "dashboardMain"){
        while(el.id!= "dashboardMain"){
            if(el.nodeName == "BODY") 
                alert("could not drop element!!");
            
            el = el.parentElement;
        }
    }
    
    evt = ev || window.event; 
    var mousePos = mouseCoords(evt);
    
    readJSon(currentObjectDragging, mousePos);
    currentObjectDragging = null;
}

function mouseCoords(ev){
    var x,y = 0;
    if(ev.pageX || ev.pageY){
        return {x:ev.clientX - 310 , y:ev.clientY - 150}; 
    }
    return {
        x:ev.clientX + document.body.scrollLeft - document.body.clientLeft, 
        y:ev.clientY + document.body.scrollTop  - document.body.clientTop 
    }; 
} 

function readJSon(currentObjectDragging, mousePos){

    var id = currentObjectDragging.split("|");
    var moduloRoot = id[0];
    var moduloChild = id[1];
    var HTML_FILE_URL = './json/json.txt';
    
    
    
    
    if (moduloChild != null && moduloRoot != null) {
        $.get(HTML_FILE_URL, function(data){

            var obj = jQuery.parseJSON(data);
            
            if(dataSourceJson == null)
                dataSourceJson = obj;
            else
                obj = dataSourceJson;
            
            var name = obj[moduloRoot][0][moduloChild].name;
            var entrada = obj[moduloRoot][0][moduloChild].entradas;
            var saidas = obj[moduloRoot][0][moduloChild].saidas;
            var atributos = obj[moduloRoot][0][moduloChild].atributos;
            
            createModel(name, moduloRoot, moduloChild, entrada.length, saidas.length, mousePos.x, mousePos.y);
        });
    }
}

function createAttributes(atributos, moduloChild)
{
    
    $('#here_table').html("");
    
    var $table = $('<table width="100%" border="1" id="' + moduloChild + '_table" class="table_atributes" />');
    $table.append( '<tr><td>Atributo</td><td>Tipo</td><td>Valor</td></tr>' );


    for(var i = 0; i < atributos.length; i++)
    {
        $table.append( '<tr><td>' + atributos[i].name  + '</td><td>' + atributos[i].type + '</td><td><input type="text" id="'+ moduloChild+'_'+ atributos[i].name +'_value" value="'+ atributos[i].default +'" width="100%"/></td></tr>' );
        
    }
    
    $('#here_table').append($table);
    
    

    
    
}

function createModel(name, moduloRoot, moduloChild, entrada, saida, x, y) {
    //var x = 0;
    //var y = 0;
    var inPorts2 = [entrada];
    var outPorts2 = [saida];
    
    if (entrada == 0){
        inPorts2 = null;
    }
    else{
        for(var i=0; i < entrada; i++){
            var portName = "in" + (i+1).toString();
            inPorts2[i] = portName;
        }
    }
    
    if (moduloRoot === 'modulo_tipo_a'){
        var color = '#0000FF';
    }
    else if (moduloRoot === 'modulo_tipo_b'){
            var color = '#778899';
        }
        else if (moduloRoot === 'modulo_tipo_c'){
                var color = '#FF4500';
            }
            else if (moduloRoot === 'modulo_tipo_d'){
                    var color = '#2ECC71';
                }
              
    if (saida == 0){
        outPorts2 = null;
    }
    else{                  
        for(var i=0; i < saida; i++){
            var portName = "out" + (i+1).toString();
            outPorts2[i] = portName;
        }
    }

    var m2 = new joint.shapes.devs.Model({
        position: { x: x, y: y },
        size: { width: 130, height: 100 },
        inPorts: inPorts2,
        outPorts: outPorts2,
        attrs: {
            '.label': { text: name, 'ref-x': .4, 'ref-y': .2 },
            rect: { fill: color },
            '.inPorts circle': { fill: '#16A085', magnet: 'passive', type: 'input' },
            '.outPorts circle': { fill: '#E74C3C', type: 'output' }
        }
    });

    //graph.addCell(m2);
    
      // Create a custom element.
    // ------------------------
    joint.shapes.html = {};
    joint.shapes.html.Element = joint.shapes.basic.Generic.extend(_.extend({}, joint.shapes.basic.PortsModelInterface, {
        markup: '<g class="rotatable"><g class="scalable"><rect/></g><g class="inPorts"/><g class="outPorts"/></g>',
        portMarkup: '<g class="port<%= id %>"><circle/></g>',
        defaults: joint.util.deepSupplement({
            type: 'html.Element',
            size: { width: 130, height: 100 },
            inPorts: [],
            outPorts: [],
            attrs: {
                '.': { magnet: false },
                rect: {
                    stroke: 'none', 'fill-opacity': 0, width: 150, height: 250,
                },
                circle: {
                    r: 6, //circle radius
                    magnet: true,
                    stroke: 'black'
                },

                 '.inPorts circle': { fill: '#16A085', magnet: 'passive', type: 'input' },
                '.outPorts circle': { fill: '#E74C3C', type: 'output' }
            
            }
        }, joint.shapes.basic.Generic.prototype.defaults),
        getPortAttrs: function (portName, index, total, selector, type) {

            var attrs = {};
            var portClass = 'port' + index;
            var portSelector = selector + '>.' + portClass;
            var portCircleSelector = portSelector + '>circle';
            attrs[portCircleSelector] = { port: { id: portName || _.uniqueId(type), type: type } };
            attrs[portSelector] = { ref: 'rect', 'ref-y': (index + 0.5) * (1 / total) };
            if (selector === '.outPorts') { attrs[portSelector]['ref-dx'] = 0; }
            return attrs;
        }
    }));


   // Create a custom view for that element that displays an HTML div above it.
   // -------------------------------------------------------------------------

    joint.shapes.html.ElementView = joint.dia.ElementView.extend({

        template: [
            '<div class="html-element">',
            '<button class="delete">x</button>',
            '<button id="'+ moduloChild + '" idpai="' + moduloRoot + '" type="button" data-toggle="modal" data-target="#exampleModal">Me Clica!</button>',
            '</div>'
        ].join(''),

    initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);

        this.$box = $(_.template(this.template)());
        // Prevent paper from handling pointerdown.
        this.$box.find('input,select').on('mousedown click', function(evt) { evt.stopPropagation(); });
        this.$box.find('button').on('click', function(evt) { 
            
            
            var HTML_FILE_URL = './json/json.txt';
    
                var button = this;
                
                
                currentModChild = this.id;
                currentModRoot = $(this).attr("idpai");

                $.get(HTML_FILE_URL, function(data){
        
                    var obj = dataSourceJson
                    var atributos = obj[$(button).attr("idpai")][0][button.id].atributos;
                    
                    createAttributes(atributos, button.id);
                });
            });

       
        this.$box.find('.delete').on('click', _.bind(this.model.remove, this.model));
        // Update the box position whenever the underlying model changes.
        this.model.on('change', this.updateBox, this);
        // Remove the box when the model gets removed from the graph.
        this.model.on('remove', this.removeBox, this);

        this.updateBox();

        this.listenTo(this.model, 'process:ports', this.update);
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
    },


     render: function() {
        joint.dia.ElementView.prototype.render.apply(this, arguments);
        this.paper.$el.prepend(this.$box);
        // this.paper.$el.mousemove(this.onMouseMove.bind(this)), this.paper.$el.mouseup(this.onMouseUp.bind(this));
        this.updateBox();
        return this;
    },

    renderPorts: function () {
        var $inPorts = this.$('.inPorts').empty();
        var $outPorts = this.$('.outPorts').empty();

        var portTemplate = _.template(this.model.portMarkup);

        _.each(_.filter(this.model.ports, function (p) { return p.type === 'in' }), function (port, index) {

            $inPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
        _.each(_.filter(this.model.ports, function (p) { return p.type === 'out' }), function (port, index) {

            $outPorts.append(V(portTemplate({ id: index, port: port })).node);
        });
    }, 

    update: function () {

        // First render ports so that `attrs` can be applied to those newly created DOM elements
        // in `ElementView.prototype.update()`.
        this.renderPorts();
        joint.dia.ElementView.prototype.update.apply(this, arguments);
    },

    updateBox: function() {
                // Set the position and dimension of the box so that it covers the JointJS element.
                var bbox = this.model.getBBox();
                // Example of updating the HTML with a data stored in the cell model.
                // paper.on('blank:pointerdown', function(evt, x, y) { this.$box.find('textarea').toBack(); });
                this.$box.find('span').text(this.model.get('textarea'));
                this.model.on('cell:pointerclick', function(evt, x, y) { this.$box.find('textarea').toFront(); });
                this.$box.css({ width: bbox.width, height: bbox.height, left: bbox.x, top: bbox.y, transform: 'rotate(' + (this.model.get('angle') || 0) + 'deg)' });
            },
            removeBox: function(evt) {
                this.$box.remove();
            }
        }); 
        
        
        // Create JointJS elements and add them to the graph as usual.
        // -----------------------------------------------------------
        
        var el1 = new joint.shapes.html.Element({ 
            position: { x: x, y: y }, 
            size: { width: 130, height: 100 },
            inPorts: inPorts2,
            outPorts: outPorts2
          });
        
        
        graph.addCell(el1);

}
