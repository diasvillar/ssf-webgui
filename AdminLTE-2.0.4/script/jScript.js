$(document).ready(function(){
                                 var x = 0;
                                 var y = 0;
                                 
                 $("#btninsert").click(function(event){			
                                 
                                 var entrada = document.getElementById('NumEntrada').value;
                                 var saida = document.getElementById('NumSaida').value;
                                 var inPorts2 = [entrada];
                                 var outPorts2 = [saida];
                                 if (entrada > 7 || saida > 7){
                                         alert("Aceita no máximo 7 entradas e 7 saídas");	
                                         return false;
                                 }
                                 if (entrada == 0){
                                         inPorts2 = null;
                                         var color = '#0000FF';
                                 }
                                 if (entrada == 1){
                                         inPorts2 = ['in1'];
                                         var color = '#778899';
                                 }
                                 if (entrada == 2){
                                         inPorts2 = ['in1','in2'];
                                         var color = '#2ECC71';
                                 }
                                 if (entrada == 3){
                                         inPorts2 = ['in1','in2','in3'];
                                         var color = '#006400';
                                 }
                                 if (entrada == 4){
                                         inPorts2 = ['in1','in2','in3', 'in4'];
                                         var color = '#808000';
                                 }
                                 if (entrada == 5){
                                         inPorts2 = ['in1','in2','in3', 'in4', 'in5'];
                                         var color = '#BC8F8F';
                                 }
                                 if (entrada == 6){
                                         inPorts2 = ['in1','in2','in3', 'in4', 'in5', 'in6'];
                                         var color = '#FF4500';
                                 }
                                 if (entrada == 7){
                                         inPorts2 = ['in1','in2','in3', 'in4', 'in5', 'in6', 'in7'];
                                         var color = '#FFFF00';
                                 }
                                 if (saida == 0){
                                         outPorts2 = null;
                                 }
                                 if (saida == 1){
                                         outPorts2 = ['out1'];
                                 }
                                 if (saida == 2){
                                         outPorts2 = ['out1','out2'];
                                 }
                                 if (saida == 3){
                                         outPorts2 = ['out1','out2','out3'];
                                 }
                                 if (saida == 4){
                                         outPorts2 = ['out1','out2','out3', 'out4'];
                                 }
                                 if (saida == 5){
                                         outPorts2 = ['out1','out2','out3', 'out4', 'out5'];
                                 }
                                 if (saida == 6){
                                         outPorts2 = ['out1','out2','out3', 'out4', 'out5', 'out6'];
                                 }
                                 if (saida == 7){
                                         outPorts2 = ['out1','out2','out3', 'out4', 'out5', 'out6', 'out7'];
                                 }
                                 
                                 if (x < 1000){
                                         var m2 = new joint.shapes.devs.Model({
                                                 position: { x: x + 40, y: y + 20 },
                                                 size: { width: 200, height: 180 },
                                                 inPorts: inPorts2,
                                                 outPorts: outPorts2,
                                                 attrs: {
                                                         '.label': { text: 'Model', 'ref-x': .4, 'ref-y': .2 },
                                                         rect: { fill: color },
                                                         '.inPorts circle': { fill: '#16A085', magnet: 'passive', type: 'input' },
                                                         '.outPorts circle': { fill: '#E74C3C', type: 'output' }
                                                 }
                                         });
                                         x += 290;
                                         
                                         
                                 }
                                 else{
                                         y += 200;
                                         x = 0;
                                         var m2 = new joint.shapes.devs.Model({
                                                 position: { x: x + 40, y: y + 20 },
                                                 size: { width: 200, height: 180 },
                                                 inPorts: inPorts2,
                                                 outPorts: outPorts2,
                                                 attrs: {
                                                         '.label': { text: 'Model', 'ref-x': .4, 'ref-y': .2 },
                                                         rect: { fill: color },
                                                         '.inPorts circle': { fill: '#16A085', magnet: 'passive', type: 'input' },
                                                         '.outPorts circle': { fill: '#E74C3C', type: 'output' }
                                                 }
                                         });
                                         x += 290;
                                 }
                     graph.addCell(m2);
 
                     
                                         
                 });
 
             });

            
function PermiteSomenteNumeros(event) { 
    var charCode = (event.which) ? event.which : event.keyCode 
    var entrada = document.getElementById('NumEntrada').value;
 
    if (charCode > 31 && (charCode < 48 || charCode > 57)) 
        return false; 
                                         
    if (entrada > 7)
        return false;
    return true; 
} 