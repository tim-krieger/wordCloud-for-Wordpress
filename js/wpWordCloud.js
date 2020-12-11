(function ($) {

	'use strict';

	// init
	// go through all word cloud containers
	// to receive word cloud settings 
	$(".word-cloud-container").each(function () {

		var wpWordCloudSettings = getWordCloudSettings(this);

		window.wordcloudID = wpWordCloudSettings.id;
		console.log("WordCloud ID: " + window.wordcloudID);

		wpwc(wpWordCloudSettings, "Read settings");
		
		if (wpWordCloudSettings.data == null && wpWordCloudSettings.list == null) {

			wpwc(wpWordCloudSettings, "Error: No text found.");

			wpWordCloudSettings.data = 'Kein Text übermittelt. Bitte prüfe die Einstellungen im Backend.';

			wpWordCloudSettings.countWords = 0;

		}

		if (wpWordCloudSettings.list == null && wpWordCloudSettings.countWords != 1) {
		
			wpWordCloudSettings.countWords = 1;

			wpwc(wpWordCloudSettings, "%cAchtung: count-words ist nicht aktiviert und wird automatisch auf 1 gesetzt.", 1);
	
		}

		// add canvas and / or html
		$(this).append('<div class="word-cloud-controller"></div>');
		if (wpWordCloudSettings.style == 'html') {

			$(this).append('<div class="word-cloud" style="position: relative; height: '+wpWordCloudSettings.canvasHeight+'; width: '+wpWordCloudSettings.canvasWidth+';" id="word-cloud-html-'+wpWordCloudSettings.id+'"></div>');
			$(this).append('<canvas class="word-cloud" style="width: 100%; display: none;" height="'+wpWordCloudSettings.canvasHeight+'" width="'+wpWordCloudSettings.canvasWidth+'" id="word-cloud-'+wpWordCloudSettings.id+'"></canvas>');

		} else {

			$(this).append('<canvas class="word-cloud" style="width: 100%" height="'+wpWordCloudSettings.canvasHeight+'" width="'+wpWordCloudSettings.canvasWidth+'" id="word-cloud-'+wpWordCloudSettings.id+'"></canvas>');

		}

		wpwc(wpWordCloudSettings, "Added canvas");

		// add black list container
		// contains words clicked by user
		if (wpWordCloudSettings.enableCustomBlackList == 1) {

			wpwc(wpWordCloudSettings, "Added black list container");

			$(this).append('<p id="word-cloud-black-list-'+wpWordCloudSettings.id+'"></p>');
			//$(this).append('<label for="word-cloud-activate-black-list-'+wpWordCloudSettings.id+'">Ignore-Liste anwenden</label>');
			
		}
		if (wpWordCloudSettings.enableCustomBlackList == 1 || wpWordCloudSettings.enableBlackList == 1) {

			$(this).append('<label class="kits-label" for="word-cloud-activate-black-list-'+wpWordCloudSettings.id+'"><input checked type="checkbox" class="activate-black-list" id="word-cloud-activate-black-list-'+wpWordCloudSettings.id+'" name="word-cloud-activate-black-list-'+wpWordCloudSettings.id+'">Nur Adjektive, Verben und Nomen anzeigen</label>');

		}
		// add preview image (example)
		$(this).append('<div class="word-cloud-example"></div>');
		// add canvas
		$(this).append('<canvas class="word-cloud" style="width: 100%" height="'+wpWordCloudSettings.canvasHeight+'" width="'+wpWordCloudSettings.canvasWidth+'" id="word-cloud-'+wpWordCloudSettings.id+'"></canvas>');
		
		wpwc(wpWordCloudSettings, "Added canvas");

		// add hover container
		// hiden on init
		$(this).append('<div class="word-cloud-tooltip" id="word-cloud-tooltip-'+wpWordCloudSettings.id+'"></div>');

		// force tooltop to disappear when mouse cursor leaves canvas
		$('#word-cloud-' + wpWordCloudSettings.id).mouseleave(function(){
			
			$('#word-cloud-tooltip-' + wpWordCloudSettings.id).hide();

		})
		
		if (wpWordCloudSettings.countWords == 1) {

			wpWordCloudSettings.list = countWords(wpWordCloudSettings);

			wpwc(wpWordCloudSettings, "Counted words");

		}

		if (wpWordCloudSettings.debug == 1) {

			console.log({"WP WordCloud Words" : wpWordCloudSettings.list});

		}

		if (wpWordCloudSettings.enableFrontendEdit == 1 || wpWordCloudSettings.enableOcr == 1) {

			// Auswahl Text / Datei hochladen
			$(this).find('.word-cloud-controller').prepend('<div class="kits_orientierung_wrapper"><div class="kits_orientierung"><svg version="1.1" focusable="false" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="504.01px" height="441.508px" viewBox="-2.012 29.218 504.01 441.508" enable-background="new -2.012 29.218 504.01 441.508" xml:space="preserve"><path fill="#00456F" d="M451.465,61.133C397.949,15.527,318.359,23.73,269.238,74.414L250,94.238l-19.238-19.824C181.738,23.73,102.051,15.527,48.535,61.133c-61.328,52.344-64.551,146.289-9.668,203.027l188.965,195.117c12.207,12.598,32.031,12.598,44.238,0L461.035,264.16C516.016,207.422,512.793,113.477,451.465,61.133L451.465,61.133z"/></svg> <span>Texterkennung mit <a href="https://tesseract.projectnaptha.com/" target="_blank">tesseract.js</a></span></div></div>');
			$(this).find('.word-cloud-controller').prepend('<form style="margin: 20px 0;"><input type="radio" id="cloud_input_text" name="cloud_input" value="text" checked=""><label for="cloud_input_text" class="change-to-text">Text</label><input type="radio" id="cloud_input_file" name="cloud_input" value="file"><label for="cloud_input_file" class="change-to-image">Foto</label></form>');	
			$(this).find('.word-cloud-controller').append('<button class="render-word-cloud" id="render-word-cloud-'+wpWordCloudSettings.id+'">Erstellen</button>');

			$(this).prepend('<textarea class="word-cloud-text" id="word-cloud-text-'+wpWordCloudSettings.id+'" placeholder="Gib hier einen Text ein..." rows="5"></textarea>');

			$('#word-cloud-text-'+wpWordCloudSettings.id).val(wpWordCloudSettings.data);

			wpwc(wpWordCloudSettings, "Added edit field");
		
		} 


		wpWordCloudSettings.maxWeight = getMaxWeight(wpWordCloudSettings);

		wpWordCloudSettings = setWcCallbacks(wpWordCloudSettings);

		if (wpWordCloudSettings.style == 'html') {
		
			WordCloud(
				[$('#word-cloud-' + wpWordCloudSettings.id)[0],
				$('#word-cloud-html-' + wpWordCloudSettings.id)[0]],
				wpWordCloudSettings);

		} else {
		
			WordCloud(
				$('#word-cloud-' + wpWordCloudSettings.id)[0],
				wpWordCloudSettings);
			
		}
	});

	// add download button
	$(".word-cloud-container").append('<a href="#" class="canvas-download-button" id="btn-download-canvas" download="kits-wortwolke.png">Download</a>');
	// add github source
	$(".word-cloud-container").append('<div class="github_link"> <svg aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" class="svg-inline--fa fa-github fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" id="kits_github_link"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path></svg> <a href="https://github.com/nickyreinert/wordCloud-for-Wordpress" target="_blank">WP Word Cloud</a> </div>');

	// change between text and file upload
	$('[name="cloud_input"]').change(function() {
		var theVal = $(this).val();
		 if (theVal == "file") {
		 	$('input[type="file"]').show();
			$('.kits_orientierung_wrapper').show();
		 	$(".word-cloud-text-from-image-progress-bar-container").show();
		 	$(".word-cloud-text").hide();
		 } else if (theVal == "text") {
		 	$('input[type="file"]').hide();
		 	$('.kits_orientierung_wrapper').hide();
		 	$(".word-cloud-text-from-image-progress-bar-container").hide();
		 	$(".word-cloud-text").show();
		 }
	});

	// trigger click event after removing black list item
	$(document).on('click', '.black-list-item', function () {
		console.log("render again");
		setTimeout(
		  function() 
		  {
		     $("button.render-word-cloud").click();
		  }, 300);
	});

	// Download canvas as png image
	$(document).ready(function () {

		var downloadButton = document.getElementById('btn-download-canvas');
		downloadButton.addEventListener('click', function (e) {
			var id = $("canvas.word-cloud").attr('id');
			var canvas = document.getElementById(id);
		    var dataURL = canvas.toDataURL('image/png');
		    downloadButton.href = dataURL;
		});

	});
	
	// clears input field when changing input method (text/image)
	$(".change-to-text, .change-to-image").click(function() {

		document.getElementById("word-cloud-text-" + window.wordcloudID).value = "";
		document.getElementById("word-cloud-text-from-image-mobile-" + window.wordcloudID).value = "";

	});

	$('.activate-black-list').click(function() {

		var wpWordCloudSettings = getWordCloudSettings($(this).parent()[0]);

		if (wpWordCloudSettings.persistentCustomBlackList == 0) {
			
			$('#word-cloud-black-list-' + wpWordCloudSettings.id).children().remove();

		} 

		wpWordCloudSettings.customBlackList = getCustomBlackList(wpWordCloudSettings);

		if (processedSettings.enableFrontendEdit == 1) {

			wpWordCloudSettings.data = $('#word-cloud-text-'+wpWordCloudSettings.id).val();

		}

		wpWordCloudSettings.list = countWords(wpWordCloudSettings);
		
		wpWordCloudSettings.maxWeight = getMaxWeight(wpWordCloudSettings);
		
		wpWordCloudSettings = setWcCallbacks(wpWordCloudSettings);

		console.log(wpWordCloudSettings.list);

		WordCloud($('#word-cloud-' + wpWordCloudSettings.id)[0], wpWordCloudSettings);

	})

	$('.render-word-cloud').click(function() {

		$("canvas.word-cloud").css("height", "auto");
		$(".word-cloud-example").hide();
		$(".canvas-download-button").css("display", "inline-block");

		var wpWordCloudSettings = getWordCloudSettings($(this).parent().parent()[0]);

		if (wpWordCloudSettings.persistentCustomBlackList == 0) {
			
			$('#word-cloud-black-list-' + wpWordCloudSettings.id).children().remove();

		} 

		wpWordCloudSettings.customBlackList = getCustomBlackList(wpWordCloudSettings);

		wpWordCloudSettings.data = $('#word-cloud-text-'+wpWordCloudSettings.id).val();

		wpWordCloudSettings.list = countWords(wpWordCloudSettings);
		
		wpWordCloudSettings.maxWeight = getMaxWeight(wpWordCloudSettings);
		
		wpWordCloudSettings = setWcCallbacks(wpWordCloudSettings);

		console.log(wpWordCloudSettings);

		WordCloud($('#word-cloud-' + wpWordCloudSettings.id)[0], wpWordCloudSettings);

	});

	function addWordToBlackList(item, settings) {

		wpwc(settings, "User added word to ingore list.");

		// add word to black list below the word cloud
		$('#word-cloud-black-list-'+settings.id).append('<span count='+item[1]+' class="black-list-item"><span class="black-list-word">' + item[0] + '</span></span>');

		settings.customBlackList = getCustomBlackList(settings);
		
		settings.list = countWords(settings);

		settings.maxWeight = getMaxWeight(settings);
		
		settings = setWcCallbacks(settings);

		WordCloud($('#word-cloud-' + settings.id)[0], settings);

	}

	// add trigger so user can remove words from black list
	$(document).on("click", "span.black-list-item" , function() {

		// if user clicks on word below word cloud canvas
		// it will be removed from black list

		var settings = getWordCloudSettings($(this).parent().parent()[0]);

		$(this).remove();

		settings.customBlackList = getCustomBlackList(settings);
		
		settings.list = countWords(settings);

		settings.maxWeight = getMaxWeight(settings);
		
		settings = setWcCallbacks(settings);

		WordCloud($('#word-cloud-' + settings.id)[0], settings);

	});

	function getCustomBlackList(settings) {

		var blackList = {};

		if ($("#word-cloud-activate-black-list-"+settings.id).is(":checked")) {

			$('#word-cloud-black-list-' + settings.id).children().each(function(){

				var count = $(this).attr('count');
				var word = $(this).find('.black-list-word').html();
	
				blackList[word] = count;
	
			})
	
		} 

		return blackList;

	}

	function countWords(settings) {

		var cleanText = settings.data.replace(new RegExp(settings.ignoreChars, 'gim'), '');

		cleanText = (settings.textTransform == 'uppercase') 
			? cleanText.toUpperCase()
			: cleanText.toLowerCase();

		var textArray = cleanText.split(' ');

		settings.list = {};

		var purgedTextArray = [] 

		// first remove stopp words
		$.each(textArray, function(index, word) {
				
			if ((
				typeof(settings.customBlackList[word]) === 'undefined' &&
				!settings.blackList.includes(word)
				) ||
				!$("#word-cloud-activate-black-list-"+settings.id).is(":checked") 
 				
			) {

				purgedTextArray.push(word);

			}

		})

		var wordList = {};

		var wordCount = Object.keys(purgedTextArray).length;

		// second: count words
		$.each(purgedTextArray, function(index, word) {

			if (word.length >= settings.minWordLength) {

				if (word in wordList) {
					
					wordList[word]['abs'] += 1
					wordList[word]['rel'] = 100 * wordList[word]['abs']  / wordCount
					wordList[word]['wdf'] = Math.log2(wordList[word]['abs'] + 1) / Math.log2(wordCount)

				} else {

					wordList[word] = {
						'abs' : 1, 
						'rel' : 100 / wordCount,
						'wdf' : Math.log2(2) / Math.log2(wordCount)

					};

				}

			}


		});

		// third: send values to result

		$.each(wordList, function(index, word) {
			
			settings.list[index] = Math.round(word['abs']);

		})

		return prepareWordList(settings);

	}

	function getMaxWeight(settings) {

		var maxWeight = 0;

		$.each(settings.list, function(index, wordCount){
		
			if (wordCount[1] > maxWeight) {
			
				maxWeight = wordCount[1];

			} 
		});

		return maxWeight;
		
	}

	function setWcCallbacks(settings) {

		// pass function to color option, based on the weight of the word 
		settings.color = function (word, weight, fontSize, radius, theta) {
		
			var alpha = weight / settings.maxWeight
			if (alpha < settings.minAlpha) {
				alpha = settings.minAlpha;
			}

			return "rgba(0,0,0," + alpha + ")";

		};

		settings.weightFactor = function (size) {

			return settings.sizeFactor;
			// return size * $('#word-cloud-'+settings.id).width() / (settings.sizeFactor * (settings.maxWeight / 15));
			
			// return Math.pow(size, 2.5) * $('#myWordCloud2').width() / 256;
		
		};

		// if user clicks a word, it will be removed from the list and added to 
		// an ignore list
		settings.click = function (item, dimension, event) {

			if ($("#word-cloud-activate-black-list-"+settings.id).is(":checked")) {

				addWordToBlackList(item, settings);

			}

		};

		settings.hover = function (item, dimension, event) {

			if (item != undefined) {

				$('#word-cloud-tooltip-' + settings.id).text(item[1]);

				$('#word-cloud-tooltip-' + settings.id).show();

				$('#word-cloud-tooltip-' + settings.id).css({left: event.pageX, top: event.pageY});
			}

		};
		return settings

	}

	function prepareWordList(settings) {

		var preparedWordList = [];

		$.each(settings.list, function(word, count){

			if (count >= settings.minWordOccurence) {

				preparedWordList.push([word, count]);

			}

		});

		// in order to start with the most important word in the center, sort the array
		// thanks to https://stackoverflow.com/a/5200010
		preparedWordList.sort(function(a, b) {
    			a = a[1];
    			b = b[1];

    			return a > b ? -1 : (a < b ? 1 : 0);
		});


		return preparedWordList;

	}

	// log function
	function wpwc(wpWordCloudSettings, message, error = 0){

		if (wpWordCloudSettings.debug == 1) {

			console.log("[WP WordCloud] " + message);

		}

		if (error > 0) {

			console.warn("[WP WordCloud] " + message, 'color: red;');

		}

	}

})(jQuery);



