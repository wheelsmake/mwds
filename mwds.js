/* mwds框架目标：10KB很不错，40KB及格线，80KB是底线；注释至少占文件的30%大小，并且力求易懂。
 * 本文件为mwds唯一JavaScript文件，也即将成为mwds唯一需要的JS文件。
 * 正在脱离JQuery，因为它太大了——足足有88KB。
 * 为了防止压缩代码时破坏代码，我没有开启变量缩短选项，而是在代码中使用简短的字符变量“手动”压缩代码，同时保留重要变量的长名称。
 * Herobrine保佑 永不出bug
 * mwds.js
 *  │
 *  ├---公共变量区（调试模式、移动相关、所有窗口数组`winlist`）
 *  │
 *  ├-┬-公共函数/方法区
 *  │ ├---仿JQuery函数区todo:
 *  │ ├---z-index获取与修改
 *  │ ├---`tt`获取坐标信息
 *  │ ├---`checkPos`窗口越界检测
 *  │ └---不支持组件提示
 *  │
 *  ├-┬-JQuery主函数（即将弃用）
 *  │ ├---视口变化时`checkPos`
 *  │ ├---窗口移动相关事件注册
 *  │ ├---`ds-cls`可关闭窗口相关fixme:
 *  │ ├---overlay创建
 *  │ └---tooltip相关
 *  │
 *  ├-┬-窗口移动处理
 *  │ ├---按下处理（2个）
 *  │ ├---获取全局最大z-index（`zinmax`）
 *  │ ├---移动中处理
 *  │ ├---松开处理
 *  │ └---递归删除没用style（`delStyle`）
 *  │
 *  ├-┬-窗口提升
 *  │ ├---检测覆盖&层级关系`tOrb`
 *  │ └---主算法`zIndex`fixme:
 *  │
 *  ├-┬-`ds-cls`可关闭窗口相关
 *  │ ├---自动添加tooltip提示可关闭
 *  │ └---关闭窗口的主方法todo:
 *  │
 *  ├-┬-提示框（tooltip）
 *  │ └---对齐提示框
 *  │
 *  todo:
 */
console.log("mwds.js - MoreWindows ©LJM12914\r\noink组件。 https://github.com/openink/mwds");

//公共变量区
    //调试模式
var dbgmode = true;
    //移动相关
var ismoving = false;
var dtop, dleft, move;
    //全局窗口数组
var winlist = $(".ds-win");
//end公共变量区
//公共函数/方法区
    //仿JQuery函数区
if(window.HTMLElement){
    HTMLElement.prototype.addClass = function(c){this.classList.add(c);return this;}
    HTMLElement.prototype.removeClass = function(c){return this.classList.replace(c,"");}
    HTMLElement.prototype.hasClass = function(c){return this.classList.contains(c);}
    HTMLElement.prototype.css = function(){
        if(arguments.length==1){
            return this.style.getPropertyValue(arguments[0]);
        }
        else if(arguments.length==2){
            for(let i = 0; i < arguments[1].length; i++){
                this.style.setProperty(i,arguments[1][i]);
            }
            return this;
        }
    }
}
else{
    //todo:兼容一下不支持HTMLElement的浏览器
    noSupport("mwds");
}
    //end仿JQuery函数区
    //快速获取z-index
function getZ(o){return parseInt($(o).css("z-index"));}

    //增加/修改z-index
function setZ(o, isP, p, dbginf){//p可以是负数！
    if(isP) $(o).css("z-index",getZ(o) + p);
    else $(o).css("z-index",p);
    if(dbgmode) console.log(o[0].id + "->" + getZ(o) + " " + dbginf);
    //return getZ(obj);
}

    //获取元素各种坐标信息的封装函数
    //client<height/width>：内容+padding
    //offset<height/width>：内容+padding+border+滚动条（如果有）
    //outer<height/width>：内容+padding+border+滚动条（如果有）+margin
    //F(ixed)T(op)：相对于当前页面上端的坐标，T(op)：相对于网页上端的坐标，B、L、R一样
    //P(ure)H(eight)：元素本身的高度（盒模型最里面那个纯高度，不包括padding margin border scroll）
    //A(ll)H(eight)：元素所有的高度（outer<height/width>）
function tt(o,t,dbginf){
    o = $(o)[0];
    switch(t){
        case "t": return parseInt($(o).css("top").replace("px",""));
        case "ft": return o.getBoundingClientRect().top;
        case "b": return tt(o,"t") + tt(o,"h");
        case "fb": return tt(o,"ft") + tt(o,"h");
        case "l": return parseInt($(o).css("left").replace("px",""));
        case "fl": return o.getBoundingClientRect().left;
        case "r": return tt(o,"l") + tt(o,"w");
        case "fr": return tt(o,"fl") + tt(o,"w");
        case "h": return o.offsetHeight;
        case "w": return o.offsetWidth;
        case "ah": return o.outerHeight;
        case "aw": return o.outerWidth;
        case "ph": return o.clientHeight - parseInt($(o).css("padding-top").replace("px","")) - parseInt($(o).css("padding-bottom").replace("px",""));
        case "pw": return o.clientWidth - parseInt($(o).css("padding-left").replace("px","")) - parseInt($(o).css("padding-right").replace("px",""));
        default:
            if(dbgmode) console.log("tt error: wrong ml " + t + " " + dbginf);
            return 0;
    }
}

    //窗口越界检测
function checkPos(o,dbginf){
    if(dbgmode){
        if(dbginf) console.log("checkPos: " + dbginf);
        else console.log("checkPos " + $(o)[0].id);
    }
    if(tt(o,"l") < 0) o.css("left",0);
    if(tt(o,"t") < 0) o.css("top",0);
    if(tt(o,"r") > document.body.scrollWidth) o.css("left",document.body.scrollWidth - tt(o,"w"));//此处不考虑横向滚动条，因此absolute元素也不能拖到右边去
    if(tt(o,"b") > innerHeight && !o.hasClass("ds-a")) o.css("top",innerHeight - tt(o,"h"));
}

    //不支持时显示提示
function noSupport(m){
    alert("您的浏览器不支持该组件："+m+"。网页的浏览体验可能会有所损失。");
}
//end公共函数/方法区

//JQuery主方法
$(function(){
//防止窗口变化时超限
    window.addEventListener("resize",function(){for(let i = 0; i < winlist.length; i++)if(i.hasClass("ds-f")){checkPos($(winlist[i]),"resize");}});
//移动
    //鼠标
    $("*").removeClass("ds-zin");//防止有人在classlist里写ds-zin锁窗口
    $("*").on("mousedown",function(e){press(false,e);});
    $(".ds-mov").on("mousedown",function(e){pressOnWin(false,e);});
    $("*").on("mousemove",function(e){moveWindows(false,e);});
    $("*").on("mouseup",function(){moveUp();});
    //触摸屏（oink：仅限触摸屏电脑,移动端会直接上菜单）
    $("*").on("touchstart",function(e){press(true,e);});
    $(".ds-mov").on("touchstart",function(e){pressOnWin(true,e);});
    $("*").on("touchmove",function(e){moveWindows(true,e)});
    $("*").on("touchend",function(){moveUp();});
//end移动
//可关闭的窗口
    clsAddToolTip();//给ds-cls添加提示框（必须放在overlay创建之前执行）
    //鼠标
    $(".ds-cls").on("dblclick",function(e){closeCls(false,e)});
    //触摸屏（oink：仅限触摸屏电脑,移动端会直接上菜单）
    $(".ds-cls").on("touchstart",function(e){closeCls(true,e);});//fixme:这里由于子节点的touchstart传不上来，无法在点击窗口内容时出现提示。
//end可关闭的窗口
//overlay创建
    createMask();//弹出框/菜单遮罩创建
//endoverlay创建
//tooltip相关
    $(".ds-tt").parent().addClass("ds-tp");//给toolip父节点添加标记
    //鼠标
    $(".ds-tp").on("mouseover",function(e){alignToolTip($(e.target));});
    //触摸屏
    $(".ds-tp").on("touchstart",function(e){alignToolTip($(e.target));});
//endtooltip相关
});
//endJQuery主方法

//移动方法
    //general按下处理
function press(isTouch, e){
    let t = e.target;
    while(true){//如果在窗口内发生则提升z-index
        if($(t).hasClass("ds-win")){
            if(isTouch) e.preventDefault();//必须这样
            e.stopPropagation();
            zIndex($(t));
            break;
        }
        if($(t).prop("nodeName") == "HTML") break;//结束遍历
        t = $(t).parent();
    }
}

    //ds-win按下处理
function pressOnWin(isTouch, e){
    move = $(e.target);
    if(move.hasClass("ds-mov")){//防止事件冒泡
        zinmax();
        ismoving = true;
        if(isTouch){
            dtop = e.touches[0].pageY - tt(move,"t");
            dleft = e.touches[0].pageX - tt(move,"l");
        }
        else{
            dtop = e.pageY - tt(move,"t");
            dleft = e.pageX - tt(move,"l");
        }
        $("*").css({"cursor":"grabbing","user-select":"none","-webkit-user-drag":"none","-webkit-user-select":"none"});
    }
}

    //移动窗口设置全局最大zindex
function zinmax(){
    let m = 0;
    for(let i = 0; i < winlist.length; i++) m = Math.max(m,getZ($(winlist[i])));
    setZ(move,false,m + 1,"zinmax");
}

    //移动中处理
function moveWindows(isTouch, e){
    if(ismoving){
        //zIndex(move);//占用资源过多，使用zinmax方法代替
        if(isTouch){
            move.css("top",e.touches[0].pageY - dtop);
            move.css("left",e.touches[0].pageX - dleft);
        }
        else{
            move.css("top",e.pageY - dtop);
            move.css("left",e.pageX - dleft);
        }
        checkPos(move);//防止位置超限
    }
}

    //松开处理
function moveUp(){
    if(ismoving){
        ismoving = false;
        //zIndex(move); //由于某些玄学因素，这里不能zIndex，否则会使bug更多
        delStyle($("html")[0]);
    }
}

    //递归删除没用style
function delStyle(d){
    let styles = "";
    $.each(d.style,function(z,key){styles += key;});
    if(styles == "cursoruser-select-webkit-user-drag") $(d).removeAttr("style");
    else $(d).css({"cursor":"","user-select":"","-webkit-user-drag":"","-webkit-user-select":""});
    for(let i = 0;i < d.children.length; i++) delStyle(d.children[i]);
}
//end移动方法

//窗口提升方法
    //判断a在b上面还是下面+检测
function tOrb(a, b){
    let t = tt(a,"t");
    let o = tt(a,"b");
    let l = tt(a,"l");
    let r = tt(a,"r");
    let t1 = tt(b,"t");
    let o1 = tt(b,"b");
    let l1 = tt(b,"l");
    let r1 = tt(b,"r");
    if(((t>t1&&t<o1)||(o>t1&&o<o1)||(t1>t&&t1<o)||(o1>t&&o1<o))&&((l>l1&&l<r1)||(r>l1&&r<r1)||(l1>l&&l1<r)||(r1>l&&r1<r))){//判断是否覆盖
        if(getZ(a) > getZ(b)) return "a";//a在上
        else if(getZ(a) < getZ(b)) return "b";//a在下
        else return "s";//两个一样
    }else return "e";//根本就没覆盖
}

    //dark名鼎鼎的zIndex方法 fixme:搞完了，但还是有点问题，4-3L时由于没有记录相对位置仍然会出现问题，解决方案：先把非e记录进数组再按zindex执行递归
function zIndex(o){
    setZ(o,false,50,"zin-f");
    for(let i = 0; i < winlist.length; i++){
        if((tOrb(o,$(winlist[i])) != "e") && (!$(winlist[i]).hasClass("ds-zin")) && ($(winlist[i]).css("display") != "none")){
            o.addClass("ds-zin");
            setZ(o,false,zIndex($(winlist[i])) + 1,"zin-l");
            o.removeClass("ds-zin");
        }
    }
    return getZ(o);
}

//end窗口提升方法

//ds-cls相关
    //给ds-cls自动安排tooltip
function clsAddToolTip(){
    let c = document.createElement("span");
    $(c).addClass("ds-tt ds-tt-gra ds-tt-l-t");
    c.innerText = "在空闲区域双击可关闭窗口";
    $(".ds-cls").prepend(c);
}

    //双击关闭ds-cls
function closeCls(isTouch, e){
    let t = $(e.target);
    if(!t.hasClass("ds-cls")) return;
    if(isTouch){
        //setTimeout()//todo:触摸屏端检测双击
    }
    else{
        setZ(t,false,50,"cls");
        t.hide();
    }
}
//endds-cls相关

//提示框
    //tooltip辅助显示
function alignToolTip(tp){
    let t = $(tp.children(".ds-tt")[0]);//不管一个元素内含多个tooltip
    //对于浮动在上下的tooltip需要左右对齐（1/2宽度）
    if(t.hasClass("ds-tt-t") || t.hasClass("ds-tt-b") || t.hasClass("ds-tt-t-t") || t.hasClass("ds-tt-b-t")) t.css("margin-left",(tt(tp,"pw") - tt(t,"w")) / 2 + "px");
    //对于浮动在左右的tooltip需要上下对齐（1/2高度）
    else if(t.hasClass("ds-tt-l") || t.hasClass("ds-tt-r") || t.hasClass("ds-tt-l-t") || t.hasClass("ds-tt-r-t")) t.css("margin-top",(tt(tp,"ph") - tt(t,"h")) / 2 + "px");
}
//end提示框

//fixpos
    //todo:
function fixpos(){

}
function showFixpos(){

}
//endfixpos逻辑

//弹出框
    //todo:遮罩创建
function createMask(){

}
    //显示
function showPopOut(){

}
    //隐藏
function hidePopOut(){

}
//end弹出框

//菜单
    //todo:
    function dropDown(){

    }
//end菜单