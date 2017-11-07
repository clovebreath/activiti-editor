<%--
  Created by IntelliJ IDEA.
  User: clove
  Date: 2017/11/2
  Time: 10:51
  To change this template use File | Settings | File Templates.
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html>
<head>
    <title>Designer</title>
    <%@include file="WEB-INF/head.jsp" %>
</head>
<body>
    <div class="easyui-layout" style="width:auto;height: 100%;">

        <div data-options="region:'west'" style="width:300px;height: 100%">
            <div class="easyui-layout"  data-options="fit:true">
                <div class="easyui-accordion" data-options="region:'north',title:'Items',collapsible:false" height="auto">
                    <div title="Events" style="width: 100%">
                        <ul>
                            <li id="bpmn-event-start" class="easyui-draggable bpmn-list">
                                <img class="bpmn-icon" src="./statics/images/icons/startevent/none.png">
                                Start Event
                            </li>
                            <li id="bpmn-event-end" class="easyui-draggable bpmn-list">
                                <img class="bpmn-icon" src="./statics/images/icons/endevent/none.png">
                                End Event
                            </li>
                        </ul>
                    </div>
                    <div title="Activities" style="width: 100%">
                        <ul>
                            <li id="bpmn-task-user" class="easyui-draggable bpmn-list">
                                <img class="bpmn-icon" src="./statics/images/icons/activity/list/type.user.png">
                                User Task
                            </li>
                        </ul>
                    </div>
                    <div title="Gateways" style="width: 100%">
                        <ul>
                            <li id="bpmn-gateway-exclusive" class="easyui-draggable bpmn-list">
                                <img class="bpmn-icon" src="./statics/images/icons/gateway/exclusive.databased.png">
                                Exclusive Gateway
                            </li>
                        </ul>
                    </div>
                </div>
                <div id="bpum-properties" data-options="region:'center',collapsible:false,title:'Properties'" height="auto">

                </div>
            </div>
        </div>
        <div data-options="region:'center'">
            <div id="inner-pannel" class="easyui-layout" fit="true">
                <div id="bpmn-canvas" class="easyui-droppable" data-options=
                        "region:'center',title:'Canvas',accept:'.bpmn-list',tools:[{iconCls:'icon-save',handler:getSvgFile}]">
                    <div style="position:relative;width: 100%;height: 100%">
                        <svg id="bpmn-svg" style="width:100%;height:100%" xmlns="http://www.w3.org/2000/svg" version="1.1">
                        </svg>
                        <div id="bpmn-menu-area">
                            <div id="bpmn-menu-arrow" class="bpmn-menu easyui-draggable">
                                <img src="statics/images/icons/connector/sequenceflow.png">
                            </div>
                            <div id="bpmn-menu-delete" class="bpmn-menu" onclick="deleteItem()">
                                <img src="statics/images/icons/delete.png">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
<script type="text/javascript">
    var bpmnSvg=null;
    var selectSvgItem=null;
    var svgCircleR=20;
    var svgStroke="black";
    var svgStorkeWidth=1;
    var svgRectWidth=80;
    var svgRectHeight=60;
    var svgFill="lightgrey";

    //初始化
    $(function(){
        bpmnSvg=d3.select("#bpmn-svg");
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
    });

    //连线停止操作
    function arrowDragStop(e){

    }

    //删除元素
    function deleteItem() {
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
                case "bpmn-event-end":
                    appendCircle(bpmnSvg,e.data.left-300,e.data.top,svgCircleR,svgStroke,svgStorkeWidth,svgFill)
                        .attr("onclick","showMiniMenu(this)")
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
                        .attr("onclick","showMiniMenu(this)")
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
                        .attr("onclick","showMiniMenu(this)").attr("transform","translate(0,0)")
                        .call(dragEvent.subject(
                            function() {
                                var t = d3.select(this);
                                return {
                                    x:0,
                                    y:0
                                };
                            }));
                    break;
                default:

                    break;
            }

            appendLine(bpmnSvg,100,100,200,200,svgStroke,svgStorkeWidth).attr("marker-end","url(#arrow)");

//          bpmnSvg.append('polygon').attr("points", '70,10 130,10 100,50').attr("fill",'none').attr("stroke",'#520').attr('stroke-width',4);
//          appendPolygon(bpmnSvg,'70,10 130,10 100,50',svgStroke,svgStorkeWidth,svgFill);
        }
    }
    //生成被拖拽的对象
    function getObj(source){
        var p = $('<div style="border:1px solid #ccc;width:200px"></div>');
        p.html($(source).html()).appendTo('body');
        return p;
    }

    function appendCircle(svgContainer,cx,cy,r,stroke,strokeWidth,fill){
        var svgCir = svgContainer.append("circle")
                .attr("cx",cx)
                .attr("cy",cy)
                .attr("r",r)
                .attr("stroke",stroke)
                .attr("stroke-width",strokeWidth)
                .attr("fill",fill);
        return svgCir;
    }
    function appendLine(svgContainer,x1,y1,x2,y2,stroke,strokeWidth){
        var svgLine = svgContainer.append("line")
            .attr("x1",x1)
            .attr("y1",y1)
            .attr("x2",x2)
            .attr("y2",y2)
            .attr("stroke",stroke)
            .attr("stroke-width",strokeWidth);
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
            .attr("fill",fill);
        return svgRect;
    }
    function appendPolygon(svgContainer,points,stroke,strokeWidth,fill){
        var svgPolygon = svgContainer.append("polygon")
            .attr("points",points)
            .attr("stroke",stroke)
            .attr("stroke-width",strokeWidth)
            .attr("fill",fill);
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
                d3.select(this).attr("transform", "translate(" +
                    (this.x = d3.event.x) + "," + (this.y = d3.event.y)+ ")");
                break;
        }
    }
    //svg元素移动完的事件
    function onSvgItemDragEnd() {
        switch (this.tagName){
            case "circle":
            case "rect":
                break;
            case "polygon":
                var transform = this.getAttribute("transform").split(",");
                var transformX = transform[0].replace(/[^0-9.-]/ig,"");
                var transformY = transform[1].replace(/[^0-9.-]/ig,"");
                d3.select(this).attr("points",transformGatewayPoints(this.points,parseFloat(transformX),parseFloat(transformY)))
                    .attr("transform","translate(0,0)");
                break;
            default:
                break;
        }
        showMiniMenu(this);
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
    //获取svg的xml文件
    function getSvgFile(){
        var svgContext = d3.select("#bpmn-canvas").html();
        funDownload(svgContext,"bpmn.svg");
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
    };
</script>