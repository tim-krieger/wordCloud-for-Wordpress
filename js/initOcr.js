(function ($) {
    // thanks to  https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API/Taking_still_photos
    // for tutorial on how to take pictures with built in camera

    var width = 320;    // We will scale the photo width to this
    var height = 0;     // This will be computed based on the input stream
    var streaming = false;  // current status of camera stream
    var video = null;
    var canvas = null;
    var photo = null;

    $(".word-cloud-container").each(function () {

      var wpWordCloudSettings = getWordCloudSettings(this);
          
      // if ocr is enable, add button and overlay
      // user can take a picture of a document, which will be converted to text
      // and then counted and rendered 
      if (wpWordCloudSettings.enableOcr == 1) {
        
        $(this).find('.word-cloud-controller').prepend(
          '<button class="text-from-image" id="word-cloud-text-from-image-'+wpWordCloudSettings.id+'">Photo</button>');

        $(this).append(
          '<div class="text-from-image-container" id="text-from-image-container-'+wpWordCloudSettings.id+'"></div>');

        $('.text-from-image').click(function () {

                  showCaptureControls(wpWordCloudSettings);
                  startCapture(wpWordCloudSettings);
              
        })
    
      }

    });

    
    function removeCaptureControls(wpWordCloudSettings) {
        var videoCaptureContainer =  $('#text-from-image-container-'+wpWordCloudSettings.id);

        $(videoCaptureContainer).hide();
        $(videoCaptureContainer).children().remove();

    }

    function showCaptureControls(wpWordCloudSettings) {

        var videoCaptureContainer =  $('#text-from-image-container-'+wpWordCloudSettings.id);
        $(videoCaptureContainer).show();
        
        $(videoCaptureContainer)
            // add camera controls to ui
            // hide on init, otherwise you see this ugly gray box
            // until user confirms camera usage
            .append('<div style="display: none;" class="ocr-camera-controls">'+
              '<video id="video-input-'+wpWordCloudSettings.id+'">Video stream not available.</video>'+
              '<canvas id="temp-canvas-'+wpWordCloudSettings.id+'"></canvas>'+
              '<img id="image-output-'+wpWordCloudSettings.id+'" alt="The screen capture will appear in this box. Click the image to re-capture" />'+
              '<button class="close-ocr" id="close-ocr-'+wpWordCloudSettings.id+'">X</button>'+
              '</div>'
            );

            $('#close-ocr-'+wpWordCloudSettings.id).on('click', function(){

              $(videoCaptureContainer).hide();
              $(videoCaptureContainer).empty();
    
            })

    } 

    function startCapture(wpWordCloudSettings) {

        var videoCaptureContainer =  $('#text-from-image-container-'+wpWordCloudSettings.id);

        video = document.getElementById('video-input-'+wpWordCloudSettings.id);
        canvas = document.getElementById('temp-canvas-'+wpWordCloudSettings.id);
        image = document.getElementById('image-output-'+wpWordCloudSettings.id);
    
        // If you get `TypeError: navigator.mediaDevices is undefined`
        // serve your page via HTTPS, otherwise access will be blocked
        navigator.mediaDevices.getUserMedia({video: true, audio: false})
          .then(function(stream) {
            video.srcObject = stream;
            video.play();
          })
          .catch(function(e) {
            console.log("Could not start video stream from your camera: " + e);
            removeCaptureControls(wpWordCloudSettings);
          });
    
          video.addEventListener('canplay', function(ev){

            // actually show controls only 
            // if user confirms video stream
            $(videoCaptureContainer).find('div.ocr-camera-controls').show();

            // if not already streaming, init streaming settings
            if (!streaming) {
              height = video.videoHeight / (video.videoWidth/width);
      
              // Firefox currently has a bug where the height can't be read from
              // the video, so we will make assumptions if this happens.
      
              if (isNaN(height)) {
                height = width / (4/3);
              }
      
              video.setAttribute('width', width);
              video.setAttribute('height', height);
              canvas.setAttribute('width', width);
              canvas.setAttribute('height', height);
              streaming = true;
            
            }
        }, false);
    
        video.addEventListener('click', function(ev){
          takepicture();
          ev.preventDefault();
        }, false);

        image.addEventListener('click', function(event){
          
          $(video).show();

        })
    
        clearImage();
      
      }
    
      // Fill the photo with an indication that none has been
      // captured.
    
      function clearImage() {
        var context = canvas.getContext('2d');
        context.fillStyle = "#AAA";
        context.fillRect(0, 0, canvas.width, canvas.height);
    
        var data = canvas.toDataURL('image/png');
        image.setAttribute('src', data);

      }
    
      // Capture a photo by fetching the current contents of the video
      // and drawing it into a canvas, then converting that to a PNG
      // format data URL. By drawing it on an offscreen canvas and then
      // drawing that to the screen, we can change its size and/or apply
      // other changes before drawing it.
    
      function takepicture() {
        
        var context = canvas.getContext('2d');

        if (width && height) {
          canvas.width = width;
          canvas.height = height;
          context.drawImage(video, 0, 0, width, height);
    
          var data = canvas.toDataURL('image/png');
          image.setAttribute('src', data);
          $(video).hide();
    
          // now, as we have the document as an image,
          // pass it to tesseract and ocr' it
          const { createWorker } = Tesseract;
    
          const worker = createWorker({
            workerPath: 'https://unpkg.com/tesseract.js@v2.0.0/dist/worker.min.js',
            langPath: 'https://tessdata.projectnaptha.com/4.0.0',
            corePath: 'https://unpkg.com/tesseract.js-core@v2.0.0/tesseract-core.wasm.js',
            // logger: m => console.log(m),
          });
    
          (async () => {
            await worker.load();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(data);
    
            // document.getElementById('ocr').textContent = text;
            console.log(text);
    
            await worker.terminate();
          })();
    
    
    
    
        } else {
          clearImage();
        }

        
};

})(jQuery);