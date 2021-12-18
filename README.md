# Oink组件：MWDS

MoreWindows，一个oink的组件，提供了网页overlay层上的几乎一切功能：悬浮窗、菜单、弹出框、提示框、消息框……

~~这是我用JQuery写的第一个组件~~ 现在已经不用了，Vanilla JS NB！

窗口操作使用html原生。

## 兼容性

**应该**兼容各浏览器的较新版本**吧**。目前通过测试的各浏览器如下：

| PC             | MAC        | Android       | iOS        |
|:--------------:|:----------:|:-------------:|:----------:|
| Google Chrome  | 无Mac设备可供测试 | Via（即webview） | 无iOS设备可供测试 |
| Firefox        |            | 小米自带          |            |
| Edge（Chrome内核） |            |               |            |
| Opera          |            |               |            |
| 360            |            |               |            |
| QQ             |            |               |            |
| 傲游             |            |               |            |
| 搜狗             |            |               |            |

#### 不兼容IE9以下，因为使用了`box-shadow`。可自行更改。

## 一、普通窗口

### 新建

`document.createElement("div").classList.add("ds-win")`。

### 属性表

全部使用class，前缀`ds-`。

| 属性class    | 描述                  | 互斥  | 缺省      |
|:----------:|:-------------------:|:---:|:-------:|
| `ds-win`   | 定义一个窗口              |     | 必需      |
| `ds-a`     | 窗口位置行为`absolute`    |     | `fixed` |
| `ds-tra`   | 窗口背景透明，hover后变白色    |     | 永远白色    |
| `ds-mov`   | 窗口可移动               |     | 不可移动    |
| `ds-cls`   | 双击窗口的空闲部分关闭         |     | 无关闭功能   |
| `ds-ontop` | 置于所有**窗口**的最顶层      |     |         |
| `ds-zin`   | 窗口提升程序使用的标志，不要手动设置！ |     |         |

对`ds-win`的样式表进行编辑即可自定义其样式，不过请注意`/*<某属性>不可更改*/`的注释，更改这些属性可能导致难以预料的问题出现。

### 窗口提升相关

任何窗口式图形化界面都拥有这个功能：点击一个处于下方的窗口，它就会提升到上方。mwds也不例外。

窗口的`z-index`最小值（默认值）是`50`，目前不支持修改。若出现堆叠窗口，z-index的范围会向上扩展以容纳这些窗口。移动中的窗口拥有**目前页面中所有窗口的`z-index`最大值+1**的`z-index`，以确保它的拖动不会受任何窗口影响（但是可能会受到其他元素影响！建议不要使用固定的高`z-index`元素以免拖动窗口出现问题）。

按住<kbd>Ctrl</kbd>+<kbd>Alt</kbd>可以无视一切窗口内元素的阻碍，随意拖动/关闭窗口。

## 二、提示框与弹出框

提示框是hover一些元素时弹出的小框，用于提示该元素的作用。提示框类是`ds-tt`。提示框的`z-index`为`999`。

### 新建

标准用法：

```html
<span necessary>
    <span class="ds-tt">tip content</span>
    main text content
</span>
```

`necessary`是必须的，它规定了能产生提示框的区域。

**重要提示**：`<span class="ds-tt">`必须位于`main text content`前！否则将会导致提示框出现对齐问题！

### 属性表

| 属性class                | 描述                                 | 缺省     |
|:----------------------:|:----------------------------------:|:------:|
| `ds-tt`                | 定义一个提示框                            | 必需     |
| `ds-toolpar`           | **自动生成的**父元素标记                     | 必有     |
| `ds-tt-gra`            | 渐变动画显示                             | 不渐变显示  |
| `ds-tt-<t\|b\|l\|r>`   | 控制提示框的显示位置，`t`=上，`b`=下，`l`=左，`r`=右 | 二选一(1) |
| `ds-tt-<t\|b\|l\|r>-t` | 显示三角形“气泡”效果                        | 二选一(1) |

对`ds-tt`的样式表进行编辑即可自定义其样式，不过请注意`/*<某属性>不可更改*/`的注释，更改这些属性可能导致难以预料的问题出现。

### 智能显示

如果Javascript发现弹出的提示框被浏览器的边界截断，就会将提示框对齐到能被看见的地方。

### 极端情况

不兼容在同一个元素中包含多个带有`ds-tt`的元素的状况，此时只有最靠前的那个可以被识别。

在#text节点中无法运行。