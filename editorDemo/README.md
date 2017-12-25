# 流程图设计器
- 使用[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)作为绘图板
- 使用[d3.js](https://d3js.org/)操作svg并且绑定数据，版本号Version 4.11.0
- 使用[easyUI](http://www.jeasyui.com/index.php)做悬浮菜单，版本号Version: 1.5.3

Tips:
- 节点目前使用svg rect标签，可在 [activitidesig.js](statics/js/designer/activitiDesign.js)中的iconDragStop(e)方法中修改。由于要获取图片，所以将样式直接写到svg内容上，而不是使用css文件，若是能有更好的获取图片的方法，则可以将样式直接写到css中。
- 数据统一绑定到g标签上，绑定数据的格式为
    ```javascript
    //注：下面格式为easyUI propertygrid获取数据返回的格式，实际使用中只用到了name、value、group属性，可以更改表格。
    let data=[
        {"name":"","value":"","group":"","editor":""},
        {"name":"","value":"","group":"","editor":""}
        //···
    ];
    //绑定数据
    d3.select(element).datum(data);
    //读取数据
    d3.select(element).data();
    ```
基本原理：
- 使用easyui-draggable来使元素可拖拽，通过拖拽事件在svg容器中绘制流程图，同时使用easyui-window做了两个悬浮窗，方便展示数据与绘图。
- [iconDragStop(e)]()方法为绘图的入口,流程基本如下
    - 判断拖拽目标点是否符合生成新节点的条件[checkDragPosition()]()
    - 绘制新节点[appendItem()]()，同时给新节点添加样式
    - 初始化节点的数据
    - 触发节点的点击事件以选中此节点
- [arrowDragStop(e)]()方法定义了绘制连线的入口，调用drawFlow()方法，在两个节点间绘制连接线。
- [clickSvgElement(e)]()方法定义了元素的点击事件，同时也包括了数据绑定，数据回写等主要操作
    - 首先，只有g元素相应此点击事件，所有数据绑定都是在g元素层面操作。
    - bindPropertiesToItem()绑定当前表格中的数据到与之对应的元素上，同时给g元素添加id属性，将name的内容写入text中，调用resizeGroup()方法根据文本长度调整节点大小
    - setMiniMenu()将两个悬浮按钮展示到被点击元素下方，同时将selectSvgItem设置为当前被点击的元素。
    - showPropertiesTable()根据节点类型初始化表格，然后调用setProperties()将被点击元素的数据回写到属性表格，
- 节点的基本结构是一个svg的g元素，内部包含一个rect矩形以及一个text文本用于显示元素的名称。g元素会有一个uuid属性作为唯一标示，同时有个type属性表明节点的类型，同时uuid和type也是节点的主要选择器。
- checkDragPosition()方法用于检查落点是否符合生成元素的条件，现有两部分，一为不在悬浮窗上，二是鼠标指向点有足够的空间。
- d3.drag()方法来生成svg元素的拖拽事件，使流程图的节点变得可拖拽，同时绑定三个事件：
    - onSvgItemDragStart() 开始拖拽，触发主面板点击事件（保证上一个被选中节点的数据成功绑定，同时隐藏节点下方的小图标）
    - onSvgItemDrag() 拖拽过程中，用getDragStatus()方法判断能否往鼠标方向移动
        - 能，则通过改变rect和text的x、y属性进行位移，然后重绘与节点相连的连线
        - 不能，则尝试只往鼠标方向的x或y某个单一方向移动。
    - onSvgItemDragEnd() 拖拽结束，触发节点的点击事件。
    ```javascript
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
    ```
- 数据表格展示使用easyui-propertygrid，加载所需的数据在 [activitidesig.js](statics/js/designer/activitiDesign.js)上方定义为常量。
    - 使用datagrid的groupFormatter将英文展示为对应中文
    - 使用column的data的formatter属性，将表单下拉框的uuid和对应表单名对应起来
- getBpmnOfSvg()方法通过对svg元素解析生成所需要的xml文件。
    - 首先触发svg容器的点击事件，保证最后修改的数据绑定成功
    - 然后getItemBpmn()遍历每一个g元素（一个节点），获取其对应xml，xml主要由两部分构成：
        - process部分主要是节点的数据信息
        - plane部分主要是节点的图像位置信息
    - 最后将所有的svg拼接起来，构成完整的xml。

# 表单设计器
- 基于[雷劈网WEB表单设计器](http://formdesign.leipi.org/)开发
- 富文本编辑器使用[UEditor 1.4.3](http://fex.baidu.com/ueditor/)
- 时间控件使用[jQuery datepicker plugin](https://fengyuanchen.github.io/datepicker),版本号Version: 0.6.4

Tips:

- ueditor默认使用ajax到后台获取前后端交互的相关配置，由于目前表单设计过程未与后台交互，因此可选择将此功能注释（待测试），同时能解决浏览器后台报错[请求后台配置项http错误，上传功能将不能正常使用!](ueditor.all.min.js:8092)：statics/js/formDesigner/ueditor/ueditor.all.js  line:8068

  ```javascript
  // 表单设计并未涉及与后台交互功能，所以关闭从后台获取配置文件的方法。
  // configUrl && UE.ajax.request(configUrl,{
  //     'method': 'GET',
  //     'dataType': isJsonp ? 'jsonp':'',
  //     'onsuccess':function(r){
  //         try {
  //             var config = isJsonp ? r:eval("("+r.responseText+")");
  //             utils.extend(me.options, config);
  //             me.fireEvent('serverConfigLoaded');
  //             me._serverConfigLoaded = true;
  //         } catch (e) {
  //             showErrorMsg(me.getLang('loadconfigFormatError'));
  //         }
  //     },
  //     'onerror':function(){
  //         showErrorMsg(me.getLang('loadconfigHttpError'));
  //     }
  // });
  ```

- 表单控件页面主要位于\webapp\statics\js\formDesigner\ueditor\formdesign路径下，同时处理生成表单的方法位于[formDesign.js](statics/js/formDesign.js)中，可根据需要自行修改。
- 通过下列代码获取第一次解析后的内容
    ```javascript
    leipiEditor.sync();       /*同步内容*/
    let fields = $("#fields").val();
    //获取表单设计器里的内容
    let formeditor = leipiEditor.getContent();
    //解析表单设计器控件
    let parse_form = this.parse_form(formeditor, fields);
    ```
    parse_form的格式为：
    ```json
    {
      "fields":1,
      "template":"<p><input name=\"data_1\" type=\"text\" title=\"as\" value=\"\" leipiplugins=\"text\" orghide=\"0\" orgalign=\"left\" orgwidth=\"150\" orgtype=\"text\" style=\"text-align: left; width: 150px;\"/></p>","parse":"<p>{data_1}</p>",
      "data":[{
          "name":"data_1",
          "type":"text",
          "title":"as",
          "value":"",
          "leipiplugins":"text",
          "orghide":"0",
          "orgalign":"left",
          "orgwidth":"150",
          "orgtype":"text",
          "style":"text-align: left; width: 150px;",
          "content":"<input name=\"data_1\" type=\"text\" title=\"as\" value=\"\" leipiplugins=\"text\" orghide=\"0\" orgalign=\"left\" orgwidth=\"150\" orgtype=\"text\" style=\"text-align: left; width: 150px;\"/>"
      }],
      "add_fields":{
        "data_1":{
          "name":"data_1",
          "leipiplugins":"text"
        }
      }
    }
    ```
- 对此数据进行二次解析[formDesign.js](statics/js/designer/formDesign.js)中的getTable()方法，然后获取所需要的自定义表单代码。
- 