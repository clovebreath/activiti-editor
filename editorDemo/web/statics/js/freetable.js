var tableDiv=$("#bpmn-properties");
var tableUuids=[];
var processUuid;
//页面初始化
function initFreeTable(){
    //BPMN PROCESS的UUID
    processUuid=Math.uuid();
    tableUuids.push(processUuid);
    $("#default-table").attr("uuid",tableUuids[0]);
    $("#default-table").append("<tr><td>UUID</td><td>"+tableUuids[0]+"</td></tr>");
    //表格可编辑
    $("#default-table td").click(editableTd);
    $("").attr("onclick","svgClick(e)");
}

//表格点击事件
function editableTd(e) {
    //已有input标签
    if($(this).children("input").length > 0)
        return false;
    var tdObj = $(this);

    //TODO 表格属性扩展，时间、文本、多行文本、选择等
    var preText = tdObj.html();//当前文本内容
    var inputObj = $("<input type='text' />");//创建输入框

    tdObj.html(""); //清空td中的所有元素
    inputObj.width(tdObj.width()).height(tdObj.height())
        .css({border:"0px"}).val(preText).appendTo(tdObj)
        //用trigger方法触发事件
        .trigger("focus").trigger("select");
    inputObj.keyup(function(event){
        if(13 == event.which){
            //回车保存数据
            var text = $(this).val();
            tdObj.html(text);
        }else if(27 == event.which) {
            //ESC键取消修改
            tdObj.html(preText);
        }
    });
    inputObj.blur(function (event) {
        //失去焦点则保存
        var text = $(this).val();
        tdObj.html(text);
    });
    //已进入编辑状态后，不再处理click事件
    inputObj.click(function(){
        return false;
    });
}

//表格新增一列
function appendNewRow(){
    var tempUuid=selectSvgItem.getAttribute("uuid");
    var newRow = $("table[uuid="+tempUuid+"] tr:last").clone(true);
    newRow.children().eq(0).text("inputKey");
    newRow.children().eq(1).text("inputValue");
    $("table[uuid="+tempUuid+"]").append(newRow);
}

//新建表格
function appendNewTable(uuid) {
    var newTable = $("#default-table").clone(true);
    newTable.attr("uuid",uuid);

    //TODO newTable的ID需要更改
    newTable.find("td").eq(5).text(uuid);
    newTable.attr("id","uuid");

    tableUuids.push(uuid);
    $('#bpmn-properties').append(newTable);
    showUuidTable(uuid);
}

//隐藏其他表格，展示uuid对应表格
function showUuidTable(uuid) {
    var tableContexts = $("table");
    for (var i = 0; i < tableContexts.length; i++) {
        if (tableContexts[i].getAttribute("uuid")) {
            if (tableContexts[i].getAttribute("uuid") === uuid) {
                $(tableContexts[i]).show();
            } else {
                $(tableContexts[i]).hide();
            }
        }
    }
}

function svgClick(e) {
    e.stopPropagation();
}
//TODO 修改下载表格的方法
//下载自定义的表格
function getTableFile(){
    var tableContexts = $("Table");
    for(var i=0;i<tableContexts.length;i++){
        if(tableContexts[i].getAttribute("uuid")){
            funDownload(tableContexts[i].outerHTML,tableContexts[i].getAttribute("uuid")+".form");
        }
    }
}