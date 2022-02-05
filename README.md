简体中文 | English(Under Development)

# MoreWindows

MoreWindows，一个oink的组件，提供了网页overlay层上的几乎一切功能：悬浮窗、菜单、弹出框、提示框、消息框……

~~这是我用JQuery写的第一个组件~~ 现在已经不用了，Vanilla JS NB！窗口操作使用html原生。为了方便进行一些常见的操作，构建了一个JS库：[`luery`](https://github.com/ljm12914/luery)，它支持基本的DOM选择和DOM操作。后文中的`$("...")`即为它所提供。注意：它**不支持**多级css选择器，如`$("body div")`会返回`null`。

## 兼容性

仅兼容较新的现代浏览器。目前通过测试的各**最新版**浏览器如下：

|         PC         |     Android      |        MAC        |        iOS        |
| :----------------: | :--------------: | :---------------: | :---------------: |
|   Google Chrome    | Via（即webview） | 无Mac设备可供测试 | 无iOS设备可供测试 |
|      Firefox       |     小米自带     |                   |                   |
| Edge（Chrome内核） |     华为自带     |                   |                   |
|       Opera        |                  |                   |                   |
|        360         |                  |                   |                   |
|         QQ         |                  |                   |                   |
|        傲游        |                  |                   |                   |
|        搜狗        |                  |                   |                   |

IE9以下无`box-shadow`，使用`border`进行了兼容。可自行更改。（IE兼容性未系统测试，反正肯定不容乐观）

## 一、窗口

### 新建

`document.createElement("div").classList.add("ds-win")`。

### 属性表

| 属性class  |                  描述                  | 互斥 |      缺省      |
| :--------: | :------------------------------------: | :--: | :------------: |
|  `ds-win`  |              定义一个窗口              |      |      必需      |
|   `ds-a`   |         窗口位置行为`absolute`         |      |    `fixed`     |
|  `ds-tra`  |      窗口背景透明，hover后变白色       |      | 永远为指定颜色 |
|  `ds-mov`  |               窗口可移动               |      |    不可移动    |
|  `ds-cls`  |         双击窗口的空闲部分关闭         |      |   无关闭功能   |
| `ds-ontop` |          置于最顶层（见下方）          |      |                |
|  `ds-zin`  | 窗口提升程序使用的标志，不要手动设置！ |      |                |

对`.ds-win`的样式表进行编辑即可自定义其样式，不过请注意`/*<某属性>不可更改*/`的注释，更改这些属性可能导致难以预料的问题出现。

置顶窗口`ds-ontop`的`z-index`为`999`（主要是我不相信有人可以搞出950个窗口），并通过`animation:ontop`保持。置顶窗口的边框颜色有所改变，以突出其为置顶。可自定义样式。

### 窗口提升相关（DOING）

任何窗口式图形化界面都拥有这个功能：点击一个处于下方的窗口中的内容，这个窗口就会提升到上方。mwds也不例外。

窗口的`z-index`最小值（默认值）是`50`，目前不支持修改。若出现堆叠窗口，z-index的范围会向**上**扩展以容纳这些窗口。移动中的窗口拥有**目前页面中所有窗口的`z-index`最大值+1**的`z-index`，以确保它的拖动不会受任何窗口影响（但是可能会受到其他元素影响，建议使用置顶元素时`z-index`不要太小，以免拖动窗口出现问题）。

## 二、提示框

提示框（Tooltip）是hover一些元素时弹出的小框，用于提示该元素的作用。提示框类是`.ds-tt`。提示框的`z-index`为其产生区域的`z-index`，所以可能看不到提示框

### 新建

标准用法：

```html
<div|span necessary>
    <div|span class="ds-tt">tip content</div|span>
    <div|span>main content</div|span>
</div|span>
```

`necessary`是必须的，它规定了能产生提示框的区域。如果在块级元素中，则应使用`<div>`。如果在行内元素中，则应使用`<span>`，但是**不推荐在行内元素中使用提示框**。

**提示**：`.ds-tt`最好位于`main content`前，否则可能出现对齐问题。

### 属性表

|      属性class      |                         描述                         |   缺省    |
| :-----------------: | :--------------------------------------------------: | :-------: |
|       `ds-tt`       |                    定义一个提示框                    |   必需    |
|       `ds-tp`       |               **自动生成的**父元素标记               |   必有    |
|  `ds-tt-<t/b/l/r>`  | 控制提示框的显示位置，`t`=上，`b`=下，`l`=左，`r`=右 | 二选一(1) |
| `ds-tt-<t/b/l/r>-t` |                 显示三角形“气泡”效果                 | 二选一(1) |

对`.ds-tt`的样式表进行编辑即可自定义其样式，不过请注意`/*<某属性>不可更改*/`的注释，更改这些属性可能导致难以预料的问题出现。

### 智能显示（DOING）

如果mwds发现提示框被浏览器的边界截断，就会将提示框移至其他地方以使其完全显示（通常是对面）。

### 极端情况

不兼容在同一个元素中包含多个带有`.ds-tt`的元素的状况，此时只有在文档流中最靠前的元素可以被识别，并且可能会出现一些问题。

## 三、弹出框

从屏幕中间弹出一个窗口。mwds会在加载时自动创建覆盖层（`#ds-overlay`），所有窗口都是这个覆盖层的子元素。支持多个窗口，但是没有自动调整窗口相对高度的功能（因为可能导致一些语义问题），需要保证**后显示的窗口不会把已有窗口挡住。**窗口居中，比较难以修改（因为使用了flex布局）。

弹出框显示时会有动画，并且`#ds-overlay`将页面的其余部分调暗。用户点击页面上不属于弹出框的位置即可删除最上一个弹出框。

`#ds-overlay`无弹出框时的`z-index`为-1，有弹出框时的`z-index`为`999`。

由于在面积小时很容易被关闭，弹出框**不适合**用于将一些信息展现给用户，而适合包含较多元素、占据较大屏幕面积的交互型界面，例如设置界面。可使用下文的通知框展现信息。

### 属性表

弹出框拥有默认的样式，可自定义样式。无其他特殊属性。

### 新建

新建一个DOM对象，用于弹出框。

```javascript
var el = document.createElement("div");
el.innerHTML = "test1<br />test2";
```

或直接使用HTML文件中的元素：

```javascript
var el = $("#element");
```

### 显示弹出框

将DOM对象传给`showPopUp()`方法即可。该方法会返回该弹出框在`$("#ds-overlay").children`中的下标序号，可用于删除该弹出框。

```javascript
var n = showPopUp(el);
```

### 关闭弹出框

将需要删除的弹出框的**下标序号**传给`hidePopUp()`方法。该方法返回被删除的弹出框DOM对象。

```javascript
el == hidePopUp(n) //true
```

#### 关闭所有弹出框

无参数调用`hidePopUp()`方法。

```javascript
hidePopUp();
```

## 四、菜单

浏览器的右键菜单以无用著称（除了最下面那个“检查”）。

注：菜单组件不兼容移动端；由于历史遗留问题，菜单（menu）与下拉框（dropdown）在mwds中**为同一组件**，均表示在用户右键点击某个页面元素后在光标处弹出的元素。

### 新建

直接使用HTML文件中的元素：

```javascript
var el = $("#element");
```

其实也可以在运行时新建一个元素，但是可能会出现未知的问题。推荐使用已有元素。

### 属性表

mwds的菜单除了在光标右下角，还可以**默认**在光标其他三个角弹出，以增加一次展现的量。但是，一次在一个角只允许弹出一个菜单，传入多个在同一角弹出的菜单时，仅第一个会弹出。

菜单弹出时会有一个类似于弹出框的动画。

建议：尽量不要同时在四个角显示菜单，这样子比较难关掉。

|       属性class       |                        描述                        |             缺省             |
| :-------------------: | :------------------------------------------------: | :--------------------------: |
|        `ds-dd`        |                    定义一个菜单                    |             必需             |
| `ds-dd-<br/bl/tr/tl>` |                   菜单的弹出位置                   |     右下角（`ds-dd-br`）     |
|      `ds-nocls`       | 菜单在用户点击其中元素后不关闭，必须点击页面才关闭 | 菜单在用户点击其中元素后关闭 |

对`.ds-dd`的样式表进行编辑即可自定义其样式，不过请注意`/*<某属性>不可更改*/`的注释，更改这些属性可能导致难以预料的问题出现。

默认样式的`z-index`为`9999`。需要搭配的HTML如下：

```html
<div class="ds-dd">
    <ul>
        <li>first menu item</li>
        <li>second</li>
        ...
    </ul>
</div>
```

### 显示菜单（DOING）

通过`registerDropDown()`，给特定DOM对象注册一个菜单，可以控制在右键点击特定元素时才显示菜单。

`registerDropDown()`代码中存在的事件冒泡导致`el`和`el2`一同在`#element`被右键点击时显示，这**是刻意的设计**。若`#element`不需要`el2`菜单，则可在注册菜单时添加第三个参数`true`阻止事件冒泡导致菜单弹出。

mwds**不会**阻止在菜单上右键点击。

```javascript
registerDropDown($("#element"),el);
registerDropDown($("*"),el2);
registerDropDown($("#no-propagation"),el3,true); //禁用事件冒泡
```

在上述示例代码中，仅有`el3`会在`#no-propagation`被右键点击时弹出。

注：千万不要在生产环境中给所有元素绑定菜单`registerDropDown($("*"),...)`，头铁可以去试试。

### 关闭菜单

在需要的时候调用`closeDropDown()`关闭所有菜单。

mwds已内置的关闭逻辑：点击页面中的非菜单元素时会关闭所有菜单，点击菜单任意子元素后也会关闭所有菜单。其余逻辑需要自定义。

### 多级菜单

可以在菜单中安排能产生扩展框的元素。扩展框见下。

注：**不允许给菜单中的某个元素再绑定菜单**，这样做会产生巨大的问题，头铁可以去试试。

### 智能显示（DOING）

mwds认为菜单均为竖排，横排菜单不受其支持，请尽量不要使用。

如果mwds发现菜单的**横**轴被浏览器的边界截断，就会将菜单移至光标的其他角以使其完全显示。

如果mwds发现菜单的**纵**轴被浏览器的边界截断，就会将菜单移至光标的其他角以使其完全显示；如果这样做也不行，那么会将菜单缩短，使其带滚轮地完全显示。

## 五、扩展框（TODO）

点击一个元素后，这个元素临时展开一个扩展框。点击页面的其余部分时，该扩展框自动收回。

### 新建

没错，和`.ds-tt`很像。唯一的区别是扩展框只能是块级元素，故不可使用`<span>`。

```html
<div necessary>
    <div class="ds-exp"><strong>content</strong> <button>and interaction</button></div>
    <div>main content</div>
</div>
```

### 属性表

就连属性表也很像`.ds-tt`……

|      属性class       |                         描述                         |   缺省    |
| :------------------: | :--------------------------------------------------: | :-------: |
|       `ds-exp`       |                    定义一个扩展框                    |   必需    |
|       `ds-ep`        |               **自动生成的**父元素标记               |   必有    |
|  `ds-exp-<t/b/l/r>`  | 控制扩展框的显示位置，`t`=上，`b`=下，`l`=左，`r`=右 | 二选一(1) |
| `ds-exp-<t/b/l/r>-t` |                 显示三角形“气泡”效果                 | 二选一(1) |

对`.ds-exp`的样式表进行编辑即可自定义其样式，不过请注意`/*<某属性>不可更改*/`的注释，更改这些属性可能导致难以预料的问题出现。

### 智能显示

如果mwds发现拓展框被浏览器的边界截断，就会将拓展框移至其他地方以使其完全显示。与`.ds-tt`不同的是，它会先尝试平移至可以完全展现的区域，如果没有合适的区域，再转移至对面。

### 自定义显示

有时候不希望将拓展框居中对齐将其展开的元素。此时可以直接编写嵌入样式或内联样式来操控具体位置。拓展框父元素的`position`为`relative`。

下面的示例代码将`#exp`拓展框定位至其父元素之下2rem。

```css
#exp{
    top: 2rem;
    left: 0;
}
```

### 极端情况

不兼容在同一个元素中包含多个带有`.ds-exp`的元素的状况，此时只有在文档流中最靠前的元素可以被识别，并且会出现一些问题。

---

和`.ds-tt`简直完全一样

## 六、固定栏（TODO）

`ds-win`并不需要总是滑动。有时候我们需要把一个窗口固定在某个位置，或更重要的，我们想把一个窗口重新放入正常文档流中。这时需要`ds-fixpos`来帮忙了。

### 新建

`document.createElement("div").classList.add("ds-fixpos")`。

要将其绑定到指定的窗口，编辑元素的Attribute：`data-ds-fixpos="<id1> <id2> ..."`。

示例：

```html
<div class="ds-win" id="id-1"></div>
<div class="ds-win" id="id-2"></div>
<div class="ds-win" id="id-3"></div>
<div class="ds-win" id="id-4"></div>
<div class="ds-win" id="id-5"></div>
...
<div class="ds-fixpos" data-ds-fixpos="id-1 id-2 id-3“></div>
```

对`ds-fixpos`的样式表进行编辑即可自定义其样式，不过请注意`/*<某属性>不可更改*/`的注释，更改这些属性可能导致难以预料的问题出现。

### 行为

当鼠标指针进入`ds-fixpos`区域时，它会显示并引导松开鼠标，若在`ds-fixpos`区域内松开鼠标，则窗口将固定至`ds-fixpos`区域内，成为`ds-fixpos`的子元素。当固定在`ds-fixpos`中的窗口被重新拖出来，它会**默认被放置到`body`的文档流起始点**，相当于`document.body.prepend`。

### 属性表

|  属性class  |      描述      | 互斥 | 缺省 |
| :---------: | :------------: | :--: | :--: |
| `ds-fixpos` | 定义一个固定栏 |      | 必需 |

### 极端情况

## 七、通知框（TODO）

开发mwds的主要目的之一。我受够这种东西了——从屏幕下边缘出现一个黑块，上面写着一些小小的东西；当我想选择文本时，唰的一下就跑掉了！
……

mwds的通知框有4种默认**样式**：警告通知、提醒通知、成功通知和普通通知。除此之外，样式完全可自定义；

有4种默认**形式**：带确认取消按钮的通知框、带一个输入框的通知框、带输入确认的通知框（Github*删库*时弹出的“Type ... to confirm”那种）、仅文本的通知框。除此之外，形式完全可自定义；

按动画分为3种：角落弹出、上方弹出和全屏弹出。用户对浏览器边缘出现的元素敏感性要低于角落出现的元素，**特别是从下边缘弹出的元素**，因为正常的文档流即为从下往上，用户已习惯新元素从下方出现了。（其实动画也可自定义，不过没什么意义）

### 新建

#### 默认形式

带确认取消按钮的通知框为提醒通知**样式**；带输入确认的通知框为警告通知样式；带一个输入框的通知框和仅文本的通知框为普通通知样式。

允许直接创建4种默认**形式**的通知框。

创建一个仅文本的通知框，默认为普通通知：

```javascript
noti("text");
```

使用其他默认样式（下同）：

```javascript
noti("text","info"); //普通通知
noti("text","success"); //成功通知
noti("text","warning"); //提醒通知
noti("text","danger"); //警告通知
```

创建一个带确认取消按钮的通知框：

```javascript
var result = confirmNoti("text"); //返回true或false
```

创建一个带一个输入框的通知框：

```javascript
var result = promptNoti("text"); //返回输入的字符串，若无，返回""
```

创建一个带输入确认的通知框：第三个参数为需要输入确认的文本

```javascript
var result = typeConfirmNoti("text",undefined,"text-to-type");
```

#### 自定义形式

使用HTML中已有的元素。

```javascript
var el = $("#element");
```

其实也可以在运行时新建一个，但是可能会出现未知的问题。推荐使用已有元素。

### 属性表

|      |      |      |
| :--: | :--: | :--: |
|      |      |      |
|      |      |      |
|      |      |      |

