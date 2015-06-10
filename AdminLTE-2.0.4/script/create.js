var draggedEl;
var newId = 0;
var currentObjectDragging;
var dataSourceJson;
var currentModRoot;
var currentModChild;
var currentIdJson;
var jsonToSave;
var currentObjId;
var linkToJson;
var PositionToJson;



 
$(document).ready(function(){
	
	$("#export").hide();
    
    $('#btnSaveJson').click(function(){
        
        if(currentModRoot != null && currentModChild != null)
        {
            var jsonObj = findObjectInJson(currentIdJson);
            
            for(var i = 0; i < jsonObj.atributos.length; i++)
            {
                var currentAttr = jsonObj.atributos[i];
				
				if(currentAttr.type == 'bool'){
					
					var radioValues = document.getElementsByName('bool');
				    var i = 0;
				    for(i; i<radioValues.length; i++){
					   if(radioValues[i].checked){
						  var valueInputed = radioValues[i].value;
						  break;
					   }
				    }
				}
                else{
					var valueInputed = $('#' + currentModChild + '_' +currentAttr.name + '_value').val();
				}
                
                jsonObj.atributos[i].default = valueInputed;
        
            }
            
        }
        
        currentModRoot = null;
        currentModChild = null;
        currentIdJson = null;
    });
	    
    $('#btnCancelEdit').click(function(){
        
        currentModRoot = null;
        currentModChild = null;
        currentIdJson = null;
        
        
    });
    
    $('#btnSave').bind('click', function(){

		var data = "";
		
		for(var i = jsonToSave.length; i--;) {
			for (var x = jsonToSave[i].links.length; x--;){
			   jsonToSave[i].links.splice(i, 1);
			}
		}
        
        if(typeof jsonToSave !== 'undefined' && jsonToSave.length > 0){
			
			var allLinks = graph.getLinks();
			var allCells = graph.getElements();
			
			for (var x = 0; x< allLinks.length; x++)
			{
				linkToJson = allLinks[x].toJSON();
				//alert(linkToJson.source.id);
				//alert(linkToJson.target.id);
				//alert(linkToJson.source.port);
				//alert(linkToJson.target.port);
				
				createLinkInJson(linkToJson.source.id, linkToJson.target.id, linkToJson.source.port, linkToJson.target.port);
			}
			
			for (var x = 0; x< allCells.length; x++)
			{
				
				PositionToJson = allCells[x].toJSON();
				if(PositionToJson.type === 'html.Element'){
					
					newPosition(PositionToJson.position.x, PositionToJson.position.y, PositionToJson.id);
					//alert (PositionToJson.position.x);
					//alert (PositionToJson.position.y);
					//alert (PositionToJson.id);
				}
			}
			var data = data + '{ "model":[';
			for(var i =0; i < jsonToSave.length; i++)
			{
				if (i != jsonToSave.length-1){
					var obj = jsonToSave[i];
					data = data + JSON.stringify(obj) + ',';
				}
				else{
					var obj = jsonToSave[i];
					data = data + JSON.stringify(obj);
				}
				//alert(JSON.stringify(obj));	
			}
			data = data + ']}';
			
			//var jsonString = graph.getElements();
			//alert (JSON.stringify(jsonString));
		}
		
		allLinks = null;
		linkToJson = null;
		
		$("#export").attr('download','jsonSaida.txt');
		$("#export").attr('href', 'data:application/x-json;base64,' + btoa(data)).show();
    });
	
});

function findObjectInJson(idToFind)
{
    
    if(jsonToSave != null)
    {
       for(var j =0; j < jsonToSave.length; j++)
        {
            var jsonObj = jsonToSave[j];
            if(idToFind == jsonObj.idValue)
            {
                
                return jsonObj;
                
            }
        } 
    }
}

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
            
            var name = obj[moduloRoot][0][moduloChild].name;
            var entrada = obj[moduloRoot][0][moduloChild].entradas;
            var saidas = obj[moduloRoot][0][moduloChild].saidas;
            var atributos = obj[moduloRoot][0][moduloChild].atributos;
            
            var currentObject = obj[moduloRoot][0][moduloChild];
            
            currentObject.posX = mousePos.x;
            currentObject.posY = mousePos.y;
            currentObject.links = new Array();
            
            if(currentObjId == null)
                currentObjId = 1;
            else
                currentObjId++
                
            currentObject.idValue = "obj_" + currentObjId;
            
            
            if(jsonToSave == null)
                jsonToSave = new Array();
            
            jsonToSave.push(currentObject);
            
            createModel(name, moduloRoot, moduloChild, entrada.length, saidas.length, mousePos.x, mousePos.y, currentObject.idValue);
        });
    }
}

function createAttributes(atributos, moduloChild)
{
    
    $('#here_table').html("");
    
    var $table = $('<table width="100%" border="1px" id="' + moduloChild + '_table" class="table_atributes" />');
    $table.append( '<tr><th>Atributo</th><th>Tipo</th><th>Valor</th></tr>' );


    for(var i = 0; i < atributos.length; i++)
    {
		
		if( atributos[i].type == 'bool'){
			if(atributos[i].default == 'false'){
				$table.append( '<tr><td align="center">' + atributos[i].name  + '</td><td align="center">' + atributos[i].type + '</td><td align="center"><input type="radio" name="bool" value="false" checked> ' + atributos[i].default + ' <input type="radio" name="bool" value="true"> true </td></tr>' );
			}else{
				$table.append( '<tr><td align="center">' + atributos[i].name  + '</td><td align="center">' + atributos[i].type + '</td><td align="center"><input type="radio" name="bool" value="true" checked> ' + atributos[i].default + ' <input type="radio" name="bool" value="false"> false </td></tr>' );
			}
		}
		else{
			$table.append( '<tr><td align="center">' + atributos[i].name  + '</td><td align="center">' + atributos[i].type + '</td><td align="center"><input type="text" id="'+ moduloChild+'_'+ atributos[i].name +'_value" value="'+ atributos[i].default +'" width="100%"/></td></tr>' );
        }
    }
    
    $('#here_table').append($table);
	
}

function createModel(name, moduloRoot, moduloChild, entrada, saida, x, y, objectId) {
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
        var element = 'html-element';
    }
    else if (moduloRoot === 'modulo_tipo_b'){
            var element = 'html-element2';
        }
        else if (moduloRoot === 'modulo_tipo_c'){
                var element = 'html-element3';
            }
            else if (moduloRoot === 'modulo_tipo_d'){
                    var element = 'html-element4';
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
            '<div class="'+element+'">',
			'<button id="btnDelete"'+'" idInJson="' + objectId +'" class="delete">x</button>',
			'<label></label>',
            '<br/>',
			'<br/>',
            '<button id="'+ moduloChild + '" idpai="' + moduloRoot + '" idInJson="' + objectId + '" type="button" data-toggle="modal" data-target="#exampleModal">Parameters</button>',
			'</div>'
        ].join(''),

    initialize: function() {
        _.bindAll(this, 'updateBox');
        joint.dia.ElementView.prototype.initialize.apply(this, arguments);
		
        this.$box = $(_.template(this.template)());
        // Prevent paper from handling pointerdown.
        this.$box.find('input,select').on('mousedown click', function(evt) { evt.stopPropagation(); });
        this.$box.find('button').on('click', function(evt) { 
            
			
			if(this.id == "btnDelete")
			{
				currentIdJson = $(this).attr("idInJson");
				removeToJson(currentIdJson);
			}
			else{
            
				var HTML_FILE_URL = './json/json.txt';
		
					var button = this;
					
					currentModChild = $(this).attr("id");
					currentModRoot = $(this).attr("idpai");
					currentIdJson = $(this).attr("idInJson");
					
					$.get(HTML_FILE_URL, function(data){
			
						var objToFind = findObjectInJson(currentIdJson);

						createAttributes(objToFind.atributos, button.id);
					});
			}
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
				this.$box.find('label').text(this.model.get('label'));
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
			label: moduloChild,
            inPorts: inPorts2,
            outPorts: outPorts2
          });
        
        setJointIdToJson(el1.id);
        graph.addCell(el1);

}

function setJointIdToJson(id)
{
    var i = jsonToSave.length;
    
    jsonToSave[i - 1].jointId = id;
}

function removeToJson(currentIdJson) 
{
      for(var i =  jsonToSave.length; i--;) {
          if( jsonToSave[i].idValue === currentIdJson) {
               jsonToSave.splice(i, 1);
          }
      }
}

function createLinkInJson(sourceId, targetId, sourcePort, targetPort){
	
	for(var i =  jsonToSave.length; i--;) {
          if( jsonToSave[i].jointId === targetId) {
			  
              var target = jsonToSave[i].idValue;
          }
      }
	
	for(var i =  jsonToSave.length; i--;) {
          if( jsonToSave[i].jointId === sourceId) {
			  
			  var text = '{ "targetId":"'+target+'" , "saida":"'+sourcePort+'" , "entrada":"'+targetPort+'" }';
			  var obj = JSON.parse(text);
			  jsonToSave[i].links[jsonToSave[i].links.length] = obj;
			  
          }
      }
}

function newPosition(posX, posY, elementId){
	
	for(var i =  jsonToSave.length; i--;) {
          if( jsonToSave[i].jointId === elementId) {
			  
              jsonToSave[i].posX = posX;
			  jsonToSave[i].posY = posY;
			  
          }
      }	
}
