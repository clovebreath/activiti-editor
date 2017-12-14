let attrReg = "((\\w+)=\"(.?|.+?)\")";
let styleReg = "(style=\"(.?|.+?)\")";
let styleDetailReg = "((\\w+:\\s)((.?|.+?);))";
let attrMatcher = new RegExp(attrReg, "g");
let styleMatcher = new RegExp(styleReg, "g");
let styleDetailMatcher = new RegExp(styleDetailReg, "g");


function getTable(parseFormData) {
    let dataList = JSON.parse(parseFormData).data;
    let rawData = JSON.parse(parseFormData).parse;
    for (let data of dataList) {
        if(!data){
            continue;
        }
        let content = data.content;
        let name = data.name;
        let type = data.leipiplugins;
        if (type === "text") {
            let style = content.match(styleMatcher)[0];
            for (let key in data) {
                if ("orgtype" === key) {
                    content = content.replace("orgtype", "type");
                } else if (key === "orghide" && data[key] === "1") {
                    content = content.replace(style, style.replace(";\"", "display:none;\""));
                }
            }
        }
        else if (type === "progressbar") {
            for (let key in data) {
                if ("orgsigntype" === key) {
                    var barType = data[key].split("-")[1];
                } else if ("orgvalue" === key) {
                    var barValue = data[key];
                }
            }
            content = `<div class="progress"><div class="bar bar-${barType}" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: ${barValue}%;"><span class="sr-only">${barValue}%</span></div></div>`;
        }
        else if (type === "textarea") {
            content = content.replace("<textarea", "<textarea class=\"form-control\"");
            let style = content.match(styleMatcher)[0] ? content.match(styleMatcher)[0] : "style=\"\"";
            let newStyle = style.replace("style=\"", "style=\"overflow:hidden;");
            if (data.orgwidth === "") {
                let width = newStyle.match(new RegExp("((width:\\\s*)((.?|.+?);))", "g"));
                if (width) {
                    newStyle = newStyle.replace(width, "width: 100%;");
                } else {
                    newStyle = newStyle.replace("style=\"", "style=\"width: 98%;");
                }
            }
            if (data.orgheight === "") {
                let height = newStyle.match(new RegExp("((height:\\\s*)((.?|.+?);))", "g"))[0];
                if (height) {
                    newStyle = newStyle.replace(height, "height: 100%;");
                } else {
                    newStyle = newStyle.replace("style=\"", "style=\"height: 100%;");
                }
            }
            content = content.replace(style, newStyle);
        }
        else if (type === "listctrl") {
            let colType = data.orgcoltype.substring(0, data.orgcoltype.lastIndexOf("`")).split("`");
            let colValue = data.orgcolvalue.substring(0, data.orgcolvalue.lastIndexOf("`")).split("`");
            let colUnit = data.orgunit.substring(0, data.orgunit.lastIndexOf("`")).split("`");
            let colTitle = data.orgtitle.substring(0, data.orgtitle.lastIndexOf("`")).split("`");
            let colSum = data.orgsum.substring(0, data.orgsum.lastIndexOf("`")).split("`");
            let tableTitle = data.title;

            //生成表头部分
            content = `<table cellspacing="0" class="table table-bordered" leipiplugins="${data.leipiplugins}" style="width: ${data.orgwidth};">`;
            content += `<thead><tr><th colspan="${colType.length + 1}">${tableTitle}<span style="float: right;"><button onclick="addRow(this)" class="btn btn-small btn-default">添加一行</button></span></th></tr>`;
            content += `<tr>`;
            for (let i = 0; i < colTitle.length; i++) {
                content += `<th>${colTitle[i]}</th>`;
            }
            content += `<th>操作</th></tr></thead>`;
            //生成表尾部分
            content += `<tfoot><tr>`;
            for (let i = 0; i < colSum.length; i++) {
                if (colSum[i] === "1") {
                    content += `<td><div class="input-prepend"><span class="add-on">共</span><input class="input-mini" type="text" onblur="sumTotal(this,${i})" name="sum_col${i}"> ${colUnit[i] ? `<span class="add-on">${colUnit[i]}</span>` : ""}</div></td>`;
                } else {
                    content += `<td></td>`;
                }
            }
            content += `<td><button onclick="sumTotal(this)" class="btn btn-small btn-default">合计</button></td></tr></tfoot>`;
            //生成tbody
            content += `<tbody><tr class="template">`;
            for (let i = 0; i < colType.length; i++) {
                let j = 0;
                if (colType[i] === "text") {
                    content += `<td><div class="input-prepend"><input class="input-small" type="text" name="data_col${i}_row${j}" value=""> ${colUnit[i] ? `<span class="add-on">${colUnit[i]}</span>` : ""}</div></td>`;
                } else if (colType[i] === "int") {
                    content += `<td><div class="input-prepend"><input class="input-small" type="number" name="data_col${i}_row${j}" value=""> ${colUnit[i] ? `<span class="add-on">${colUnit[i]}</span>` : ""}</div></td>`;
                } else if (colType[i] === "textarea") {
                    content += `<td><div class="input-prepend"><textarea name="data_col${i}_row${j}" value=""> ${colUnit[i] ? `<span class="add-on">${colUnit[i]}</span>` : ""}</div></td>`;
                } else {
                    content += `<td></td>`;
                }
            }
            content += `<td><a href="javascript:void(0);" class="delete-row-link" onclick="deleteRow(this)">删除</a></td></tr>`;
        }
        else if (type === "checkboxs") {
            let attrs = content.match(attrMatcher);
            name = name.split(",");
            //统一name
            for (let attr of attrs) {
                if (attr.indexOf("name=") === 0 && attr.indexOf(`name="${name[0]}"`) < 0) {
                    content = content.replace(attr, `name="${name[0]}"`);
                }
            }
            //设置显示样式
            let checkboxs=content.match(new RegExp("<input.*?nbsp;","g"));
            if(content.indexOf('inline="true"')>0){
                for(let checkbox of checkboxs){
                    content=content.replace(checkbox,`<label class="checkbox inline">${checkbox}</label>`);
                }
            }else{
                for(let checkbox of checkboxs){
                    content=content.replace(checkbox,`<label class="checkbox">${checkbox}</label>`);
                }
            }
            name = data.parse_name;
        }
        else if (type === "radios") {
            let radios=content.match(new RegExp("<input.*?nbsp;","g"));
            if(content.indexOf('inline="true"')>0){
                for(let radio of radios){
                    content=content.replace(radio,`<label class="radio inline">${radio}</label>`);
                }
            }else{
                for(let radio of radios){
                    content=content.replace(radio,`<label class="radio">${radio}</label>`);
                }
            }

        }
        else if (type === "macros") {
            let val="{macros}";
            switch (data.orgtype){
                case 'sys_date_time':
                    // 当前日期+时间
                    val = new Date().format('yyyy-MM-dd HH:mm');
                    break;
                case 'sys_date':
                    // 当前日期
                    val = new Date().format('yyyy-MM-dd');
                    break;
                case 'sys_time':
                    // 当前日期
                    val = new Date().format('HH:mm');
                    break;
                case 'sys_date_month':
                    // 当前年月
                    val = new Date().format('yyyy-MM');
                    break;
                case 'sys_date_year':
                    // 当前年份
                    val = new Date().format('yyyy');
                    break;
                // 下面为扩展定义
                // 扩展定义可在statics/js/formDesigner/ueditor/formdesign/macros.html页面中自定义。
                case 'sys_user_id':
                    // 当前用户id（这里应该通过系统代码获取，这里只做示例）
                    val = '1101';
                    // 真实使用中，有两种处理方式（推荐第一种，减少数据访问量）
                    // 第一就是获取表单时提前查询，这里直接设置
                    // 第二是在这里发起ajax请求进行获取
                    break;
                case 'sys_real_name':
                    // 当前用户姓名（这里应该通过系统代码获取，这里只做示例）
                    val = '张三';
                    break;
                case 'sys_dept':
                    // 当前用户部门（这里应该通过系统代码获取，这里只做示例）
                    val = '研发部';
                    break;
            }
            content=content.replace("{macros}",val);
            content=content.replace("<input","<input readonly=\"readOnly\"");
            
        }
        else if (type === "qrcode") {
            content=`<div id="${name}" leipiplugins="${data.leipiplugins}" value="${data.value}" style="${data.style}" ></div>`;
        }
        else if (type === "select") {
            //暂时无需处理
        }


        rawData = rawData.replace("{" + name + "}", content);
    }
    return rawData;
}

/**
 * 设置表格样式
 * @param selector 表格的父元素选择器
 */
function setTableBorder(selector) {
    let select=`#${selector}`;
    $(select).find("table").addClass("table").addClass("table-bordered").addClass("table-condensed");
    $(select).find("td").css("vertical-align","middle").css("text-align","center");
    $(select).find("th").css("text-align","center");
    let tables=$("[leipiplugins='listctrl']");
    for(let i=0;i<tables.length;i++){
        let table=tables[i];
        $(table).find("[class='delete-row-link']").eq(0).hide();
    }
}

/**
 * 新增一行
 * @param element 根据按钮元素定位当前表格
 */
function addRow(element){
    let newRow=$(element).parents("table").find("tbody").find("tr:last-of-type").clone();
    newRow.find('[class="delete-row-link"]').show();
    let inputList=newRow.find('[name^="data_col"]');
    for(let i=0;i<inputList.length;i++){
        let input=inputList.eq(i);
        //清空数据
        input.val("");
        //修name属性
        let orgName=input.attr("name");
        let newName=orgName.split("row")[0]+"row"+(++orgName.split("row")[1]);
        input.attr("name",newName);
    }
    $(element).parents("table").find("tbody").append(newRow);
}

/**
 * 计算此列的数据和
 * @param colIndex 列序号
 * @param element 元素
 */
function sumTotal(element,colIndex){
    if(colIndex!==null&&colIndex!==undefined){
        let sum=0;
        let inputList=$(element).parents("table").find("input[name*='col"+colIndex+"_row']");
        for(let i=0;i<inputList.length;i++){
            let temp=parseInt($(inputList[i]).val());
            if(!isNaN(temp)){
                sum+=temp;
            }
        }
        $(element).val(sum);
        return sum;
    }else{
        $(element).parents("tr").find("input").blur();
    }
}

/**
 * 初始化页面所有的二维码
 */
function initQrcode() {
    let qrcodeDivs=$("[leipiplugins='qrcode']");
    for(let i=0;i<qrcodeDivs.length;i++){
        let qrcodeDiv=qrcodeDivs[i];
        $(qrcodeDiv).qrcode({
            width: parseInt($(qrcodeDiv).css("width")),
            height: parseInt($(qrcodeDiv).css("height")),
            text	: $(qrcodeDiv).attr("value")
        });
    }
}

/**
 * 删除当前行
 * @param element 删除链接元素<a>
 */
function deleteRow(element){
    if( window.confirm('确认删除此行吗？') ) {
        let deletedRow=$(element).parents("tr");
        //修改被删除行后面的行的name属性
        let tempRowIndex=parseInt(deletedRow.find("input").eq(0).attr("name").split("row")[1]);
        for(let i=0;i<$(element).parents("tbody").find("input").length;i++){
            let input=$(element).parents("tbody").find("input").eq(i);
            let inputName=input.attr("name");
            let inputNameRowIndex=parseInt(inputName.split("row")[1]);
            if(inputNameRowIndex>tempRowIndex){
                input.attr("name",inputName.split("row")[0]+"row"+(inputNameRowIndex-1));
            }
        }
        //删除选中行
        deletedRow.remove();
        return "Deleted";
    }
    return "Canceled";
}

/**
 * 下载方法
 * @param content 内容
 * @param filename 文件名
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
 * 保存表单
 */
function submitFormDesigner(){
    funDownload($("#preView").html(),"form.form");
}