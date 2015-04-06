$(document).ready(function() {
	
	if ((!('webkitSpeechRecognition' in window)) || (!('webkitSpeechRecognition' in window))) {
		$("#status").text("please use Google chrome");
		return;
	} else {
		$("#status").text("Good");
	}

	events = {};
	events.domainAnswerEvent = "domain-name";
	events.initConceptsAnswerEvent = "init-concepts-questions";
	events.comfirmDifferentAnswerEvent = "comfirm-different-answer";
	events.nextConcept = "next-concept";
	events.newConcept = "new-concept";
	voices = window.speechSynthesis.getVoices();

	var domain_name;
	var queue = [];
	var init_concepts;
	var current_concepts;

	function ask(words, recog, e) {
		recog.onresult = function(event) {
			var w = "";
			for(var i = event.resultIndex; i < event.results.length; i++) {
				if (event.results[i].isFinal) {
					w += event.results[i][0].transcript;
				}
			}
			if(w.length > 0) {
				$("#answer").text(w);
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
        $("#question").text(words);
	}

	function ask_concept(recog) {
		current_concepts = queue.shift();
		var question = "What do " + current_concepts.cA + " and " + current_concepts.cB + " have in common that " + current_concepts.d + " does not have";
		ask(question,recog,events.newConcept);
	}

	var recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;

	$(window).on(events.domainAnswerEvent, function(e,d){
		var question = "Name three concepts that are important in the context of ";
		domain_name = d.answer;
		ask(question + domain_name, recognition, events.initConceptsAnswerEvent);
	});

	$(window).on(events.initConceptsAnswerEvent, function(e,d){
		var question = "Are these different concepts";
		init_concepts = d.answer.split(" ");
		ask(question, recognition, events.comfirmDifferentAnswerEvent);
	});

	$(window).on(events.nextConcept, function(e){
		ask_concept(recognition);
	});

	$(window).on(events.newConcept, function(e,d){
		queue.push({"cA":current_concepts.cA,"cB":d.answer,"d":current_concepts.cB});
		queue.push({"cA":current_concepts.cB,"cB":d.answer,"d":current_concepts.cA});
		$(window).trigger(events.nextConcept);
	});

	$(window).on(events.comfirmDifferentAnswerEvent, function(e,d){
		if(d.answer.toLowerCase() == "yes") {
			queue.push({"cA":init_concepts[0],"cB":init_concepts[1],"d":init_concepts[2]});
			queue.push({"cA":init_concepts[2],"cB":init_concepts[1],"d":init_concepts[0]});
			queue.push({"cA":init_concepts[0],"cB":init_concepts[2],"d":init_concepts[1]});
			$(window).trigger(events.nextConcept);
		} else {
			var question = "Name three concepts that are important in the context of ";
			ask(question + domain_name, recognition, events.initConceptsAnswerEvent);
		}
	});

	$("#start").click(function(event) {
		ask("what would you like to work on",recognition, events.domainAnswerEvent);
	});    
});