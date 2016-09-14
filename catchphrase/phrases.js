//upload file callback
var uploadFile = function(event) {
    var input = event.target;
    var reader = new FileReader();
    reader.onload = function(){
    	var text = reader.result;
    	phrasesLeft = phrasesLeft.concat(text.split("\n"));
    	phrasesTotal = phrasesTotal.concat(text.split("\n"));
    	localStorage.setItem('savedPhrases', JSON.stringify(phrasesTotal));
    };
    reader.readAsText(input.files[0]);
    $("#phrases").html(phrasesTotal.reverse().slice(0,20).join("<br>"));
};

// clear phrases button callback
var resetPhrases = function(){
	localStorage.removeItem("phrasesSaved");
	phrasesLeft = [];
	phrasesTotal = [];
};

// listen for added phrase

$(document).ready(function(){
    $("#phrases").html(phrasesTotal.reverse().slice(0,20).join("<br>"));
    $("#newPhrase").keyup(function(key){
		if (key.which === 13){
			// Carriage return
			var newPhrase = document.getElementById("newPhrase").value;
			document.getElementById("newPhrase").value = "";
			phrasesTotal.push(newPhrase);
			phrasesLeft.push(newPhrase);
			localStorage.setItem('savedPhrases', JSON.stringify(phrasesTotal));
			 $("#phrases").html(phrasesTotal.reverse().slice(0,20).join("<br>"));
		}
	});
});
