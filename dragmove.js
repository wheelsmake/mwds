"use strict";
var DM = function(){
    var dLeft,dTop,o,cb,c,cDown,isMoving = false;
    this.register = (_o,_cb,_c,_cDown)=>{
        o = _o;
        cb = _cb;
        c = _c;
        cDown = _cDown;
        if(!c) c = "grab";
        o.css("cursor",c);
        luery.Events(o,"mousedown",e=>{
            css(true);
            down(e,false);
        });
        luery.Events(o,"touchstart",e=>{
            css(true);
            down(e,true);
        });
        luery.Events(o,"mousemove",e=>{move(e,false)});
        luery.Events(o,"touchmove",e=>{move(e,true)});
        luery.Events(o,"mouseup",e=>{
            css(false);
            up(e,false);
        });
        luery.Events(o,"touchend",e=>{
            css(false);
            up(e,true);
        });
        luery.Events(luery("*"),"mousemove",e=>{move(e,false)});
        luery.Events(luery("*"),"touchmove",e=>{move(e,true)});
        luery.Events(luery("*"),"mouseup",e=>{
            css(false);
            up(e,false);
        });
        luery.Events(luery("*"),"touchend",e=>{
            css(false);
            up(e,true);
        });
    }
    function down(e,isTouch){
        isMoving = true;
        if(isTouch){
            dTop = e.touches[0].clientY - luery.tt(o,"ft");
            dLeft = e.touches[0].clientX - luery.tt(o,"fl");
        }
        else{
            dTop = e.clientY - luery.tt(o,"ft");
            dLeft = e.clientX - luery.tt(o,"fl");
        }
        cb(e,0,isTouch,dTop,dLeft);
    }
    function move(e,isTouch){
        if(isMoving){
            let t, l;
            if(isTouch){
                t = e.touches[0].clientY - dTop;
                l = e.touches[0].clientX - dLeft;
            }
            else{
                t = e.clientY - dTop;
                l = e.clientX - dLeft;
            }
            o.css("top",t + "px");
            o.css("left",l + "px");
            checkWinPos(o);
            cb(e,1,isTouch,t,l);
        }
    }
    function up(e,isTouch){
        if(isMoving){
            isMoving = false;
            cb(e,2,isTouch);
        }
    }
    function checkWinPos(o){
        if(luery.tt(o,"fr") > document.body.clientWidth) o.css("left",document.body.clientWidth - luery.tt(o,"w") + "px");
        if(luery.tt(o,"fb") > innerHeight) o.css("top",innerHeight - luery.tt(o,"h") + "px");
        if(luery.tt(o,"fl") < 0) o.css("left",0);
        if(luery.tt(o,"ft") < 0) o.css("top",0);
        if(luery.tt(o,"t") < 0) o.css("top",0);
    }
    function css(isDown){
        if(isDown === true){
            luery("*").css({"cursor":"grabbing","user-select":"none","-webkit-user-drag":"none"});
            if(cDown){
                o.css("cursor",cDown);
                luery("*").css("cursor",cDown);
                return;
            }
        }
        else if(isDown === false) delStyle(luery("html")[0]);
        o.css("cursor",c);
    }
    function delStyle(d){
        if(d.getAttribute("style") == "cursor: " + cDown + "; user-select: none; -webkit-user-drag: none;") d.removeAttribute("style");
        else d.css({"cursor":"","user-select":"","-webkit-user-drag":""});
        for(let i = 0;i < d.children.length; i++) delStyle(d.children[i]);
    }
}