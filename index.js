let imgCan;
let imgCtx;
let imgData;
let uploader;
let svgString;
let filename;

function makeSVG() {
	const svg = document.getElementById("svgImage");
	// Empty the SVG
	svg.innerHTML = "";

	svg.setAttribute("viewBox", `0 0 ${imgCan.width} ${imgCan.height}`);

	let color = [];
	const colors = [];
	for (var i = 0; i < imgData.data.length; i++) {
		const channel = i % 4;
		var x = (i - channel) % imgCan.width;
		var y = ((i - channel) - x) / imgCan.width;
		if (channel == 3) {
			// Remember the previous color
			color.push(imgData.data[i]);
			colors.push(color);
			// Flush the previous color
			color = [];
		} else {
			color.push(imgData.data[i]);
		}

		// console.log("C = " + channel);
		// console.log("X = " + x);
		// console.log("Y = " + y);
	}

	for (var i = 0; i < colors.length; i++) {
		var x = i % imgCan.width;
		var y = (i - x) / imgCan.width;
		if (colors[i][3] !== 0) {
			const rect = document.createElement("rect");
			rect.setAttribute("x", x);
			rect.setAttribute("y", y);
			rect.setAttribute("width", 1);
			rect.setAttribute("height", 1);
			rect.setAttribute("fill",
				`rgb(${colors[i][0]},${colors[i][1]},${colors[i][2]})`);
			if (colors[i][3] !== 255) {
				rect.setAttribute("fill-opacity", colors[i][3] / 255);
			}
			svg.appendChild(rect);
		}
	}

	// Refresh SVG
	svg.innerHTML = svg.innerHTML;
	svgString = `<svg viewBox="${svg.getAttribute("viewBox")}">${svg.innerHTML}</svg>`;

	// Hide the upload overlay
	toggleOverlay();

	// Show the download button
	document.getElementById("downloadButton").style.display = "block";

}

function handleImages(e) {
	const reader = new FileReader();
	reader.onload = function (e) {
		const img = new Image();
		img.onload = function () {
			// Get the image into imageData
			imgCan.width = img.width;
			imgCan.height = img.height;
			imgCtx.drawImage(img, 0, 0);
			imgData = imgCtx.getImageData(0, 0, imgCan.width, imgCan.height);
			makeSVG();
		};
		img.src = e.target.result;
	};
	reader.readAsDataURL(e.target.files[0]);
	filename = e.target.files[0].name;
}

function setup() {
	uploader = document.getElementById("uploader");
	document.getElementById("uploader").onchange = handleImages;

	imgCan = document.getElementById("testCanvas");
	imgCtx = imgCan.getContext("2d");
}

window.addEventListener("load", setup);

function download() {
	type = "image/svg+xml";
	filename = `${filename.replace(/\.[^/.]+$/, "")}.svg`;
	data = `<?xml version="1.0" encoding="UTF-8" standalone="no"?> ${svgString}`;
	const file = new Blob([data], {
		type
	});
	if (window.navigator.msSaveOrOpenBlob) { // IE10+
		window.navigator.msSaveOrOpenBlob(file, filename);
	} else { // Others
		const a = document.createElement("a");


		const url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(() => {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
	}
}

function toggleOverlay() {
	if (document.getElementById("uploadWrapper").style.opacity == "0") {
		document.getElementById("uploadWrapper").style.opacity = "1";
		document.getElementById("uploadWrapper").style.visibility = "visible";
	} else {
		document.getElementById("uploadWrapper").style.opacity = "0";
		document.getElementById("uploadWrapper").style.visibility = "hidden";
	}
}