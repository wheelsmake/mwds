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
    //弹出框关闭flag
isToClosePopUp = false,
    //窗口移动flag
isMoving = false,
    //窗口移动跨方法变量
deltaTop, deltaLeft, move,
    //窗口关闭flag
isToCloseCls = false,
    //菜单关闭flag
isToCloseDropDown = false,
pressedMenuItem,
    //窗口超限探测优化flag
resizeTimer = null,
    //窗口初次移动zIndex flag
isToZIndex = false,
    //窗口z-index总体下降计数
zIndexFallCount = 0;
//end全局变量区

//公共函数/方法区
    //快速获取z-index
function getZ(o){return parseInt(o.style.zIndex) || 50;}

    //修改z-index
function setZ(o,p){
    o.css("z-index",p);
    return getZ(o);
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
    //遮罩层初始化
createMask();//弹出框/菜单遮罩创建
    //注册所有事件
registerEvents();
//end初始化

//注册事件
function registerEvents(eToRegister){
    if(eToRegister !== undefined) eval(eToRegister + "();");
    else any();mov();cls();tt();dd();
    //todo:important:避免多次注册事件
    function any(){//通用
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
    }
    function mov(){//移动
        //这里不需要抛异常，没有窗口要移动很正常，反而更轻松了
        try{$.Events($(".ds-win.ds-mov"),"mousedown",e=>{pressOnWin(false,e);});}catch(e){}
        try{$.Events($(".ds-win.ds-mov"),"touchstart",e=>{pressOnWin(true,e);});}catch(e){}
    }
    function cls(){//可关闭窗口
        try{$.Events($(".ds-win.ds-cls"),"dblclick",e=>{closeCls(false,e);});}catch(e){}
        //fixme:这里由于子节点的touchstart传不上来，无法在触摸屏点击窗口内容时出现提示。
        try{$.Events($(".ds-win.ds-cls"),"touchstart",e=>{closeCls(true,e);});}catch(e){}
    }
    function tt(){//提示框
        try{$.Events($(".ds-tp"),"mouseover",e=>{alignToolTip(e.target);});}catch(e){}
        try{$.Events($(".ds-tp"),"touchstart",e=>{alignToolTip(e.target);});}catch(e){}
    }
    function dd(){//菜单
        //点击菜单任意子元素后关闭所有菜单，ds-nocls除外
        try{$.Events($(".ds-dd"),"mousedown",e=>{pressedMenuItem = e.target;});}catch(e){}
        try{
            $.Events($(".ds-dd"),"mouseup",e=>{
                if(pressedMenuItem === e.target && !e.target.hasClass("ds-dd") && !e.target.getParentByClass("ds-dd").hasClass("ds-nocls") && !e.button) closeDropDown();
                pressedMenuItem = undefined;
            });
        }
        catch(e){}
    }
}
//end注册事件

//窗口
    //窗口注册
var win = this.win = obj=>{
    obj.addClass("ds-win");
    registerEvents("mov");
    registerEvents("cls");
    if(obj.hasClass("ds-cls")) toolTip(obj,"双击空闲区域可关闭窗口","b",false);
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
        //zinmax(); //note:暂时关闭
        isMoving = true;
        if(isTouch){
            deltaTop = e.touches[0].pageY - $.tt(move,"t");
            deltaLeft = e.touches[0].pageX - $.tt(move,"l");
        }
        else{
            deltaTop = e.pageY - $.tt(move,"t");
            deltaLeft = e.pageX - $.tt(move,"l");
        }
    }
}

        //移动窗口设置全局最大zindex
function zinmax(o){
    var m = 0, w = $(".ds-win");
    for(let i = 0; i < w.length; i++) m = Math.max(m, getZ(w[i]));
    setZ(o,m + 1);
}

        //移动中处理
function moveWindows(isTouch, e){
    if(isMoving){
        if(isToZIndex){
            zinmax(move);
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
        zIndex(move, true);
        delStyle($("html")[0]);
    }
}

        //递归删除没用style
function delStyle(d){
    let s = d.attr("style");
    if(s == "cursor: grabbing; user-select: none; -webkit-user-drag: none;") d.attr("style",null);
    else d.css({"cursor":"","user-select":"","-webkit-user-drag":"","-webkit-user-select":""});
    for(let i = 0;i < d.children.length; i++) delStyle(d.children[i]);
}
    //end移动

    //窗口提升
        //判断a在b上面还是下面+检测
var tOrb = this.tOrb =(a,b)=>{
    let t = $.tt(a,"t");
    let o = $.tt(a,"b");
    let l = $.tt(a,"l");
    let r = $.tt(a,"r");
    let t1 = $.tt(b,"t");
    let o1 = $.tt(b,"b");
    let l1 = $.tt(b,"l");
    let r1 = $.tt(b,"r");
    //fixed:不加等号会导致完全重叠在一起的窗口无法分离
    if(((t>=t1&&t<=o1)||(o>=t1&&o<=o1)||(t1>=t&&t1<=o)||(o1>=t&&o1<=o))&&((l>=l1&&l<=r1)||(r>=l1&&r<=r1)||(l1>=l&&l1<=r)||(r1>=l&&r1<=r))){
        if(getZ(a) > getZ(b)) return "a";//a在上
        else if(getZ(a) < getZ(b)) return "b";//a在下
        else return "s";//两个一样
    }else return "e";//根本就没覆盖
}

        //dark名鼎鼎的zIndex方法 fixme:搞完了，但还是有点问题，4-3L时由于没有记录相对位置仍然会出现问题，可能的解决方案：先把非e记录进数组再按zindex执行递归
        //2022.3.11：终于有希望解决所有问题了！！
function zIndex(o,isMoving){
    /*//老代码
    setZ(o,50);
    for(let i = 0; i < $(".ds-win").length; i++){
        if(tOrb(o,$(".ds-win")[i]) != "e" && !$(".ds-win")[i].hasClass("ds-zin") && !$(".ds-win")[i].hasClass("ds-ontop") && $(".ds-win")[i].css("display") != "none"){
            o.addClass("ds-zin");
            setZ(o,zIndex($(".ds-win")[i]) + 1,"zin-l");
            o.removeClass("ds-zin");
        }
    }
    return getZ(o);*/

    //用于将移动完毕的窗口分开处理
    var w = $(".ds-win");
    if(isMoving){
        //todo:很简单的，就把它弄到和它在一起的窗口的最大值加1
        
    }
    else{
        var pN = [];
        for(let i = 0; i < w.length; i++){
            var t = tOrb(w[i],o);
            if((t == "a" || t == "s") && w[i] != o) pN[pN.length] = w[i];
        }
        var finalZ = 50;
        for(let i = 0; i < pN.length; i++) finalZ = Math.max(getZ(pN[i]) + 1, finalZ);
        setZ(o,finalZ);
    }
    //无论如何都会执行这个检查并清除空层的机制，但累计到5才会清除一次以免卡顿
    if(!(zIndexFallCount > 5)){//note:这个!是调试用的
        var cDs = [];
        for(let i = 0; i < w.length; i++) checkR(w[i], i);
        //console.log(cDs); //succeed:成功！
        for(let i = 0; i < cDs.length; i++){
            var treeZ = [], emptyZ = [];
            for(let j = 0; j < w.length; j++) if(w[j].attr("cD") == cDs[i]) treeZ[getZ(w[j]) - 50] = true;
            for(let j = 0; j < treeZ.length; j++){
                if(!treeZ[j]){
                    //todo:让该层上的窗口都往下一层
                }
            }
        }
        zIndexFallCount = 0;
    }
    else zIndexFallCount++;
    //递归处
    function checkR(o,n){
        if(!o.attr("cD")){
            o.attr("cD",n);
            cDs[cDs.length] = n;
        }
        var r = [[],[]];
        for(let i = 0; i < w.length; i++){
            if(tOrb(o,w[i]) != "e" && !w[i].attr("cD")){
                r[0][r[0].length] = w[i];
                r[1][r[1].length] = i;
                w[i].attr("cD",o.attr("cD"));
            }
        }
        for(let i = 0; i < r[0].length; i++) checkR(r[0][i],r[1][i]);
    }
}
    //end窗口提升
//end窗口

//可关闭的窗口
    //双击关闭ds-cls
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

//提示框
    //提示框注册
var toolTip = this.toolTip = (t,h,d,s)=>{
    var e = document.createElement("div").addClass("ds-tt");
    e.innerHTML = h;
    switch(d){
        case "t":
            if(s) g("t-t");
            else g("t");
            break;
        case "b":
            if(s) g("b-t");
            else g("b");
            break;
        case "l":
            if(s) g("l-t");
            else g("l");
            break;
        case "r":
            if(s) g("r-t");
            else g("r");
            break;
        default:
            throw new TypeError("invalid direction argument");
    }
    t.addClass("ds-tp");
    t.append(e);
    registerEvents("tt");
    function g(d){e.addClass("ds-tt-" + d).attr("data-tt-o","ds-tt-" + d);}
}

    //对齐tooltip
function alignToolTip(tp,isFixed){
    //数据获取
    if(!tp.hasClass("ds-tp")) return;
    let t = tp.querySelector(".ds-tt");//不管一个元素内含多个tooltip，note:由于不是document域，无法使用luery获取
    //还原原来的样式
    if(isFixed !== true) rAC().addClass(t.attr("data-tt-o"));
    //尝试次数不超过5次
    for(let i = 0; i < 5; i++){
        //toFixed()是为了防止渲染精度导致的tooltip随机抖动，偏差很小不要紧
        //对于浮动在上下的tooltip需要左右对齐（1/2宽度）
        if(t.hasClass("ds-tt-t") || t.hasClass("ds-tt-b") || t.hasClass("ds-tt-t-t") || t.hasClass("ds-tt-b-t")){
            //fixed:其实方案是相同的 fixed:如果元素宽高为auto，则relative->absolute的坐标基点不同，使用不同的对齐方案
            //console.log(tp.css("width"));
            t.css("margin-left",(($.tt(tp,"pw") - $.tt(t,"w")) / 2).toFixed(2) + "px");
        }
        //对于浮动在左右的tooltip需要上下对齐（1/2高度）
        else if(t.hasClass("ds-tt-l") || t.hasClass("ds-tt-r") || t.hasClass("ds-tt-l-t") || t.hasClass("ds-tt-r-t")){
            //fixed:其实方案是相同的 fixed:如果元素宽高为auto，则relative->absolute的坐标基点不同，使用不同的对齐方案
            //console.log(tp.css("height"));
            t.css("margin-top",(-($.tt(tp,"ph") + $.tt(t,"h")) / 2).toFixed(2) + "px");
        }
        //测试是否超出界限，若超出则重新进行
        if($.tt(t,"fr") > document.body.clientWidth){
            if(!i) fixToolTip("l");
            else if(i == 1) fixToolTip("t");
            else if(i == 2) fixToolTip("b");
        }
        if($.tt(t,"fb") > window.innerHeight){
            if(!i) fixToolTip("t");
            else if(i == 1) fixToolTip("l");
            else if(i == 2) fixToolTip("r");
        }
        if($.tt(t,"fl") < 0){
            if(!i) fixToolTip("r");
            else if(i == 1) fixToolTip("t");
            else if(i == 2) fixToolTip("b");
        }
        if($.tt(t,"ft") < 0){
            if(!i) fixToolTip("b");
            else if(i == 1) fixToolTip("l");
            else if(i == 2) fixToolTip("r");
        }
        break;
    }
    function fixToolTip(a){
        //fixme:.ds-cls提示框失灵
        //console.log(tp,t);
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
    let t, l;
    $.Events(er,"contextmenu",e=>{
        //console.log(e.target,er);
        if(noPro && checkDDProp(e.target)) return;
        e.preventDefault();
        ee.css("display","block");
        for(let i = 0; i < 12914; i++){//反正绝对不可能超过10次就出去了，不管这里是多少了
            if(ee.hasClass("ds-dd-bl")){
                t = e.clientY + 8;
                l = e.clientX - $.tt(ee,"w") - 8;
            }
            else if(ee.hasClass("ds-dd-tr")){
                t = e.clientY - $.tt(ee,"h") - 8;
                l = e.clientX + 8;
            }
            else if(ee.hasClass("ds-dd-tl")){
                t = e.clientY - $.tt(ee,"h") - 8;
                l = e.clientX - $.tt(ee,"w") - 8;
            }
            else{//ds-dd-br，默认
                t = e.clientY + 8;
                l = e.clientX + 8;
            }
            if(checkDropDownPos()){//JSON对象不允许插值，只能分开
                ee.css({
                    top:t + "px",
                    left:l + "px"
                });
                break;
            }
        }
    });

        //检查菜单位置
    function checkDropDownPos(){
        //TODO:
        return true;
    }

        //fixme:检查是否冒泡事件
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
        if($(".ds-dd")[i].attr("style") === "") $(".ds-dd")[i].attr("style",null);
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
            if(!obj.isInClass("ds-dd")) closeDropDown();
            isToCloseDropDown = false;
        }
    }
}
//end菜单
}