// @ts-check


let footerdiv = document.getElementById("footer")
let testdiv = document.getElementById("test")
let counter = 0

window.onload = () =>{
	// if (testdiv) {testdiv.textContent = String(counter)}
	if (footerdiv){
		footerdiv.onclick = function () {
			counter = counter + 1;
			if (testdiv){
				testdiv.textContent = String(counter)
			}
		}
	}
	// window.scrollBy(200, 200) // vscode 不支持
}
