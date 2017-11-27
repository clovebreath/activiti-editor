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
const documentation="<documentation>_documentation_</documentation>";
const conditionExpression="<conditionExpression xsi:type=\"tFormalExpression\"><![CDATA[_condition_]]></conditionExpression>";
const formProperty="<activiti:formProperty id=\"timeoutTime\" type=\"string\" default=\"2\"></activiti:formProperty>";

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

//获取process的表格相关xml
function getProcessXml(){
    var tempProcessXml="<process _id_ _name_ isExecutable=\"true\" _candidateStarterUsers_ _candidateStarterGroups_ _additional_>_subItem_\n";
    tempProcessXml=getProcessTableData(processUuid,tempProcessXml);
    tempProcessXml=getDataObjectTableData(processUuid,tempProcessXml);
    tempProcessXml=getListenerTableData(processUuid,tempProcessXml);
    tempProcessXml=getSignalTableData(processUuid,tempProcessXml);
    tempProcessXml=getMessageTableData(processUuid,tempProcessXml);
    return tempProcessXml.replace("_subItem_","");
}

//根据传入参数获取每个svg子元素对应bpmn
function getItemBpmn(item,bpmnProcessChilds,bpmnPlaneChilds) {
    var startXml=[];
    var endXml=[];
    var isBPMNShape=true;
    var tempUuid=item.getAttribute("uuid");
    var tempProcessXml;
    //根据类别设定xml的开始和结束部分,并拼接process部分
    switch (item.getAttribute("type")){
        case BPMN_EVENT_START:
            startXml[0]="<startEvent _id_ _name_ _async_ _exclusive_ _initiator_ _formKey_ _additional_>_subItem_\n";
            endXml[0]="</startEvent>\n";
            startXml[1]="<bpmndi:BPMNShape";
            endXml[1]="></omgdc:Bounds>\n</bpmndi:BPMNShape>\n";
            tempProcessXml=getGeneralTableData(tempUuid,startXml[0]);
            tempProcessXml=getMainConfigTableData(tempUuid,tempProcessXml);
            tempProcessXml=getDocumentationTableData(tempUuid,tempProcessXml);
            tempProcessXml=getFormTableData(tempUuid,tempProcessXml);
            tempProcessXml=getListenerTableData(tempUuid,tempProcessXml);
            tempProcessXml=tempProcessXml.replace("_subItem_","").replace("_extensionElement_","");
            break;
        case BPMN_EVENT_END:
            startXml[0]="<endEvent _id_ _name_ _async_ _exclusive_>_subItem_\n";
            endXml[0]="</endEvent>";
            startXml[1]="<bpmndi:BPMNShape";
            endXml[1]="></omgdc:Bounds>\n</bpmndi:BPMNShape>\n";
            tempProcessXml=getGeneralTableData(tempUuid,startXml[0]);
            tempProcessXml=getDocumentationTableData(tempUuid,tempProcessXml);
            tempProcessXml=getListenerTableData(tempUuid,tempProcessXml);
            tempProcessXml=tempProcessXml.replace("_subItem_","");
            break;
        case BPMN_TASK_USER:
            startXml[0]="<userTask _id_ _name _async_ _exclusive_ _isForCompensation_ _assignee_ _candidateUsers_" +
                " _candidateGroups_ _dueDate_ _category_ _formKey_ _priority_ _skipExpression_>\n";
            endXml[0]="</userTask>\n";
            startXml[1]="<bpmndi:BPMNShape";
            endXml[1]="></omgdc:Bounds>\n</bpmndi:BPMNShape>\n";
            tempProcessXml=getGeneralTableData(tempUuid,startXml[0]);
            tempProcessXml=getMainConfigTableData(tempUuid,tempProcessXml);
            tempProcessXml=getDocumentationTableData(tempUuid,tempProcessXml);
            tempProcessXml=getFormTableData(tempUuid,tempProcessXml);
            tempProcessXml=getListenerTableData(tempUuid,tempProcessXml);
            tempProcessXml=getMultiInstanceTableData(tempUuid,tempProcessXml);
            tempProcessXml=tempProcessXml.replace("_subItem_","");
            break;
        case BPMN_GATEWAY_EXCLUSIVE:
            startXml[0]="<exclusiveGateway _id_ _name_ _async_ _exclusive_>_subItem_\n";
            endXml[0]="</exclusiveGateway>\n";
            startXml[1]="<bpmndi:BPMNShape";
            endXml[1]="></omgdc:Bounds>\n</bpmndi:BPMNShape>\n";
            tempProcessXml=getGeneralTableData(tempUuid,startXml[0]);
            tempProcessXml=getDocumentationTableData(tempUuid,tempProcessXml);
            tempProcessXml=getListenerTableData(tempUuid,tempProcessXml);
            tempProcessXml=tempProcessXml.replace("_subItem_","");
            break;
        case BPMN_SEQUENCE_FLOW:
            startXml[0]="<sequenceFlow _id_ _name_ _sourceRef_ _targetRef_ _skipExpression_>_subItem_\n";
            endXml[0]="</sequenceFlow>\n";
            startXml[1]="<bpmndi:BPMNEdge";
            endXml[1]="</bpmndi:BPMNEdge>\n";
            isBPMNShape=false;
            tempProcessXml=getGeneralTableData(tempUuid,startXml[0]);
            tempProcessXml=getMainConfigTableData(tempUuid,tempProcessXml);
            tempProcessXml=getDocumentationTableData(tempUuid,tempProcessXml);
            tempProcessXml=getListenerTableData(tempUuid,tempProcessXml);
            tempProcessXml.replace("_targetRef_","targetRef=\"" + $("table[id][uuid="+item.getAttribute("target-ref")+"]").find("td").eq(1).text()+"\"")
                .replace("_sourceRef_","sourceRef=\"" + $("table[id][uuid="+item.getAttribute("source-ref")+"]").find("td").eq(1).text() +"\" ");
            tempProcessXml=tempProcessXml.replace("_subItem_","");
            break;
        default:
            return false;
    }
    tempProcessXml+=endXml[0];

    //plane部分
    var tempPlaneXml=null;
    var itemId=$("table[uuid="+tempUuid+"][class^='origin-general-table']").find("tbody").find("td").eq(1).text();
    if(itemId){
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

function getGeneralTableData(uuid,xmlString) {
    var itemDatas = $("table[uuid="+uuid+"][class^='origin-general-table']").find("tbody").find("td");
    //获取基本表格属性
    for(var i=0;i<itemDatas.length;i++){
        var key=itemDatas.eq(i++).text();
        var value=itemDatas.eq(i).text();
        if(key&&value){
            if (key === "id" || key === "name") {
                xmlString = xmlString.replace("_" + key + "_", key + "=\"" + value + "\"");
            } else if (key === "asynchronous") {
                key = "activiti:async";
                xmlString = xmlString.replace("_async_", key + "=\"" + value + "\"");
            } else if (key === "exclusive") {
                key = "activiti:exclusive";
                xmlString = xmlString.replace("_exclusive_", key + "=\"" + value + "\"");
            } else {
                key = "activiti:" + key;
                xmlString = xmlString.replace("_additional_", key + "=\"" + value + "\" _additional_");
            }
        }
    }
    return xmlString.replace("_additional_","").replace("_id_","").replace("_name_","").replace("_async_","").replace("_exclusive_","");
}
function getMainConfigTableData(uuid,xmlString) {
    var itemDatas = $("table[uuid="+uuid+"][class^='origin-main-config-table']").find("tbody").find("td");
    //获取基本表格属性
    for(var i=0;i<itemDatas.length;i++){
        var key=itemDatas.eq(i++).text();
        var value=itemDatas.eq(i).text();
        if(key&&value){
            xmlString = xmlString.replace("_" + key + "_","activiti:"+key + "=\"" + value + "\"");
        }
    }
    return xmlString.replace("_initiator_","").replace("_formKey_","");
}
function getDocumentationTableData(uuid,xmlString) {
    var docXml="<documentation>_documentation_</documentation>\n";
    var itemDatas = $("table[uuid="+uuid+"][class^='origin-documentation-table']").find("tbody").find("td");
    var key=itemDatas.eq(0).text();
    var value=itemDatas.eq(1).text();
    if(key&&value){
        docXml.replace("_documentation_",value);
        xmlString=xmlString.replace("_subItem_",docXml+"_subItem_");
    }
    return xmlString;
}
function getFormTableData(uuid,xmlString) {
    var keys=["id","name","type","expression","variable","default","datePattern","readable","writable","required"];
    var formProperty="<activiti:formProperty _id_ _name_ _type_ _expression_ _variable_ _default_ " +
        "_datePattern_ _readable_ _writable_ _required_>_value_\n</activiti:formProperty>";
    var formPropertyValue="<activiti:value _id_ _name_></activiti:value>\n";
    var itemDataRows = $("table[uuid="+uuid+"][class^='origin-form-table']").find("tbody").find("tr");
    for(var index=0;index<itemDataRows.length;index++){
        var datas=itemDataRows.eq(index).find("td");
        for(var i=0;i<10;i++){
            var value=datas.eq(i).text();
            if(value){
                formProperty=formProperty.replace("_"+keys[i]+"_",keys[i]+"=\""+value+"\"");
            }else{
                formProperty=formProperty.replace("_"+keys[i]+"_","");
            }
        }
        var formValueRaw=datas.eq(10).text();
        if(formValueRaw){
            var formValues=formValueRaw.split(";");
            for(var value of formValues){
                var tempValue=formPropertyValue.replace("_id_",value.split(":")[0]).replace("_name_",value.split(":")[1]);
                formProperty=formProperty.replace("_value_",tempValue+"_value_");
            }
        }
        formProperty=formProperty.replace("_value_","");
        if(xmlString.indexOf("<extensionElements>")!==-1 && xmlString.indexOf("</extensionElements>")!==-1){
            xmlString=xmlString.replace("_extensionElement_",formProperty+"_extensionElement_");
        }else{
            xmlString=xmlString.replace("_subItem_","<extensionElements>_extensionElement_</extensionElements>_subItem_")
            xmlString=xmlString.replace("_extensionElement_",formProperty+"_extensionElement_");
        }
    }
    return xmlString;
}
function getListenerTableData(uuid,xmlString){
    var itemDataRows = $("table[uuid="+uuid+"][class^='origin-listener-table']").find("tbody").find("tr");
    var listenerXml="<activiti:executionListener _event_ _expression_></activiti:executionListener>\n";
    //todo 对于listener的数据处理有问题，需要修正、
    for(var index=0;index<itemDataRows.length;index++){
        var datas=itemDataRows.eq(index).find("td");
        if(datas.eq(0).text()&&datas.eq(2).text()){
            var tempListener=listenerXml.replace("_event_","event=\""+datas.eq(2).text()+"\"")
                .replace("_expression_","expression=\""+datas.eq(0).text()+"\"");
            if(xmlString.indexOf("<extensionElements>")!==-1 && xmlString.indexOf("</extensionElements>")!==-1){
                xmlString=xmlString.replace("_extensionElement_",tempListener+"_extensionElement_");
            }else{
                xmlString=xmlString.replace("_subItem_","<extensionElements>_extensionElement_</extensionElements>_subItem_")
                xmlString=xmlString.replace("_extensionElement_",tempListener+"_extensionElement_");
            }
        }
    }
    return xmlString;
}
function getMultiInstanceTableData(uuid,xmlString) {
    var multiInstance = "<multiInstanceLoopCharacteristics _isSequential_ _collection_ _elementVariable_>_subItems_\n" +
        "</multiInstanceLoopCharacteristics>";
    var loopCardinality="<loopCardinality>_loopCardinality_</loopCardinality>\n";
    var completionCondition="<completionCondition>_completionCondition_</completionCondition>\n";
    var itemDatas = $("table[uuid="+uuid+"][class^='origin-multi-instance-table']").find("tbody").find("td");
    //获取基本表格属性

    for(var i=0;i<itemDatas.length;i++){
        var key=itemDatas.eq(i++).text();
        var value=itemDatas.eq(++i).text();
        if(key&&value){
            switch (key){
                case "Sequential":
                    multiInstance=multiInstance.replace("_isSequential_",value);
                    break;
                case "Loop Cardinality":
                    loopCardinality=loopCardinality.replace("_loopCardinality_",value);
                    multiInstance=multiInstance.replace("_subItems_",loopCardinality+"_subItems_");
                    break;
                case "Collection":
                    multiInstance=multiInstance.replace("_collection_",value);
                    break;
                case "Element variable":
                    multiInstance=multiInstance.replace("_elementVariable_",value);
                    break;
                case "Completion condition":
                    completionCondition=completionCondition.replace("_completionCondition_",value);
                    multiInstance=multiInstance.replace("_subItems_",loopCardinality+"_subItems_");
                    break;
            }

        }
    }
    multiInstance=multiInstance.replace("_isSequential_","").replace("_collection_","")
        .replace("_elementVariable_","").replace("_subItems_","");
    return xmlString.replace("_subItem_",multiInstance+"_subItem_");
}
function getProcessTableData(uuid,xmlString){
    var documentXml="<documentation>_documentation_</documentation>\n";
    var itemDatas = $("table[uuid="+uuid+"][class^='orign-process-table']").find("tbody").find("td");
    //获取基本表格属性
    for(var i=0;i<itemDatas.length;i++){
        var key=itemDatas.eq(i++).text();
        var value=itemDatas.eq(i).text();
        if(key&&value){
            if (key === "id" || key === "name") {
                xmlString = xmlString.replace("_" + key + "_", key + "=\"" + value + "\"");
            } else if (key === "candidate start users") {
                key = "activiti:candidateStarterUsers";
                xmlString = xmlString.replace("_candidateStarterUsers_", key + "=\"" + value + "\"");
            } else if (key==="candidate start groups") {
                key = "activiti:candidateStarterGroups";
                xmlString = xmlString.replace("_candidateStarterGroups_", key + "=\"" + value + "\"");
            } else if(key==="documentation"){
                documentXml=documentXml.replace("_documentation_",value);
                xmlString=xmlString.replace("_subItem_",documentXml+"_subItem_");
            } else {
                key = "activiti:" + key;
                xmlString = xmlString.replace("_additional_", key + "=\"" + value + "\" _additional_");
            }
        }
    }
    return xmlString.replace("_id_","").replace("_name_","").replace("_candidateStarterUsers_","")
        .replace("_candidateStarterGroups_","").replace("_additional_","");
}
function getDataObjectTableData(uuid,xmlString) {
    var dataObject="<dataObject _id_ _name_ _itemSubjectRef_>\n_value_\n</dataObject>";
    var valueXml="<extensionElements>\n<activiti:value>_value_</activiti:value>\n</extensionElements>";
    var dataRows = $("table[uuid="+uuid+"][class^='origin-data-object-table']").find("tbody").find("tr");
    for(var i=0;i<dataRows.length;i++){
        var datas=dataRows.eq(i).find("td");
        var tempObjectData=dataObject;
        if(datas.eq(0).text()||datas.eq(1).text()||datas.eq(2).text()||datas.eq(3).text()){
            for(var i=0;i<datas.length;i++){
                var value=datas.eq(i).text();
                if(value){
                    switch (i){
                        case 0:tempObjectData=tempObjectData.replace("_id_","id=\""+value+"\"");break;
                        case 1:tempObjectData=tempObjectData.replace("_name_","name=\""+value+"\"");break;
                        case 2:tempObjectData=tempObjectData.replace("_itemSubjectRef_","itemSubjectRef=\"xsd:"+value+"\"");break;
                        case 3:tempObjectData=tempObjectData.replace("_value_",valueXml.replace("_value_",value));break;
                    }
                }
            }
        }else{
            continue;
        }
        tempObjectData=tempObjectData.replace("_id_","").replace("_name_","").replace("_itemSubjectRef_","").replace("_value_","");
        xmlString=xmlString.replace("_subItem_",tempObjectData+"_subItem_");
    }
    return xmlString;
}
function getSignalTableData(uuid,xmlString) {
    var signalXml="<signal _id_ _name_ _scope_></signal>\n";
    var dataRows = $("table[uuid="+uuid+"][class^='origin-signal-table']").find("tbody").find("tr");
    for(var i=0;i<dataRows.length;i++){
        var datas=dataRows.eq(i).find("td");
        var tempSignal=signalXml;
        if(datas.eq(0).text()||datas.eq(1).text()||datas.eq(2).text()){
            for(var i=0;i<datas.length;i++){
                var value=datas.eq(i).text();
                if(value){
                    switch (i){
                        case 0:tempSignal=tempSignal.replace("_id_","id=\""+value+"\"");break;
                        case 1:tempSignal=tempSignal.replace("_name_","name=\""+value+"\"");break;
                        case 2:tempSignal=tempSignal.replace("_scope_","activiti:scope=\""+value+"\"");break;
                    }
                }
            }
        }else{
            continue;
        }
        tempSignal=tempSignal.replace("_id_","").replace("_name_","").replace("_scope_","");
        xmlString=xmlString.replace("_subItem_",tempSignal+"_subItem_");
    }
    return xmlString;
}
function getMessageTableData(uuid,xmlString) {
    var messageXml="<message _id_ _name_></message>\n";
    var dataRows = $("table[uuid="+uuid+"][class^='origin-signal-table']").find("tbody").find("tr");
    for(var i=0;i<dataRows.length;i++){
        var datas=dataRows.eq(i).find("td");
        var tempMessage=messageXml;
        if(datas.eq(0).text()||datas.eq(1).text()){
            for(var i=0;i<datas.length;i++){
                var value=datas.eq(i).text();
                if(value){
                    switch (i){
                        case 0:tempMessage=tempMessage.replace("_id_","id=\""+value+"\"");break;
                        case 1:tempMessage=tempMessage.replace("_name_","name=\""+value+"\"");break;
                    }
                }
            }
        }else{
            continue;
        }
        tempMessage=tempMessage.replace("_id_","").replace("_name_","");
        xmlString=xmlString.replace("_subItem_",tempMessage+"_subItem_");
    }
    return xmlString;
}