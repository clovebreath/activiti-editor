var bpmnSvg=null;
var selectSvgItem=null;
var targetSvgItem=null;
var svgCircleR=20;
var svgStroke="black";
var svgStorkeWidth=1;
var svgRectWidth=80;
var svgRectHeight=60;
var svgFill="lightgrey";
var bpmnHeader="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:activiti=\"http://activiti.org/bpmn\" xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.activiti.org/test\">\n";
var bpmnFooter="</definitions>";
//初始化
function initDesigner(){
    bpmnSvg=d3.select("#bpmn-svg").attr("uuid",Math.uuid());
    var defs = bpmnSvg.append("defs");
    //定义箭头
    var arrowMarker = defs.append("marker")
        .attr("id","arrow")
        .attr("markerUnits","strokeWidth")
        .attr("markerWidth","12")
        .attr("markerHeight","12")
        .attr("viewBox","0 0 12 12")
        .attr("refX","6")
        .attr("refY","6")
        .attr("orient","auto");
    arrowMarker.append("path")
        .attr("d","M2,2 L10,6 L2,10 L6,6 L2,2")
        .attr("fill","#000");
    //拖拽-左侧菜单栏
    $('.bpmn-list').draggable({
        revert:true,cursor:'pointer',proxy:getObj,onStopDrag:iconDragStop
    });

    //拖拽-箭头
    $('#bpmn-menu-arrow').draggable({
        revert:true,cursor:'pointer',proxy:'clone',onStopDrag:arrowDragStop
    });
}

//连线按钮拖拽停止事件
function arrowDragStop(e){
    var postionX = e.pageX-$('#bpmn-svg').offset().left;
    var positonY = e.pageY-$('#bpmn-svg').offset().top;

    if( postionX>0 && positonY>0 ){
        var targetItem=getElementByPosition(postionX,positonY);
        if(targetItem!==null){
            drowFlow(selectSvgItem,targetItem);
        }
    }
}

//获取svg在给定坐标处的元素(有多个时选中最上层)
function getElementByPosition(svgX,svgY) {
    var tempItem=null;
    d3.selectAll("circle,rect,polygon").each(
        function () {
            var box=this.getBBox();
            if(box.x<svgX && svgX<(box.x+box.width) && box.y<svgY && svgY<(box.y+box.height)){
                tempItem=this;
                console.log(this);
            }
        }
    )
    return tempItem;
}

//删除元素
function deleteItem() {
    //删除对应表格
    var tempUuid=selectSvgItem.getAttribute("uuid");
    $("table[uuid="+tempUuid+"]").delete();

    //删除有关系的连线
    d3.selectAll("path").each(
        function (d,i) {
            if(this.getAttribute("source-ref")===tempUuid||this.getAttribute("target-ref")===tempUuid){
                d3.select(this).remove();
            }
        }
    );
    selectSvgItem.remove();

    $("#bpmn-menu-area").hide();
}

//从菜单栏拖拽停止的事件
function iconDragStop(e){
    var canvasBottom=$("#bpmn-svg").height();
    var dragEvent = d3.drag()
        .on("start", onSvgItemDragStart)
        .on("drag", onSvgItemDrag)
        .on("end", onSvgItemDragEnd);
    //在画布范围内
    if(e.data.left>=300 && e.data.top<canvasBottom){
        switch(e.data.target.id){
            case "bpmn-event-start":
                appendCircle(bpmnSvg,e.data.left-300,e.data.top,svgCircleR,svgStroke,svgStorkeWidth,svgFill)
                    .attr("type","bpmn-event-start")
                    .call(dragEvent.subject(
                        function() {
                            var t = d3.select(this);
                            return {
                                x: t.attr("cx"),
                                y: t.attr("cy")
                            };
                        }));
                break;
            case "bpmn-event-end":
                appendCircle(bpmnSvg,e.data.left-300,e.data.top,svgCircleR,svgStroke,svgStorkeWidth,svgFill)
                    .attr("type","bpmn-event-end")
                    .call(dragEvent.subject(
                        function() {
                            var t = d3.select(this);
                            return {
                                x: t.attr("cx"),
                                y: t.attr("cy")
                            };
                        }));
                break;
            case "bpmn-task-user":
                appendRect(bpmnSvg,e.data.left-300,e.data.top,svgRectWidth,svgRectHeight,svgStroke,svgStorkeWidth,svgFill)
                    .attr("type","bpmn-task-user")
                    .call(dragEvent.subject(
                        function() {
                            var t = d3.select(this);
                            return {
                                x: t.attr("x"),
                                y: t.attr("y")
                            };
                        }));
                break;
            case "bpmn-gateway-exclusive":
                appendPolygon(bpmnSvg,getGatewayPoints(e.data.left-300,e.data.top),svgStroke,svgStorkeWidth,svgFill)
                    .attr("type","bpmn-gateway-exclusive")
                    .call(dragEvent.subject(
                        function() {
                            var t = d3.select(this);
                            return {
                                x:this.getBBox().x,
                                y:this.getBBox().y
                            };
                        }));
                break;
            default:
                break;
        }
    }
}

//生成被拖拽的对象
function getObj(source){
    var p = $('<div style="border:1px solid #ccc;width:200px"></div>');
    p.html($(source).html()).appendTo('body');
    return p;
}

//获取指定元素的中心点
function getMidPoint(item) {
    var pointX=item.getBBox().x+item.getBBox().width/2;
    var pointY=item.getBBox().y+item.getBBox().height/2;
    return {x:pointX,y:pointY};
}

//判断两个元素之间的连线的类型，U、L、I、Z.
function getFlowType(itemStart,itemEnd) {
    var boxStart=itemStart.getBBox();
    var boxEnd=itemEnd.getBBox();
    var x11 = boxStart.x, x12 = boxStart.x + boxStart.width, x21 = boxEnd.x, x22 = boxEnd.x + boxEnd.width;
    var y11 = boxStart.y, y12 = boxStart.y + boxStart.height, y21 = boxEnd.y, y22 = boxEnd.y + boxEnd.height;
    var x1m = (x11 + x12) / 2, x2m = (x21 + x22) / 2, y1m = (y11 + y12) / 2, y2m = (y21 + y22) / 2;
    if (x11 >= x22) {//结点2在结点1左边(x轴无交集)
        if (y11 > y22) { //结点2在结点1左上方（y轴无交集）
            return "L";
        }
        else if (y12 < y21) {//结点2在结点1左下方（y轴无交集）
            return "L";
        }
        else {//y轴有交集
            return ((y1m - y2m) === 0 ? "I" : "Z");
        }
    }
    else if(x12 <= x21){//结点2在结点1右边(x轴无交集)
        if (y11 > y22) { //结点2在结点1右上方（y轴无交集）
            return "L";
        }
        else if (y12 < y21) {//结点2在结点1右下方（y轴无交集）
            return "L";
        }
        else {//y轴有交集
            return ((y1m - y2m) === 0 ? "I" : "Z");
        }
    }
    else { //结点2和结点1（x轴有交集）
        if (y11 > y22) { //结点2在结点1上方（y轴无交集）
            return ((y1m - y2m) === 0 ? "I" : "N");
        }
        else if (y12 < y21) {//结点2在结点1下方（y轴无交集）
            return ((y1m - y2m) === 0 ? "I" : "N");
        }
        else {//y轴有交集
            return "none";
        }
    }
}

//在两个元素之间画连接线
function drowFlow(itemStart,itemEnd){
    var flowType = getFlowType(itemStart,itemEnd);
    var boxStart=itemStart.getBBox();
    var boxEnd=itemEnd.getBBox();
    var x11 = boxStart.x, x12 = boxStart.x + boxStart.width, x21 = boxEnd.x, x22 = boxEnd.x + boxEnd.width;
    var y11 = boxStart.y, y12 = boxStart.y + boxStart.height, y21 = boxEnd.y, y22 = boxEnd.y + boxEnd.height;
    var x1m = (x11 + x12) / 2, x2m = (x21 + x22) / 2, y1m = (y11 + y12) / 2, y2m = (y21 + y22) / 2;
    console.log(flowType,itemStart.getAttribute("uuid"),itemEnd.getAttribute("uuid"));
    switch (flowType){
        case "I":
            if(x1m===x2m){//x轴上中心点同一轨迹
                appendPath(bpmnSvg,getIPointPath({x:x12,y:y1m},{x:x21,y:y2m}),svgStroke,svgStorkeWidth)
                    .attr("type","bpmn-sequence-flow")
                    .attr("source-ref",itemStart.getAttribute("uuid"))
                    .attr("target-ref",itemEnd.getAttribute("uuid"));
            }
            else {//y轴上中心点同一轨迹
                appendPath(bpmnSvg,getIPointPath({x:x1m,y:y12},{x:x2m,y:y21}),svgStroke,svgStorkeWidth)
                    .attr("type","bpmn-sequence-flow")
                    .attr("source-ref",itemStart.getAttribute("uuid"))
                    .attr("target-ref",itemEnd.getAttribute("uuid"));
            }
            break;
        case "Z":
            if(x11 >= x22){//结点2在结点1左边(x轴无交集)
                appendPath(bpmnSvg,getZPointPath({x:x11,y:y1m},{x:x22,y:y2m}),svgStroke,svgStorkeWidth)
                    .attr("type","bpmn-sequence-flow")
                    .attr("source-ref",itemStart.getAttribute("uuid"))
                    .attr("target-ref",itemEnd.getAttribute("uuid"));
            }else {//结点2在结点1右边(x轴无交集)
                appendPath(bpmnSvg,getZPointPath({x:x12,y:y1m},{x:x21,y:y2m}),svgStroke,svgStorkeWidth)
                    .attr("type","bpmn-sequence-flow")
                    .attr("source-ref",itemStart.getAttribute("uuid"))
                    .attr("target-ref",itemEnd.getAttribute("uuid"));
            }
            break;
        case "N":
            if(y11 > y22){//结点2在结点1上方（y轴无交集）
                appendPath(bpmnSvg,getNPointPath({x:x1m,y:y11},{x:x2m,y:y22}),svgStroke,svgStorkeWidth)
                    .attr("type","bpmn-sequence-flow")
                    .attr("source-ref",itemStart.getAttribute("uuid"))
                    .attr("target-ref",itemEnd.getAttribute("uuid"));
            }else {//结点2在结点1下方（y轴无交集）
                appendPath(bpmnSvg,getNPointPath({x:x1m,y:y12},{x:x2m,y:y21}),svgStroke,svgStorkeWidth)
                    .attr("type","bpmn-sequence-flow")
                    .attr("source-ref",itemStart.getAttribute("uuid"))
                    .attr("target-ref",itemEnd.getAttribute("uuid"));
            }
            break;
        case "L":
            if(x11 >= x22){
                if (y11 > y22) { //结点2在结点1左上方（y轴无交集）
                    appendPath(bpmnSvg,getLPointPath({x:x1m,y:y11},{x:x22,y:y2m}),svgStroke,svgStorkeWidth)
                        .attr("type","bpmn-sequence-flow")
                        .attr("source-ref",itemStart.getAttribute("uuid"))
                        .attr("target-ref",itemEnd.getAttribute("uuid"));
                }
                else if (y12 < y21) {//结点2在结点1左下方（y轴无交集）
                    appendPath(bpmnSvg,getLPointPath({x:x1m,y:y12},{x:x22,y:y2m}),svgStroke,svgStorkeWidth)
                        .attr("type","bpmn-sequence-flow")
                        .attr("source-ref",itemStart.getAttribute("uuid"))
                        .attr("target-ref",itemEnd.getAttribute("uuid"));
                }
            }else {
                if (y11 > y22) { //结点2在结点1右上方（y轴无交集）
                    appendPath(bpmnSvg,getLPointPath({x:x1m,y:y11},{x:x21,y:y2m}),svgStroke,svgStorkeWidth)
                        .attr("type","bpmn-sequence-flow")
                        .attr("source-ref",itemStart.getAttribute("uuid"))
                        .attr("target-ref",itemEnd.getAttribute("uuid"));
                }
                else if (y12 < y21) {//结点2在结点1右下方（y轴无交集）
                    appendPath(bpmnSvg,getLPointPath({x:x1m,y:y12},{x:x21,y:y2m}),svgStroke,svgStorkeWidth)
                        .attr("type","bpmn-sequence-flow")
                        .attr("source-ref",itemStart.getAttribute("uuid"))
                        .attr("target-ref",itemEnd.getAttribute("uuid"));
                }
            }
            break;
        default:break;
    }
}

function appendCircle(svgContainer,cx,cy,r,stroke,strokeWidth,fill){
    var svgCir = svgContainer.append("circle")
        .attr("cx",cx)
        .attr("cy",cy)
        .attr("r",r)
        .attr("stroke",stroke)
        .attr("stroke-width",strokeWidth)
        .attr("fill",fill)
        .attr("onclick","clickSvgElement(this)")
        .attr("uuid",Math.uuid());
    return svgCir;
}

function appendPath(svgContainer,d,stroke,strokeWidth) {
    var svgPath = svgContainer.append("path")
        .attr("d",d)
        .attr("stroke",stroke)
        .attr("fill","transparent")
        .attr("stroke-width",strokeWidth)
        .attr("marker-end","url(#arrow)")
        .attr("uuid",Math.uuid());
    return svgPath;
}

function appendLine(svgContainer,x1,y1,x2,y2,stroke,strokeWidth){
    var svgLine = svgContainer.append("line")
        .attr("x1",x1)
        .attr("y1",y1)
        .attr("x2",x2)
        .attr("y2",y2)
        .attr("stroke",stroke)
        .attr("stroke-width",strokeWidth)
        .attr("marker-end","url(#arrow)")
        .attr("uuid",Math.uuid());
    return svgLine;
}

function appendRect(svgContainer,x,y,width,height,stroke,strokeWidth,fill){
    var svgRect = svgContainer.append("rect")
        .attr("x",x)
        .attr("y",y)
        .attr("width",width)
        .attr("height",height)
        .attr("stroke",stroke)
        .attr("stroke-width",strokeWidth)
        .attr("fill",fill)
        .attr("onclick","clickSvgElement(this)")
        .attr("uuid",Math.uuid());
    return svgRect;
}

function appendPolygon(svgContainer,points,stroke,strokeWidth,fill){
    var svgPolygon = svgContainer.append("polygon")
        .attr("points",points)
        .attr("stroke",stroke)
        .attr("stroke-width",strokeWidth)
        .attr("fill",fill)
        .attr("onclick","clickSvgElement(this)")
        .attr("uuid",Math.uuid());
    return svgPolygon;
}

//根据左上角坐标计算gateway的四个点
function getGatewayPoints(x, y){
    var points=(x+20)+","+y+" "+x+","+(20+y)+" "+(x+20)+","+(y+40)+" "+(x+40)+","+(20+y);
    return points;
}

//计算gateway平移后的点
function transformGatewayPoints(points,transformX,transformY) {
    var result="";
    for(var i=0;i<points.length;i++){
        points[i].x+=transformX;
        points[i].y+=transformY;
        result+=points[i].x+","+points[i].y+" ";
    }
    return result;
}

//移动元素后重新绘制连接线
function reDrowPath(item) {
    d3.selectAll("path").each(
        function (d,i) {
            if(this.getAttribute("source-ref")===item.getAttribute("uuid")){
                var condition="[type][uuid="+this.getAttribute('target-ref')+"]";
                var otherItem=$(condition)[0];
                drowFlow(item,otherItem);
                d3.select(this).remove();
            }
            if(this.getAttribute("target-ref")===item.getAttribute("uuid")){
                var condition="[type][uuid="+this.getAttribute('source-ref')+"]";
                var otherItem=$(condition)[0];
                drowFlow(otherItem,item);
                d3.select(this).remove();
            }
        }
    );
}

//给定起点和终点，计算path的d值,Z型
function getLPointPath(startPoint,endPoint) {
    var pathD="M";
    pathD+=startPoint.x+" "+startPoint.y+" L";
    pathD+=startPoint.x+" "+endPoint.y+" L";
    pathD+=endPoint.x+" "+endPoint.y;
    return pathD;
}

//给定起点和终点，计算path的d值,U型
function getUPointPath(startPoint,endPoint) {
    var pathD="M";

}

//给定起点和终点，计算path的d值,N型
function getNPointPath(startPoint,endPoint) {
    var pathD="M";
    pathD+=startPoint.x+" "+startPoint.y+" L";
    pathD+=startPoint.x+" "+(startPoint.y+endPoint.y)/2+" L";
    pathD+=endPoint.x+" "+(startPoint.y+endPoint.y)/2+" L";
    pathD+=endPoint.x+" "+endPoint.y;
    return pathD;
}

//给定起点和终点，计算path的d值,Z型
function getZPointPath(startPoint,endPoint) {
    var pathD="M";
    pathD+=startPoint.x+" "+startPoint.y+" L";
    pathD+=(startPoint.x+endPoint.x)/2+" "+startPoint.y+" L";
    pathD+=(startPoint.x+endPoint.x)/2+" "+endPoint.y+" L";
    pathD+=endPoint.x+" "+endPoint.y;
    return pathD;
}

//给定起点和终点，计算path的d值,I型
function getIPointPath(startPoint,endPoint) {
    var pathD="M";
    pathD+=startPoint.x+" "+startPoint.y+" L";
    pathD+=endPoint.x+" "+endPoint.y;
    return pathD;
}

//svg元素移动开始前的事件
function onSvgItemDragStart(){
    $("#bpmn-menu-area").hide();
}

//SVG元素移动的事件
function onSvgItemDrag() {
    switch (this.tagName){
        case "circle":
            d3.select(this).attr("cx",d3.event.x ).attr("cy",d3.event.y );
            break;
        case "rect":
            d3.select(this).attr("x",d3.event.x ).attr("y",d3.event.y );
            break;
        case "polygon":
            d3.select(this).attr("points",getGatewayPoints(d3.event.x, d3.event.y));
            break;
    }
    reDrowPath(this);
}

//svg元素移动完的事件
function onSvgItemDragEnd() {
    switch (this.tagName){
        case "circle":
        case "rect":
        case "polygon":
        default:
            break;
    }
    clickSvgElement(this);
}

//点击时显示小菜单
function showMiniMenu(element){
    //设置被选中的item
    selectSvgItem=element;
    var outingBox=selectSvgItem.getBBox();
    var midPointX=outingBox.x+outingBox.width/2;
    var midPointY=outingBox.y+outingBox.height/2;
    $("#bpmn-menu-area").show();
    $("#bpmn-menu-area").css("left",outingBox.x);
    $("#bpmn-menu-area").css("top",outingBox.y+outingBox.height);
}

//点击时显示对应表格
function showPropertiesTable(element) {
    var itemUuid=element.getAttribute("uuid");
    for(var uuid of tableUuids){
        if(uuid===itemUuid){
            showUuidTable(uuid);
            return;
        }
    }
    //如果没有对应表格
    appendNewTable(itemUuid);
}

//元素点击事件
function clickSvgElement(element) {
    showMiniMenu(element);
    showPropertiesTable(element);
}

//绑定数据
function dataBind() {
    //TODO 数据的绑定，是否利用d3.js把数据统一绑定到svg元素上，还是说直接在页面上以表格的形式存在。
}

//获取svg对应的bpmn
function getBpmnOfSvg(){

    //TODO 将svg文档转换为bpmn文档。
    var svgObj = document.getElementById("bpmn-svg").children;
    var bpmnContent=bpmnHeader;
    for(var childItem of svgObj){
        switch (childItem.getAttribute("type")){
            case "bpmn-event-start":
                var xml=getItemBpmn(childItem,"<startEvent","></startEvent>");
                bpmnContent+=xml+"\n";
                break;
            case "bpmn-event-end":
                var xml=getItemBpmn(childItem,"<endEvent","></endEvent>");
                bpmnContent+=xml+"\n";
                break;
            case "bpmn-task-user":
                var xml=getItemBpmn(childItem,"<userTask","></userTask>");
                bpmnContent+=xml+"\n";
                break;
            case "bpmn-gateway-exclusive":
                var xml=getItemBpmn(childItem,"<exclusiveGateway","></exclusiveGateway>");
                bpmnContent+=xml+"\n";
                break;
            default:
                break;
        }
    }
    bpmnContent+=bpmnFooter;
    return bpmnContent;
}

function getItemBpmn(item,startXml,endXml) {
    var tempUuid=item.getAttribute("uuid");
    var tempItemXml=startXml;
    if($("table[uuid="+tempUuid+"]").length==1){
        //有与之相对应的table
        var itemDatas = $("table[uuid="+tempUuid+"]").eq(0).find("td");
        for(var i=0;i<itemDatas.length;i++){
            tempItemXml=tempItemXml+" "+itemDatas.eq(i++).text()+"=\""+itemDatas.eq(i).text()+"\"";
        }
    }
    tempItemXml+=endXml;
    return tempItemXml;
}

//TODO 将下方法改成获取bpmn文件的方法
//获取svg的xml文件
function getSvgFile(){
    // var svgContext = d3.select("#svg-container").html();
    funDownload(getBpmnOfSvg(),"bpmn.svg");
}

//下载方法
function funDownload(content, filename) {
    // 创建隐藏的可下载链接
    var eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    var blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
}