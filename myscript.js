function snailme() {
	let snailEmoji = "🐌";
	document.getElementById("snail").outerHTML 
	= '<p id="snail" style="font-size:20px" class="position-relative">' + snailEmoji + '</p>';
	let snailElem = document.getElementById("snail");
	let positionX = snailElem.offsetLeft;
	let speedX = 3;
	const maxXPosition = window.screen.availWidth * 0.9;
	const minXPosition = 0;
	console.log(maxXPosition);
	console.log(positionX);
	let stepCount = 0;
	function step() {
		positionX = positionX + speedX;
		stepCount = stepCount + 1;
		if (positionX > maxXPosition || positionX < minXPosition) {
			speedX = speedX * (-1);
		}
		snailElem.style['margin-left'] = positionX + 'px';
		window.requestAnimationFrame(step);
	}
	window.requestAnimationFrame(step);
}

document.getElementById("snail").addEventListener('click', snailme);

// for clickable dead link
// some credit to chatGPT for this one lol

const clickable = document.getElementsByClassName('clickable').item(0);
clickable.addEventListener('click', function() {
	clickable.classList.toggle('clicked');
	setTimeout(function() {
		clickable.classList.toggle('clicked');
	}, 300);
})