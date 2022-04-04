//Creeper保佑 永无bug
"use strict";
var mwds = new function(){
//初始化代码--------------------------------------------------------------------------------------------------------
console.log("mwds.js - MoreWindows ©LJM12914\r\noink组件。 https://github.com/openink/mwds");

    //内部luery指代
var $ = luery,
    //遮罩
overlay = $("#ds-overlay"),
    //窗口移动flag
isMoving = false,
    //窗口移动跨方法变量
deltaTop, deltaLeft, move,
    //窗口关闭flag
isToCloseCls = false,
    //弹出框关闭flag
isToClosePopUp = false,
    //菜单关闭flag
isToCloseDropDown = false,
pressedMenuItem,
    //扩展框关闭flag
isToCloseExp = false,
pressedExpItem,
    //窗口超限探测优化flag
resizeTimer = null,
    //窗口初次移动zIndex flag
isToZIndex = false,
    //窗口z-index总体下降计数
zIndexFallCount = 0;

    //遮罩层初始化
createMask();//弹出框/菜单遮罩创建
    //初始化注册通用事件
iniGenEvents();
//end初始化代码--------------------------------------------------------------------------------------------------------

//公共函数/方法区
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

    //todo:统一的关闭检查方案。在鼠标按下外部元素或按下内部元素且无ds-nocls时关闭元素。
function checkClose(type, supportsNoCls){
    
}

    //脱注册
var unregister = this.unregister = (obj, deleteEle)=>{
    
}
//end公共函数/方法区

//注册事件
function iniGenEvents(){
    $.Events($("*"),"mousedown",e=>{
        checkCloseDropDown(e,true);
        checkWinPress(false,e);
    });
    $.Events($("*"),"mousemove",e=>{moveWindows(false,e);});
    $.Events($("*"),"mouseup",e=>{
        checkCloseDropDown(e,false);
        moveUp();
    });
    $.Events($("*"),"touchstart",e=>{checkWinPress(true,e);});
    $.Events($("*"),"touchmove",e=>{moveWindows(true,e)});
    $.Events($("*"),"touchend",e=>{moveUp();});
    window.onresize = e=>{
        if(resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(_=>{
            var a = $(".ds-win");//argument:这里用.ds-mov好还是.ds-win好？不能移动的窗口是否需要限制其移出视口？
            for(let i = 0; i < a.length; i++) checkWinPos(a[i]);
        },100);
    }
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
            $.Events(o,"mouseover",e=>{alignToolTip(e.target);});
            $.Events(o,"touchstart",e=>{alignToolTip(e.target);});
            break;
        case "dd"://点击菜单任意子元素后关闭所有菜单，ds-nocls除外
            $.Events(o,"mousedown",e=>{pressedMenuItem = e.target;});
            $.Events(o,"mouseup",e=>{
                if(pressedMenuItem === e.target && !e.target.hasClass("ds-dd") && !e.target.getParentByClass("ds-dd").hasClass("ds-nocls") && !e.button) closeDropDown();
                pressedMenuItem = undefined;
            });
            break;
        case "resize":
            //todo:
            break;
        case "exp-c":
            $.Events(o,"click",e=>{

            });
            break;
        case "exp-d":
            $.Events(o,"dblclick",e=>{

            })
        default: $.E();
    }
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
        zIndex(t.getParentByClass("ds-win"));
    }
}

        //ds-win按下处理
function pressOnWin(isTouch, e){
    move = e.target;
    if(move.hasClass("ds-mov")){//防止事件冒泡
        $("*").css({"cursor":"grabbing","user-select":"none","-webkit-user-drag":"none","-webkit-user-select":"none"});
        isToZIndex = true;
        //setZ(move, 51 + $(".ds-win").length);
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
        if(isToZIndex){
            zIndex(move);
            isToZIndex = false;
        }
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
        zIndex(move);
        delStyle($("html")[0]);
    }
}

        //递归删除没用style
function delStyle(d){
    //let s = d.attr("style");
    //if(s == "cursor: grabbing; user-select: none; -webkit-user-drag: none;") d.attr("style",null);
    //else d.css({"cursor":"","user-select":"","-webkit-user-drag":"","-webkit-user-select":""});
    d.css({"cursor":"","user-select":"","-webkit-user-drag":"","-webkit-user-select":""});
    if(!d.attr("style")) d.attr("style",null);
    for(let i = 0;i < d.children.length; i++) delStyle(d.children[i]);
}
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
    //老代码 setZ(o,50);for(let i = 0; i < $(".ds-win").length; i++){if(tOrb(o,$(".ds-win")[i]) != "e" && !$(".ds-win")[i].hasClass("ds-zin") && !$(".ds-win")[i].hasClass("ds-ontop") && $(".ds-win")[i].css("display") != "none"){o.addClass("ds-zin");setZ(o,zIndex($(".ds-win")[i]) + 1,"zin-l");o.removeClass("ds-zin");}}return getZ(o);
    //新代码
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
    //累计到5才会真正执行一次，以免频繁清除空层造成的卡顿
    if(zIndexFallCount > 5){
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
        if(isToCloseCls){
            c();
            isToCloseCls = false;
            return;
        }
        setTimeout(_=>{isToCloseCls = true;/*console.log("true");*/},0);
        setTimeout(_=>{isToCloseCls = false;/*console.log("false");*/},450);
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
    //提示框配置取决
var ttDecider = this.ttDecider = o=>{
    let di = "t";
    let sh = false;
    if(o.hasClass("ds-tt-t")) di = "t";
    if(o.hasClass("ds-tt-b")) di = "b";
    if(o.hasClass("ds-tt-l")) di = "l";
    if(o.hasClass("ds-tt-r")) di = "r";
    if(o.hasClass("ds-tt-t-t")){
        di = "t";
        sh = true;
    }
    if(o.hasClass("ds-tt-b-t")){
        di = "b";
        sh = true;
    }
    if(o.hasClass("ds-tt-l-t")){
        di = "l";
        sh = true;
    }
    if(o.hasClass("ds-tt-r-t")){
        di = "r";
        sh = true;
    }
    return{
        direction: di,
        showTip: sh
    }
}

    //提示框注册
var toolTip = this.toolTip = (target, html, direction, showTip, surePre)=>{
    var e;
    if(surePre == "pre") e = html;
    else{
        e = document.createElement("div").addClass("ds-tt");
        e.innerHTML = html;
    }
    switch(direction){
        case "t":
            if(showTip) g("t-t");
            else g("t");
            break;
        case "b":
            if(showTip) g("b-t");
            else g("b");
            break;
        case "l":
            if(showTip) g("l-t");
            else g("l");
            break;
        case "r":
            if(showTip) g("r-t");
            else g("r");
            break;
        default: $.E("direction");
    }
    target.addClass("ds-tp");
    if(target.css("height") == "auto" && target.css("width") == "auto") target.css("display","inline-block");
    target.append(e);
    deltaEvents(target,"tt");
    function g(d){e.addClass(`ds-tt-${d}`).attr("data-tt-o",`ds-tt-${d}`);}
}

    //对齐tooltip
function alignToolTip(tp,isFixed){
    //数据获取
    if(!tp.hasClass("ds-tp")) return;
    //tp.addClass(""); //todo:tooltip双向动画
    //fixed:直接使用querySelector会导致内部元素有tooltip的元素的tooltip无法获取到
    if(tp.id == ""){
        var i = (Math.random() * 1e8).toFixed(0);
        tp.id = i;
        var t = tp.querySelector(`#${i} > .ds-tt`);
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
        console.log(tp,t);
        rAC();
        if(hasTriangle()) t.addClass("ds-tt-" + a + "-t");
        else t.addClass("ds-tt-" + a);
        alignToolTip(t.getParentByClass("ds-tp"),true);
    }
    function hasTriangle(){let o = t.attr("data-tt-o");return o == "ds-tt-t-t" || o == "ds-tt-b-t" || o == "ds-tt-l-t" || o == "ds-tt-r-t";}
    function rAC(){return t.removeClass("ds-tt-t").removeClass("ds-tt-t-t").removeClass("ds-tt-b").removeClass("ds-tt-b-t").removeClass("ds-tt-l").removeClass("ds-tt-l-t").removeClass("ds-tt-r").removeClass("ds-tt-r-t");}
}
//end提示框

//弹出框
    //遮罩创建
function createMask(){
    if(overlay == false){//important:这里不可以写!overlay，对于空数组它们的运行结果不一致，我也觉得很奇怪。可见我提的问题：https://www.zhihu.com/question/515825074
        let e = document.createElement("div");
        e.id = "ds-overlay";
        document.body.prepend(e);
        overlay = $("#ds-overlay");
    }
}

    //事件注册
$("#ds-overlay").ontouchstart = $("#ds-overlay").onmousedown = e=>{isToClosePopUp = e.target.id == "ds-overlay"};
$("#ds-overlay").ontouchend = $("#ds-overlay").onmouseup = e=>{
    if(e.target.id == "ds-overlay" && isToClosePopUp && !e.button){//只有左键可以关闭了
        hidePopUp(overlay.children.length - 1);
        if(!overlay.children.length) hidePopUp();
        isToClosePopUp = false;
    }
};

    //显示，返回序号
var showPopUp = this.showPopUp = d=>{
    overlay.append(d.cloneNode(true));
    return overlay.children.length - 1;
}

    //隐藏
var hidePopUp = this.hidePopUp = d=>{//传入序号！！！
    const A = Array.from(overlay.children);
    if(d === undefined){
        overlay.innerHTML = "";
        return A;
    }
    else{
        overlay.removeChild(A[d]);
        return A[d];
    }
}
//end弹出框

//菜单
    //绑定菜单
var dropDown = this.dropDown = (er,ee,noPro)=>{
    deltaEvents(ee,"dd");
    $.Events(er,"contextmenu",e=>{
        let t, l;
        //console.log(e.target,er);
        if(noPro && checkDDProp(e.target)) return;
        e.preventDefault();
        ee.css("display","block");
        for(let i = 0; i < 12914; i++){//hack:反正绝对不可能超过10次，不管这里是多少了
            if(ee.hasClass("ds-dd-bl")){
                t = e.clientY + 8;
                l = e.clientX - $.dom(ee,"bp--pb") - 8;
            }
            else if(ee.hasClass("ds-dd-tr")){
                t = e.clientY - $.dom(ee,"bp||pb") - 8;
                l = e.clientX + 8;
            }
            else if(ee.hasClass("ds-dd-tl")){
                t = e.clientY - $.dom(ee,"bp||pb") - 8;
                l = e.clientX - $.dom(ee,"bp--pb") - 8;
            }
            else{//ds-dd-br，默认
                t = e.clientY + 8;
                l = e.clientX + 8;
            }
            if(checkDropDownPos()){
                ee.css({
                    top:t + "px",
                    left:l + "px"
                });
                break;
            }
        }
    });
}

    //检查菜单位置
function checkDropDownPos(){
    //todo:检查菜单位置
    return true;
}
    
    //todo:检查是否冒泡事件
function checkDDProp(obj){
    if(er.toString().indexOf("Collection") != -1){
        //console.log("a");
        for(let i = 0; i < er.length; i++) if(er[i] === obj) return false;
        return true;
    }
    else if(er.toString().indexOf("Element") != -1){
        if(er === obj) return false;
        else return true;
    }
    $.E("?");
}

    //关闭菜单
var closeDropDown = this.closeDropDown = _=>{
    var dd = $(".ds-dd");
    for(let i = 0; i < dd.length; i++){
        dd[i].css({"display":"","top":"","left":""});
        if(dd[i].attr("style") === "") dd[i].attr("style",null);
    }
}

    //点击所有元素时检查是否需要关闭菜单todo:统一菜单与扩展框关闭逻辑（最好把弹出框也统一进来）
function checkCloseDropDown(e,isDown){
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
}
//end菜单

//扩展框
var exp = this.exp = (tar, exp, d, tri, noPro)=>{
    var alexp, isExistNode = exp instanceof Node,
    isNoStyle = (!isExistNode)?true:!(
        exp.hasClass("ds-exp-tl") || exp.hasClass("ds-exp-tr") ||
        exp.hasClass("ds-exp-bl") || exp.hasClass("ds-exp-br") ||
        exp.hasClass("ds-exp-t")  || exp.hasClass("ds-exp-b")  ||
        exp.hasClass("ds-exp-l")  || exp.hasClass("ds-exp-r")  ),
    isNoTrigger = (!isExistNode)?true:!(exp.hasClass("ds-exp-h") || exp.hasClass("ds-exp-c") || exp.hasClass("ds-exp-d")),
    isValidStyle = (d == "tl" || d == "tr" || d == "bl" || d == "br" || d == "t" || d == "b" || d == "l" || d == "r"),
    isValidTrigger = (tri == "h" || tri == "c" || tri == "d");
    //获取操作对象
    if(isExistNode) alexp = exp.cloneNode(true);//note:这边不用考虑exp不在tar内部最末尾的问题
    else{
        alexp = document.createElement("div").addClass("ds-exp");
        alexp.innerHTML = exp;
    }
    //end获取操作对象
    //添加配置或选择默认配置
    //console.log(isExistNode,isNoStyle,isNoTrigger,isValidStyle,isValidTrigger);
    if(isValidStyle){
        if(!isNoStyle) alexp.removeClass("ds-exp-tl").removeClass("ds-exp-tr").removeClass("ds-exp-bl").removeClass("ds-exp-br").removeClass("ds-exp-t").removeClass("ds-exp-b").removeClass("ds-exp-l").removeClass("ds-exp-r");
        lst(d);
    }
    else if(isNoStyle) $.E("style");
    if(isValidTrigger){
        if(!isNoTrigger) alexp.removeClass("ds-exp-h").removeClass("ds-exp-c").removeClass("ds-exp-d");
        lst(tri);
    }
    else if(isNoTrigger) $.E("trigger");
    //end添加配置或选择默认配置
    //最终处理
    alexp.addClass("ds-exp");
    tar.addClass("ds-ep");
    tar.append(alexp);
    bindTriggerEvents();
    bindCloseExp();
    if(exp.isChildOf(tar)) exp.remove();//避免出现两个东西
    function bindTriggerEvents(){
        if(alexp.hasClass("ds-exp-c")) deltaEvents(tar,"exp-c");
        else if(alexp.hasClass("ds-exp-d")) deltaEvents(tar,"exp-d");
    }
    function bindCloseExp(){

    }
    function lst(c){alexp.addClass(`ds-exp-${c}`);}
}
//end扩展框

//声明式注册
    //声明式注册接口
preRegister(win, toolTip, ttDecider, exp);
function preRegister(win, tooltip, ttDecider, exp){
    var doms = $("*[mwds]");
    for(let i = 0; i < doms.length; i++){
        let d = doms[i];
        d.attr("mwds", null);
        let tt = d.querySelector(".ds-tt");
        let ep = d.querySelector(".ds-exp");
        if(d.hasClass("ds-win")) win(d, d.hasClass("ds-a"), d.hasClass("ds-tra"), d.hasClass("ds-mov"), d.hasClass("ds-cls"), d.hasClass("ds-ontop"), d.hasClass("ds-resize"), "pre");
        else if(tt){
            let dec = ttDecider(tt);
            toolTip(d, tt, dec.direction, dec.showTip, "pre");
        }
        else if(ep){
            //todo:
        }
    }
}
//end声明式注册
}