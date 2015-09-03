//Como sugestão, dividir esse script em outros scripts conforme as funções para que fiquem mais fáceis de encontrar. 
//Em um único arquivo fica confuso e as vezes sem sentido.
//para cada script novo, não esquecer de incluí-lo na pagina index.html

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


 //Uma página não pode ser manipulada com segurança enquanto o documento não estiver pronto.
$(document).ready(function(){
	
	//Esconde o link que aparece no canto inferior direito para fazer o download
	$("#export").hide();
    //Função que define ações sobre o botão salvar da window modal que abre após clicar no botão parameters de um módulo
    $('#btnSaveJson').click(function(){
		
        var jsonObj;
		var currentAttr;
		var valueInputed;
		//verifica se existe o tipo (root) e qual módulo (child) corrente está sendo trabalhado.
        if(currentModRoot != null && currentModChild != null){
			//chama a função findObjectInJson contida no arquivo create.js que retorna um objeto contendo os parametros salvos no JSON de saída.
            jsonObj = findObjectInJson(currentIdJson);
            //percorre os atributos do objeto retornado
            for(var i = 0; i < jsonObj.atributos.length; i++){
                currentAttr = jsonObj.atributos[i];
				//faz o tratamento para o caso do tipo do atributo ser 'bool'. Pois nesse caso é utilizado um radio e não um box de string.
				if(currentAttr.type == 'bool'){	
					var radioValues = document.getElementsByName('radioBoolValues');
				    for(x = 0; x<radioValues.length; x++){
					   if(radioValues[x].checked){
						  valueInputed = radioValues[x].value;
						  break;
					   }
				    }
				}else{//Tratamento para os casos que são apenas string em um box. 
					valueInputed = $('#' + currentModChild + '_' +currentAttr.name + '_value').val();		
					/* Não foi tratado nada para garantir que um float seja composto de um número ponto outro número (ex: 1.0).
					   Não foi tratado nada para garantir que float e int possam conter apenas valores numéricos. ele aceita qualquer string.
					   Não foi implementado nada em relação aos tipos file e dir.
					*/
				}
                //atualiza os valores default dos atributos para os novos valores.
                jsonObj.atributos[i].default = valueInputed;
            }
        }
        
        currentModRoot = null;
        currentModChild = null;
        currentIdJson = null;
    });
	
	//Função que define a ação sobre o botão close da window modal que abre após clicar no botão parameters de um módulo
    $('#btnCancelEdit').click(function(){
        currentModRoot = null;
        currentModChild = null;
        currentIdJson = null;
    });
    
	//Função que define a ação que ocorre ao clicar no botão salvar que serve para salvar um projeto na máquina local do usuário.
    $('#btnSave').bind('click', function(){

		var data = "";
		
		//percorre a variável jsonToSave que contém os módulos e seus dados que serão guardados no arquivo de saída (configuração do projeto).
		for(var i = jsonToSave.length; i--;) {
			//percorre a variável que contém os links do módulo
			for (var x = jsonToSave[i].links.length; x--;){
				// dar uma olhada nesse link para entender o funcionamento da função splice: http://www.w3schools.com/jsref/jsref_splice.asp
			   jsonToSave[i].links.splice(i, 1);
			}
		}
        
		//verifica a existência de dados na variável jsonToSave
        if(typeof jsonToSave !== 'undefined' && jsonToSave.length > 0){
			
			//recebe todos os links que são apresentados no projeto
			var allLinks = graph.getLinks();
			//recebe todos os elementos do projeto
			var allCells = graph.getElements();
			
			//percorre todos os links contidos no projeto
			for (var x = 0; x< allLinks.length; x++){
				linkToJson = allLinks[x].toJSON();
				//chama a função createLinkInJson para inserir na variável jsonToSave os dados atualizados referentes ao link. 
				//(id do módulo de saída, id do módulo de entrada, porta de saída, porta de entrada).
				createLinkInJson(linkToJson.source.id, linkToJson.target.id, linkToJson.source.port, linkToJson.target.port);
			}
			
			//percorre todos os elementos contidos no projeto
			for (var x = 0; x< allCells.length; x++){
				PositionToJson = allCells[x].toJSON();
				//verifica se o tipo do elemento é um módulo
				if(PositionToJson.type === 'html.Element'){
					//chama a função newPosition que atualiza os valores x e y da posição dos módulos antes de exportar o projeto.
					newPosition(PositionToJson.position.x, PositionToJson.position.y, PositionToJson.id);
				}
			}
			
			// Início - Formatação dos dados no arquivo de saída.
			var data = data + '{ "model":[';
			
			for(var i =0; i < jsonToSave.length; i++){
				if (i != jsonToSave.length-1){
					var obj = jsonToSave[i];
					data = data + JSON.stringify(obj) + ',';
				}
				else{
					var obj = jsonToSave[i];
					data = data + JSON.stringify(obj);
				}
			}		
			data = data + ']}';
			//Fim - Formatação dos dados no arquivo de saída.
		}
		
		allLinks = null;
		linkToJson = null;
		
		//Faz com que o link fique visível e que ao clicar no mesmo realize o download da configuração do projeto para a máquina local do usuário.
		$("#export").attr('download','jsonSaida.txt');
		$("#export").attr('href', 'data:application/x-json;base64,' + btoa(data)).show();
    });
});

//Função para encontrar na variável jsonToSave o objeto com o ID especificado na chamada da função e retornar os dados do mesmo em um objeto.
function findObjectInJson(idToFind){
    
	//verifica se a variável existe
    if(jsonToSave != null){
		//percorre a variável elemento a elemento
		for(var j =0; j < jsonToSave.length; j++){
            
			var jsonObj = jsonToSave[j];
			//verifica se o ID é o mesmo
            if(idToFind == jsonObj.idValue){
				//Se for o mesmo retorna o objeto.
                return jsonObj;
            }
        } 
    }
}

//Função que permite que um elemento seja solto durante o evento drag and drop (arrastar e soltar).
function allowDrop(ev){
	//Função que previne que o elemento arrastado execute a sua ação default ao ser clicado.
    ev.preventDefault();
}

//Função para arrastar (drag) o elemento.
function drag(ev){
	//faz um clone do elemento que está sendo arrastado
    draggedEl = ev.target.cloneNode(true);
    draggedEl.id = draggedEl.id+(newId++);
	//define as propriedades ondrop, ondragover e ondragstart como undefined
    draggedEl.ondrop = undefined;
    draggedEl.ondragover = undefined;
    draggedEl.ondragstart = undefined;
	//atribui o valor do ID do elemento (módulo) que está sendo arrastado para a variedade currentObjectDragging
    currentObjectDragging = ev.target.id;
}

//Função que permite que o módulo seja solto (drop) após ser arrastado (drag)
function drop(ev){
	
	//Função que previne que o elemento arrastado execute a sua ação default ao ser solto.
    ev.preventDefault();
    var el = ev.target;

    //if you inccidently drop the element inside an element which is inside the drop box,
    //navigate up to the drop box inorder to append
    if(el.id != "dashboardMain"){
        while(el.id!= "dashboardMain"){
            if(el.nodeName == "BODY"){
                alert("could not drop element!!");
            }
            el = el.parentElement;
        }
    }
    
	//atribui o valor do evento passado na função, ou do evento que acontece na janela do usuário para a variável evt
    evt = ev || window.event;
	//recebe o valor das coordenadas do mouse na janela através da função mouseCoords
    var mousePos = mouseCoords(evt);
    //Função para fazer a leitura do JSON (json.txt) com os dados de cada módulo e assim poder criar a representação grafica correta do elemento solto.
    readJSon(currentObjectDragging, mousePos);
    currentObjectDragging = null;
}

//Função para recuperar as coordenadas X e Y do mouse na tela.
function mouseCoords(ev){
    var x,y = 0;
	//Verifica se existe algum valor X ou Y através do evento recebido na chamada da função
    if(ev.pageX || ev.pageY){
		//atribui e retorna os valores para as variáveis x e y.
        return {x:ev.clientX - 310 , y:ev.clientY - 150}; 
    }
	//atribui e retorna os valores x e y utilizando outra logica. 
    return {
        x:ev.clientX + document.body.scrollLeft - document.body.clientLeft, 
        y:ev.clientY + document.body.scrollTop  - document.body.clientTop 
    }; 
} 

//Função para fazer a leitura do JSON (json.txt) com os dados de cada módulo e assim poder criar a representação grafica correta do elemento solto.
function readJSon(currentObjectDragging, mousePos){
	
	//divide a variável currentObjectDragging no caractere "|". Dessa forma id passa a ser um array com dois valores (string antes e depois do caractere "|") 
    var id = currentObjectDragging.split("|");
    var moduloRoot = id[0];
    var moduloChild = id[1];
	//caminho do arquivo json.txt que contém os dados de cada módulo.
    var HTML_FILE_URL = './json/json.txt';
    
	//verifica se a extração dos valores moduloRoot e moduloChild foram feitos corretamente
    if (moduloChild != null && moduloRoot != null) {
		//Função que recebe todos os valores do arquivo e atribui os mesmos para a variavel data
        $.get(HTML_FILE_URL, function(data){
			
			//transforma a variável data em um objeto.
            var obj = jQuery.parseJSON(data);
            
			//atribui os valores name, entra, saidas, atributos e currentObject conforme os dados no JSON referentes ao moduloRoot (raiz) e moduloChild (qual módulo).
            var name = obj[moduloRoot][0][moduloChild].name;
            var entrada = obj[moduloRoot][0][moduloChild].entradas;
            var saidas = obj[moduloRoot][0][moduloChild].saidas;
            var atributos = obj[moduloRoot][0][moduloChild].atributos;
            var currentObject = obj[moduloRoot][0][moduloChild];
            
			//atribui os valores root, child, posX, posY do objeto currentObject 
			currentObject.root = moduloRoot;
			currentObject.child = moduloChild;
            currentObject.posX = mousePos.x;
            currentObject.posY = mousePos.y;
			//cria o array de links para o objeto currentObject
            currentObject.links = new Array();
            
			//Vrificação para garantir que cada elemento tenha um id único.
            if(currentObjId == null)
                currentObjId = 1;
            else
                currentObjId++
            //atribuição desse id único a variável idValue do objeto currentObject
            currentObject.idValue = "obj_" + currentObjId;
            
            //Criação da variável jsonToSave que contém toda a configuração do projeto e que será transformada no arquivo de saída.
            if(jsonToSave == null)
                jsonToSave = new Array();
            
			//Insere os dados do objeto currentObject na variável jsonToSave
            jsonToSave.push(currentObject);
			//Função para a criação da representação gráfica do módulo no projeto.
            createModel(name, moduloRoot, moduloChild, entrada.length, saidas.length, mousePos.x, mousePos.y, currentObject.idValue);
        });
    }
}

//Função que cria a tabela de parametros dentro da modal window que é aberta ao clicar no botão Parameters dos módulos.
function createAttributes(atributos, moduloChild){
    
	//here_table é o id da div no html onde encontra-se a Tabela. Caso queira alterar algo, o estilo da tabela foi criado no arquivo joint.css
    $('#here_table').html("");
	//essa parte também encontra-se uma parte do estilo da tabela.
    var $table = $('<table width="100%" border="1px" id="' + moduloChild + '_table" class="table_atributes" />');
    $table.append( '<tr><th>Atributo</th><th>Tipo</th><th>Valor</th></tr>' );

	//Percorre a variável atributos recebendo seus valores e alocando-os conforme o tipo do mesmo.
    for(var i = 0; i < atributos.length; i++){
		
		//trata o caso específico de dados do tipo bool pois tratam-se de botões radios na interface. Para os outros tipos funcionam apenas como uma string.
		if( atributos[i].type == 'bool'){
			//verifica o valor default do tipo bool
			if(atributos[i].default == 'false'){
				//se for false terá essa composição (mantendo o botão false marcado)
				$table.append( '<tr><td align="center">' + atributos[i].name  + '</td><td align="center">' + atributos[i].type + '</td><td align="center"><input type="radio" name="radioBoolValues" value="false" checked> ' + atributos[i].default + ' <input type="radio" name="radioBoolValues" value="true"> true </td></tr>' );
			}else{
				//caso o contrário terá essa composição (mantendo o botão true marcado)
				$table.append( '<tr><td align="center">' + atributos[i].name  + '</td><td align="center">' + atributos[i].type + '</td><td align="center"><input type="radio" name="radioBoolValues" value="true" checked> ' + atributos[i].default + ' <input type="radio" name="radioBoolValues" value="false"> false </td></tr>' );
			}
		}else{
			//Para tipos diferentes do bool (int, float, dir e file) terá essa composição (box de string)
			$table.append( '<tr><td align="center">' + atributos[i].name  + '</td><td align="center">' + atributos[i].type + '</td><td align="center"><input type="text" id="'+ moduloChild+'_'+ atributos[i].name +'_value" value="'+ atributos[i].default +'" width="100%"/></td></tr>' );
        }
    }
    
	//Esta função insere um conteúdo (recebido como parâmetro) no formato HTML ao final de um controle alvo.
    $('#here_table').append($table);
}

//Função para criar a representação gráfica do módulo na tela do usuário.
function createModel(name, moduloRoot, moduloChild, entrada, saida, x, y, objectId) {

    var inPorts2 = [entrada];
    var outPorts2 = [saida];
    
	//verifica o caso de nenhuma porta de entrada do módulos a ser criado
    if (entrada == 0){
        inPorts2 = null;
    }else{
		//percorre a variável entrada atribuindo um nome único para cada porta (ex: in1, in2, in3.. in7)
        for(var i=0; i < entrada; i++){
            var portName = "in" + (i+1).toString();
            inPorts2[i] = portName;
        }
    }
    
	////verifica o caso de nenhuma porta de saida do módulos a ser criado	
    if (saida == 0){
        outPorts2 = null;
    }else{
		//percorre a variável saida atribuindo um nome único para cada porta (ex: out1, out2, out3.. out7)
        for(var i=0; i < saida; i++){
            var portName = "out" + (i+1).toString();
            outPorts2[i] = portName;
        }
    }
	
	/* 
		define qual o estilo do módulo será usado conforme o seu tipo (recognition, detection, utils e input/output). 
		Os estilos html-element (1,2,3 e 4) encontram-se no arquivo joint.css
	*/
	if (moduloRoot === 'Recognition'){
        var element = 'html-element';
    }
    else if (moduloRoot === 'Detection'){
            var element = 'html-element2';
        }
        else if (moduloRoot === 'Utils'){
                var element = 'html-element3';
            }
            else if (moduloRoot === 'Input/Output'){
                    var element = 'html-element4';
                }
    
    // Create a custom element.
    // Dar uma lida nessa página: http://www.jointjs.com/tutorial/html-elements
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
                rect: { stroke: 'none', 'fill-opacity': 0, width: 150, height: 250, },
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
   // Dar uma lida nessa página: http://www.jointjs.com/tutorial/html-elements
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
			
			// Funções com os tratamentos do evento de clicar nos botões de deletar e Parameters de um módulo.
			this.$box.find('button').on('click', function(evt) { 
				
				//trata o caso do botão de deletar.
				if(this.id == "btnDelete"){
					//recebe o id do módulo que está sendo deletado
					currentIdJson = $(this).attr("idInJson");
					//chama a função removeToJson que remove da variável jsonToSave o módulo deletado
					removeToJson(currentIdJson);
				}
				//trata o caso do botão Parameters
				else{
					//recebe os atributos do módulo clicado
					var button = this;	
					currentModChild = $(this).attr("id");
					currentModRoot = $(this).attr("idpai");
					currentIdJson = $(this).attr("idInJson");
					
					//Função para encontrar na variável jsonToSave o objeto com o ID especificado na chamada da função e retornar os dados do mesmo em um objeto.
					var objToFind = findObjectInJson(currentIdJson);
					//Função que cria a tabela de parametros dentro da modal window que é aberta ao clicar no botão Parameters dos módulos.
					createAttributes(objToFind.atributos, button.id);
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
    var el1 = new joint.shapes.html.Element({ 
        position: { x: x, y: y }, 
        size: { width: 130, height: 100 },
		label: moduloChild,
        inPorts: inPorts2,
        outPorts: outPorts2
    });
	//Função que atribui um id único para cada elemento do Joint.
    setJointIdToJson(el1.id);
    graph.addCell(el1);
}

//Função que atribui um id único para cada elemento do Joint.
function setJointIdToJson(id){
	
	//recebe o tamanho do objeto jsonToSave
    var i = jsonToSave.length;
	//atribui o valor do id do joint na última posição do objeto jsonToSave
    jsonToSave[i - 1].jointId = id;
}

//Função que remove da variável jsonToSave o módulo deletado
function removeToJson(currentIdJson) {
	
	//Percorre o objeto jsonToSave
    for(var i =  jsonToSave.length; i--;) {
		//verifica se o ID na posição da variável jsonToSave corresponde ao ID passado na chamada da função (currentIdJson)
        if( jsonToSave[i].idValue === currentIdJson) {
			//dar uma olhada nesse link para entender o funcionamento da função splice: http://www.w3schools.com/jsref/jsref_splice.asp
            jsonToSave.splice(i, 1);
        }
    }
}

//Função para inserir na variável jsonToSave os links pertencentes a cada módulo na tela.
function createLinkInJson(sourceId, targetId, sourcePort, targetPort){
	
	//percorre o objeto jsonToSave
	for(var i =  jsonToSave.length; i--;) {
		//verifica se o ID do elemento joint corresponde ao ID da variável targetId passado na chamada da função
        if( jsonToSave[i].jointId === targetId) {
			//caso corresponda, atribui-se o o valor de idValue para a variável target
            var target = jsonToSave[i].idValue;
        }
    }
	
	//percorre o objeto jsonToSave
	for(var i =  jsonToSave.length; i--;) {
		//verifica se o ID do elemento joint corresponde ao ID da variável sourceId passado na chamada da função
        if( jsonToSave[i].jointId === sourceId) {
			//Insere os dados correspondentes ao link do módulo (de onde sai, pra onde vai, qual o tipo da porta) na variável text
			var text = '{ "targetId":"'+target+'" , "saida":"'+sourcePort+'" , "entrada":"'+targetPort+'" }';
			//transforma o texto em um objeto
			var obj = JSON.parse(text);
			//insere os dados no array links que pertence ao objeto jsonToSave
			jsonToSave[i].links[jsonToSave[i].links.length] = obj;  
        }
    }
}

//Função para atualizar as posições de um módulo caso elas sejam alteradas
function newPosition(posX, posY, elementId){
	
	//percorre o objeto jsonToSave
	for(var i =  jsonToSave.length; i--;) {
		//verifica se o ID do elemento joint corresponde ao passado na chamada da função (elementId)
		if( jsonToSave[i].jointId === elementId) {
			//Atualiza os valores X e Y do mesmo.
            jsonToSave[i].posX = posX;
			jsonToSave[i].posY = posY; 
        }
    }	
}

//Função para retornar o objeto jsonToSave
function returnJsonToSave(){
	return jsonToSave;
}

//Função para atualizar os atributos de cada módulo quando eles forem importados de um arquivo de configuração
function updateImportedAttributes(elemento){
	
	//percorre o objeto jsonToSave
	for (var i = 0; i < jsonToSave.length; i++){
		//Verifica se o ID da variável idValue do objeto jsonToSave corresponde ao idValue do elemento passado na chamada da função
		if (jsonToSave[i].idValue === elemento.idValue){
			//percorre os atributos da variável elemento 
			for(var x = 0; x< elemento["atributos"].length; x++){
				//atualiza os valores no ojeto jsonToSave
				jsonToSave[i]["atributos"][x].default = elemento["atributos"][x].default;
			}
		}
	}
}
