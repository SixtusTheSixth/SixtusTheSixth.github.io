/*

function snailme() {
	let snailEmoji = "🐌";
	var snailElem = $("#snail");
	snailElem.outerHTML = '<p style="font-size:20px" class="position-absolute start-0 top-50">' + snailEmoji + '</p>';
	function move() {
		snailElem.animate({left:'+=1px'});
		window.requestAnimationFrame(move);
		console.log('moving');
	}
	window.requestAnimationFrame(move);
}
$("#snail").click(snailme);

*/

function snailme() {
	let snailEmoji = "🐌";
	document.getElementById("snail").outerHTML 
	= '<p id="snail" style="font-size:20px" class="position-relative">' + snailEmoji + '</p>';
	// window.screen.availWidth and window.screen.availHeight
	let snailElem = document.getElementById("snail");
	let positionX = snailElem.offsetLeft;
	let speedX = 3;
	const maxXPosition = window.screen.availWidth * 0.9;
	const minXPosition = 0;
	console.log(maxXPosition);
	console.log(positionX);
	// snailElem.style['margin'] = '0px 150px 15px 200px';
	// snailElem.style.border = '1px solid red';
	// console.log(snailElem.style);
	// console.log(snailElem.innerHTML);
	let stepCount = 0;
	function step() {
		positionX = positionX + speedX;
		stepCount = stepCount + 1;
		if (positionX > maxXPosition || positionX < minXPosition) {
			speedX = speedX * (-1);
		}
		// snailElem.style.transform = `translateX(${ positionX }px)`; // positionX + 'px';
		// snailElem.setProperty("x", positionX, "important");
		snailElem.style['margin-left'] = positionX + 'px';
		// if (stepCount < 3) {window.requestAnimationFrame(step);}
		window.requestAnimationFrame(step);
		// console.log("position: " + positionX + " step count: "+ stepCount + "actual pos: " + snailElem.style['margin-left']);
	}
	window.requestAnimationFrame(step);
}

document.getElementById("snail").addEventListener('click', snailme);