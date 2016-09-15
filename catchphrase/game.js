var boom = new Audio('boom.mp3');

function Timer(){
	// pick random duration after which end the current game
	if (localStorage.getItem('dist') === "normal"){
		this.duration = normrv(minDuration, maxDuration, meanDuration, sdDuration);
	}
	else{
		this.duration = uniform(minDuration, maxDuration);
	}
	this.tick = function(){
		this.time = (Date.now() - this.startTime) / 1000;
		$('#timer').html(this.time.toFixed(2) + " seconds");
		$("#reset").show();
		$("#cont").html("Continue");
		if (this.time > this.duration || !(this.ticking)){
			clearInterval(this.interval);
			phrasesLeft.push(nextPhrase);
			localStorage.setItem('phrasesLeft', JSON.stringify(phrasesLeft));
			$("#gameMenu").hide();
			$("#startMenu").show();
			this.ticking = false;
			if (this.time > this.duration){
				$("#log").html("BOOM! You ran out of time.");
			}
			boom.play();
		}
	};
	this.stop = function(){
		this.ticking = false;
	};
	this.start = function(){
		this.startTime = Date.now();
		this.ticking = true;
		this.interval = setInterval(this.tick.bind(this), 10);
	};
}

var timer;
var cont = function(){
	$("#startMenu").hide();
	$("#gameMenu").show();
	timer = new Timer();
	console.log(timer);
	timer.start();
	next();
};

var nextPhrase;
var next = function(){
	if (phrasesLeft.length === 0){
		$("#log").html("BOOM! You ran out of catchphrases!");
		$("#cont").hide();
		timer.stop();
	}
	var idx = Math.floor(Math.random() * phrasesLeft.length);
	nextPhrase = phrasesLeft.splice(idx, 1)[0];
	$("#phrase").html(nextPhrase);
	localStorage.setItem('phrasesLeft', JSON.stringify(phrasesLeft));
};

var skip = function(){
	var skippedPhrase = nextPhrase;
	next();
	phrasesLeft.push(skippedPhrase);
}

var reset = function(){
	var response = confirm("Are you sure you want to reset your progress through the pack?");
	if (response === true){
	    phrasesLeft = phrasesTotal.slice();
    	$("#reset").hide();
    	$("#log").html("");
    	$("#cont").html("Play");
    	$("#cont").show();	
	}
};

$(document).ready(function(){
	if (_.isEqual(phrasesLeft, phrasesTotal)){
		$("#reset").hide();	
		$("#cont").html("Play")
	}
	else{
		$("#reset").show();
		$("#cont").html("Continue");
	}
	$("#gameMenu").hide();
	$("#cont").show();
	$("#log").html("");
	$("#cont").click(cont);
	$("#next").click(next);
	$("#reset").click(reset);
});
