/* 框架目标：10KB！！！
 * 为了防止压缩代码时破坏代码，我没有开启变量缩短选项，而是在代码中使用简短的字符变量“手动”压缩代码，同时保留重要变量的长名称。
 * Herobrine保佑 永不出bug
 * mwds.js
 *  │
 *  ├---公共变量区（移动相关、所有窗口数组`winlist`）
 *  │
 *  ├-┬-公共函数/方法区
 *  │ │
 *  │ ├---z-index获取与修改
 *  │ └---`checkPos`窗口越界检测
 *  │
 *  ├---视口变化时`checkPos`
 *  ├---窗口移动相关
 *  ├---`ds-cls`可关闭窗口相关
 *  ├---overlay创建
 *  ├---tooltip相关
 *  │
 *  ├-┬-窗口移动处理
 *  │ │
 *  │ ├---按下处理（2个）
 *  │ ├---获取全局最大z-index（`zinmax`）
 *  │ ├---移动中处理
 *  │ ├---松开处理
 *  │ └---递归删除没用style（`delStyle`）
 *  │
 *  ├-┬-窗口提升
 *  │ │
 *  │ ├---检测覆盖&层级关系`tOrb`
 *  │ └---主算法`zIndex`
 *  │
 *  ├-┬-`ds-cls`可关闭窗口相关
 *  │ │
 *  │ ├---自动添加tooltip提示可关闭
 *  │ └---关闭窗口的主方法
 *  │
 *  ├-┬-提示框（tooltip）
 *  │ │
 *  │ ├---给tooltip父节点添加标记
 *  │ └---对齐提示框
 *  │
 *  ├-┬-锚定位置（fixpos）
 *  | |
 *  | ├---给tooltip父节点添加标记
 *  |
 *  |
 *  ├-┬-弹出框
 * 
 * 
 */
console.log("mwds.js - MoreWindows ©LJM12914\r\noink组件。 https://github.com/openink/mwds");
//公共变量区
    //移动相关
var ismoving = false;
var dtop, dleft, move;
    //全局窗口数组
var winlist = $(".ds-win");
//end公共变量区
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
function checkPos(o){//上和左比下和右更重要，所以放在最后
    if(tt(o,"fr") > document.body.scrollWidth) o.css("left",document.body.scrollWidth - tt(o,"w") + "px");//此处不考虑横向滚动条，因此absolute元素也不能拖到右边去
    if(tt(o,"fb") > innerHeight && !o.hasClass("ds-a")) o.css("top",innerHeight - tt(o,"h") + "px");
    if(tt(o,"fl") < 0) o.css("left",0);
    if(tt(o,"ft") < 0) o.css("top",0);
}
//end公共函数/方法区
//防止窗口变化时超限
window.addEventListener("resize",()=>{for(let i = 0; i < winlist.length; i++){checkPos(winlist[i])}});
//移动
$("*").removeClass("ds-zin");//防止有人在classlist里写ds-zin锁窗口
    //鼠标
$Events($("*"),"mousedown",(e)=>{press(false,e);});
$Events($(".ds-mov"),"mousedown",(e)=>{pressOnWin(false,e);});
$Events($("*"),"mousemove",(e)=>{moveWindows(false,e);});
$Events($("*"),"mouseup",()=>{moveUp();});
    //触摸屏
$Events($("*"),"touchstart",(e)=>{press(true,e);});
$Events($(".ds-mov"),"touchstart",(e)=>{pressOnWin(true,e);});
$Events($("*"),"touchmove",(e)=>{moveWindows(true,e)});
$Events($("*"),"touchend",()=>{moveUp();});
//end移动
//可关闭的窗口
clsAddToolTip();//给ds-cls添加提示框（必须放在overlay创建之前执行）
    //鼠标
$Events($(".ds-cls"),"dblclick",(e)=>{closeCls(false,e)});
    //触摸屏
$Events($(".ds-cls"),"touchstart",(e)=>{closeCls(true,e);});//fixme:这里由于子节点的touchstart传不上来，无法在点击窗口内容时出现提示。
//end可关闭的窗口
//overlay创建
createMask();//弹出框/菜单遮罩创建
//endoverlay创建
//tooltip相关
toolTipIni();//给tooltip父节点添加标记
    //鼠标
$Events($(".ds-tp"),"mouseover",(e)=>{alignToolTip(e.target);});
    //触摸屏
$Events($(".ds-tp"),"touchstart",(e)=>{alignToolTip(e.target);});
//endtooltip相关

//移动处理
    //general按下处理
function press(isTouch, e){
    let t = e.target;
    while(true){//如果在窗口内发生则提升z-index
        if(t.hasClass("ds-win")){
            if(isTouch) e.preventDefault();//必须这样
            e.stopPropagation();
            zIndex(t);
            break;
        }
        if(t.tagName == "HTML") break;
        t = t.parent();
    }
}

    //ds-win按下处理
function pressOnWin(isTouch, e){
    move = e.target;
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
    for(let i = 0; i < winlist.length; i++) m = Math.max(m,getZ(winlist[i]));
    setZ(move,false,m + 1);
}

    //移动中处理
function moveWindows(isTouch, e){
    if(ismoving){
        if(isTouch){
            move.css("top",e.touches[0].pageY - dtop + "px");
            move.css("left",e.touches[0].pageX - dleft + "px");
        }
        else{
            move.css("top",e.pageY - dtop + "px");
            move.css("left",e.pageX - dleft + "px");
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
    let s = d.getAttribute("style");
    if(s == "cursor: grabbing; user-select: none; -webkit-user-drag: none;") d.removeAttribute("style");
    else d.css({"cursor":"","user-select":"","-webkit-user-drag":"","-webkit-user-select":""});
    for(let i = 0;i < d.children.length; i++) delStyle(d.children[i]);
}
//end移动处理

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
    setZ(o,false,50);
    for(let i = 0; i < winlist.length; i++){
        if((tOrb(o,winlist[i]) != "e") && (!winlist[i].hasClass("ds-zin")) && (winlist[i].css("display") != "none")){
            o.addClass("ds-zin");
            setZ(o,false,zIndex(winlist[i]) + 1,"zin-l");
            o.removeClass("ds-zin");
        }
    }
    return getZ(o);
}

//end窗口提升方法

//ds-cls相关
    //给ds-cls自动安排tooltip
function clsAddToolTip(){
    let c = document.createElement("div");
    c.addClass("ds-tt ds-tt-gra ds-tt-l-t");
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
//endds-cls相关

//提示框
    //给tooltip父节点添加标记
function toolTipIni(){
    let a = $(".ds-tt");
    for(let i = 0; i < a.length; i++) a[i].parent().addClass("ds-tp");
}
    //对齐tooltip
function alignToolTip(tp){
    if(!tp.hasClass("ds-tp")) return;
    let t = tp.querySelector(".ds-tt");//不管一个元素内含多个tooltip
    //Math.round()是为了防止tooltip随机抖动
    //对于浮动在上下的tooltip需要左右对齐（1/2宽度）
    if(t.hasClass("ds-tt-t") || t.hasClass("ds-tt-b") || t.hasClass("ds-tt-t-t") || t.hasClass("ds-tt-b-t")) t.css("margin-left",Math.round((tt(tp,"pw") - tt(t,"w")) / 2) + "px");
    //对于浮动在左右的tooltip需要上下对齐（1/2高度）
    else if(t.hasClass("ds-tt-l") || t.hasClass("ds-tt-r") || t.hasClass("ds-tt-l-t") || t.hasClass("ds-tt-r-t")) t.css("margin-top",Math.round((tt(tp,"ph") - tt(t,"h")) / 2) + "px");
    //
    if(tt(t,"fr") > document.body.scrollWidth) t.removeClass("ds-tt-")
    if(tt(o,"fb") > innerHeight) 
    if(tt(o,"fl") < 0) 
    if(tt(o,"ft") < 0) 
}
//end提示框

//fixpos
    //todo:
function fixpos(){

}
function showFixpos(){

}
//endfixpos

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