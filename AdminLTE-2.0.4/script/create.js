var draggedEl;
var newId = 0;
var currentObjectDragging;

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
        return {x:ev.clientX - 340 , y:ev.clientY - 200}; 
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
            
            createModel(name, moduloRoot, entrada.length, saidas.length, mousePos.x, mousePos.y);
        });
    }
}

function createModel(name, moduloRoot, entrada, saida, x, y) {
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
        size: { width: 200, height: 180 },
        inPorts: inPorts2,
        outPorts: outPorts2,
        attrs: {
            '.label': { text: name, 'ref-x': .4, 'ref-y': .2 },
            rect: { fill: color },
            '.inPorts circle': { fill: '#16A085', magnet: 'passive', type: 'input' },
            '.outPorts circle': { fill: '#E74C3C', type: 'output' }
        }
    });

    graph.addCell(m2);

}
