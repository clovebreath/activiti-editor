//定义bpmn元素的常量
const BPMN_EVENT_START = "bpmn-event-start";
const BPMN_EVENT_END = "bpmn-event-end";
const BPMN_TASK_USER = "bpmn-task-user";
const BPMN_GATEWAY_EXCLUSIVE = "bpmn-gateway-exclusive";
const BPMN_SEQUENCE_FLOW = "bpmn-sequence-flow";
const BPMN_PROCESS = "bpmn-process";
/**
 * 用于自动生成table的id项。
 * 0--process
 * 1--BPMN_SEQUENCE_FLOW
 * 2--BPMN_TASK_USER
 * 3--BPMN_EVENT_START
 * 4--BPMN_EVENT_END
 * 5--BPMN_GATEWAY_EXCLUSIVE
 */
let nomalTableIds=[];
/**
 * 用于分组展示其对应的中文
 */
const groupHeader={'General':'基础属性','Main Config':'额外配置','Process':'全局属性','Multi Instance':'多示例','id':'ID','name':'名称','initiator':'发起人',
'formKey':'对应表单名','assignee':'受让人','candidateUsers':'执行用户','candidateGroups':'执行用户组','collection':'集合','elementVariable':'组件变量',
'condition':'执行条件','type':'类型','default':'默认值'};
const startEventConfig = [
    {
        "name": "id",
        "value": "",
        "group": "General",
        "editor": "text"
    },
    {
        "name": "name",
        "value": "",
        "group": "General",
        "editor": "text"
    },
    {
        "name": "initiator",
        "value": "",
        "group": "Main Config",
        "editor": "text"
    },
    {
        "name": "formKey",
        "value": "",
        "group": "Main Config",
        "editor": "text"
    }
];
const processConfig=[
    {
        "name": "id",
        "value": "",
        "group": "Process",
        "editor": "text"
    },
    {
        "name": "name",
        "value": "",
        "group": "Process",
        "editor": "text"
    }
];
const endEventConfig=[
    {
        "name": "id",
        "value": "",
        "group": "General",
        "editor": "text"
    },
    {
        "name": "name",
        "value": "",
        "group": "General",
        "editor": "text"
    }
];
const userTaskConfig=[
    {
        "name": "id",
        "value": "",
        "group": "General",
        "editor": "text"
    },
    {
        "name": "name",
        "value": "",
        "group": "General",
        "editor": "text"
    },
    {
        "name": "assignee",
        "value": "",
        "group": "Main Config",
        "editor": "text"
    },
    {
        "name": "candidateUsers",
        "value": "",
        "group": "Main Config",
        "editor": "text"
    },
    {
        "name": "candidateGroups",
        "value": "",
        "group": "Main Config",
        "editor": "text"
    },
    {
        "name": "formKey",
        "value": "",
        "group": "Main Config",
        "editor": "text"
    },
    {
        "name": "collection",
        "value": "",
        "group": "Multi Instance",
        "editor": "text"
    },
    {
        "name": "elementVariable",
        "value": "",
        "group": "Multi Instance",
        "editor": "text"
    }
];
const exclusiveGatewayConfig=[
    {
        "name": "id",
        "value": "",
        "group": "General",
        "editor": "text"
    },
    {
        "name": "name",
        "value": "",
        "group": "General",
        "editor": "text"
    }
];
const sequenceFlowConfig=[
    {
        "name": "id",
        "value": "",
        "group": "General",
        "editor": "text"
    },
    {
        "name": "name",
        "value": "",
        "group": "General",
        "editor": "text"
    },
    {
        "name": "condition",
        "value": "",
        "group": "Main Config",
        "editor": "text"
    }
];

//svg初始属性
const svgStroke = "#808080";
const svgStorkeWidth = 2;
const svgWidth = 80;
const svgHeight = 48;

//svg对象
let bpmnSvg = null;
//当前选中对象
let selectSvgItem = null;
//这个svg的uuid
let processUuid = Math.uuid();
//用作自动生成的form中property属性计数
let fromPropertyIndex = [];

/**
 * 格式化方法，将英文转化为对应中文
 * @param value
 * @returns {*}
 */
function formatChinese(value) {
    return groupHeader[value];
}

/**
 * 初始化
 */
function initDesigner() {
    //初始化svg元素
    bpmnSvg = d3.select("#bpmn-svg").attr("uuid", processUuid).attr("id",processUuid);
    selectSvgItem = bpmnSvg.node();
    $(selectSvgItem).click(function (event) {
        clickSvgElement(event);
    });
    //定义箭头
    let defs = bpmnSvg.append("defs");
    let arrowMarker = defs.append("marker")
        .attr("id", "arrow")
        .attr("markerUnits", "userSpaceOnUse")
        .attr("markerWidth", "12")
        .attr("markerHeight", "12")
        .attr("viewBox", "0 0 12 12")
        .attr("refX", "9")
        .attr("refY", "6")
        .attr("orient", "auto");
    arrowMarker.append("path")
        .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
        .attr("fill", "#808080");
    //拖拽-左侧菜单栏
    $('.bpmn-list').draggable({
        revert: true, cursor: 'pointer', proxy: function getObj(source) {
            let p = $('<div style="border:1px solid #ccc;width:auto"></div>');
            p.html($(source).html()).appendTo('body');
            return p;
        }, onStopDrag: iconDragStop
    });

    //拖拽-箭头
    $('#bpmn-menu-arrow').draggable({
        revert: true, cursor: 'pointer', proxy: function getObj(source) {
            let p = $('<div style="width:auto"></div>');
            p.html($(source).html()).appendTo('body');
            return p;
        }, onStopDrag: arrowDragStop
    });

    //表格初始化
    //添加分组中文展示方法-main
    $('#bpmn-property-main').datagrid({
        groupFormatter:formatChinese
    });
    //加载初始数据
    $('#bpmn-property-main').propertygrid("loadData", JSON.parse(JSON.stringify(processConfig)));
    $('#bpmn-property-main').datagrid("updateRow",{"index":0,"row":{
        "name": "id",
        "value": selectSvgItem.getAttribute("id"),
        "group": "Process",
        "editor": "text"
    }});
    //添加分组中文展示方法-form
    $('#bpmn-property-form').datagrid({
        groupFormatter:function (value){
            return value.replace("property","属性");
        }
    });
    //Form区域隐藏
    $('#bpmn-form-area').hide();
    //调整对话框的位置
    let dialogWindow=$("body>div");
    let canvesWindow=$("#bpmn-canvas").offset();
    dialogWindow.eq(1).css("top",(canvesWindow.top)+"px").css("left", (canvesWindow.left)+`px`);
    dialogWindow.eq(2).css("top",(canvesWindow.top)+"px").css("left", (canvesWindow.left)+`px`);
    dialogWindow.eq(3).css("top",(canvesWindow.top)+"px").css("left",canvesWindow.left+$("#bpmn-canvas")[0].clientWidth-dialogWindow[3].clientWidth);
    dialogWindow.eq(4).css("top",(canvesWindow.top)+"px").css("left",canvesWindow.left+$("#bpmn-canvas")[0].clientWidth-dialogWindow[3].clientWidth-1);
    //初始化时需要触发svg面板的点击事件
    $("[type='bpmn-process']").click();
}

/**
 * 调整对话框的位置。todo 修改为在页面同样比例的位置。
 * 目前代码使页面大小改变后对话框改变了位置
 */
function setDialogPosition(){
    let dialogWindow=$("body>div");
    let canvesWindow=$("#bpmn-canvas").offset();
    dialogWindow.eq(1).css("top",(canvesWindow.top)+"px").css("left", (canvesWindow.left)+`px`);
    dialogWindow.eq(2).css("top",(canvesWindow.top)+"px").css("left", (canvesWindow.left)+`px`);
    dialogWindow.eq(3).css("top",(canvesWindow.top)+"px").css("left",canvesWindow.left+$("#bpmn-canvas")[0].clientWidth-dialogWindow[3].clientWidth);
    dialogWindow.eq(4).css("top",(canvesWindow.top)+"px").css("left",canvesWindow.left+$("#bpmn-canvas")[0].clientWidth-dialogWindow[3].clientWidth-1);
}

/**
 * 连线停止事件
 * @param e
 */
function arrowDragStop(e) {
    let postionX = e.pageX - $("[type='bpmn-process']").eq(0).offset().left;
    let positonY = e.pageY - $("[type='bpmn-process']").eq(0).offset().top;

    if (postionX > 0 && positonY > 0) {
        let targetItem = getElementByPosition(postionX, positonY);
        if (targetItem !== null) {
            let flow = drawFlow(selectSvgItem, targetItem);debugger
            $(flow.node()).click();
        }
    }
}

/**
 * 获取svg在给定坐标处的元素(有多个时选中最上层)
 * @param svgX
 * @param svgY
 * @returns {*}
 */
function getElementByPosition(svgX, svgY) {
    let tempItem = null;
    d3.selectAll("svg>g").each(
        function () {
            //首先要排除连线的干扰
            if(this.getAttribute("type")!==BPMN_SEQUENCE_FLOW){
                let box = this.getBBox();
                if (box.x < svgX && svgX < (box.x + box.width) && box.y < svgY && svgY < (box.y + box.height)) {
                    tempItem = this;
                }
            }
        }
    );
    return tempItem;
}

/**
 * 删除元素
 */
function deleteItem() {
    let tempUuid = selectSvgItem.getAttribute("uuid");
    //删除有关系的连线,若是被删除的元素本身就是连线，则跳过
    d3.selectAll("path").each(
        function (d, i) {
            if (this.getAttribute("source-ref") === tempUuid || this.getAttribute("target-ref") === tempUuid) {
                d3.select(this).remove();
            }
        }
    );
    d3.selectAll("line").each(
        function (d, i) {
            if (this.getAttribute("source-ref") === tempUuid || this.getAttribute("target-ref") === tempUuid) {
                d3.select(this).remove();
            }
        }
    );
    //删除元素本身
    selectSvgItem.remove();
    $("#bpmn-menu-area").hide();
    $("[type='bpmn-process']").click();
}

/**
 * 从菜单栏拖拽停止的事件(绘图)
 * @param e
 * @returns {*}
 */
function iconDragStop(e) {
    //计算绘图区和body坐标差，方便进行转换。
    let canvasTop = $("[type='bpmn-process']").offset().top - $("body").offset().top ;
    let canvasLeft = $("[type='bpmn-process']").offset().left - $("body").offset().left ;
    //定义d3拖拽对象，后续添加到对象上，使其可移动
    let dragEvent = d3.drag()
        .on("start", onSvgItemDragStart)
        .on("drag", onSvgItemDrag)
        .on("end", onSvgItemDragEnd)
        .subject(function () {
            let t = d3.select(this);
            return {
                x: t.node().getBBox().x,
                y: t.node().getBBox().y
            };
        });
    let item=null;
    //拖出对话框，则有效
    if (e.data.top > canvasTop && checkDragPosition(e.data.left,e.data.top)) {
        switch (e.data.target.id) {
            case BPMN_EVENT_START:
                item = appendItem(bpmnSvg, e.data.left-canvasLeft, e.data.top-canvasTop,svgWidth,svgHeight)
                    .attr("type", BPMN_EVENT_START)
                    .call(dragEvent);
                break;
            case BPMN_EVENT_END:
                item = appendItem(bpmnSvg, e.data.left-canvasLeft, e.data.top-canvasTop,svgWidth,svgHeight)
                    .attr("type", BPMN_EVENT_END)
                    .call(dragEvent);
                break;
            case BPMN_TASK_USER:
                item = appendItem(bpmnSvg, e.data.left-canvasLeft, e.data.top-canvasTop,svgWidth,svgHeight)
                    .attr("type", BPMN_TASK_USER)
                    .call(dragEvent);
                break;
            case BPMN_GATEWAY_EXCLUSIVE:
                item = appendItem(bpmnSvg, e.data.left-canvasLeft, e.data.top-canvasTop,svgWidth,svgHeight)
                    .attr("type", BPMN_GATEWAY_EXCLUSIVE)
                    .call(dragEvent);
                break;
            default:
                break;
        }
    }
    if (item) {
        item.node().__data__=[];
        $(item.node()).click();
    }
    return item;
}

/**
 * 检查落点是否符合生成元素的条件
 * @param posX 绝对坐标
 * @param posY 绝对坐标
 */
function checkDragPosition(posX,posY){
    //获取相对坐标
    let canvasTop = $("[type='bpmn-process']").offset().top - $("body").offset().top ;
    let canvasLeft = $("[type='bpmn-process']").offset().left - $("body").offset().left ;
    let relativeX=posX-canvasLeft;
    let relativeY=posY-canvasTop;

    //首先检查目标点是否在对话框上，使用绝对坐标
    for(let i=0; i<$(".window").length; i++){
        let tempWindow=$(".window").eq(i);
        let windowY1=tempWindow.offset().top;
        let windowX1=tempWindow.offset().left;
        let windowY2=tempWindow.offset().top+tempWindow.height();
        let windowX2=tempWindow.offset().left+tempWindow.width();
        if((windowX1<posX && posX<windowX2)&&(windowY1<posY && posY<windowY2)){
            return false;
        }
    }

    //然后判断是否有足够的空间新建一个矩形，使用相对坐标
    let x0=relativeX-6,x1=relativeX+svgWidth+6;
    let y0=relativeY-6,y1=relativeY+svgHeight+6;
    for(let x=x0;x<=x1;x=x+3){
        let tmpItem=getElementByPosition(x, y0);
        if (tmpItem) {
            return false;
        }
        tmpItem=getElementByPosition(x, y1);
        if (tmpItem) {
            return false;
        }
    }
    for(let y=y0;y<=y1;y=y+3){
        let tmpItem=getElementByPosition(x0, y);
        if (tmpItem) {
            return false;
        }
        tmpItem=getElementByPosition(x1, y);
        if (tmpItem) {
            return false;
        }
    }
    return true;
}

/**
 * 判断两个元素的位置关系
 * @param itemStart
 * @param itemEnd
 * @returns string 四个方位(NSWE)。重叠则为none tips:可扩展为8个方位。
 */
function getFlowType(itemStart, itemEnd) {
    let boxStart = itemStart.getBBox();
    let boxEnd = itemEnd.getBBox();
    let x11 = boxStart.x, x12 = boxStart.x + boxStart.width, x21 = boxEnd.x, x22 = boxEnd.x + boxEnd.width;
    let y11 = boxStart.y, y12 = boxStart.y + boxStart.height, y21 = boxEnd.y, y22 = boxEnd.y + boxEnd.height;
    let x1m = (x11 + x12) / 2, x2m = (x21 + x22) / 2, y1m = (y11 + y12) / 2, y2m = (y21 + y22) / 2;
    if (x11 >= x22) {//结点2在结点1左边(x轴无交集)
        if (y11 > y22) { //结点2在结点1左上方（y轴无交集）
            if(angle({'x': x1m,'y': y1m},{'x': x2m,'y': y2m})<45){
                return "W";
            }else{
                return "N";
            }
        }
        else if (y12 < y21) {//结点2在结点1左下方（y轴无交集）
            if(angle({'x': x1m,'y': y1m},{'x': x2m,'y': y2m})>-45){
                return "W";
            }else{
                return "S";
            }
        }
        else {//y轴有交集
            return "W";
        }
    }
    else if (x12 <= x21) {//结点2在结点1右边(x轴无交集)
        if (y11 > y22) { //结点2在结点1右上方（y轴无交集）
            if(angle({'x': x1m,'y': y1m},{'x': x2m,'y': y2m})>-45){
                return "E";
            }else{
                return "N";
            }
        }
        else if (y12 < y21) {//结点2在结点1右下方（y轴无交集）
            if(angle({'x': x1m,'y': y1m},{'x': x2m,'y': y2m})<45){
                return "E";
            }else{
                return "S";
            }
        }
        else {//y轴有交集
            return "E";
        }
    }
    else { //结点2和结点1（x轴有交集）
        if (y11 > y22) { //结点2在结点1上方（y轴无交集）
            return "N";
        }
        else if (y12 < y21) {//结点2在结点1下方（y轴无交集）
            return "S";
        }
        else {//y轴有交集
            return "none";
        }
    }
}

/**
 * 计算两个点连线与水平线的角度
 * @param start {x:x,y:y}
 * @param end {x:x,y:y}
 * @returns {number}
 */
function angle(start,end){
    let disX = end.x - start.x;
    let disY = end.y - start.y;
    return 360*Math.atan(disY/disX)/(2*Math.PI);
}

/**
 * 在两个元素之间画连接线
 * @param itemStart
 * @param itemEnd
 * @returns {*}
 */
function drawFlow(itemStart, itemEnd) {
    let startUuid=itemStart.getAttribute("uuid");
    let endUuid=itemEnd.getAttribute("uuid");
    let flow;debugger
    //如果已存在连线，则直接返回
    if($(`[target-ref="${endUuid}"][source-ref="${startUuid}"]`).attr("type")===BPMN_SEQUENCE_FLOW){
        flow = d3.select(`[target-ref="${endUuid}"][source-ref="${startUuid}"]`);
    }else{
        let flowType = getFlowType(itemStart, itemEnd);
        let boxStart = itemStart.getBBox();
        let boxEnd = itemEnd.getBBox();
        let x11 = boxStart.x, x12 = boxStart.x + boxStart.width, x21 = boxEnd.x, x22 = boxEnd.x + boxEnd.width;
        let y11 = boxStart.y, y12 = boxStart.y + boxStart.height, y21 = boxEnd.y, y22 = boxEnd.y + boxEnd.height;
        let x1m = (x11 + x12) / 2, x2m = (x21 + x22) / 2, y1m = (y11 + y12) / 2, y2m = (y21 + y22) / 2;
        let group=bpmnSvg.append("g");
        switch (flowType) {
            case "N":
                flow = appendLine(group,x1m,y11,x2m,y22);
                break;
            case "S":
                flow = appendLine(group,x1m,y12,x2m,y21);
                break;
            case "E":
                flow = appendLine(group,x12,y1m,x21,y2m);
                break;
            case "W":
                flow = appendLine(group,x11,y1m,x22,y2m);
                break;
            default:break;
        }
        if(flow){
            flow.attr("uuid", Math.uuid())
                .attr("target-ref",endUuid)
                .attr("source-ref",startUuid)
                .attr("type",BPMN_SEQUENCE_FLOW);
            $(flow.node()).click(function (event) {
                clickSvgElement(event);
            });
            flow.node().__data__=[];
        }else{
            console.log("draw line error:",flow)
        }
    }
    return flow;
}

/**
 * 添加元素到svg上
 * @param svgContainer
 * @param x
 * @param y
 * @param width
 * @param height
 */
function appendItem(svgContainer,x,y,width,height){
    let group=svgContainer.append("g").attr("uuid", Math.uuid());
    let item=group.append("rect")
        .attr("x",parseInt(x))
        .attr("y",parseInt(y))
        .attr("width",parseInt(width))
        .attr("height",parseInt(height))
        .attr("stroke-width",0)
        .attr("rx",10)
        .attr("ry",10);
    let label=group.append("text")
        .attr("x",parseInt(x)+parseInt(width)/2)
        .attr("y",parseInt(y)+parseInt(height)/2)
        .attr("text-anchor","middle")
        .attr("dominant-baseline","middle");
    $(group.node()).click(function (event) {
        clickSvgElement(event);
    });
    return group;
}

/**
 * 画线
 * @param group
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
function appendLine(group, x1, y1, x2, y2) {
    let svgLine = group.append("line")
        .attr("x1", parseInt(x1))
        .attr("y1", parseInt(y1))
        .attr("x2", parseInt(x2))
        .attr("y2", parseInt(y2))
        .attr("stroke", svgStroke)
        .attr("stroke-width", svgStorkeWidth)
        .attr("marker-end", "url(#arrow)");
    let label=group.append("text")
        .attr("x",svgLine.node().getBBox().x+svgLine.node().getBBox().width/2)
        .attr("y",svgLine.node().getBBox().y+svgLine.node().getBBox().height/2)
        .attr("text-anchor","middle")
        .attr("dominant-baseline","middle");
    return group;
}

/**
 * 修改连线
 * @param group
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 */
function changeLine(group, x1, y1, x2, y2) {
    // let newGroup=bpmnSvg.append("g")
    //     .attr("uuid",group.attr("uuid"))
    //     .attr("id",group.attr("id"))
    //     .attr("source-ref",group.attr("source-ref"))
    //     .attr("target-ref",group.attr("target-ref"))
    //     .attr("type",group.attr("type"))
    // ;
    // let svgLine=newGroup.append("line")
    //     .attr("x1", x1)
    //     .attr("y1", y1)
    //     .attr("x2", x2)
    //     .attr("y2", y2)
    //     .attr("stroke", svgStroke)
    //     .attr("stroke-width", svgStorkeWidth)
    //     .attr("marker-end", "url(#arrow)");
    // newGroup.append("text")
    //     .attr("x",svgLine.node().getBBox().x+svgLine.node().getBBox().width/2)
    //     .attr("y",svgLine.node().getBBox().y+svgLine.node().getBBox().height/2)
    //     .attr("text-anchor","middle")
    //     .attr("dominant-baseline","middle");
    // $(newGroup.node()).click(function (event) {
    //     clickSvgElement(event);
    // });
    // newGroup.datum(group.data());

    let svgLine = group.select("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2);
    let label = group.select("text")
        .attr("x",svgLine.node().getBBox().x+svgLine.node().getBBox().width/2)
        .attr("y",svgLine.node().getBBox().y+svgLine.node().getBBox().height/2);
    return group;
}

/**
 * 移动元素后重新绘制连接线
 * @param item
 */
function reDrawPath(item) {
    d3.selectAll("g[target-ref][source-ref]").each(
        function(){
            let group=d3.select(this);
            let flowType, boxStart, boxEnd;
            if (item.getAttribute("uuid") === this.getAttribute("source-ref")) {
                let otherItem = $("[type][uuid=" + this.getAttribute('target-ref') + "]")[0];
                flowType = getFlowType(item, otherItem);
                boxStart = item.getBBox();
                boxEnd = otherItem.getBBox();
            }
            else if (item.getAttribute("uuid") === this.getAttribute("target-ref")) {
                let otherItem = $("[type][uuid=" + this.getAttribute('source-ref') + "]")[0];
                flowType = getFlowType(otherItem,item);
                boxStart = otherItem.getBBox();
                boxEnd = item.getBBox();
            }
            if(flowType && boxStart && boxEnd){
                let x11 = boxStart.x, x12 = boxStart.x + boxStart.width, x21 = boxEnd.x, x22 = boxEnd.x + boxEnd.width;
                let y11 = boxStart.y, y12 = boxStart.y + boxStart.height, y21 = boxEnd.y, y22 = boxEnd.y + boxEnd.height;
                let x1m = (x11 + x12) / 2, x2m = (x21 + x22) / 2, y1m = (y11 + y12) / 2, y2m = (y21 + y22) / 2;
                switch (flowType) {
                    case "N":
                        changeLine(group,x1m,y11,x2m,y22);
                        break;
                    case "S":
                        changeLine(group,x1m,y12,x2m,y21);
                        break;
                    case "E":
                        changeLine(group,x12,y1m,x21,y2m);
                        break;
                    case "W":
                        changeLine(group,x11,y1m,x22,y2m);
                        break;
                    default:break;
                }
            }
        }
    );
}

/**
 * svg元素移动开始前的事件
 */
function onSvgItemDragStart() {
    //触发主面板点击事件
    $("svg").click();
}

/**
 *svg元素移动事件
 */
function onSvgItemDrag() {

    let eventX = parseInt(d3.event.x);
    let eventY = parseInt(d3.event.y);
    let nodes=d3.select(this).node().children;
    //根据当前状态修改位置
    if(getDragStatus(eventX,eventY,this).canDrag){
        $(nodes[0]).attr("x",eventX).attr("y", eventY);
        $(nodes[1]).attr("x",eventX+nodes[0].getBBox().width/2).attr("y", eventY+nodes[0].getBBox().height/2);
        reDrawPath(this);
    }
    //若不能完全实现鼠标目标方向，则尝试x轴或y轴的平移
    else if(getDragStatus(eventX,this.getBBox().y,this).canDrag){
        $(nodes[0]).attr("x",eventX);
        $(nodes[1]).attr("x",eventX+nodes[0].getBBox().width/2);
        reDrawPath(this);
    }
    else if(getDragStatus(this.getBBox().x,eventY,this).canDrag){
        $(nodes[0]).attr("y", eventY);
        $(nodes[1]).attr("y", eventY+nodes[0].getBBox().height/2);
        reDrawPath(this);
    }
}

/**
 * 根据传入坐标判断能否拖拽
 * @param eventX
 * @param eventY
 * @param element
 * @returns {{canDrag: boolean}}
 */
function getDragStatus(eventX,eventY,element){
    //暂时只有一个属性：能否移动。
    let status={
        "canDrag":true
    };
    let eleBox=element.getBBox();
    //与其他item的最小距离为6px,(下面计算结果可能出现为3px的情况);
    let x0=eventX-6,x1=x0+eleBox.width+12;
    let y0=eventY-6,y1=y0+eleBox.height+12;
    for(let x=x0;x<=x1;x=x+3){
        let tmpItem=getElementByPosition(x, y0);
        if (tmpItem && element.getAttribute("uuid") !== tmpItem.getAttribute("uuid")) {
            status.canDrag=false;
            break;
        }
        tmpItem=getElementByPosition(x, y1);
        if (tmpItem && element.getAttribute("uuid") !== tmpItem.getAttribute("uuid")) {
            status.canDrag=false;
            break;
        }
    }
    for(let y=y0;y<=y1;y=y+3){
        let tmpItem=getElementByPosition(x0, y);
        if (tmpItem && element.getAttribute("uuid") !== tmpItem.getAttribute("uuid")) {
            status.canDrag=false;
            break;
        }
        tmpItem=getElementByPosition(x1, y);
        if (tmpItem && element.getAttribute("uuid") !== tmpItem.getAttribute("uuid")) {
            status.canDrag=false;
            break;
        }
    }

    d3.selectAll("svg>g").each(
        function () {
            //首先要排除连线的干扰
            if(this.getAttribute("type")!==BPMN_SEQUENCE_FLOW){
                let box = this.getBBox();
                if ( x0<=box.x && ((box.x+box.width)<=x1) && y0<=box.y && ((box.y+box.height)<=y1 && this.getAttribute("uuid")!==element.getAttribute("uuid")) ) {
                    status.canDrag=false;
                }
            }
        }
    );

    return status;
}

/**
 * svg元素移动完的事件
 */
function onSvgItemDragEnd() {
    d3.event.sourceEvent.stopPropagation();
    //触发自己的点击事件
    $(this).click();
}

/**
 * 点击时显示小菜单
 * @param element
 */
function setMiniMenu(element) {
    //设置被选中的item
    selectSvgItem = element;
    //如果是svg面板，隐藏浮动菜单
    if (BPMN_PROCESS === element.getAttribute("type")) {
        $("#bpmn-menu-area").hide();
    }
    //如果是连线，则隐藏连线图标,小菜单移动到中心位置
    else if(BPMN_SEQUENCE_FLOW === element.getAttribute("type")){
        $("#bpmn-menu-area").css("left",element.getBBox().x+element.getBBox().width/2)
            .css("top",element.getBBox().y+element.getBBox().height/2);
        $("#bpmn-menu-area").show();
        $("#bpmn-menu-arrow").hide();
    }
    else {
        let outingBox = selectSvgItem.getBBox();
        let midPointX = outingBox.x + outingBox.width / 2;
        let midPointY = outingBox.y + outingBox.height / 2;
        $("#bpmn-menu-area").show();
        $("#bpmn-menu-arrow").show();
        $("#bpmn-menu-area").css("left", outingBox.x);
        $("#bpmn-menu-area").css("top", outingBox.y + outingBox.height);
    }
}

/**
 * 点击时显示对应table
 * @param element 被点击的元素
 */
function showPropertiesTable(element) {
    let type = element.getAttribute("type");
    let formArea=$('#bpmn-form-area');
    let mainPropertyArea=$('#bpmn-property-main');
    //初始化表格，注：使用JSON.parse(JSON.stringify())原因是直接使用jsonObject后该object会被修改，具体原因尚未弄清。
    switch (type) {
        case BPMN_PROCESS:
            formArea.hide();
            mainPropertyArea.propertygrid("loadData", JSON.parse(JSON.stringify(processConfig)));
            break;
        case BPMN_EVENT_START:
            formArea.hide();
            mainPropertyArea.propertygrid("loadData", JSON.parse(JSON.stringify(startEventConfig)));
            break;
        case BPMN_EVENT_END:
            formArea.hide();
            mainPropertyArea.propertygrid("loadData", JSON.parse(JSON.stringify(endEventConfig)));
            break;
        case BPMN_TASK_USER:
            formArea.show();
            mainPropertyArea.propertygrid("loadData",JSON.parse(JSON.stringify(userTaskConfig)));
            break;
        case BPMN_GATEWAY_EXCLUSIVE:
            formArea.hide();
            mainPropertyArea.propertygrid("loadData",JSON.parse(JSON.stringify(exclusiveGatewayConfig)));
            break;
        case BPMN_SEQUENCE_FLOW:
            formArea.hide();
            mainPropertyArea.propertygrid("loadData",JSON.parse(JSON.stringify(sequenceFlowConfig)));
            break;
    }
    //将已有的属性填写到表格上
    setProperties(element);
}

/**
 * 元素点击事件
 * @param e
 */
function clickSvgElement(e) {debugger
    e.stopPropagation();
    if(e.target.getAttribute("type")&&e.target.getAttribute("type")!=="null"){
        bindPropertiesToItem(selectSvgItem);
        setMiniMenu(e.target);
        showPropertiesTable(e.target);
    }else{
        let groupNode=e.target.parentNode;
        if(groupNode.getAttribute("type")&&groupNode.getAttribute("type")!=="null"){
            bindPropertiesToItem(selectSvgItem);
            setMiniMenu(groupNode);
            showPropertiesTable(groupNode);
        }
    }
}

/**
 * 自动获取新建的元素的默认id
 * @param uuid 元素的uuid
 */
function getAutoId(uuid){
    //根据uuid判断当前元素类型
    let itemType=$("[type][uuid="+uuid+"]").attr("type");
    let autoId=uuid;
    switch (itemType){//自动生成id方法
        case BPMN_PROCESS:
            autoId=uuid;
            break;
        case BPMN_SEQUENCE_FLOW:
            nomalTableIds[1]=nomalTableIds[1]?++nomalTableIds[1]:1;
            autoId="flow"+nomalTableIds[1];
            break;
        case BPMN_TASK_USER:
            nomalTableIds[2]=nomalTableIds[2]?++nomalTableIds[2]:1;
            autoId="usertask"+nomalTableIds[2];
            break;
        case BPMN_EVENT_START:
            nomalTableIds[3]=nomalTableIds[3]?++nomalTableIds[3]:1;
            autoId="startevent"+nomalTableIds[3];
            break;
        case BPMN_EVENT_END:
            nomalTableIds[4]=nomalTableIds[4]?++nomalTableIds[4]:1;
            autoId="endevent"+nomalTableIds[4];
            break;
        case BPMN_GATEWAY_EXCLUSIVE:
            nomalTableIds[5]=nomalTableIds[5]?++nomalTableIds[5]:1;
            autoId="exclusivegateway"+nomalTableIds[5];
            break;
        default:
            autoId=null;
            break;
    }
    return autoId;
}

/**
 * 将表格中修改的属性绑定到元素上
 * @param element
 */
function bindPropertiesToItem(element) {
    if (!element) {
        console.log("bind property to element error, element",element);
        return;
    }
    if($('#bpmn-property-main').propertygrid('getRowIndex',$('#bpmn-property-main').propertygrid('getSelected'))!==null){
        $('#bpmn-property-main').propertygrid('endEdit',$('#bpmn-property-main').propertygrid('getRowIndex',$('#bpmn-property-main').propertygrid('getSelected')));
    }
    //main区域的属性
    let mainData = $('#bpmn-property-main').propertygrid('getRows');
    let additionalData = [];
    //form区域的属性
    if ($('#bpmn-form-area').css("display") !== "none") {
        if($('#bpmn-property-form').propertygrid('getRowIndex',$('#bpmn-property-form').propertygrid('getSelected'))!==null){
            $('#bpmn-property-form').propertygrid('endEdit',$('#bpmn-property-form').propertygrid('getRowIndex',$('#bpmn-property-form').propertygrid('getSelected')));
        }
        additionalData = $('#bpmn-property-form').propertygrid('getRows');
        //对form的属性进行处理，如果全是空，就不保存
        for(let i=additionalData.length;i>0;i=i-3){
            if(!(additionalData[i-1].value||additionalData[i-2].value||additionalData[i-3].value)){
                additionalData.splice(i-3,3);
            }
        }
        if(additionalData.length>0){
            //整理剩余数据的序号
            let index=1;
            for(let i=0;i<additionalData.length;i=i+3){
                additionalData[i].group="property"+index;
                additionalData[i+1].group="property"+index;
                additionalData[i+2].group="property"+index;
                index++;
            }
            fromPropertyIndex[element.getAttribute("uuid")]=index-1;
        }
        else {
            //添加空的property1
            additionalData[0]={name: "id", value: "", group: "property1", editor: "text"};
            additionalData[1]={name: "type", value: "", group: "property1", editor: "text"};
            additionalData[2]={name: "default", value: "", group: "property1", editor: "text"};
            fromPropertyIndex[element.getAttribute("uuid")]=1;
        }
        //获取后将form区域清空
        $('#bpmn-property-form').propertygrid('loadData',[]);
    }
    //组合
    mainData=mainData.concat(additionalData);
    d3.select("[type][uuid='" + element.getAttribute("uuid") + "']").datum(mainData);
    //将id绑定到g元素上
    if(mainData[0].name&&mainData[0].name==="id"){
        element.id=mainData[0].value;
    }else{
        console.log("set id to element error, id:",mainData[0].name,mainData[0].value);
    }
    //将name绑定到text元素上
    if(mainData[1].name&&mainData[1].name==="name"){
        $(element).children("text").html(mainData[1].value);
        resizeGroup(element);
    }else{
        console.log("set name to element error, name:",mainData[1].name,mainData[1].value);
    }
}

/**
 * 根据文字长度调整组内元素大小 todo 需要考虑调整大小后与其他节点是否重叠的问题
 * @param group
 */
function resizeGroup(group){
    if(group.tagName==='g'){
        let textToLang=false;
        let rect=group.children[0];
        let text=group.children[1];
        if($(text).html()){
            let x=rect.getBBox().x+text.getBBox().width+40;
            let y0=rect.getBBox().y-6;
            let y1=rect.getBBox().y+rect.getBBox().height+6;
            //首先判断文字是否过长以致于会和其它元素相交
            for(;y0<y1;y0=y0+3){
                let tmpItem=getElementByPosition(x, y0);
                if (tmpItem && group.getAttribute("uuid") !== tmpItem.getAttribute("uuid")) {
                    textToLang=true;
                    break;
                }
            }

            if(textToLang){
                //如果文字过长，就吧显示的文字去掉一半
                text.innerHTML=text.innerHTML.substr(0,text.innerHTML.length/2)+"..";
                resizeGroup(group);
            }else{
                if(rect.getBBox().width < (text.getBBox().width+40)){
                    $(rect).attr("width",text.getBBox().width+40);
                    $(text).attr("x",rect.getBBox().x+rect.getBBox().width/2);
                }
                if(rect.getBBox().width > (text.getBBox().width+40)){
                    $(rect).attr("width",text.getBBox().width+40);
                    $(text).attr("x",rect.getBBox().x+rect.getBBox().width/2);
                }
            }
        }else{
            $(rect).attr("width",svgWidth);
        }
        //重绘线条
        reDrawPath(group);
    }
}

/**
 * 将element的相关属性设置到对应表格中
 * @param element
 */
function setProperties(element) {

    let data = d3.select("[type][uuid='"+element.getAttribute("uuid")+"']").data();
    let mainTable=$('#bpmn-property-main');
    //获取数据
    if(!data[0]||data[0].length===0){//未绑定数据或绑定数据为空
        if(element.getAttribute("type")===BPMN_PROCESS){
            mainTable.datagrid("updateRow",{"index":0,"row":{
                "name": "id",
                "value": element.getAttribute("id"),
                "group": "Process",
                "editor": "text"
            }})
        } else{
            mainTable.datagrid("updateRow",{"index":0,"row":{
                "name": "id",
                "value": getAutoId(element.getAttribute("uuid")),
                "group": "General",
                "editor": "text"
            }})
        }
        if(element.getAttribute("type")===BPMN_TASK_USER){
            newFormProperty(element.getAttribute("uuid"));
        }

        return;
    }else {
        data=data[0];
    }
    //写入normal数据
    let mainTableRows=mainTable.datagrid("getRows");
    let dataIndex=0,mainTableIndex=0;
    while(mainTableIndex<mainTableRows.length && dataIndex<data.length){
        mainTable.datagrid("updateRow",{"index":mainTableIndex++,"row": data[dataIndex++]});
    }
    //写入form的数据
    let additionalTable=$('#bpmn-property-form');
    let additionalTableRows=$('#bpmn-property-form').datagrid("getRows");
    let additionalTableIndex=0;
    while(additionalTableIndex<additionalTableRows.length && dataIndex<data.length){
        additionalTable.datagrid("updateRow",{"index":additionalTableIndex++,"row": data[dataIndex++]});
    }
    for(;dataIndex<data.length;dataIndex++ ){
        $('#bpmn-property-form').datagrid('appendRow',data[dataIndex]);
    }

}

/**
 * 获取svg的xml文件 todo 修改为保存到数据库
 */
function getSvgFile() {
    funDownload(getBpmnOfSvg(), "designer.bpmn");
}

/**
 * 下载方法
 */
function funDownload(content, filename) {
    // 创建隐藏的可下载链接
    let eleLink = document.createElement('a');
    eleLink.download = filename;
    eleLink.style.display = 'none';
    // 字符内容转变成blob地址
    let blob = new Blob([content]);
    eleLink.href = URL.createObjectURL(blob);
    // 触发点击
    document.body.appendChild(eleLink);
    eleLink.click();
    // 然后移除
    document.body.removeChild(eleLink);
}

/**
 * 给form表单新建一栏，属性属于当前svg元素（必定是task）
 */
function newFormProperty() {
    let uuid = selectSvgItem.getAttribute("uuid");
    if(fromPropertyIndex[uuid]){
        fromPropertyIndex[uuid]++;
    }else{
        fromPropertyIndex[uuid]=1;
    }
    $('#bpmn-property-form').datagrid('appendRow',{"name": "id",
        "value": "",
        "group": "property"+fromPropertyIndex[uuid],
        "editor": "text"
    });
    $('#bpmn-property-form').datagrid('appendRow', {"name": "type",
        "value": "",
        "group": "property"+fromPropertyIndex[uuid],
        "editor": "text"
    });
    $('#bpmn-property-form').datagrid('appendRow',{"name": "default",
        "value": "",
        "group": "property"+fromPropertyIndex[uuid],
        "editor": "text"
    });
}

/**
 * 获取svg对应的bpmn
 * @returns {string}
 */
function getBpmnOfSvg(){
    const bpmnHeader="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
        "<definitions xmlns=\"http://www.omg.org/spec/BPMN/20100524/MODEL\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" " +
        "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" xmlns:activiti=\"http://activiti.org/bpmn\" " +
        "xmlns:bpmndi=\"http://www.omg.org/spec/BPMN/20100524/DI\" xmlns:omgdc=\"http://www.omg.org/spec/DD/20100524/DC\" " +
        "xmlns:omgdi=\"http://www.omg.org/spec/DD/20100524/DI\" typeLanguage=\"http://www.w3.org/2001/XMLSchema\" " +
        "expressionLanguage=\"http://www.w3.org/1999/XPath\" targetNamespace=\"http://www.asiainfo.com/activiti\">\n";
    const bpmnFooter="</definitions>";
    $("[type='bpmn-process']").click();
    let svgObj = document.getElementsByTagName("svg")[0].children;
    let processUuid=document.getElementsByTagName("svg")[0].getAttribute("uuid");
    let bpmnProcessChilds=[];
    let bpmnPlaneChilds=[];
    for(let childItem of svgObj){
        getItemBpmn(childItem,bpmnProcessChilds,bpmnPlaneChilds);
    }
    let i=0;
    //bpmnDiagram的xml头尾
    let bpmnDiagramXmlStart=`<bpmndi:BPMNDiagram id="${"BPMNDiagram_"+processUuid}">\n`;
    let bpmnDiagramXmlEnd="</bpmndi:BPMNDiagram>\n";
    //bpmnprocess以及bpmnPlane的xml内容
    let bpmnProcessXml=getProcessXml(processUuid);
    let bpmnPlaneXml=`<bpmndi:BPMNPlane bpmnElement="${processUuid}" id="${"BPMNPlane_"+processUuid}">\n`;
    while(i<bpmnProcessChilds.length){
        bpmnProcessXml+=bpmnProcessChilds[i];
        bpmnPlaneXml+=bpmnPlaneChilds[i++];
    }
    bpmnProcessXml+="</process>\n";
    bpmnPlaneXml+="</bpmndi:BPMNPlane>\n";
    //最终的xml文本内容
    let bpmnContent=bpmnHeader+bpmnProcessXml+bpmnDiagramXmlStart+bpmnPlaneXml+bpmnDiagramXmlEnd+bpmnFooter;
    return bpmnContent;
}

/**
 * 获取process的相关xml
 * @param uuid
 * @returns {string}
 */
function getProcessXml(uuid){
    let tempXml="<process _id_ _name_ isExecutable=\"true\" >\n";
    let datas=d3.select("[uuid='"+uuid+"']").data()[0];
    for(let data of datas){
        switch (data.group){
            case "Process":
                if(data.value){
                    tempXml=tempXml.replace("_"+data.name+"_",data.name+"=\""+data.value+"\"");
                }else{
                    tempXml=tempXml.replace("_"+data.name+"_","");
                }
                break;
            case "General":
                if(data.value){
                    tempXml=tempXml.replace("_"+data.name+"_",data.name+"=\""+data.value+"\"");
                }else{
                    tempXml=tempXml.replace("_"+data.name+"_","");
                }
                break;
        }
    }
    return tempXml;
}

/**
 * 获取startevent的相关xml
 * @param uuid
 * @returns {string}
 */
function getStartEventXml(uuid){
    let tempXml="<startEvent _id_ _name_ _activiti:initiator_ _activiti:formKey_></startEvent>\n";
    let datas=d3.select("[uuid='"+uuid+"']").data()[0];
    for(let data of datas){
        switch (data.group){
            case "General":
                if(data.value){
                    tempXml=tempXml.replace("_"+data.name+"_",data.name+"=\""+data.value+"\"");
                }else{
                    tempXml=tempXml.replace("_"+data.name+"_","");
                }
                break;
            case "Main Config":
                if(data.value){
                    tempXml=tempXml.replace("_activiti:"+data.name+"_","activiti:"+data.name+"=\""+data.value+"\"");
                }else{
                    tempXml=tempXml.replace("_activiti:"+data.name+"_","");
                }
                break;
        }
    }
    return tempXml;
}

/**
 * 获取endevent的相关xml
 * @param uuid
 * @returns {string}
 */
function getEndEventXml(uuid){
    let tempXml="    <endEvent _id_ _name_></endEvent>\n";
    let datas=d3.select("[uuid='"+uuid+"']").data()[0];
    for(let data of datas){
        switch (data.group){
            case "General":
                if(data.value){
                    tempXml=tempXml.replace("_"+data.name+"_",data.name+"=\""+data.value+"\"");
                }else{
                    tempXml=tempXml.replace("_"+data.name+"_","");
                }
                break;
        }
    }
    return tempXml;
}

/**
 * 获取exclusivegateway的相关xml
 * @param uuid
 * @returns {string}
 */
function getExclusiveGatewayXml(uuid){
    let tempXml="<exclusiveGateway _id_ _name_></exclusiveGateway>\n";
    let datas=d3.select("[uuid='"+uuid+"']").data()[0];
    for(let data of datas){
        switch (data.group){
            case "General":
                if(data.value){
                    tempXml=tempXml.replace("_"+data.name+"_",data.name+"=\""+data.value+"\"");
                }else{
                    tempXml=tempXml.replace("_"+data.name+"_","");
                }
                break;
        }
    }
    return tempXml;
}

/**
 * 获取sequenceflow的相关xml
 * @param uuid
 * @returns {string}
 */
function getSequenceFlowXml(uuid){
    let tempXml="<sequenceFlow _id_ _name_ _sourceRef_ _targetRef_>\n_subItem_</sequenceFlow>\n";
    let condition="<conditionExpression xsi:type=\"tFormalExpression\"><![CDATA[_condition_]]></conditionExpression>\n";
    let flow=$("[uuid='"+uuid+"']");

    //设置基本属性sourceref和targetref
    tempXml=tempXml.replace("_sourceRef_", "sourceRef=\""+$("[uuid='"+flow.attr("source-ref")+"']").attr("id")+"\"");
    tempXml=tempXml.replace("_targetRef_", "targetRef=\""+$("[uuid='"+flow.attr("target-ref")+"']").attr("id")+"\"");

    let datas=d3.select("[uuid='"+uuid+"']").data()[0];

    for(let data of datas){
        switch (data.group){
            case "General":
                if(data.value){
                    tempXml=tempXml.replace("_"+data.name+"_",data.name+"=\""+data.value+"\"");
                }else{
                    tempXml=tempXml.replace("_"+data.name+"_","");
                }
                break;
            case "Main Config":
                if(data.value){
                    condition=condition.replace("_"+data.name+"_",data.value);
                }else{
                    condition=condition.replace("_"+data.name+"_","");
                }
                break;
        }
    }
    if(condition.indexOf("<![CDATA[]]>")<0){
        tempXml=tempXml.replace("_subItem_",condition);
    }else{
        tempXml=tempXml.replace("_subItem_","");
    }

    return tempXml;
}

/**
 * 获取userTask的相关xml
 * @param uuid
 * @returns {string}
 */
function getUserTaskXml(uuid){
    let tempXml=" <userTask _id_ _name_ _activiti:assignee_ _activiti:formKey_ _activiti:candidateGroups_ _activiti:candidateUsers_>\n_subItem_";
    let formProperties=[];
    let formPropertyXml="<activiti:formProperty _id_ _type_ _default_ ></activiti:formProperty>";
    let multiInstance="<multiInstanceLoopCharacteristics isSequential=\"false\" _activiti:collection_ " +
        "_activiti:elementletiable_></multiInstanceLoopCharacteristics>\n";
    let datas=d3.select("[uuid='"+uuid+"']").data()[0];
    for(let data of datas){
        //普通属性直接进行替换
        if (data.group === "General") {
            if (data.value) {
                tempXml=tempXml.replace("_" + data.name + "_", data.name + "=\"" + data.value + "\"");
            } else {
                tempXml=tempXml.replace("_" + data.name + "_", "");
            }
        } else if (data.group === "Main Config") {
            if (data.value) {
                tempXml=tempXml.replace("_activiti:" + data.name + "_", "activiti:"+data.name + "=\"" + data.value + "\"");
            } else {
                tempXml=tempXml.replace("_activiti:" + data.name + "_", "");
            }
        } else if (data.group === "Multi Instance") {
            if (data.value) {
                multiInstance=multiInstance.replace("_activiti:" + data.name + "_", "activiti:"+data.name + "=\"" + data.value + "\"");
            } else {
                multiInstance=multiInstance.replace("_activiti:" + data.name + "_", "");
            }
        } else if (data.group.indexOf("property") === 0) {
            //扩展属性通过数组来存储，每一项对应一个数组元素，后续添加到usertask中时再处理无意义的属性。
            if(!formProperties[data.group]){
                formProperties[data.group]=new String(formPropertyXml);
            }
            if (data.value) {
                formProperties[data.group]=formProperties[data.group].replace("_" + data.name + "_", data.name + "=\"" + data.value + "\"");
            } else {
                formProperties[data.group]=formProperties[data.group].replace("_" + data.name + "_", "");
            }
        }
    }
    if(multiInstance.indexOf("_activiti:")<0){
        tempXml=tempXml.replace("_subItem_",multiInstance+"\n_subItem_");
    }
    for(let key in formProperties){
        //对于扩展属性（from列表），需判断是否有意义。
        if(formProperties[key] && formProperties[key].indexOf("=")>0 ){
            tempXml=tempXml.replace("_subItem_",formProperties[key]+"\n_subItem_");
        }
    }
    return tempXml.replace("_subItem_","")+"\n</userTask>\n";
}

/**
 * 根据传入参数获取每个svg子元素对应bpmn
 * @param item 元素
 * @param bpmnProcessChilds 数组存放元素的process部分xml
 * @param bpmnPlaneChilds 数组存放元素的plane部分xml
 * @returns {boolean} 获取成功还是失败
 */
function getItemBpmn(item,bpmnProcessChilds,bpmnPlaneChilds) {
    const bpmnShape="<bpmndi:BPMNShape bpmnElement=\"_bpmnElement_\" id=\"_id_\">\n" +
        "<omgdc:Bounds height=\"_height_\" width=\"_width_\" x=\"_x_\" y=\"_y_\"></omgdc:Bounds>\n" +
        "</bpmndi:BPMNShape>\n";
    const bpmnEdge="<bpmndi:BPMNEdge bpmnElement=\"_bpmnElement_\" id=\"_id_\">\n_wayPoint_</bpmndi:BPMNEdge>";
    const wayPoint="<omgdi:waypoint x=\"_x_\" y=\"_y_\"></omgdi:waypoint>\n";

    let isBPMNShape=true;
    let tempUuid=item.getAttribute("uuid");
    let tempItemXml;
    //根据类别设定xml的开始和结束部分,并拼接process部分
    switch (item.getAttribute("type")){
        case BPMN_EVENT_START:
            tempItemXml=getStartEventXml(tempUuid);
            break;
        case BPMN_EVENT_END:
            tempItemXml=getEndEventXml(tempUuid);
            break;
        case BPMN_TASK_USER:
            tempItemXml=getUserTaskXml(tempUuid);
            break;
        case BPMN_GATEWAY_EXCLUSIVE:
            tempItemXml=getExclusiveGatewayXml(tempUuid);
            break;
        case BPMN_SEQUENCE_FLOW:
            isBPMNShape=false;
            tempItemXml=getSequenceFlowXml(tempUuid);
            break;
        default:
            console.log("item type error .",item);
            return false;
    }
    //plane部分
    let tempPlaneXml=null;
    let itemId=item.getAttribute("id");
    if(itemId){
        if(isBPMNShape){
            //shape
            tempPlaneXml=bpmnShape;
            let bbox=item.getBBox();
            tempPlaneXml=tempPlaneXml.replace("_bpmnElement_",itemId).replace("_id_","BPMNShape_"+itemId)
                .replace("_height_",bbox.height).replace("_width_",bbox.width).replace("_x_",bbox.x)
                .replace("_y_",bbox.y);
        }else{
            //flow
            item=$(item).find("line")[0];
            if(item.getAttribute("d")){
                tempPlaneXml=bpmnEdge;
                tempPlaneXml=tempPlaneXml.replace("_bpmnElement_",itemId).replace("_id_","BPMNEdge_"+itemId);
                let pointList=item.getAttribute("d").split(" ");
                for(let i=0;i<pointList.length;){
                    let tempWayPoint=wayPoint.replace("_x_",parseFloat(pointList[i++].substring(1)));
                    tempWayPoint=tempWayPoint.replace("_y_",parseFloat(pointList[i++]));
                    tempPlaneXml=tempPlaneXml.replace("_wayPoint_",tempWayPoint+"_wayPoint_");
                }
                tempPlaneXml=tempPlaneXml.replace("_wayPoint_","");
            }else if(item.getAttribute("x1")){
                tempPlaneXml=bpmnEdge;
                tempPlaneXml=tempPlaneXml.replace("_bpmnElement_",itemId).replace("_id_","BPMNEdge_"+itemId);

                let tempWayPoint1=wayPoint.replace("_x_",item.getAttribute("x1"));
                tempWayPoint1=tempWayPoint1.replace("_y_",item.getAttribute("y1"));
                tempPlaneXml=tempPlaneXml.replace("_wayPoint_",tempWayPoint1+"_wayPoint_");
                let tempWayPoint2=wayPoint.replace("_x_",item.getAttribute("x2"));
                tempWayPoint2=tempWayPoint2.replace("_y_",item.getAttribute("y2"));
                tempPlaneXml=tempPlaneXml.replace("_wayPoint_",tempWayPoint2);
            }
        }
    }
    else{
        console.log("item id error .",item);
        return false;
    }

    bpmnProcessChilds.push(tempItemXml);
    bpmnPlaneChilds.push(tempPlaneXml);
    return true;
}
