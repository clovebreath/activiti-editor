const bpmnHeader="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" " +
    "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:activiti=\"http://activiti.org/bpmn\" " +
    "xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" " +
    "xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" " +
    "expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.activiti.org/test\">\n";
const bpmnFooter="</definitions>";
const bpmnShape="<bpmndi:BPMNShape bpmnElement=\"_bpmnElement_\" id=\"_id_\">\n" +
    "<omgdc:Bounds height=\"_height_\" width=\"_width_\" x=\"_x_\" y=\"_y_\"></omgdc:Bounds>\n" +
    "</bpmndi:BPMNShape>\n";
const bpmnEdge="<bpmndi:BPMNEdge bpmnElement=\"_bpmnElement_\" id=\"_id_\">\n_wayPoint_</bpmndi:BPMNEdge>";
const wayPoint="<omgdi:waypoint x=\"_x_\" y=\"_y_\"></omgdi:waypoint>\n";

//获取svg对应的bpmn
function getBpmnOfSvg(){
    var svgObj = document.getElementById("bpmn-svg").children;
    var bpmnProcessChilds=[];
    var bpmnPlaneChilds=[];
    for(var childItem of svgObj){
        getItemBpmn(childItem,bpmnProcessChilds,bpmnPlaneChilds);
    }
    var i=0;
    //bpmnDiagram的xml头尾
    var bpmnDiagramXmlStart="<bpmndi:BPMNDiagram id=\"_id_\">\n".replace("_id_","BPMNDiagram_"+processUuid);
    var bpmnDiagramXmlEnd="</bpmndi:BPMNDiagram>\n";
    //bpmnprocess以及bpmnPlane的xml内容
    var bpmnProcessXml=getProcessXml();
    var bpmnPlaneXml="<bpmndi:BPMNPlane bpmnElement=\"_bpmnElement_\" id=\"_id_\">\n".replace("_bpmnElement_",processUuid)
        .replace("_id_","BPMNPlane_"+processUuid);
    while(i<bpmnProcessChilds.length){
        bpmnProcessXml+=bpmnProcessChilds[i];
        bpmnPlaneXml+=bpmnPlaneChilds[i++];
    }
    bpmnProcessXml+="</process>\n";
    bpmnPlaneXml+="</bpmndi:BPMNPlane>\n";
    //最终的xml文本内容
    var bpmnContent=bpmnHeader+bpmnProcessXml+bpmnDiagramXmlStart+bpmnPlaneXml+bpmnDiagramXmlEnd+bpmnFooter;
    console.log(bpmnContent);
    return bpmnContent;
}

//获取process的xml
function getProcessXml(){
    var tempProcessXml="<process id=\""+processUuid+"\"";
    var itemDatas = $("table[uuid="+processUuid+"]").eq(0).find("td");
    for(var i=2;i<itemDatas.length;i++){
        if(itemDatas.eq(i).text()){
            tempProcessXml=tempProcessXml+" "+itemDatas.eq(i++).text()+"=\""+itemDatas.eq(i).text()+"\"";
        }
    }
    return tempProcessXml+">\n";
}

//根据传入参数获取每个svg子元素对应bpmn
function getItemBpmn(item,bpmnProcessChilds,bpmnPlaneChilds) {
    var startXml=[];
    var endXml=[];
    var itemId=null;
    var isBPMNShape=true;
    //根据类别设定xml的开始和结束部分
    switch (item.getAttribute("type")){
        case BPMN_EVENT_START:
            startXml[0]="<startEvent";
            endXml[0]="></startEvent>\n";
            startXml[1]="<bpmndi:BPMNShape";
            endXml[1]="></omgdc:Bounds>\n</bpmndi:BPMNShape>\n";
            break;
        case BPMN_EVENT_END:
            startXml[0]="<endEvent";
            endXml[0]="></endEvent>\n";
            startXml[1]="<bpmndi:BPMNShape";
            endXml[1]="></omgdc:Bounds>\n</bpmndi:BPMNShape>\n";
            break;
        case BPMN_TASK_USER:
            startXml[0]="<userTask";
            endXml[0]="></userTask>\n";
            startXml[1]="<bpmndi:BPMNShape";
            endXml[1]="></omgdc:Bounds>\n</bpmndi:BPMNShape>\n";
            break;
        case BPMN_GATEWAY_EXCLUSIVE:
            startXml[0]="<exclusiveGateway";
            endXml[0]="></exclusiveGateway>\n";
            startXml[1]="<bpmndi:BPMNShape";
            endXml[1]="></omgdc:Bounds>\n</bpmndi:BPMNShape>\n";
            break;
        case BPMN_SEQUENCE_FLOW:
            startXml[0]="<sequenceFlow";
            endXml[0]="></sequenceFlow>\n";
            startXml[1]="<bpmndi:BPMNEdge";
            endXml[1]="</bpmndi:BPMNEdge>\n";
            isBPMNShape=false;
            break;
        default:
            return false;
    }

    //process部分
    var tempUuid=item.getAttribute("uuid");
    var tempProcessXml=startXml[0];
    var itemDatas = $("table[uuid="+tempUuid+"]").eq(0).find("td");
    //获取基本表格属性
    for(var i=0;i<itemDatas.length;i++){
        var key=itemDatas.eq(i++).text();
        var value=itemDatas.eq(i).text();
        if(key&&value){
            if(key=="id"){
                //获取id
                itemId=value;
            }
            if(key!=="id"&&key!=="name"){
                //添加命名空间
                key="activiti:"+key;
            }
            tempProcessXml=tempProcessXml+" "+key+"=\""+value+"\"";
        }
    }
    //对于flow，需要添加sourceRef和targetRef,分别为对应item的id.
    if(item.hasAttribute("target-ref")&&!isBPMNShape){
        tempProcessXml=tempProcessXml + " targetRef=\"" + $("table[uuid="+item.getAttribute("target-ref")+"]").find("td").eq(1).text()+"\" "+
            "sourceRef=\"" + $("table[uuid="+item.getAttribute("source-ref")+"]").find("td").eq(1).text() +"\" ";
    }
    tempProcessXml+=endXml[0];

    //plane部分
    var tempPlaneXml=null;
    if(itemId!=null){
        if(isBPMNShape){
            //shape
            tempPlaneXml=bpmnShape;
            var bbox=item.getBBox();
            tempPlaneXml=tempPlaneXml.replace("_bpmnElement_",itemId).replace("_id_","BPMNShape_"+itemId)
                .replace("_height_",bbox.height).replace("_width_",bbox.width).replace("_x_",bbox.x)
                .replace("_y_",bbox.y);
        }else{
            //flow
            tempPlaneXml=bpmnEdge;
            tempPlaneXml=tempPlaneXml.replace("_bpmnElement_",itemId).replace("_id_","BPMNEdge_"+itemId);
            var pointList=item.getAttribute("d").split(" ");
            for(var i=0;i<pointList.length;){
                var tempWayPoint=wayPoint.replace("_x_",parseFloat(pointList[i++].substring(1)));
                tempWayPoint=tempWayPoint.replace("_y_",parseFloat(pointList[i++]));
                tempPlaneXml=tempPlaneXml.replace("_wayPoint_",tempWayPoint+"_wayPoint_");
            }
            tempPlaneXml=tempPlaneXml.replace("_wayPoint_","");
        }
    }
    else{
        return false;
    }

    bpmnProcessChilds.push(tempProcessXml);
    bpmnPlaneChilds.push(tempPlaneXml);
    return true;
}