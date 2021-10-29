console.log(
    "mwds.js - MoreWindows ©LJM12914"+"\r\n"+
    "oink组件，当然也可以单独抽出来用，记得带上css https://github.com/ljm12914/oink"
); //Herobrine保佑 永不出bug

//公共变量区
    //移动相关
var ismoving, istoclose = false;
var deltatop, deltaleft, moving, movingj, duratime;
var winlist = $(".ds-win");
    //end移动相关
//end公共变量区

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
    //鼠标
    $(".ds-cls").on("dblclick",function(e){if($(e.target).hasClass("ds-cls")) $(e.target).hide();});//防止事件冒泡
    $(".ds-cls").on("mouseenter",function(e){showTips($(e.target),"双击关闭窗口");});
    $(".ds-cls").on("mouseleave",function(){hideTips()});
    //触摸屏（oink：仅限触摸屏电脑,移动端会直接上菜单）
    $(".ds-cls").on("touchstart",function(e){//FIXME:这里由于子节点的touchstart传不上来，暂时无法在点击窗口内容时出现提示。
        let t = $(e.target);
        showTips(t,"双击关闭窗口");
        if(t.hasClass("ds-cls")) checkClose(t);//防止事件冒泡
    });
    $(".ds-cls").on("touchend",function(){hideTips()});
//end可关闭的窗口
//遮罩创建
createMask();
//end遮罩创建
});
//endJQuery主方法

//移动方法
    //general按下处理
function pressDown(isTouch,e){
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
function dsWinPress(isTouch,e){
    moving = e.target;
    movingj = $(moving);
    if(movingj.hasClass("ds-mov")){//防止事件冒泡
        ismoving = true;
        if(isTouch){
            deltatop = e.touches[0].pageY - movingj.position().top;
            deltaleft = e.touches[0].pageX - movingj.position().left;
        }
        else{
            deltatop = e.pageY - movingj.position().top;
            deltaleft = e.pageX - movingj.position().left;
        }
        $("*").css({"cursor":"grabbing","user-select":"none","-webkit-user-drag":"none","-webkit-user-select":"none"});
    }
}
    //移动中处理+边界探测
function movingf(isTouch,e){
    if(ismoving){
        //zIndex($(e));
        if(isTouch){
            zIndex(movingj);
            movingj.css("top",e.touches[0].pageY - deltatop);
            movingj.css("left",e.touches[0].pageX - deltaleft);
        }
        else{
            movingj.css("top",e.pageY - deltatop);
            movingj.css("left",e.pageX - deltaleft);
        }
        if(movingj.position().left < 0) movingj.css("left",0);
        if(movingj.position().top < 0) movingj.css("top",0);
        if(movingj.position().left + movingj.innerWidth() > document.body.scrollWidth) movingj.css("left",document.body.scrollWidth - movingj.innerWidth());//此处不考虑横向滚动条，因此absolute元素也不能拖到右边去
        if(movingj.position().top + movingj.innerHeight() > window.innerHeight && !movingj.hasClass("ds-a")) movingj.css("top",window.innerHeight - movingj.innerHeight());
    }
}
    //松开处理
function moveUp(){
    if(ismoving){
        ismoving = false;
        zIndex(movingj);//重新计算z-index
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
function tOrb(a,b){
    a = $(a);
    b = $(b);
    let t = a.offset().top;
    let o = t + a.innerHeight();
    let l = a.offset().left;
    let r = l + a.innerWidth();
    let t1 = b.offset().top;
    let o1 = t1 + b.innerHeight();
    let l1 = b.offset().left;
    let r1 = l1 + b.innerWidth();
    if(((t>t1&&t<o1)||(o>t1&&o<o1)||(t1>t&&t1<o)||(o1>t&&o1<o))&&((l>l1&&l<r1)||(r>l1&&r<r1)||(l1>l&&l1<r)||(r1>l&&r1<r))){//判断是否覆盖
        if(parseInt($(a).css("z-index")) > parseInt($(b).css("z-index"))) return "a";//a在上
        else if(parseInt($(a).css("z-index")) < parseInt($(b).css("z-index"))) return "b";//a在下
        else return "s";//两个一样
    }else return "e";//根本就没覆盖
}

function zIndex(obj){
    //TODO: zindex
    let count = 0;
    let coverlist = [];
    for(let i = 0; i < winlist.length; i++){
        let torb = tOrb(obj,$(winlist[i]));
        if(torb == "b" || torb == "s" && !$(winlist[i]).hasClass("ds-zin")){
            coverlist[coverlist.length] = $(winlist[i]);
            count++;//EFIXME:为啥这里™开始玄学了啊？为什么？！
        }
    }
    if(count != 0){//减少复杂度
        obj.css("z-index",50 + count);
        obj.addClass("ds-zin");
        console.log(obj[0].classList);
        for(let i = 0; i < coverlist.length; i++){
            zIndex(coverlist[i]);
        }
        obj.removeClass("ds-zin");
    }
}
//end动态提升方法

//“关闭”
function checkClose(){

}
//end“关闭”

//小提示框接口
function showTips(obj,text,width,height){
    let tips = document.createElement("div");
    tips.id = "ds-tips";
    tips.innerHTML = text;
    $("body").append(tips);
    $(tips).css({"top":"200px","left":"200px"});
    //TODO: 计算tips出现的位置
}

function hideTips(){
    $("#ds-tips").remove();
}
//end小提示框接口

//fixpos逻辑
//TODO
function fixpos(){

}

function showFixpos(){

}
//endfixpos逻辑

//提示框接口
//TODO: 遮罩
function createMask(){

}
function showPopOut(){

}

function hidePopOut(){

}
//end提示框接口