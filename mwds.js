"use strict";
var MWDS = function(){
/* 为了防止压缩代码时破坏代码，我没有开启变量缩短选项，而是在代码中使用简短的字符变量“手动”压缩代码，同时保留重要变量的长名称。
 * 不用担心，看得懂的
 * Herobrine保佑 永不出bug
 */
console.log("mwds.js - MoreWindows ©LJM12914\r\noink组件。 https://github.com/openink/mwds");
//全局变量区
    //内部luery指代
var $ = luery,
    //遮罩
overlay = $("#ds-overlay"),
    //弹出框删除flag
isToClosePopUp = false,
    //窗口移动flag
isMoving = false,
    //窗口移动跨方法变量
deltaTop, deltaLeft, move,
    //菜单关闭flag
isToCloseDropDown = false,
pressedMenuItem,
    //窗口超限探测优化flag
resizeTimer = null,
    //DOM变化监测
observer;
//end全局变量区

//公共函数/方法区
    //快速获取z-index
function getZ(o){return parseInt(o.style.zIndex);}

    //增加/修改z-index
function setZ(o,isP,p){//p可以是负数！
    if(isP) o.style.zIndex = getZ(o) + p;
    else o.style.zIndex = p;
    //return getZ(obj);
}

    //窗口越界检测
function checkWinPos(o){//上和左比下和右更重要，所以放在最后
    if($.tt(o,"fr") > document.body.clientWidth) o.css("left",document.body.clientWidth - $.tt(o,"w") + "px");//此处不考虑横向滚动条，因此absolute元素也不能拖到右边去
    if($.tt(o,"fb") > innerHeight && !o.hasClass("ds-a")) o.css("top",innerHeight - $.tt(o,"h") + "px");
    if($.tt(o,"fl") < 0) o.css("left",0);
    if($.tt(o,"ft") < 0 && !o.hasClass("ds-a")) o.css("top",0);//fixed:2022.2.5 ds-a被移动到视口最上方时闪至top:0px，下同
    if($.tt(o,"t") < 0)  o.css("top",0);
}
//end公共函数/方法区

//初始化
    //杂项
        //todo:防止有人在classlist里写ds-zin锁窗口
//$("*").removeAttribute("ds-zin");
        //防止窗口超限
for(let i = 0; i < $(".ds-win").length; i++) checkWinPos($(".ds-win")[i]);
window.addEventListener("resize",e=>{
    if(resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(c=>{for(let i = 0; i < $(".ds-win").length; i++) checkWinPos($(".ds-win")[i]);},250);
});

    //可关闭的窗口初始化
clsAddToolTip();//给ds-cls添加提示框（必须放在toolTipIni()之前执行）

    //遮罩层初始化
createMask();//弹出框/菜单遮罩创建

    //提示框初始化
toolTipIni();//给tooltip父节点添加标记

    //注册所有事件
registerEvents();

    //DOM变化监测
observer = new MutationObserver(processMutation);
observer.observe($("body")[0],{characterData:true,attributes:true,childList:true,subtree:true});
//end初始化

//fixme:事件注册与DOM变化监测
    //DOM变化监测
function processMutation(l){
    for(let i = 0; i < l.length; i++){
        //console.log(l[i]);
        if(l[i].type == "childList" && !!l[i].addedNodes){
            console.log("c");
        }
        //else if(l[i].type == "subtree"){//不知道是啥，丢弃
            //console.log("s");
        //}
        else if(l[i].type == "attributes" && l[i].attributeName == "class"){
            console.log("a");
        }
        //else if(l[i].type == "characterData"){//元素内部数据发生改变，丢弃
            //console.log("d");
        //}
    }
    //registerEvents();
}

    //事件注册
function registerEvents(){
    //通用
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
    //$Events($("*"),"click",e=>{});
    //移动
    try{$.Events($(".ds-mov"),"mousedown",e=>{pressOnWin(false,e);});}catch(e){}//这里不需要抛异常，没有窗口要移动很正常，反而更轻松了
    try{$.Events($(".ds-mov"),"touchstart",e=>{pressOnWin(true,e);});}catch(e){}
    //可关闭窗口
    try{$.Events($(".ds-cls"),"dblclick",e=>{closeCls(false,e);});}catch(e){}
    //fixme:这里由于子节点的touchstart传不上来，无法在触摸屏点击窗口内容时出现提示。
    try{$.Events($(".ds-cls"),"touchstart",e=>{closeCls(true,e);});}catch(e){}
    //提示框
    try{$.Events($(".ds-tp"),"mouseover",e=>{alignToolTip(e.target);});}catch(e){}
    try{$.Events($(".ds-tp"),"touchstart",e=>{alignToolTip(e.target);});}catch(e){}
    //菜单
    //点击菜单任意子元素后关闭所有菜单，ds-nocls除外
    try{$.Events($(".ds-dd"),"mousedown",e=>{pressedMenuItem = e.target;});}catch(e){}
    try{
        $.Events($(".ds-dd"),"mouseup",e=>{
            if(pressedMenuItem === e.target && !e.target.hasClass("ds-dd") && !e.target.getParentByClass("ds-dd").hasClass("ds-nocls") && !e.button) closeDropDown();
            pressedMenuItem = undefined;
        });
    }catch(e){}
}
//end注册事件

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
        zinmax();
        isMoving = true;
        if(isTouch){
            deltaTop = e.touches[0].pageY - $.tt(move,"t");
            deltaLeft = e.touches[0].pageX - $.tt(move,"l");
        }
        else{
            deltaTop = e.pageY - $.tt(move,"t");
            deltaLeft = e.pageX - $.tt(move,"l");
        }
        $("*").css({"cursor":"grabbing","user-select":"none","-webkit-user-drag":"none","-webkit-user-select":"none"});
    }
}

    //移动窗口设置全局最大zindex
function zinmax(){
    let m = 0;
    for(let i = 0; i < $(".ds-win").length; i++) m = Math.max(m,getZ($(".ds-win")[i]));
    setZ(move,false,m + 1);
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
        //zIndex(move); //由于某些玄学因素，这里不能zIndex，否则会使bug更多
        delStyle($("html")[0]);
    }
}

    //递归删除没用style
function delStyle(d){
    let s = d.getAttribute("style");
    if(s == "cursor: grabbing; user-select: none; -webkit-user-drag: none;") d.removeAttribute("style");
    else d.css({"cursor":"","user-select":"","-webkit-user-drag":"","-webkit-user-select":""});
    for(let i = 0;i < d.children.length; i++) delStyle(d.children[i]);
}
//end移动

//窗口提升
    //判断a在b上面还是下面+检测
function tOrb(a, b){
    let t = $.tt(a,"t");
    let o = $.tt(a,"b");
    let l = $.tt(a,"l");
    let r = $.tt(a,"r");
    let t1 = $.tt(b,"t");
    let o1 = $.tt(b,"b");
    let l1 = $.tt(b,"l");
    let r1 = $.tt(b,"r");//fixed:不加等号会导致完全重叠在一起的窗口无法分离，已修复
    if(((t>=t1&&t<=o1)||(o>=t1&&o<=o1)||(t1>=t&&t1<=o)||(o1>=t&&o1<=o))&&((l>=l1&&l<=r1)||(r>=l1&&r<=r1)||(l1>=l&&l1<=r)||(r1>=l&&r1<=r))){//判断是否覆盖
        if(getZ(a) > getZ(b)) return "a";//a在上
        else if(getZ(a) < getZ(b)) return "b";//a在下
        else return "s";//两个一样
    }else return "e";//根本就没覆盖
}

    //dark名鼎鼎的zIndex方法 fixme:搞完了，但还是有点问题，4-3L时由于没有记录相对位置仍然会出现问题，可能的解决方案：先把非e记录进数组再按zindex执行递归
function zIndex(o){
    setZ(o,false,50);
    for(let i = 0; i < $(".ds-win").length; i++){
        if(tOrb(o,$(".ds-win")[i]) != "e" && !$(".ds-win")[i].hasClass("ds-zin") && !$(".ds-win")[i].hasClass("ds-ontop") && $(".ds-win")[i].css("display") != "none"){
            o.addClass("ds-zin");
            setZ(o,false,zIndex($(".ds-win")[i]) + 1,"zin-l");
            o.removeClass("ds-zin");
        }
    }
    return getZ(o);
}
//end窗口提升

//可关闭的窗口
    //给ds-cls自动安排tooltip
function clsAddToolTip(){
    let c = document.createElement("div");
    c.addClass("ds-tt ds-tt-t");
    c.innerText = "在空闲区域双击可关闭窗口";
    let a = $(".ds-cls");
    for(let i = 0; i < a.length; i++) a[i].innerHTML = c.outerHTML + a[i].innerHTML;
}

    //双击关闭ds-cls
function closeCls(isTouch, e){
    let t = e.target;
    if(!t.hasClass("ds-cls")) return;
    if(isTouch){
        //setTimeout()//todo:触摸屏端检测双击
    }
    else{
        setZ(t,false,50,"cls");
        t.css("display","none");
    }
}
//end可关闭的窗口

//提示框
    //给tooltip父节点添加标记，给tooltip打个原始class标记
function toolTipIni(){
    let a = $(".ds-tt");
    for(let i = 0; i < a.length; i++){
        a[i].parent().addClass("ds-tp");
        a[i].setAttribute("data-tt-o",a[i].className.substring(a[i].className.indexOf("ds-tt-") + 6,a[i].className.length));
    }
}

    //对齐tooltip
function alignToolTip(tp){
    if(!tp.hasClass("ds-tp")) return;
    let t = tp.querySelector(".ds-tt");//不管一个元素内含多个tooltip，note:由于不是document域，无法使用luery获取
    //toFixed()是为了防止渲染精度导致的tooltip随机抖动，偏差很小不要紧
    //对于浮动在上下的tooltip需要左右对齐（1/2宽度）
    if(t.hasClass("ds-tt-t") || t.hasClass("ds-tt-b") || t.hasClass("ds-tt-t-t") || t.hasClass("ds-tt-b-t")) t.css("margin-left",(($.tt(tp,"pw") - $.tt(t,"w")) / 2).toFixed(2) + "px");
    //对于浮动在左右的tooltip需要上下对齐（1/2高度）
    else if(t.hasClass("ds-tt-l") || t.hasClass("ds-tt-r") || t.hasClass("ds-tt-l-t") || t.hasClass("ds-tt-r-t")) t.css("margin-top",(($.tt(tp,"ph") - $.tt(t,"h")) / 2).toFixed(2) + "px");
    //智能显示
    if($.tt(t,"fr") > document.body.clientWidth) checkToolTip("r","l",t);
    if($.tt(t,"fb") > innerHeight) checkToolTip("b","t",t);
    if($.tt(t,"fl") < 0) checkToolTip("l","r",t);
    if($.tt(t,"ft") < 0) checkToolTip("t","b",t);
}

//todo:important:warning:fixme:note:这里必须重构了，很混乱
    //辅助智能显示todo:指定原始的样式，一旦特殊情况结束则返回原始样式
function checkToolTip(s,g,o){
    if(o.hasClass("ds-tt-" + s)){
        o.setAttribute("data-tt-o",s);
        o.removeClass("ds-tt-" + s);
        o.addClass("ds-tt-" + g);
    }
    else if(o.hasClass("ds-tt-" + s + "-t")){
        o.setAttribute("data-tt-o",s + "-t");
        o.removeClass("ds-tt-" + s + "-t");
        o.addClass("ds-tt-" + g + "-t");
    }
    else console.log("???");
    alignToolTip(o);
}
//end提示框

//固定栏
    //
var fixpos = this.fixpos = _=>{
    //note:这里先不做，先去做更有意义的事
}
//end固定栏

//弹出框
    //遮罩创建
function createMask(){
    if(overlay == false){//note:important:这里不可以写!overlay，对于空数组它们的运行结果不一致，我也觉得很奇怪。可见我提的问题：https://www.zhihu.com/question/515825074
        console.log("l");
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
    //菜单绑定
var registerDropDown = this.registerDropDown = (er,ee,noPro)=>{
    let t, l;
    $.Events(er,"contextmenu",e=>{
        //console.log(e.target,er);
        if(noPro && checkDDProp(e.target)) return;
        e.preventDefault();
        ee.css("display","block");
        for(let i = 0; i < 12914; i++){//反正绝对不可能超过10次就出去了，不管这里是多少了
            if(ee.hasClass("ds-dd-bl")){
                t = e.clientY + 10;
                l = e.clientX - $.tt(ee,"w") - 10;
            }
            else if(ee.hasClass("ds-dd-tr")){
                t = e.clientY - $.tt(ee,"h") - 10;
                l = e.clientX + 10;
            }
            else if(ee.hasClass("ds-dd-tl")){
                t = e.clientY - $.tt(ee,"h") - 10;
                l = e.clientX - $.tt(ee,"w") - 10;
            }
            else{//ds-dd-br，默认
                t = e.clientY + 10;
                l = e.clientX + 10;
            }
            if(checkDropDownPos()){
                ee.css("top",t + "px");//JSON对象不允许插值，只能分开
                ee.css("left",l + "px");
                break;
            }
        }
    });

        //检查菜单位置
    function checkDropDownPos(){
        //TODO:
        return true;
    }

        //检查是否冒泡事件
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
        throw new TypeError("?");
    }
}

    //关闭菜单
var closeDropDown = this.closeDropDown = _=>{
    for(let i = 0; i < $(".ds-dd").length; i++){
        $(".ds-dd")[i].css({"display":"","top":"","left":""});
        if($(".ds-dd")[i].getAttribute("style") === "") $(".ds-dd")[i].removeAttribute("style");
    }
}

    //点击所有元素时检查是否需要关闭菜单
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
            if(!obj.isInClass("ds-dd")) closeDropDown;
            isToCloseDropDown = false;
        }
    }
}
//end菜单
}