(function() {
	const vscode = acquireVsCodeApi();
	document.addEventListener('keydown', function (e) {
	    vscode.postMessage({text : `Key Down ${e.code}`})
		if (e.code == "ArrowLeft")  { vscode.postMessage({command : "previous"})}
		if (e.code == "ArrowRight") { vscode.postMessage({command : "next" })}
		if (e.code == "KeyM")  { vscode.postMessage({command : "ASDF" })}
	});
	// document.addEventListener("scroll",function (e) {
	//     vscode.postMessage({text : "SCROLL"})
	// })
	// document.addEventListener("mouseenter", function (e) {
	//     vscode.postMessage({text : "Mouse IN"})
	// })
	// document.addEventListener("mouseleave", function (e) {
	//     vscode.postMessage({text : "Mouse Out"})
	// })
	// document.addEventListener("mousemove", function (e) {
	//     vscode.postMessage({text : "Mouse Move"})
	// })
	// document.addEventListener("click", function (e) {
	//     vscode.postMessage({text : "Mouse Click"})
	// })

}())