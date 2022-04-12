# MoreWindows（TODO:统一关闭逻辑）

缩写mwds，一个oink的组件，提供了网页overlay层上的几乎一切功能：悬浮窗、菜单、弹出框、提示框、通知框……

# 负一、丑话说在前头

1. mwds没有考虑具有全局横向滚动条的页面，如果有此需求请遵循以下避坑做法（但不排除还会有其他坑）：

   - 不使用绝对定位且可移动的窗口
   - 自定义通知框的动画，不要使用默认动画
2. mwds既是声明式的组件库，又支持运行时注册。但是对于所有已经注册并释放至文档中的组件，它们的事件和属性**已不可更改**。
   - 例子：**不可以**通过移除`.ds-mov`将一个可移动窗口变得不可移动。如果确有此需求，请删除该元素并重新向mwds注册该元素。原因如下：
     1. 实时监测组件的开销实在是太大了。
     2. 目前我所有用到mwds的项目都几乎不需要运行时的属性更改。此为低频率功能但需要大幅修改代码，所以必须等我有时间才能弄。
     3. 有很方便的脱注册方法：`mwds.unregister()`，脱注册后即可重新注册。
   - 还是一句话，组件库是用来方便自己的。
3. 为了方便进行一些常见的操作，构建了一个JS库：[`luery`](https://github.com/ljm12914/luery)，它支持基本的DOM选择和DOM操作，后文中的`$("...")`即为它所提供。

## 兼容性

由于使用了很多新的css特性，mwds仅兼容较新的现代浏览器。目前通过测试的各浏览器如下：

|         PC         |       Android        |        Mac        |        iOS        |
| :----------------: | :------------------: | :---------------: | :---------------: |
|   Google Chrome    |   Via（即webview）   | 无Mac设备可供测试 | 无iOS设备可供测试 |
|      Firefox       |       小米自带       |                   |                   |
| Edge（Chrome内核） |       华为自带       |                   |                   |
|       Opera        | 微信（**部分支持**） |                   |                   |
|   360安全浏览器    |                      |                   |                   |
|      QQ浏览器      |                      |                   |                   |
|     傲游浏览器     |                      |                   |                   |
|     搜狗浏览器     |                      |                   |                   |
| IE（**部分支持**） |                      |                   |                   |

IE9以下无`box-shadow`，使用`border`进行了兼容。可自行更改。

# 零、基础知识

`[argument]`：必选参数，`<argument>`：可选参数（不填自动为`undefined`）。

## 开始使用

### 浏览器

引入文件。mwds会自动创建名为`mwds`的实例：

```html
<link rel="stylesheet" href="mwds.css" />
...
<script src="mwds.js"></script>
```

mwds在创建实例时会自动进行一些初始化操作。之后将使用`mwds`实例与mwds交互。

### Node.js

node.js？不存在的！无服务器党不会考虑服务器端渲染的！

## 注册与脱注册组件

### 注册

mwds的组件注册方式有两种：**声明式注册**和**运行时注册**。

声明式注册：

1. 在`class`属性中书写需要的配置。
2. 添加自定义Attribute `mwds`。页面加载时，mwds将通过判断该Attribute自动注册组件。

- **不要嵌套使用声明式注册**！注册组件时内部元素会被删除重建。

运行时注册：

1. 使用下文提及的注册方法完成注册。在注册时需要传入配置。

- 当一个参数的`取值`一栏为`Node / HTML字符串`时，表明可以传入有效的HTML字符串或HTML DOM元素。当传入的DOM元素已经被注册为**同种组件**时，为了防止冲突，mwds会自动将元素脱注册。不要在未知元素是否已注册的情况下执行注册。

### 脱注册

需要手动脱注册时，请使用`mwds.unregister()`：

```javascript
mwds.unregister([el], <deleteElement>);
```

|       参数        |            描述            |          缺省          |
| :---------------: | :------------------------: | :--------------------: |
|      `[el]`       |       要脱注册的元素       |          必需          |
| `<deleteElement>` | 是否从HTML文档中删除元素。 | 不从HTML文档中删除元素 |

- 由于浏览器不允许分别删除处理器为直接的函数的事件，**本方法会删除目标元素绑定的所有事件**，如果其绑定了其他自定义事件，请手动再次添加。
- 本方法不会处理未经注册的元素并会抛出错误。

若`<deleteElement>`为`true`，则该方法返回新的HTML DOM元素。若此项为`false`，则该方法返回新的Node实例（未释放至文档）。

- 如需获取目前已注册的所有元素和它们的类型，使用`mwds.getComponents()`。它会返回一个二维数组。

# 一、窗口（TODO：resize）

最基本的功能，悬浮窗。

## 注册

```javascript
mwds.win([$("#mywin")], <isAbsolute>, <isTra>, <canMove>, <canClose>, <isOnTop>, <canResize>);
```

|      参数       |  取值   |    class    |           描述            |           缺省           |
| :-------------: | :-----: | :---------: | :-----------------------: | :----------------------: |
| `[$("#mywin")]` |  Node   |  `ds-win`   |         窗口元素          |           必需           |
| `<isAbsolute>`  | Boolean |   `ds-a`    | 窗口位置行为：`absolute`  |  窗口位置行为：`fixed`   |
|    `<isTra>`    | Boolean |  `ds-tra`   | 窗口背景透明，hover后变色 | 永远为某颜色（默认白色） |
|   `<canMove>`   | Boolean |  `ds-mov`   |        窗口可移动         |       窗口不可移动       |
|  `<canClose>`   | Boolean |  `ds-cls`   | 双击窗口的空闲部分可关闭  |       窗口不可关闭       |
|   `<isOnTop>`   | Boolean | `ds-ontop`  |   置于最顶层（见下方）    |       动态窗口提升       |
|  `<canResize>`  | Boolean | `ds-resize` |        可调整大小         |         自动大小         |

置顶窗口`ds-ontop`的`z-index`为`999`（主要是我不相信有人可以搞出950个窗口），并通过`animation:ontop`保持。

置顶窗口的边框颜色有所改变，以突出其为置顶。

- 窗口置顶的已知问题：当两个**大小完全相同**的置顶窗口**完全重叠**在一起时，无法**移动**其中任何一个。

该方法返回注册成功的Node。

## 窗口提升相关

任何窗口式图形化界面都拥有这个功能：点击一个处于下方的窗口中的内容，这个窗口就会提升到上方。

窗口的`z-index`最小值（默认值）是`50`，目前不支持修改。头铁可以去改改试试。若出现堆叠窗口，z-index的范围会向**上**扩展以容纳这些窗口。移动中的窗口拥有**目前页面中所有窗口的`z-index`最大值+1**的`z-index`，以确保它的拖动不会受任何窗口影响（但是可能会受到其他元素影响，建议使用置顶元素时`z-index`不要太小，以免拖动窗口出现问题）。

# 二、提示框

提示框（Tooltip）是hover一些元素时弹出的小框，用于提示该元素的作用。

- 提示框的`z-index`为其产生区域的`z-index`，所以有可能会看不到提示框。

## 注册

声明式注册时，请在提示框的父元素而不是提示框本身上添加`mwds`属性。

声明式注册时请遵循下文HTML写法。

```javascript
mwds.toolTip([$("#target-Element")], [tooltip html], <direction>, <showTip>);
```

|                  参数                  |       取值        |    class    |          描述          |  缺省  |
| :------------------------------------: | :---------------: | :---------: | :--------------------: | :----: |
|        `[$("#target-Element")]`        |       Node        |   `ds-tp`   | 要放置提示框的目标元素 |  必需  |
|            `[tooltip html]`            | Node / HTML字符串 |   `ds-tt`   |    提示框元素或HTML    |  必需  |
| `<direction>`（`<showtip>`不为`true`） |        `t`        |  `ds-tt-t`  | 在上方显示无尖端提示框 |  `t`   |
|                                        |        `b`        |  `ds-tt-b`  | 在下方显示无尖端提示框 |        |
|                                        |        `l`        |  `ds-tt-l`  | 在左方显示无尖端提示框 |        |
|                                        |        `r`        |  `ds-tt-r`  | 在右方显示无尖端提示框 |        |
|  `<direction>`（`<showtip>`为`true`）  |        `t`        | `ds-tt-t-t` | 在上方显示有尖端提示框 |  `t`   |
|                                        |        `b`        | `ds-tt-b-t` | 在下方显示有尖端提示框 |        |
|                                        |        `l`        | `ds-tt-l-t` | 在左方显示有尖端提示框 |        |
|                                        |        `r`        | `ds-tt-r-t` | 在右方显示有尖端提示框 |        |
|              `<showTip>`               |      Boolean      | `ds-tt-*-t` |    是否有三角形尖端    | 无尖端 |

该方法返回注册成功的Node。

该方法运行后将在`$("#target-Element")`的末尾添加一个提示框元素，此时整个HTML看上去像这样：

```html
<any id="target-Element" class="ds-tp">
    content
    <div class="ds-tt ds-tt-t-t">tooltip</div>
</any>
```

## 智能显示

如果mwds发现提示框被浏览器的边界截断，就会将提示框移至其他地方以使其完全显示（通常是对面）。

## 极端情况

不能在同一个元素中包含多个提示框。

# 三、弹出框（TODO：正确的多窗口分别关闭逻辑）

从屏幕中间弹出一个窗口，调暗屏幕的其余部分。

1. mwds会在加载时自动创建覆盖层`#ds-overlay`，所有窗口都是这个覆盖层的子元素。
2. 由于在面积小时很容易被关闭，弹出框**不适合**用于将一些信息展现给用户，而适合包含较多元素、占据较大屏幕面积的交互型界面，例如设置界面。可使用下文的通知框展现信息。
3. 弹出框显示时会有动画，并且`#ds-overlay`将页面的其余部分调暗。用户点击页面上不属于弹出框的位置即可删除最上一个弹出框。弹出框拥有默认的样式。
4. `#ds-overlay`无弹出框时的`z-index`为`-1`，有弹出框时的`z-index`为`999`。
5. 支持多个窗口，但是没有自动调整窗口相对高度的功能（因为可能导致一些语义问题），需要保证**后显示的窗口不会把已有窗口挡住。**窗口居中，比较难以修改（因为使用了flex布局）。

## 注册

该功能不允许声明式注册，但可以通过将元素声明在`#ds-overlay`中达到打开页面即弹窗的效果。

```javascript
var n = mwds.showPopUp([$("#element")]);
```

|       参数        | 取值 | class |                        描述                        | 缺省 |
| :---------------: | :--: | :---: | :------------------------------------------------: | :--: |
| `[$("#element")]` | Node |  无   | 作为弹出框弹出的元素。该元素会被**复制**到遮罩层。 | 必需 |

该方法会返回该弹出框在`$("#ds-overlay").children`中的下标序号，可用于删除该弹出框。

## 关闭

将下标序号传入`hidePopUp()`方法：

```javascript
mwds.hidePopUp(12914);
```

或者传入需要关闭的弹出框元素：

```javascript
mwds.hidePopUp($("#element"));
```

或者使用选择器选择符合的弹出框元素：

```javascript
mwds.hidePopUp($(".myclass"));
```

该方法返回单个被删除的元素或被删除的元素Array。

### 关闭所有

无参数调用`hidePopUp()`方法。此时返回所有弹出框元素Array。

```javascript
mwds.hidePopUp();
```

# 四、菜单（TODO：兼容触摸屏）

浏览器的右键菜单以无用著称（除了最下面那个“检查”）。

- 由于历史遗留问题，菜单（menu）与下拉框（dropdown）在mwds中**为同一组件**，均表示在用户右键点击某个页面元素后在光标处弹出的元素。

## 注册

该功能不允许声明式注册。

```javascript
mwds.dropDown([$("#target")], [dropdown], <direction>, <noCls>, <noPropagation>);
```

|       参数        |       取值        |          class           |            描述            |        缺省        |
| :---------------: | :---------------: | :----------------------: | :------------------------: | :----------------: |
| `[$("#target")]`  |       Node        |         `ds-dp`          |    要放置菜单的目标元素    |        必需        |
|   `[dropdown]`    | Node / HTML字符串 |         `ds-dd`          |       菜单元素或HTML       |        必需        |
|   `<direction>`   |       `tl`        |        `ds-dd-tl`        |  菜单在指针**左上角**弹出  |        `br`        |
|                   |       `tr`        |        `ds-dd-tr`        |  菜单在指针**右上角**弹出  |                    |
|                   |       `bl`        |        `ds-dd-bl`        |  菜单在指针**左下角**弹出  |                    |
|                   |       `br`        |        `ds-dd-br`        |  菜单在指针**右下角**弹出  |                    |
|     `<noCls>`     |      Boolean      |        `ds-nocls`        | 是否禁用点击内部元素后关闭 | 点击内部元素后关闭 |
| `<noPropagation>` |      Boolean      | 无，因为不允许声明式注册 |  是否禁用事件冒泡，见下文  |   不禁用事件冒泡   |

mwds的菜单除了在光标右下角，还可以**默认**在光标其他三个角弹出，以增加一次展现的量。但是，一次在一个角只允许弹出一个菜单，传入多个在同一角弹出的菜单时，仅第一个会弹出。

菜单弹出时会有一个类似于弹出框的动画。

- 尽量不要同时在四个角显示菜单，这样子比较难关掉。

事件冒泡：在点击目标元素的子元素时菜单会弹出，这**是刻意的设计**。若不需要在点击目标元素的子元素时弹出菜单，则可在注册菜单时添加此参数为`true`。

如`<noCls>`为`true`，则不会在点击菜单中的元素后关闭菜单，仅在点击页面其余部分时才会关闭菜单。

菜单默认样式为`ds-dd`，其样式表对应的HTML结构为：

```html
<div class="ds-dd">
    <ul>
        <li>first menu item</li>
        <li>second menu item</li>
        ...
    </ul>
</div>
```

当然可以自定义样式。默认样式的`z-index`为`9999`。

该方法返回菜单Node。如传入HTML字符串，菜单元素会被放置在`body`中，但其实放置在哪里都可以。

## 注意事项

mwds**不会**阻止在菜单上右键点击的事件，但是**不要给菜单中的元素再绑定菜单**。如有多级菜单的需求，可以给菜单中的元素添加[扩展框](#五、扩展框（DOING）)。

- 千万不要在生产环境中给所有元素绑定菜单`dropDown($("*"),...)`，因为它真的是**所有元素**！

## 关闭

关闭所有菜单：

```javascript
mwds.closeDropDown();
```

mwds已内置的关闭逻辑：点击页面中的非菜单元素时会关闭所有菜单，点击非`.ds-nocls`菜单任意子元素后也会关闭所有菜单。其余逻辑需要自定义。

mwds仅提供关闭所有菜单的方法调用，这**是刻意的设计**。若不想一次关闭所有菜单，请自定义逻辑。

## 智能显示（TODO）

- mwds认为菜单项目均为竖排，横排菜单不受支持，请尽量不要使用以免出现奇奇怪怪的问题。

如果mwds发现菜单的**横**轴被浏览器的边界截断，就会将菜单移至光标的其他角以使其完全显示。

如果mwds发现菜单的**纵**轴被浏览器的边界截断，就会将菜单移至光标的其他角以使其完全显示；如果这样做也不行，那么会将菜单缩短，使其带滚轮地完全显示。

# 五、扩展框（DOING）

点击或hover一个元素后，这个元素临时展开一个扩展框。点击或hover页面的其余部分时，该扩展框自动收回。

## 注册（DOING）

声明式注册时，请在提示框的父元素而不是提示框本身上添加`mwds`属性。

声明式注册时请遵循下文HTML写法。

```javascript
mwds.exp([$("#target-element"]), [expansion], <direction>, <trigger>, <noCls>, <noPropagation>);
```

|           参数           |       取值        |    class    |             描述             |        缺省        |
| :----------------------: | :---------------: | :---------: | :--------------------------: | :----------------: |
| `[$("#target-element")]` |       Node        |   `ds-ep`   |    要放置扩展框的目标元素    |        必需        |
|      `[expansion]`       | Node / HTML字符串 |  `ds-exp`   |       扩展框元素或HTML       |        必需        |
|      `<direction>`       |       `tl`        | `ds-exp-tl` |      指针**左上角**弹出      |        `br`        |
|                          |       `tr`        | `ds-exp-tr` |      指针**右上角**弹出      |                    |
|                          |       `bl`        | `ds-exp-bl` |      指针**左下角**弹出      |                    |
|                          |       `br`        | `ds-exp-br` |      指针**右下角**弹出      |                    |
|                          |        `t`        | `ds-exp-t`  |       元素**上方**弹出       |                    |
|                          |        `b`        | `ds-exp-b`  |       元素**下方**弹出       |                    |
|                          |        `l`        | `ds-exp-l`  |       元素**左方**弹出       |                    |
|                          |        `r`        | `ds-exp-r`  |       元素**右方**弹出       |                    |
|       `<trigger>`        |        `h`        | `ds-exp-h`  |         hover后弹出          |        `c`         |
|                          |        `c`        | `ds-exp-c`  |        左键单击后弹出        |                    |
|                          |        `d`        | `ds-exp-d`  |        左键双击后弹出        |                    |
|        `<noCls>`         |      Boolean      | `ds-nocls`  |  是否禁用点击内部元素后关闭  | 点击内部元素后关闭 |
|    `<noPropagation>`     |      Boolean      | `ds-nopro`  | 是否禁用事件冒泡，与菜单相同 |   不禁用事件冒泡   |

扩展框按展示位置分为两类：

第一类是**指针型**扩展框，与菜单一样在光标的角落弹出。

第一类是**贴靠型**扩展框，贴靠在其被放置的元素的一边。扩展框默认在四条边上居中贴靠，可以通过样式自定义贴靠位置。

扩展框按触发条件分为三类：通过hover触发、通过左键单击触发、通过左键双击触发。

`<noPropagation>`仅对触发条件为左键单击或左键双击的扩展框生效，hover触发的不生效。

该方法返回扩展框Node。

HTML结构和提示框很像：

```html
<any id="target-element" class="ds-ep">
    content
    <div class="ds-exp ds-exp-t ds-exp-c">expansion</div>
</any>
```

## 智能显示（TODO）

如果mwds发现扩展框被浏览器的边界截断，就会将扩展框移至其他地方以使其完全显示。与提示框不同的是，它会先尝试平移至可以完全展现的区域，如果没有合适的区域，再转移至其他方向。

## 极端情况

不能在同一个元素中包含多个扩展框。

# 六、固定栏（TODO）

窗口并不总是需要悬浮在页面上，有时候需要将它固定在某个位置，又或者是将它重新放入正常文档流中。固定栏可以做到这两点。

## 注册

该功能不允许声明式注册。

```javascript
mwds.fixpos([$("#fix-position")], [$("#win")], <hasWideTip>);
```

|          参数          |  取值   |    class    |       描述       |    缺省    |
| :--------------------: | :-----: | :---------: | :--------------: | :--------: |
| `[$("#fix-position")]` |  Node   | `ds-fixpos` |    固定栏元素    |    必需    |
|     `[$("#win")]`      |  Node   |     无      | 被固定的窗口元素 |    必需    |
|     `<hasWideTip>`     | Boolean |     无      |   是否广泛提示   | 不广泛提示 |

若`<hasWideTip>`不为`true`，则仅当鼠标指针进入固定栏区域时，会在固定栏内显示松开鼠标固定窗口的引导；若`<hasWideTip>`为`true`，则只要该窗口处于移动状态，就会在固定栏内显示松开鼠标固定窗口的引导。

该方法无返回值。

请注意固定栏元素的宽高，若不为`auto`，则有可能导致被撑破或窗口元素被压缩。

- 若在固定栏区域内松开鼠标，则窗口将固定至固定栏区域内，成为固定栏的子元素。
- 当固定在固定栏中的窗口被重新拖出来，它在HTML文档中会**默认被放置到`body`的开头**。

# 七、通知框（TODO：重构本说明）

mwds的通知框有4种默认**样式**：警告通知、提醒通知、成功通知和普通通知。除此之外，样式完全可自定义；

有4种默认**形式**：带确认取消按钮的通知框、带一个输入框的通知框、带输入确认的通知框（Github上*删库*时弹出的“Type ... to confirm”那种）、仅文本的通知框。除此之外，形式完全可自定义；

按动画分为3种：角落弹出、上方弹出和全屏弹出。

- 用户对浏览器边缘出现的元素敏感性要低于角落出现的元素，**特别是从下边缘弹出的元素**，因为正常的文档流即为从下往上，用户已习惯新元素从下方出现了。
- 其实动画也可自定义。

## 注册

### 默认形式

带确认取消按钮的通知框为提醒通知**样式**；带输入确认的通知框为警告通知样式；带一个输入框的通知框和仅文本的通知框为普通通知样式。

允许直接创建4种默认**形式**的通知框。

创建一个仅文本的通知框，默认为普通通知：

```javascript
mwds.noti("text");
```

使用其他默认样式（下同）：

```javascript
mwds.noti("text","info"); //普通通知
mwds.noti("text","success"); //成功通知
mwds.noti("text","warning"); //提醒通知
mwds.noti("text","danger"); //警告通知
```

创建一个带确认取消按钮的通知框：

```javascript
var result = mwds.confirmNoti("text"); //返回true或false
```

创建一个带一个输入框的通知框：

```javascript
var result = mwds.promptNoti("text"); //返回输入的字符串，若无，返回""
```

创建一个带输入确认的通知框：第三个参数为需要输入确认的文本

```javascript
var result = mwds.typeConfirmNoti("text",undefined,"text-to-type");
```

### 自定义形式

使用已有的HTML元素即可。

```javascript
mwds.noti($("#element"),"info"); //普通通知
mwds.noti($("#element"),"success"); //成功通知
mwds.noti($("#element"),"warning"); //提醒通知
mwds.noti($("#element"),"danger"); //警告通知
```

或使用自定义样式（其实就是自定义class名称，`info` `success`什么的全是class名称。注意有`ds-`前缀！！）：

```javascript
noti(el,"customized-class"); //自定义样式
```

```css
.ds-customized-class{
    /*在这里书写样式*/
    /*注意需要在class名称前加上ds-！！！*/
}
```

通知框没有保留样式，可以完全自定义。但是完全自定义会损伤一些功能，如自动关闭倒计时条。一个默认的通知框是这样的，可以仿照以获取完整功能：

```html
<div class="ds-noti ds-info">
    <div class="ds-noti-progress"></div>
    <div class="ds-noti-main">
        ::before <!--用于显示默认样式的图标-->
        content
    </div>
    <div class="ds-noti-op">
        <button class="ds-noti-ok">确定</button>
        <button class="ds-noti-cancel">取消</button>
        ...
    </div>
</div>
```

# issues与PR

- 欢迎提出issue。

- 请不要在未与我沟通的情况下发起PR，否则PR大概率被拒绝。

# 版权声明

本软件以Apache License 2.0协议开源。使用本软件的任何实体必须遵循Apache License 2.0许可条款，否则其使用权将被自动收回，并将因此涉嫌侵权使用。

©2020-2022 LJM12914
