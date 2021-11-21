console.log(
    "mwds.js - MoreWindows ©LJM12914"+"\r\n"+
    "oink组件，当然也可以单独抽出来用，记得带上css https://github.com/ljm12914/mwds"
); //Herobrine保佑 永不出bug

//公共变量区
    //调试模式
var dbgmode = true;
    //end调试模式
    //移动相关
var ismoving, istoclose = false;
var deltatop, deltaleft, moving, movingj, duratime;
var winlist = $(".ds-win");
    //end移动相关
//end公共变量区
//公共函数/方法区
    //快速获取z-index
function getZ(obj){return parseInt($(obj).css("z-index"));}

    //增加/修改z-index
function setZ(obj, isPlus, p, dbginf){//p可以是负数！
    if(isPlus) $(obj).css("z-index",getZ(obj) + p);
    else $(obj).css("z-index",p);
    if(dbgmode) console.log(obj[0].id + "->" + getZ(obj) + " " + dbginf);
    //return getZ(obj);
}

    //获取所需信息（top、left、width、height）top和left基于页面坐标！
    function tt(o,t,dbginf){
        o = $(o);
        switch(t){
            case "t": return o[0].getBoundingClientRect().top;
            case "b": return tt(o,"t") + tt(o,"h");
            case "l": return o[0].getBoundingClientRect().left;
            case "r": return tt(o,"l") + tt(o,"w"); 
            case "h":
                if(window.getComputedStyle) return parseInt(window.getComputedStyle(o[0]).height.replace("px","")) + parseInt(o.css("padding-top").replace("px","")) + parseInt(o.css("padding-bottom").replace("px",""));
                else return o[0].getBoundingClientRect().height;
            case "w":
                if(window.getComputedStyle) return parseInt(window.getComputedStyle(o[0]).width.replace("px","")) + parseInt(o.css("padding-left").replace("px","")) + parseInt(o.css("padding-right").replace("px",""));
                else return o[0].getBoundingClientRect().width;
            default:
                if(dbgmode) console.log("tt error: wrong ml " + t + " " + dbginf);
                return 0;
        }
    }
//end公共函数/方法区

//JQuery主方法
$(function(){
//移动
    //鼠标
    $("*").removeClass("ds-zin");//防止有人在classlist里写ds-zin锁窗口
    $("*").on("mousedown",function(e){pressDown(false,e);});
    $(".ds-mov").on("mousedown",function(e){dsWinPress(false,e);});
    $("*").on("mousemove",function(e){movingf(false,e);});
    $("*").on("mouseup",function(){moveUp();});
    //触摸屏（oink：仅限触摸屏电脑,移动端会直接上菜单）
    $("*").on("touchstart",function(e){pressDown(true,e);});
    $(".ds-mov").on("touchstart",function(e){dsWinPress(true,e);});
    $("*").on("touchmove",function(e){movingf(true,e)});
    $("*").on("touchend",function(){moveUp();});
//end移动
//可关闭的窗口
    clsAddToolTip();//给ds-cls添加提示框
    //鼠标
    $(".ds-cls").on("dblclick",function(e){closeCls(false,e)});
    //触摸屏（oink：仅限触摸屏电脑,移动端会直接上菜单）
    $(".ds-cls").on("touchstart",function(e){closeCls(true,e);});//FIXME:这里由于子节点的touchstart传不上来，无法在点击窗口内容时出现提示。
//end可关闭的窗口
//overlay创建
    createMask();//遮罩创建
    $(".ds-tooltip").parent().addClass("ds-toolpar");//给tooltip父节点添加标记
    //鼠标
    $(".ds-toolpar").on("mouseenter",function(e){alignToolTip($(e.target));});
    //触摸屏
    $(".ds-toolpar").on("touchstart",function(e){alignToolTip($(e.target));});
//endoverlay创建
});
//endJQuery主方法

//移动方法
    //general按下处理
function pressDown(isTouch, e){
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
function dsWinPress(isTouch, e){
    moving = e.target;
    movingj = $(moving);
    if(movingj.hasClass("ds-mov")){//防止事件冒泡
        zinmax();
        ismoving = true;
        if(isTouch){
            deltatop = e.touches[0].pageY - tt(movingj,"t");
            deltaleft = e.touches[0].pageX - tt(movingj,"l");
        }
        else{
            deltatop = e.pageY - tt(movingj,"t");
            deltaleft = e.pageX - tt(movingj,"l");
        }
        $("*").css({"cursor":"grabbing","user-select":"none","-webkit-user-drag":"none","-webkit-user-select":"none"});
    }
}

    //移动窗口设置全局最大zindex
function zinmax(){
    let m = 0;
    for(let i = 0; i < winlist.length; i++) m = Math.max(m,getZ($(winlist[i])));
    setZ(movingj,false,m + 1,"zinmax");
}

    //移动中处理+边界探测
function movingf(isTouch, e){
    if(ismoving){
        //zIndex(movingj);//占用资源过多，使用zinmax方法代替
        if(isTouch){
            movingj.css("top",e.touches[0].pageY - deltatop);
            movingj.css("left",e.touches[0].pageX - deltaleft);
        }
        else{
            movingj.css("top",e.pageY - deltatop);
            movingj.css("left",e.pageX - deltaleft);
        }
        if(tt(movingj,"l") < 0) movingj.css("left",0);
        if(tt(movingj,"t") < 0) movingj.css("top",0);
        if(tt(movingj,"r") > document.body.scrollWidth) movingj.css("left",document.body.scrollWidth - tt(movingj,"w"));//此处不考虑横向滚动条，因此absolute元素也不能拖到右边去
        if(tt(movingj,"b") > innerHeight && !movingj.hasClass("ds-a")) movingj.css("top",innerHeight - tt(movingj,"h"));
    }
}

    //松开处理
function moveUp(){
    if(ismoving){
        ismoving = false;
        //zIndex(movingj); //由于某些玄学因素，这里不能zIndex，否则会使bug更多
        delStyle($("html")[0]);
    }
}

    //递归删除没用style
function delStyle(dfs){
    let styles = "";
    $.each(dfs.style,function(z,key){styles += key;});
    if(styles == "cursoruser-select-webkit-user-drag") $(dfs).removeAttr("style");
    else $(dfs).css({"cursor":"","user-select":"","-webkit-user-drag":"","-webkit-user-select":""});
    for(let i = 0; i < dfs.children.length; i++) delStyle(dfs.children[i]);
}
//end移动方法

//动态提升方法
    //判断a在b上面还是下面+检测
function tOrb(a, b){
    a = $(a);
    b = $(b);
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

    //dark名鼎鼎的zIndex方法 FIXME:搞完了，但还是有点问题，4-3L时由于没有记录相对位置仍然会出现问题，解决方案：先把非e记录进数组再按zindex执行递归
function zIndex(obj){
    setZ(obj,false,50,"zin-f");
    for(let i = 0; i < winlist.length; i++){
        if((tOrb(obj,$(winlist[i])) != "e") && (!$(winlist[i]).hasClass("ds-zin")) && ($(winlist[i]).css("display") != "none")){
            obj.addClass("ds-zin");
            setZ(obj,false,zIndex($(winlist[i])) + 1,"zin-l");
            obj.removeClass("ds-zin");
        }
    }
    return getZ(obj);
}

//end动态提升方法

//ds-cls相关
    //给ds-cls自动安排tooltip
function clsAddToolTip(){
    let c = document.createElement("span");
    $(c).addClass("ds-tooltip ds-tgra ds-showb");
    c.innerText = "在空闲区域双击可关闭窗口";
    $(".ds-cls").prepend(c);
}

    //双击关闭ds-cls
function closeCls(isTouch, e){
    let t = $(e.target);
    if(!t.hasClass("ds-cls")) return;
    if(isTouch){
        //setTimeout()//TODO:触摸屏端检测双击
    }
    else{
        setZ(t,false,50,"cls");
        t.hide();
    }
}
//endds-cls相关

//提示框
    //在正确的位置显示tooltip
    //FIXME:快搞完了，反正就是行为很奇怪
function alignToolTip(tipee){
    let tiper = $(tipee.children(".ds-tooltip")[0]);//不管一个元素内含多个tooltip
    if(tiper.hasClass("ds-showb")){//运行两次确保使用的数据正常
        for(let i = 0; i < 2; i++){
            tiper.css("top",tt(tipee,"h") + tt(tiper,"h") * .3 + "px");
            tiper.css("left",tt(tipee,"w") / 2 - tt(tiper,"w") / 2 + "px");
        }
        return;
    }
    else if(tiper.hasClass("ds-showl")){
        for(let i = 0; i < 2; i++){
            tiper.css("top",tt(tipee,"h") / 2 - tt(tiper,"h") / 2 + "px");
            tiper.css("left",- tt(tiper,"w") * 1.08 + "px");
        }
        return;
    }
    else if(tiper.hasClass("ds-showr")){
        for(let i = 0; i < 2; i++){
            tiper.css("top",tt(tipee,"h") / 2 - tt(tiper,"h") / 2 + "px");
            tiper.css("left",tt(tipee,"w") + tt(tiper,"w") * .12 + "px");
        }
        return;
    }
    else{//在顶部渲染（默认）
        for(let i = 0; i < 2; i++){
            tiper.css("top",- tt(tiper,"h") * 1.3 + "px");
            tiper.css("left",tt(tipee,"w") / 2 - tt(tiper,"w") / 2 + "px");
        }
        return;
    }
}
//end提示框

//菜单
    //TODO:
function dropDown(){

}
//end菜单

//fixpos
    //TODO:
function fixpos(){

}
function showFixpos(){

}
//endfixpos逻辑

//弹出框
    //TODO:遮罩创建
function createMask(){

}
    //显示
function showPopOut(){

}
    //隐藏
function hidePopOut(){

}
//end弹出框