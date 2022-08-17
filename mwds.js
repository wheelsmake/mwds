//Creeper保佑 永无bug
"use strict";
var mwds = new function(){
//初始化代码--------------------------------------------------------------------------------------------------------
console.log("mwds.js - MoreWindows ©LJM12914\r\noink组件。 https://github.com/wheelsmake/mwds");

    //内部luery指代
var $ = luery,
    //已注册的组件列表
components = [[],[]],
    //遮罩
overlay = $("#ds-overlay"),
    //窗口移动flag
isMoving = false,
    //窗口移动跨方法变量
deltaTop, deltaLeft, move,
    //窗口关闭flag
isToCloseWin = false,
    //弹出框关闭flag，即将弃用
isToClosePopUp = false,
    //菜单关闭flag，即将弃用
isToCloseDropDown = false,
pressedMenuItem,
    //统一关闭flag
pressedItem,
pressedItemType,
isToClose = false,
    //窗口超限探测优化flag
resizeTimer = null,
    //窗口移动中zIndex周期
zIndexInterval = false,
    //窗口z-index总体下降计数
zIndexFallCount = 0;

    //遮罩层初始化
createMask();//弹出框/菜单遮罩创建
    //初始化注册通用事件
for(let i = 0; i < $("*").length; i++) generalEvents($("*")[i]);
    //初始化注册专用事件
iniDedEvents();
    //初始化观察者
var observer = new MutationObserver(function(mutations){
    for(let i = 0; i < mutations.length; i++){
        let a = mutations[i].addedNodes;
        if(a.length){
            for(let j = 0; j < a.length; j++){
                generalEvents(a[j]);
            }
        }
    }
});
observer.observe($("body")[0],{childList:true,subtree:true});
//end初始化代码--------------------------------------------------------------------------------------------------------

//公共函数/方法区
    //供外部获取components数组但不允许修改
/*var getComponents =*/ this.getComponents = _=>{return components;}

    //快速获取z-index
function getZ(o){return parseInt(o.style.zIndex) || 50;}

    //修改z-index
function setZ(o,p){
    o.css("z-index",p);
    return getZ(o);
}

    //窗口越界检测
function checkWinPos(o){
    if($.rect(o,"fr") > document.body.clientWidth) o.css("left",document.body.clientWidth - $.dom(o,"mbp--pbm") + "px");//此处不考虑横向滚动条，因此absolute元素也不能拖到右边去
    if($.rect(o,"fb") > innerHeight && !o.hasClass("ds-a")) o.css("top",innerHeight - $.dom(o,"mbp||bpm") + "px");
    //上和左比下和右更重要，所以放在最后
    if($.rect(o,"fl") < 0) o.css("left",0);
    if($.rect(o,"ft") < 0 && !o.hasClass("ds-a")) o.css("top",0);//fixed:2022.2.5 ds-a被移动到视口最上方时闪至top:0px，下同
    if($.rect(o,"t") < 0)  o.css("top",0);
}

    //脱注册
        //所有用到的class数据
var allClasses = [
    " win","a","tra","mov","cls","ontop","resize",//" win"前面那个空格是有用的！！！
    "tp","tt","tt-t","tt-b","tt-l","tt-r","tt-t-t","tt-b-t","tt-l-t","tt-r-t",
    "dp","dd","dd-tl","dd-tr","dd-bl","dd-br",
    "ep","exp","exp-tl","exp-tr","exp-bl","exp-br","exp-t","exp-b","exp-l","exp-r","exp-h","exp-c","exp-d",
    "fixpos",
    "nocls","nopro"
];

        //脱注册主方法
var unregister = this.unregister = (obj, deleteEle)=>{
    var isC = false;
    for(let i = 0; i < components[0].length; i++){
        if(obj == components[0][i]){
            isC = true;
            break;
        }
    }
    if(!isC) $.E(`${obj} - This element should not be unregistered, or this element is not a component of mwds.`);
    var newEle = obj.cloneNode(true);
    newEle.removeClass(allClasses.join(" ").replaceAll(" "," ds-"));
    if(newEle.attr("class") == "") newEle.attr("class", null);
    if(deleteEle === true) obj.remove();
    else obj.replaceWith(newEle);
    return(newEle);
}
    //end脱注册

    //处理Node与HTML字符串
    //一律返回一个未进入HTML文档的Node。
    //如果是预注册，那么一定是DOM元素并且已有class，不需要脱注册
    //如果不是预注册并是DOM元素，那么需要检查是否已注册或是否在原本元素内
    //如果是HTML字符串，那么新建元素
var toHTML = this.toHTML = (o, p, type, surePre)=>{
    //console.log(o,p,type,surePre);
    if(surePre == "pre"){
        var c = o.cloneNode(o, true);
        o.remove();
        return c;
    }
    else if(o instanceof Node){
        for(let i = 0; i < components[0].length; i++){
            //fixed:必须要类型相同才行，不要把可关闭窗口直接脱注册了
            if(o == components[0][i] && type == components[1][i]) return unregister(o, true);
        }
        if(o.isChildOf(p)){
            var c = o.cloneNode(o, true);
            o.remove();
            return c;
        }
        return o;
    }
    else{
        var a = document.createElement("div");
        a.innerHTML = o;
        return a;
    }
}
//end公共函数/方法区

//注册事件
function generalEvents(o){
    $.Events(o,"mousedown",e=>{
        generalCheckClose(e, true);
        //checkCloseDropDown(e,true);
        checkWinPress(false,e);
    });
    $.Events(o,"mousemove",e=>{moveWindows(false,e);});
    $.Events(o,"mouseup",e=>{
        generalCheckClose(e, false);
        //checkCloseDropDown(e,false);
        moveUp();
    });
    $.Events(o,"touchstart",e=>{checkWinPress(true,e);});
    $.Events(o,"touchmove",e=>{moveWindows(true,e)});
    $.Events(o,"touchend",e=>{moveUp();});
}
function iniDedEvents(){
    window.onresize = e=>{
        if(resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(_=>{
            var a = $(".ds-win");//argument:这里用.ds-mov好还是.ds-win好？不能移动的窗口是否需要限制其移出视口？
            for(let i = 0; i < a.length; i++) checkWinPos(a[i]);
        },100);
    }
    /*overlay.ontouchstart = overlay.onmousedown = e=>{isToClosePopUp = e.target.id == "ds-overlay"};
    overlay.ontouchend = overlay.onmouseup = e=>{
        if(e.target.id == "ds-overlay" && isToClosePopUp && !e.button){//只有左键可以关闭了
            if(!$("#ds-overlay").children.length) $("#ds-overlay").innerHTML = "";
            else closePopUp(overlay.children.length - 1);
            if(!overlay.children.length) closePopUp();
            isToClosePopUp = false;
        }
    };*/
}
function deltaEvents(o,type){
    switch(type){
        case "mov":
            $.Events(o,"mousedown",e=>{pressOnWin(false,e);});
            $.Events(o,"touchstart",e=>{pressOnWin(true,e);});
            break;
        case "cls":
            $.Events(o,"dblclick",e=>{closeCls(false,e);});
            //fixme:这里由于子节点的touchstart传不上来，无法在触摸屏点击窗口内容时出现提示。
            $.Events(o,"touchstart",e=>{closeCls(true,e);});
            break;
        case "tt":
            //console.log(o);
            $.Events(o,"mouseover",e=>{alignToolTip(e.target);});
            $.Events(o,"touchstart",e=>{alignToolTip(e.target);});
            break;
        case "dd"://点击菜单任意子元素后关闭所有菜单，ds-nocls除外
            /*未统一前的代码
            $.Events(o,"mousedown",e=>{pressedMenuItem = e.target;});
            $.Events(o,"mouseup",e=>{
                if(pressedMenuItem === e.target && !e.target.hasClass("ds-dd") && !e.target.getParentByClass("ds-dd").hasClass("ds-nocls") && !e.button) closeDropDown();
                pressedMenuItem = undefined;
            });*/
            //deltaClose(o);
            break;
        case "resize":
            //todo:
            break;
        case "exp-c":
            $.Events(o,"click",e=>{
                console.log("click");
            });
            break;
        case "exp-d":
            $.Events(o,"dblclick",e=>{
                console.log("dblclick");
            })
            break;
        case "pop":
            //todo:
            break;
        default: $.E();
    }
    /*function deltaClose(obj){
        $.Events(obj,"mousedown",e=>{generalCheckClose(e, true);});
        $.Events(obj,"mouseup",e=>{generalCheckClose(e, false);});
    }*/
}
//end注册事件

//窗口
    //窗口注册
var win = this.win = (obj, isAbsolute, isTra, canMove, canClose, isOnTop, canResize, surePre)=>{
    if(canMove) deltaEvents(obj, "mov");
    if(canClose){
        toolTip(obj, "双击空闲区域可关闭窗口", "b", false);
        deltaEvents(obj, "cls");
    }
    if(canResize) deltaEvents(obj, "resize");
    if(surePre != "pre"){
        obj.addClass("ds-win");
        if(isAbsolute) obj.addClass("ds-a");
        if(isTra) obj.addClass("ds-tra");
        if(canMove) obj.addClass("ds-mov");
        if(canClose) obj.addClass("ds-cls");
        if(isOnTop) obj.addClass("ds-ontop");
        if(canResize) obj.addClass("ds-resize");
    }
    components[0].push(obj);
    components[1].push("win");
    zIndex(obj);
}
    //end窗口注册

    //移动
        //general按下处理
function checkWinPress(isTouch, e){
    let t = e.target;
    if(t.isInClass("ds-win")){
        if(isTouch) e.preventDefault();//必须这样
        e.stopPropagation();
        zIndex(t.getParentByClass("ds-win") || t);
    }
}

        //ds-win按下处理
function pressOnWin(isTouch, e){
    move = e.target;
    if(move.hasClass("ds-mov")){//防止事件冒泡
        $("body")[0].addClass("ds-moving");//fixed:不要递归删style了好卡
        zIndexInterval = setInterval(_=>{zIndex(move);},100);
        isMoving = true;
        var t = $.rect(move,"t"), l = $.rect(move,"l");
        if(isTouch){
            deltaTop = e.touches[0].pageY - t;
            deltaLeft = e.touches[0].pageX - l;
        }
        else{
            deltaTop = e.pageY - t;
            deltaLeft = e.pageX - l;
        }
    }
}

        //移动中处理
function moveWindows(isTouch, e){
    if(isMoving){
        if(isTouch){
            move.css("top",e.touches[0].pageY - deltaTop + "px");
            move.css("left",e.touches[0].pageX - deltaLeft + "px");
        }
        else{
            move.css("top",e.pageY - deltaTop + "px");
            move.css("left",e.pageX - deltaLeft + "px");
        }
        checkWinPos(move);//防止位置超限
    }
}

        //松开处理
function moveUp(){
    if(isMoving){
        isMoving = false;
        clearInterval(zIndexInterval);
        zIndex(move);
        var b = $("body")[0];
        b.removeClass("ds-moving");
        if(b.attr("class") == "") b.attr("class", null);
    }
}

/*        //递归删除没用style
function delStyle(d){
    //let s = d.attr("style");
    //if(s == "cursor: grabbing; user-select: none; -webkit-user-drag: none;") d.attr("style",null);
    //else d.css({"cursor":"","user-select":"","-webkit-user-drag":"","-webkit-user-select":""});
    d.css({"cursor":"","user-select":"","-webkit-user-drag":"","-webkit-user-select":""});
    if(!d.attr("style")) d.attr("style",null);
    for(let i = 0;i < d.children.length; i++) delStyle(d.children[i]);
}*/
    //end移动

    //窗口提升
        //判断a在b上面还是下面+检测
function tOrb(a,b){
    let t = $.rect(a,"t");
    let o = $.rect(a,"b");
    let l = $.rect(a,"l");
    let r = $.rect(a,"r");
    let t1 = $.rect(b,"t");
    let o1 = $.rect(b,"b");
    let l1 = $.rect(b,"l");
    let r1 = $.rect(b,"r");
    //fixed:不加等号会导致完全重叠在一起的窗口无法分离
    if(((t>=t1&&t<=o1)||(o>=t1&&o<=o1)||(t1>=t&&t1<=o)||(o1>=t&&o1<=o))&&((l>=l1&&l<=r1)||(r>=l1&&r<=r1)||(l1>=l&&l1<=r)||(r1>=l&&r1<=r))){
        if(getZ(a) > getZ(b)) return "a";//a在上
        else if(getZ(a) < getZ(b)) return "b";//a在下
        else return "s";//两个一样
    }else return "e";//根本就没覆盖
}

        //dark名鼎鼎的zIndex方法 fixed:搞完了，但还是有点问题，4-3L时由于没有记录相对位置仍然会出现问题，可能的解决方案：先把非e记录进数组再按zindex执行递归
        //2022.3.11：终于有希望解决所有问题了！！
        //2022.3.26：终于解决所有问题了！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
function zIndex(o){
    //console.log(o);
    var w = $(".ds-win");
    var pN = [];
    for(let i = 0; i < w.length; i++){
        var t = tOrb(w[i],o);
        if((t == "a" || t == "s") && w[i] != o) pN.push(w[i]);
    }
    //console.log(pN);
    var finalZ = getZ(o);
    for(let i = 0; i < pN.length; i++) finalZ = Math.max(getZ(pN[i]) + 1, finalZ);
    setZ(o,finalZ);
    //累计到8才会真正执行一次，以免频繁清除空层造成的卡顿
    if(zIndexFallCount > 8){
        //console.log("fallZindex");
        var cDs = {trees:[]}, checkedEle = [];
        //不需要对已经有树的元素重复一遍了，因为一棵树只要被发现就会被完全遍历
        for(let i = 0; i < w.length; i++) if(!checkedEle[i]) checkR(w[i], i, cDs.trees.length);
        //console.log(cDs); //succeed:成功！cDs记录了所有的树的cD id。//fixed:只记录id真的烦，改为记录整个树吧
        for(let i = 0; i < cDs.trees.length; i++){
            var treeZ = [];
            for(let j = 0; j < cDs.trees[i].length; j++) treeZ[getZ(cDs.trees[i][j]) - 50] = true;
            //console.log(treeZ);
            for(let j = 0; j < treeZ.length; j++) if(!treeZ[j]) for(let k = 0; k < cDs.trees[i].length; k++){
                var z = getZ(cDs.trees[i][k]);
                if(z - 50 > j) setZ(cDs.trees[i][k],z - 1);
                //console.log("falling");
            }
        }
        //收尾工作
        zIndexFallCount = 0;
    }
    else zIndexFallCount++;
    //递归处
    function checkR(o,wID,treeID){
        checkedEle[wID] = true;//标记该元素已经归入一棵树
        if(cDs.trees[treeID] == undefined) cDs.trees[treeID] = [];
        cDs.trees[treeID].push(o);//将该元素真正记录到树列表中
        var r = [[],[]];
        for(let i = 0; i < w.length; i++) if(!checkedEle[i] && tOrb(o,w[i]) != "e"){
            r[0].push(w[i]);
            r[1].push(i);
            checkedEle[i] = true;
        }
        for(let i = 0; i < r[0].length; i++) checkR(r[0][i],r[1][i],treeID);
    }
}
    //end窗口提升

    //可关闭的窗口
function closeCls(isTouch, e){
    let t = e.target;
    if(!t.hasClass("ds-cls")) return;
    if(isTouch){
        if(isToCloseWin){
            c();
            isToCloseWin = false;
            return;
        }
        setTimeout(_=>{isToCloseWin = true;/*console.log("true");*/},0);
        setTimeout(_=>{isToCloseWin = false;/*console.log("false");*/},450);
    }
    else c();
    function c(){
        setZ(t,50,"cls");
        t.hide();
    }
}
    //end可关闭的窗口
//end窗口

//提示框
    //提示框样式取决方法
var preTT = /*this.preTT =*/ (target, tt, toolTip)=>{
    let di = "t";
    let sh = false;
    //if(h("t")) di = "t"; //这是默认的，无需写
    if(h("b")) di = "b";
    if(h("l")) di = "l";
    if(h("r")) di = "r";
    if(h("t-t")){
        di = "t";
        sh = true;
    }
    if(h("b-t")){
        di = "b";
        sh = true;
    }
    if(h("l-t")){
        di = "l";
        sh = true;
    }
    if(h("r-t")){
        di = "r";
        sh = true;
    }
    toolTip(target, tt, di, sh, "pre");
    function h(o){return tt.hasClass(`ds-tt-${o}`);}
}

    //提示框注册
var toolTip = this.toolTip = (target, ttB, direction, showTip, surePre)=>{
    var e = toHTML(ttB, target, "tt", surePre);
    //console.log(e);
    e.addClass("ds-tt");
    //这里还包括了设置data属性，pre也不能去掉
    if(direction == "b" || direction == "l" || direction == "r"){
        if(showTip) g(`${direction}-t`);
        else g(direction);
    }
    else{//t
        if(showTip) g("t-t");
        else g("t");
    }
    target.addClass("ds-tp");
    //console.log(target);
    if(target.css("height") == "auto" && target.css("width") == "auto"/* && target.css("display") != "block"*/) target.css("display","inline-block");
    target.append(e);
    deltaEvents(target,"tt");
    components[0].push(target);
    components[1].push("tp");
    components[0].push(ttB);
    components[1].push("tt");
    function g(d){e.addClass(`ds-tt-${d}`).attr("data-tt-o",`ds-tt-${d}`);}
}

    //对齐tooltip
function alignToolTip(tp,isFixed){
    //数据获取
    if(!tp.hasClass("ds-tp")) return;
    //tp.addClass(""); //todo:tooltip双向动画
    //fixed:直接使用querySelector会导致内部元素有tooltip的元素的tooltip无法获取到
    if(tp.id == ""){
        var i = `mwds${(Math.random() * 1e8).toFixed(0)}`;
        tp.id = i;
        var t = tp.querySelector(`#${tp.id} > .ds-tt`);
        tp.attr("id",null);
    }
    else var t = tp.querySelector(`#${tp.id} > .ds-tt`);
    //还原原来的样式
    if(isFixed !== true) rAC().addClass(t.attr("data-tt-o"));
    //尝试次数不超过5次
    for(let i = 0; i < 5; i++){
        //toFixed()是为了防止渲染精度导致的tooltip随机抖动，偏差很小不要紧
        //对于浮动在上下的tooltip需要左右对齐（1/2宽度）
        if(t.hasClass("ds-tt-t") || t.hasClass("ds-tt-b") || t.hasClass("ds-tt-t-t") || t.hasClass("ds-tt-b-t")){
            //fixed:其实方案是相同的 fixed:如果元素宽高为auto，则relative->absolute的坐标基点不同，使用不同的对齐方案
            //console.log(tp.css("width"));
            t.css("margin-left",(($.dom(tp,"--") - $.dom(t,"bp--pb")) / 2).toFixed(2) + "px");
        }
        //对于浮动在左右的tooltip需要上下对齐（1/2高度）
        else if(t.hasClass("ds-tt-l") || t.hasClass("ds-tt-r") || t.hasClass("ds-tt-l-t") || t.hasClass("ds-tt-r-t")){
            //fixed:其实方案是相同的 fixed:如果元素宽高为auto，则relative->absolute的坐标基点不同，使用不同的对齐方案
            //console.log(tp.css("height"));
            t.css("margin-top",(-($.dom(tp,"||") + $.dom(t,"bp||pb")) / 2).toFixed(2) + "px");
        }
        //测试是否超出界限，若超出则重新进行
        //console.log($.rect(t,"fr"),$.rect(t,"fb"));
        if($.rect(t,"fr") > document.body.clientWidth){
            if(!i) fixToolTip("l");
            else if(i == 1) fixToolTip("t");
            else if(i == 2) fixToolTip("b");
        }
        if($.rect(t,"fb") > window.innerHeight){
            if(!i) fixToolTip("t");
            else if(i == 1) fixToolTip("l");
            else if(i == 2) fixToolTip("r");
        }
        if($.rect(t,"fl") < 0){
            if(!i) fixToolTip("r");
            else if(i == 1) fixToolTip("t");
            else if(i == 2) fixToolTip("b");
        }
        if($.rect(t,"ft") < 0){
            if(!i) fixToolTip("b");
            else if(i == 1) fixToolTip("l");
            else if(i == 2) fixToolTip("r");
        }
        break;
    }
    function fixToolTip(a){
        //fixed:.ds-cls提示框偶然抽风失灵
        //console.log(tp,t);
        rAC();
        if(hasTriangle()) t.addClass("ds-tt-" + a + "-t");
        else t.addClass("ds-tt-" + a);
        alignToolTip(t.getParentByClass("ds-tp"),true);
    }
    function hasTriangle(){let o = t.attr("data-tt-o");return o == "ds-tt-t-t" || o == "ds-tt-b-t" || o == "ds-tt-l-t" || o == "ds-tt-r-t";}
    function rAC(){return t.removeClass("ds-tt-t ds-tt-t-t ds-tt-b ds-tt-b-t ds-tt-l ds-tt-l-t ds-tt-r ds-tt-r-t");}
}
//end提示框

//弹出框
    //遮罩创建
function createMask(){
    if(overlay.length = 0){//important:这里不可以写!overlay，对于空数组它们的运行结果不一致，我也觉得很奇怪。可见我提的问题：https://www.zhihu.com/question/515825074
        let e = document.createElement("div");
        e.id = "ds-overlay";
        document.body.prepend(e);
        overlay = $("#ds-overlay");
    }
    //fixed:popUp的声明式注册
    var c = overlay.children;
    if(c.length) for(let i = 0; i < c.length; i++){
        deltaEvents(c[i],"pop");
        components[0].push(c[i]);
        components[1].push("pop");
    }
}

    //显示，返回序号
var showPopUp = this.showPopUp = d=>{
    var d2 = d.cloneNode(true);
    overlay.append(d2);
    deltaEvents(d2,"pop");
    components[0].push(d2);
    components[1].push("pop");
    return overlay.children.length - 1;
}

    //隐藏
var closePopUp = this.closePopUp = d=>{
    var ty = typeof d, s = `${d}. It should be a number, a Node, a Nodelist, an HTMLCollection or an Array.`;
    const A = Array.from(overlay.children);
    if(ty == "number"){//序号
        overlay.removeChild(A[d]);
        checkEmpty();
        return A[d];
    }
    else if(ty == "object"){
        if(d instanceof Node && d.isChildOf(overlay)){//单元素关闭
            var c = d.cloneNode(true);
            d.remove();
            checkEmpty();
            return c;
        }
        else if(d instanceof NodeList || d instanceof HTMLCollection || d instanceof Array){//选择器选择了多个元素关闭
            var total = [];
            for(let i = 0; i < d.length; i++){
                if(d[i].isChildOf(overlay)){
                    total.push(d[i]);
                    d[i].remove();
                }
            }
            checkEmpty();
            return total;
        }
        else $.E(s);
    }
    else if(d === undefined){
        overlay.innerHTML = "";
        return A;
    }
    else $.E(s);
    function checkEmpty(){if(!$("#ds-overlay").children.length) $("#ds-overlay").innerHTML = "";}
    /*const A = Array.from(overlay.children);
    if(d === undefined){
        overlay.innerHTML = "";
        return A;
    }
    else{
        overlay.removeChild(A[d]);
        return A[d];
    }*/
}
//end弹出框

//菜单
    //绑定菜单
var dropDown = this.dropDown = (target, dd, dire, noCls, noPro)=>{
    dd.addClass("ds-dd");
    target.addClass("ds-dp");
    if(dire == "tl" || dire == "tr" || dire == "bl") dd.addClass(`ds-dd-${dire}`);
    else dd.addClass("ds-dd-br");
    if(noCls === true) dd.addClass("ds-nocls");
    deltaEvents(dd,"dd");
    $.Events(target,"contextmenu",e=>{
        let t, l;
        //console.log(e.target);
        if(noPro === true && !e.target.hasClass("ds-dp")) return;
        e.preventDefault();
        dd.css("display","block");
        for(let i = 0; i < 12914; i++){//hack:反正绝对不可能超过10次，不管这里是多少了
            var delta = 10;
            if(dire == "bl"){
                t = e.clientY + delta;
                l = e.clientX - $.dom(dd,"bp--pb") - delta;
            }
            else if(dire == "tr"){
                t = e.clientY - $.dom(dd,"bp||pb") - delta;
                l = e.clientX + delta;
            }
            else if(dire == "tl"){
                t = e.clientY - $.dom(dd,"bp||pb") - delta;
                l = e.clientX - $.dom(dd,"bp--pb") - delta;
            }
            else{//ds-dd-br，默认
                t = e.clientY + delta;
                l = e.clientX + delta;
            }
            if(checkDropDownPos()){
                dd.css({
                    top:t + "px",
                    left:l + "px"
                });
                break;
            }
        }
    });
    components[0].push(target);//主要是产生菜单的元素有事件，所以记录target
    components[1].push("dp");
    components[0].push(dd);
    components[1].push("dd");
        //todo:检查菜单位置
    function checkDropDownPos(){
        return true;
    }
}

    //关闭菜单
var closeDropDown = this.closeDropDown = _=>{
    var dd = $(".ds-dd");
    for(let i = 0; i < dd.length; i++){
        dd[i].css({"display":"","top":"","left":""});
        if(dd[i].attr("style") === "") dd[i].attr("style",null);
    }
}

    //点击所有元素时检查是否需要关闭菜单
    //done:已经统一关闭逻辑，此处代码已弃用
/*function checkCloseDropDown(e,isDown){
    //这个就不用解释了吧
    let obj = e.target;
    //按下的不是左键，直接返回
    if(e.button == 0){
        //如果是按下鼠标，就将flag赋值：
            //如果按下的元素不在菜单内，那么true，表示可以准备关闭菜单了
            //如果按下的元素在菜单内，那么false，表示一会儿松开时无论如何都不能关闭菜单
        if(isDown) isToCloseDropDown = !obj.isInClass("ds-dd");
        //如果是松开鼠标，那么检查flag的值：
            //如果false，那么直接走人，不需要再搞什么了
            //如果true，那么判断松开时的元素是否还是不在菜单内，如果从头到尾和菜单没有一点关系，那么就可以确定用户在菜单外部单击了，关闭菜单，同时重置flag
        else if(isToCloseDropDown){
            if(!obj.isInClass("ds-dd")) closeDropDown();
            isToCloseDropDown = false;
        }
    }
}*/
//end菜单

//扩展框
    //扩展框样式取决方法
var preExp = /*this.preExp =*/ (target, expB, exp)=>{
    let di = "br";
    let tri = "c";
    if(h("tl")) di = "tl";
    if(h("tr")) di = "tr";
    if(h("bl")) di = "bl";
    //br是默认值，无需写
    if(h("t")) di = "t";
    if(h("b")) di = "b";
    if(h("l")) di = "l";
    if(h("r")) di = "r";
    //触发条件
    if(h("h")) tri = "h";
    if(h("d")) tri = "d";
    //c是默认值
    exp(target, expB, di, tri, expB.hasClass("ds-nocls"), expB.hasClass("ds-nopro"), "pre");
    function h(o){return expB.hasClass(`ds-exp-${o}`);}
}

    //扩展框注册
var exp = this.exp = (target, expB, direction, trigger, noCls, noPro, surePre)=>{
    //console.log(target, expB);
    var e = toHTML(expB, target, "exp", surePre);
    e.addClass("ds-exp");
    if(direction == "t"  || direction == "b"  || direction == "l" || direction == "r" ||
       direction == "tl" || direction == "tr" || direction == "bl") g(direction);
    else g("br");
    //console.log(e);
    target.addClass("ds-ep");
    if(target.css("height") == "auto" && target.css("width") == "auto") target.css("display","inline-block");
    target.append(e);
    if(trigger == "c"){
        e.addClass("ds-exp-c");
        deltaEvents(target, "exp-c");
    }
    else if(trigger == "d"){
        e.addClass("ds-exp-d");
        deltaEvents(target, "exp-d");
    }
    else e.addClass("ds-exp-h");
    components[0].push(target);
    components[1].push("ep");
    components[0].push(expB);
    components[1].push("exp");
    function g(d){e.addClass(`ds-exp-${d}`).attr("data-exp-o", `ds-exp-${d}`);}
}

    //关闭扩展框
function closeExp(){
    
}
//end扩展框

//声明式注册
preRegister(win, toolTip, preTT, exp, preExp);
function preRegister(win, toolTip, preTT, exp, preExp){
    //fixed:使用多次迭代doms数组的方案成功解决了当声明式组件嵌套在另一个声明式组件里，后者又首先注册的情况下导致前者在doms中失效的问题
    while(true){
        var doms = $("*[mwds]");
        if(!doms.length) break;
        for(let i = 0; i < doms.length; i++){
            if(doms[i].attr("mwds") === null) continue;//不能改doms，就跳过
            //doms[i].attr("mwds", null);
            checkMWDS(doms[i]);
        }
    }
    function checkMWDS(obj){
        obj.attr("mwds", null);
        let tt, expBlock;
        //fixed:直接使用querySelector会导致内部元素有tooltip的元素的tooltip无法获取到
        if(obj.id == ""){
            let id = `mwds${(Math.random() * 1e5).toFixed(0)}`;
            obj.id = id;
            tt = obj.querySelector(`#${obj.id} > .ds-tt`);
            expBlock = obj.querySelector(`#${obj.id} > .ds-exp`);
            obj.attr("id",null);
        }
        else{
            tt = obj.querySelector(`#${obj.id} > .ds-tt`);
            expBlock = obj.querySelector(`#${obj.id} > .ds-exp`);
        }
        //console.log(tt,expBlock);
        if(obj.hasClass("ds-win")) win(obj, obj.hasClass("ds-a"), obj.hasClass("ds-tra"), obj.hasClass("ds-mov"), obj.hasClass("ds-cls"), obj.hasClass("ds-ontop"), obj.hasClass("ds-resize"), "pre");
        else if(tt) preTT(obj, tt, toolTip);
        else if(expBlock) preExp(obj, expBlock, exp);
    }
}
//end声明式注册

//通用关闭逻辑
function generalCheckClose(event, isDown){
    if(!event.button){//左键关闭，其余键不理
        var tar = event.target;
        if(isDown){
            let isInCanClose = false;
            for(let i = 0; i < components[0].length; i++){
                let c0 = components[0][i], c1 = components[1][i];
                let isRelatedToc0 = tar.isInElement(c0) || tar == c0;
                let isValidClosee = c1 == "dd" || c1 == "exp" || c1 == "pop";
                if(isRelatedToc0 && isValidClosee){
                    isInCanClose = true;
                    console.log(tar, "related to", c0);
                }
                if(isValidClosee && isRelatedToc0 && !c0.hasClass("ds-nocls")){
                    //这里表示点击的目标就在一个可以关闭的元素内，那么记录该元素
                    pressedItem = c0;
                    pressedItemType = c1;
                    break;//note:短路求值，可能有问题
                }
            }
            //按下的元素与支持关闭的元素无关
            isToClose = !isInCanClose;
            console.log(pressedItem, pressedItemType, isInCanClose, isToClose);
        }
        else if(pressedItem){
            console.log("check pressedItem");
            if(tar.isInElement(pressedItem) || tar == pressedItem){
                //这里表示松开的目标也在按下的元素
                processClose();
                pressedItem = undefined;
                pressedItemType = undefined;
            }
        }
        else if(isToClose){
            console.log("check isToClose");
            let isInCanClose = false;
            for(let i = 0; i < components[0].length; i++){
                let c0 = components[0][i], c1 = components[1][i];
                if((tar.isInElement(c0) || tar == c0) &&
                   (c1 == "dd" || c1 == "exp" || c1 == "pop")){
                    isInCanClose = true;
                    break;//note:短路求值，可能不适用于popUp
                }
            }
            if(!isInCanClose){
                processClose();
                //console.log("close by isToClose");//按下松开都不在支持关闭的元素内，可关闭
                isToClose = false;
            }
        }
    }
    function processClose(){
        console.log(`${pressedItemType} close`);
        if(pressedItemType == "dd") closeDropDown();
        else if(pressedItemType == "exp"){

        }
        else if(pressedItemType == "pop"){

        }
        else{//isToClose
            closeExp();
            closeDropDown();
            if(overlay.children.length) closePopUp(overlay.children.length - 1);
        }
    }
}
//end通用关闭逻辑
}