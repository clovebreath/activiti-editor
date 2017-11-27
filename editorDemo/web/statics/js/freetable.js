//默认表格，后续添加的表格由此clone而得。
const ORIGIN_PROCESS_TABLE="<table class='orign-process-table bpmn-properties-table'>" +
    "<thead><tr><th width='38.2%'>KEY</th><th>VALUE</th></tr></thead>" +
    "<tfoot><tr><td colspan='2'><button>newRow</button></td></tr></tfoot>" +
    "<tbody><tr><td>id</td><td></td></tr><tr><td>name</td><td></td></tr><tr><td>namespace</td><td></td></tr>" +
    "<tr><td>candidate start users</td><td></td></tr><tr><td>candidate start groups</td><td></td></tr>" +
    "<tr><td>documentation</td><td> </td></tr></tbody>" +
    "</table>";
const ORIGIN_DATA_OBJECT_TABLE="<table class='origin-data-object-table bpmn-properties-table'>" +
    "<thead><tr><th colspan='4'>Data Properties</th></tr><tr><th>Id</th><th>Name</th><th>Type</th><th>Value</th></thead>" +
    "<tfoot><tr><td colspan='4'><button>newRow</button></td></tr></tfoot>" +
    "<tbody><tr><td></td><td></td><td></td><td></td></tr></tbody>" +
    "</table>";
const ORIGIN_LISTENER_TABLE="<table class='origin-listener-table bpmn-properties-table'>" +
    "<thead><tr><th colspan='4'>Execution listeners</th></tr>" +
    "<tr><th>Listener implementation</th><th>Type</th><th>Event</th><th>Fields</th></tr></thead>" +
    "<tfoot><tr><td colspan='4'><button>newRow</button></td></tr></tfoot>" +
    "<tbody><tr><td></td><td></td><td></td><td></td></tr></tbody>" +
    "</table>";
const ORIGIN_SIGNAL_TABLE="<table class='origin-signal-table bpmn-properties-table'>" +
    "<thead><tr><th colspan='3'>Signal definations</th></tr>" +
    "<tr><th>Id</th><th>Name</th><th>Scope</th></tr></thead>" +
    "<tfoot><tr><td colspan='3'><button>newRow</button></td></tr></tfoot>" +
    "<tbody><tr><td></td><td></td><td></td></tr></tbody>" +
    "</table>";
const ORIGIN_MESSAGE_TABLE="<table class='origin-message-table bpmn-properties-table'>" +
    "<thead><tr><th colspan='2'>Message definations</th></tr>" +
    "<tr><th>Id</th><th>Name</th></tr></thead>" +
    "<tfoot><tr><td colspan='2'><button>newRow</button></td></tr></tfoot>" +
    "<tbody><tr><td></td><td></td></tr></tbody>" +
    "</table>";
const ORIGIN_GENERAL_TABLE="<table class='origin-general-table bpmn-properties-table'>" +
    "<thead><tr><th>KEY</th><th>VALUE</th></tr></thead>" +
    "<tfoot><tr><td colspan='2'><button>newRow</button></td></tr></tfoot>" +
    "<tbody><tr><td>id</td><td></td></tr><tr><td>name</td><td></td></tr>" +
    "<tr><td>asynchronous</td><td></td></tr><tr><td>exclusive</td><td></td></tr></tbody>" +
    "</table>";
const ORIGIN_MAIN_CONFIG_TABLE="<table class='origin-main-config-table bpmn-properties-table'>" +
    "<thead><tr><th>KEY</th><th>VALUE</th></tr></thead>" +
    // "<tfoot><tr><td colspan='2'><button>newRow</button></td></tr></tfoot>" +
    "<tbody><tr><td>initiator</td><td></td></tr><tr><td>formKey</td><td></td></tr></tbody>" +
    "</table>";
const ORIGIN_DOCUMENTATION_TABLE="<table class='origin-documentation-table bpmn-properties-table'>" +
    "<thead><tr><th>KEY</th><th>VALUE</th></tr></thead>" +
    // "<tfoot><tr><td colspan='2'><button>newRow</button></td></tr></tfoot>" +
    "<tbody><tr><td>Documentation</td><td></td></tr></tbody>" +
    "</table>";
const ORIGIN_FORM_TABLE="<table class='origin-form-table bpmn-properties-table'>" +
    "<thead><tr><th colspan='11'>Form properties</th></tr>" +
    "<tr><th>Id</th><th>Name</th><th>Type</th><th>Expression</th><th>Variable</th><th>Default</th><th>Pattern</th>" +
    "<th>Readable</th><th>Writable</th><th>required</th><th>Form values</th></tr></thead>" +
    "<tfoot><tr><td colspan='11'><button>newRow</button></td></tr></tfoot>" +
    "<tbody><tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td>" +
    "<td></td><td></td><td></td><td></td></tr></tbody>" +
    "</table>";
const ORIGIN_MULTI_INSTANCE_TABLE="<table class='origin-multi-instance-table bpmn-properties-table'>" +
    "<thead><tr><th>KEY</th><th>VALUE</th></tr></thead>" +
    "<tbody><tr><td>Sequential</td><td></td></tr><tr><td>Loop Cardinality</td><td></td></tr>" +
    "<tr><td>Collection</td><td></td></tr><tr><td>Element variable</td><td></td></tr>" +
    "<tr><td>Completion condition</td><td></td></tr></tbody>" +
    "</table>";
/**
 * 对于不同的item需要展示的tab页不同，统一在下方标出
 * 0-process
 * 1-data object
 * 2-general
 * 3-main config
 * 4-documentation
 * 5-form
 * 6-multi instance
 * 7-listeners
 * 8-signals
 * 9-messages
 *
 */
const DEFAULT_TABS={
    "bpmn-event-start":[2,3,4,5,7],
    "bpmn-event-end":[2,4,7],
    "bpmn-task-user":[2,3,4,5,6,7],
    "bpmn-gateway-exclusive":[2,4,7],
    "bpmn-sequence-flow":[2,3,4,7],
    "bpmn-process":[0,1,7,8,9]
};
//将表格置入数组，方便使用
const ORIGIN_TABLES=[ORIGIN_PROCESS_TABLE,ORIGIN_DATA_OBJECT_TABLE,ORIGIN_GENERAL_TABLE,ORIGIN_MAIN_CONFIG_TABLE,
    ORIGIN_DOCUMENTATION_TABLE,ORIGIN_FORM_TABLE,ORIGIN_MULTI_INSTANCE_TABLE,ORIGIN_LISTENER_TABLE,ORIGIN_SIGNAL_TABLE,
    ORIGIN_MESSAGE_TABLE];
/**
 * 用于自动生成table的id项。
 * 0--process
 * 1--BPMN_SEQUENCE_FLOW
 * 2--BPMN_TASK_USER
 * 3--BPMN_EVENT_START
 * 4--BPMN_EVENT_END
 * 5--BPMN_GATEWAY_EXCLUSIVE
 */
var nomalTableIds=[];
//存放所有表格的uuid，也对应着所有svgitem的uuid，可能会有用
var tableUuids=[];
//process的uuid，即整个bpmn文件的uuid
var processUuid;
/**
 * 页面初始化，表格相关
 */
function initFreeTable(){
    //BPMN PROCESS的UUID
    processUuid=$("#bpmn-svg").attr("uuid");
    nomalTableIds[0]=processUuid;
    //新建process的表格
    appendTableForItem(processUuid);
    //展示对应标签
    showTabs(processUuid);
}

/**
 * 表格点击事件
 * @param e 点击事件
 * @returns {boolean}
 */
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
function appendNewRow(event){
    var tempTable=event.originalEvent.path[4];
    var newRow = $(tempTable).find("tbody tr:last-child").clone(true)
        .insertAfter($(tempTable).find("tbody tr:last-child"));
    newRow.children().click(editableTd);
    newRow.children().eq(0).text("");
}

/**
 * 为svg元素新建相关表格
 * @param uuid 表格对应的svgItem的uuid
 */
function appendTableForItem(uuid) {
    var tabIndexs=DEFAULT_TABS[$("[type][uuid="+uuid+"]").attr("type")];
    //对特定表格做出修改//todo userTask和event的general和mainConfig表格有不同
    for(var i of tabIndexs){
        var newTable = $(ORIGIN_TABLES[i]).clone();
        newTable.find("tbody").find("td").click(editableTd);
        //修改表格属性
        newTable.attr("uuid",uuid);
        //补充自动生成的id
        if(i===tabIndexs[0]){
            var autoId=getAutoId(uuid);
            newTable.find("tbody").find("td").eq(1).text(autoId);
            //todo 修改表格本身的id
            newTable.attr("id",autoId);
        }

        //添加表格到页面
        $("#bpmn-properties div[id^='properties-']").eq(i).append(newTable);
        //为新增行按钮绑定事件
        newTable.find("tfoot").find("button").click(function (event) {
            appendNewRow(event);
        });
    }
    tableUuids.push(uuid);
    //展示对应表格
    showUuidTable(uuid);
}

/**
 * 展示uuid对应svg元素相对应的tab面板
 * @param uuid svg元素的uuid
 */
function showTabs(uuid) {
    var tabIndexs=DEFAULT_TABS[$("[type][uuid="+uuid+"]").attr("type")];
    var tabArea=$('#bpmn-properties');
    for(var i=0;i<10;i++){
        if(isInArray(tabIndexs,i)){
            tabArea.tabs("getTab",i).panel('options').tab.show();
        }else{
            tabArea.tabs("getTab",i).panel('options').tab.hide();
        }
    }
    //选中第一个tab页
    tabArea.tabs('select',tabIndexs[0]);
    //展示表格
    showUuidTable(uuid);
}

/**
 * 使用循环的方式判断一个元素是否存在于一个数组中
 * @param arr 数组
 * @param value 元素值
 */
function isInArray(arr,value){
    for(var i = 0; i < arr.length; i++){
        if(value === arr[i]){
            return true;
        }
    }
    return false;
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
    var newTable = $(ORIGIN_RELATE_TABLE).clone();
    newTable.find("thead").find("th").eq(1).text(newTableUuid);

    newTable.find("tbody").find("td").click(editableTd);
    newTable.find("tfoot").find("button").click(function () {
        appendNewRow(newTableUuid);
    });
    newTable.attr("id",newTableUuid).attr("uuid",newTableUuid);
    //添加表格到页面
    tableUuids.push(newTableUuid);
    $('#bpmn-properties').append(newTable);
}

/**
 * 刪除表格
 * @param uuid 表格对应uuid
 */
function deleteTableByUuid(uuid){
    $("table[uuid="+uuid+"]").remove();
    for(var i=0; i<tableUuids.length; i++) {
        if(tableUuids[i] == uuid) {
            tableUuids.splice(i, 1);
            break;
        }
    }
}

/**
 * 隐藏其他表格，展示uuid对应表格及其关联表格（如果存在）
 * @param uuid
 */
function showUuidTable(uuid) {
    $("table[uuid]").hide();
    var mainTable=$("table[uuid="+uuid+"]").show();
    $("table[uuid="+mainTable.attr("relatedForm")+"]").show();
}

/**
 * 自动获取新建的元素的默认id
 * @param uuid 元素的uuid
 */
function getAutoId(uuid){
    //根据uuid判断当前元素类型
    var itemType=$("[type][uuid="+uuid+"]").attr("type");
    var autoId=uuid;
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