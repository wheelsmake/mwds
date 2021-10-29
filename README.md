# Oink组件：MWDS

MoreWindows，一个oink的组件，提供了网页overlay层上的几乎一切功能：悬浮窗、菜单、弹出框、提示框、消息框……

基于JQuery，这是我用JQ写的第一个组件。天哪JQ太爽了！——来自一个Vanilla JS Coder的感叹

没JQ感觉这个东西极难实现。

窗口操作使用html原生，因为我还没学Vue、React、Angular之类的东西。

## 兼容性

目前仅在Chromium和Webkit内核浏览器测试通过。不兼容IE9以下。

我没有Apple设备，在Windows那个老掉牙的Safari上测试没通过

## 一、普通窗口

### 新建窗口

`document.createElement("div").classList.add("ds-win")`。

JQuery写法 `$("").addClass("ds-win")`

### 窗口属性

全部使用class，前缀`ds-`。

| 属性class |           描述            | 互斥 |    缺省    |
| :-------: | :-----------------------: | :--: | :--------: |
|  ds-win   |       定义一个窗口        |      |    必需    |
|   ds-a    |  窗口位置行为`absolute`   |      |  `fixed`   |
|  ds-tra   | 窗口背景透明，hover后变白 |      |  永远白色  |
|  ds-mov   |        窗口可移动         |      |  不可移动  |
|  ds-cls   |  双击窗口的空闲部分关闭   |      | 无关闭功能 |
| ds-ontop  | 置于所有**窗口**的最顶层  |      |            |
|  ds-zin   |  运行标记，不允许设置！   |      |            |
|           |                           |      |            |

### 窗口提升相关

用过任何窗口式图形化界面吗？用过就应该知道点击一个一部分处于另一窗口之下的窗口时，后一个窗口会提升到原本处于上方的窗口的上方。这就叫窗口提升。

窗口的`z-index`最小值（默认值）是`50`。如果要将内容置于所有窗口下方请使用`z-index：[-2147483584,49]`。若出现堆叠窗口，z-index的范围会向上扩展以容纳这些窗口。移动中的窗口拥有`1000`的`z-index`。

按住<kbd>Alt</kbd>+<kbd>Shift</kbd>可以无视一切窗口内元素的阻碍，随意拖动/关闭窗口。

## 二、提示框与弹出框

### 提示框：id="ds-tips"

看到这个id就知道，mwds**仅允许一个提示框**同时出现在网页中，因为提示框默认被应用在拥有`ds-cls`的窗口上，当用户hover这些窗口时会提示“双击关闭窗口”。