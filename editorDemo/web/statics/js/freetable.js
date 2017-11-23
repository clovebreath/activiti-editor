//默认表格，后续添加的表格由此clone而得。
const ORIGIN_TABLE="<table id=\"default-table\" class=\"bpmn-properties-table\">" +
    "<thead><tr><th width=\"100px\">KEY</th><th>VALUE</th></tr></thead>" +
    "<tbody><tr><td>id</td><td> </td></tr><tr><td>name</td><td> </td></tr></tbody>" +
    "<tfoot><tr><td colspan='2'><button>newRow</button></td></tr></tfoot>" +
    "</table>";
//对于不同的item需要初始化的表格数据不同，可在下面的变量中添加
const DEFAULT_TABLE_PROPERTIES={
    "process":{"isExecutable":true},
    "sequenceFlow":{"conditionExpression":""},
    "startEvent":{"initiator":"","formKey":"<button>addForm</button>"},
    "userTask":{"assignee":"","candidateUsers":"","candidateGroups":"","formKey":""}
};
var tableDiv=$("#bpmn-properties");
//存放所有表格的uuid，也对应着所有svgitem的uuid，可能会有用
var tableUuids=[];
//process的uuid，即整个bpmn文件的uuid
var processUuid;

//页面初始化
function initFreeTable(){
    //BPMN PROCESS的UUID
    processUuid=$("#bpmn-svg").attr("uuid");
    appendNewTable(processUuid);
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
    inputObj.width(tdObj.width()).height(tdObj.height()).val(preText).appendTo(tdObj)
        //用trigger方法触发事件
        .trigger("focus").trigger("select");
    inputObj.keyup(function(event){
        if(13 == event.which){
            //回车保存数据
            var text = $(this).val();
            tdObj.html(text);
        }else if(27 == event.which){
            //ESC键取消修改
            tdObj.html(preText);
        }
    });
    inputObj.blur(function (event){
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
function appendNewRow(tableUuid,key,value){
    if(!key) key="";
    if(!value) value="";
    var newRow = $("table[uuid="+tableUuid+"] tbody tr:last-child").clone(true)
        .insertAfter($("table[uuid="+tableUuid+"] tbody tr:last-child"));
    newRow.children().click(editableTd);
    //设置新增行的文字
    newRow.children().eq(0).text(key);
    if(key!=="formKey"){
        newRow.children().eq(1).text(value);
    }else{
        //对于formKey行需要特殊对待，解除绑定原有td的点击可编辑事件，同时给button添加事件
        newRow.children().eq(1).html(value);
        newRow.children().unbind("click",editableTd);
        newRow.find("button").click(addRelatedForm);
    }
}

//新建表格
function appendNewTable(uuid) {
    //新建表格
    var newTable = $(ORIGIN_TABLE).clone();
    newTable.find("tbody").find("td").click(editableTd);
    newTable.find("tfoot").find("button").click(function () {
        appendNewRow(uuid);
    });
    //TODO newTable的ID需要更改
    newTable.attr("id",uuid).attr("uuid",uuid);
    //添加表格到页面
    tableUuids.push(uuid);
    $('#bpmn-properties').append(newTable);
    //对特定表格做出修改
    switch ($("[type][uuid="+uuid+"]").attr("type")){
        case BPMN_PROCESS:
            for(var key in DEFAULT_TABLE_PROPERTIES.process){
                appendNewRow(uuid,key,DEFAULT_TABLE_PROPERTIES.process[key]);
                // setAutoId(uuid,process);
            }
            break;
        case BPMN_SEQUENCE_FLOW:
            for(var key in DEFAULT_TABLE_PROPERTIES.sequenceFlow){
                appendNewRow(uuid,key,DEFAULT_TABLE_PROPERTIES.sequenceFlow[key]);
            }
            break;
        case BPMN_TASK_USER:
            for(var key in DEFAULT_TABLE_PROPERTIES.userTask){
                appendNewRow(uuid,key,DEFAULT_TABLE_PROPERTIES.userTask[key]);
            }
            break;
        case BPMN_EVENT_START:
            for(var key in DEFAULT_TABLE_PROPERTIES.startEvent){
                appendNewRow(uuid,key,DEFAULT_TABLE_PROPERTIES.startEvent[key]);
            }
            break;
        default:break;
    }
    //展示对应表格
    showUuidTable(uuid);
}

/**
 * 添加关联表格
 */
function addRelatedForm(e) {
    e.stopPropagation();
    var newTableUuid=Math.uuid();
    $(e.target).parents("table[uuid]").attr("relatedForm",newTableUuid);
    $(e.target).parent().text(newTableUuid);//本条执行后$(e.target)在页面结构上已经不存在
    //新建表格
    var newTable = $(ORIGIN_TABLE).clone();
    newTable.find("tbody").find("td").click(editableTd);
    newTable.find("tbody").find("td").eq(1).text(newTableUuid);
    newTable.find("tbody").find("td").eq(2).text("");
    newTable.find("tbody").find("tr").eq(0).find("td").unbind("click",editableTd);
    newTable.find("tfoot").find("button").click(function () {
        appendNewRow(newTableUuid);
    });
    newTable.attr("id",newTableUuid).attr("uuid",newTableUuid);
    //添加表格到页面
    tableUuids.push(newTableUuid);
    $('#bpmn-properties').append(newTable);
}

//刪除表格
function deleteTableByUuid(uuid){
    $("table[uuid="+uuid+"]").remove();
    for(var i=0; i<tableUuids.length; i++) {
        if(tableUuids[i] == uuid) {
            tableUuids.splice(i, 1);
            break;
        }
    }
}

//隐藏其他表格，展示uuid对应表格
function showUuidTable(uuid) {
    $("table[uuid]").hide();
    var mainTable=$("table[uuid="+uuid+"]").show();
    $("table[uuid="+mainTable.attr("relatedForm")+"]").show();
}

//自动获取新建的元素的默认id
function getAutoId(uuid){
    //根据uuid判断当前元素类型
    $("[type][uuid]")
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