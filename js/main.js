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
      speechForm.addEventListener("submit", (event) => {
          event.preventDefault();
          const msg = useFormInputs(event);
          speechSynthesis.speak(msg);
      });
      
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

      
      