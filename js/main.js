//Speech Synthesizer:

    //Populating the voice selector
    function populateVoiceList() {
        if (typeof speechSynthesis === 'undefined') {
          return;
        }
      
        const voices = speechSynthesis.getVoices();
      
        for (let i = 0; i < voices.length; i++) {
          const option = document.createElement('option');
          option.textContent = `${voices[i].name} (${voices[i].lang})`;
      
          if (voices[i].default) {
            option.textContent += ' — DEFAULT';
          }

          option.setAttribute('data-lang', voices[i].lang);
          option.setAttribute('data-name', voices[i].name);
          document.getElementById("voiceSelect").appendChild(option);
        }
      }
    
      populateVoiceList();
      if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
      }
      
 
          // Text-To Speech Setup:
          if ('speechSynthesis' in window) {
          let repeatSpeech = null;

          speechForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const msg = useFormInputs(event);
            const loopCheckbox = document.querySelector("#loop_box");
            if (loopCheckbox.checked) {
              repeatSpeech = setInterval(function() {
                speechSynthesis.speak(msg);
              }, 5);
            } else {
              if (repeatSpeech) {
              clearInterval(repeatSpeech);
              } else {
              speechSynthesis.speak(msg);
            }
          }
        });
      }else {
          console.log('Speech synthesis is not supported in your browser');
        }
    


        // Code to trigger the speech synth will go here
      function useFormInputs(event) {
          let msg = new SpeechSynthesisUtterance();
          const voices = window.speechSynthesis.getVoices();
          msg.voice = voices[voiceSelect.selectedIndex];
          msg.text = speechText.value;
          msg.rate = rateRange.value;
          msg.pitch = pitchRange.value;
          msg.volume = volumeRange.value;
          return msg;
      }
    
      function loopCheckbox(loopCheckbox) {
        if (loopCheckbox.checked) {
          const repeatSpeech = function() {
              speechSynthesis.speak(speech);
              setTimeout(repeatSpeech, 1000);
          };
          repeatSpeech();
      } else {
          speechSynthesis.speak(speech);
      }          
    }







    
      //  function for the button event to trigger the speech synth.
      document.getElementById("HideButton").addEventListener("click", function() {
        let speechSynthContainer = document.getElementById("speech_synth_container");
        if (speechSynthContainer.style.display === "none") {
          speechSynthContainer.style.display = "block";
        } else {
          speechSynthContainer.style.display = "none";
        }
      });   

      document.getElementById("useFormInputs").onclick = playSpeech;

      window.onload = function() {
        document.getElementById("speechFormContainer").style.display = "none";
      };


      function toggleForm() {
        var speechFormContainer = document.getElementById("speechFormContainer");
        if (speechFormContainer.style.display === "none") {
          speechFormContainer.style.display = "block";
        } else {
          speechFormContainer.style.display = "none";
        }
      }

      document.getElementById("HideButton").onclick = toggleForm;

  
      

