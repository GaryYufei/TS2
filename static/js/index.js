$(document).ready(function() {
	events = {};
	events.domainAnswerEvent = "domain-name";
	events.initConceptsAnswerEvent = "init-concepts-questions";
	events.comfirmDifferentAnswerEvent = "comfirm-different-answer";
	voices = window.speechSynthesis.getVoices();

	function ask(words, recog, e) {
		recog.onresult = function(event) {
			var w = "";
			for(var i = event.resultIndex; i < event.results.length; i++) {
				if (event.results[i].isFinal) {
					w += event.results[i][0].transcript;
				}
			}
			if(w.length > 0) {
				$(window).trigger(e, {"answer":w});
			}
		};
		var u1 = new SpeechSynthesisUtterance(words);
        u1.lang = 'en-US';
        u1.pitch = 1;
        u1.rate = 3;
        u1.voice = voices[10];
        u1.voiceURI = 'native';
        u1.volume = 1;
        u1.onend = function(event) {
        	recognition.lang = 0;
			recognition.start();
			setTimeout(function() {
				recognition.stop();
			}, 5000);
        };
        speechSynthesis.speak(u1);
	}

	if ((!('webkitSpeechRecognition' in window)) || (!('webkitSpeechRecognition' in window))) {
		$("#status").text("please use Google chrome");
	} else {
		$("#status").text("Good");
	}

	

	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;

	$(window).on(events.domainAnswerEvent, function(e,d){
		var question = "Name three concepts that are important in the context of ";
		ask(question + d.answer, recognition, events.initConceptsAnswerEvent);
	});

	$(window).on(events.initConceptsAnswerEvent, function(e,d){
		var question = "Are these different concepts";
		ask(question, recongition, events.comfirmDifferentAnswerEvent);
	});

	$(window).on(events.comfirmDifferentAnswerEvent, function(e,d){
		if(d.answer.toLowerCase() == "yes") {
			alert("yes");
		}
	});

	$("#start").click(function(event) {
		ask("what would you like to work on",recognition, events.domainAnswerEvent);
	});    
});