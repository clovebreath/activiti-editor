# 流程图设计器
- 使用[SVG](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/svg)作为绘图板
- 使用[d3.js](https://d3js.org/)操作svg并且绑定数据，版本号Version 4.11.0
- 使用[easyUI](http://www.jeasyui.com/index.php)做悬浮菜单，版本号Version: 1.5.3
# 表单设计器
- 基于[雷劈网WEB表单设计器](http://formdesign.leipi.org/)开发
- 富文本编辑器使用[UEditor 1.4.3](http://fex.baidu.com/ueditor/)
- 时间控件使用[jQuery datepicker plugin](https://fengyuanchen.github.io/datepicker),版本号Version: 0.6.4

Tips:

- ueditor默认使用ajax到后台获取前后端交互的相关配置，由于目前表单设计过程未与后台交互，因此将此功能注释：statics/js/formDesigner/ueditor/ueditor.all.js  line8068

  ```
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
  同时项目中保留原有后台文件以及配置文件，位于statics/js/formDesigner/ueditor/jsp目录下。

- 

