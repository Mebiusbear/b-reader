var t = null;

t = setTimeout(time, 1000); //开始运行

function format(i){
	return ('00'+i).slice(-2);
}

function time(){
	clearTimeout(t); //清除定时器
	dt = new Date();
	var y   = dt.getFullYear();
	var mt  = format(dt.getMonth() + 1);
	var day = format(dt.getDate())     ;
	var h   = format(dt.getHours())    ;
	var m   = format(dt.getMinutes())  ;
	var s   = format(dt.getSeconds())  ;
	document.querySelector(".showTime").innerHTML = `${y}-${mt}-${day}  ${h}:${m}:${s}`
	t = setTimeout(time, 1000); //设定定时器，循环运行
}
