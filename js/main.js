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


      
      






//Play Along Synth:

      //Movement of Circle:
let active = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;


function dragStart(event) {
  if(event.type === "touchstart") {
    initialX = event.touches[0].clientX - xOffset;
    initialY = event.touches[0].clientY - yOffset;
  } else {
    initialX = event.clientX - xOffset;
    initialY = event.clientY - yOffset;
  }
  if(event.target === circle) {
    active = true;
  }
  return [initialX, initialY];
}

function drag(event) {
  if(active) {
    event.preventDefault();

    currentX = event.clientX - initialX;
    currentY = event.clientY - initialY;
    [currentX,currentY] = checkBounds([currentX, currentY]);
    xOffset = currentX;
    yOffset = currentY;

    setTranslate(currentX, currentY, circle);
  }
  return [currentX, currentY];
}

function dragEnd(event) {
  initialX = currentX;
  initialY = currentY;
  active = false;
  return [currentX, currentY];
}

function setTranslate(xPos, yPos, el) {
  el.style.transform = "translate3d("+xPos+"px,"+yPos+"px,0)";
}

  //Synth Sounds:
  const synth = new Tone.DuoSynth({
    vibratoAmount: 0.5,
    vibratoRate: 5,
    portamento: 0.1,
    harmonicity: 1.005,
    volume: 5,
    voice0: {
      oscillator: {
        type: "sawtooth"
      },
      filter: {
        Q: 1,
        type: "lowpass",
        rolloff: -24
      },
      envelope: {
        attack: 0.01,
        decay: 0.25,
        sustain: 0.4,
        release: 1.2
      },
      filterEnvelope: {
        attack: 0.001,
        decay: 0.05,
        sustain: 0.3,
        release: 2,
        baseFrequency: 100,
        octaves: 4
      }
    },
    voice1: {
      oscillator: {
        type: "sawtooth"
      },
      filter: {
        Q: 2,
        type: "bandpass",
        rolloff: -12
      },
      envelope: {
        attack: 0.25,
        decay: 4,
        sustain: 0.1,
        release: 0.8
      },
      filterEnvelope: {
        attack: 0.05,
        decay: 0.05,
        sustain: 0.7,
        release: 2,
        baseFrequency: 5000,
        octaves: -1.5
      }
    }
  }).toDestination();

  const synthNotes = ["C2", "E2", "G2", "A2",
			"C3", "D3", "E3", "G3", "A3", "B3",
			"C4", "D4", "E4", "G4", "A4", "B4", "C5"];

  function move(x, y) {
    // use the x and y values to set the note and vibrato
    if(x === undefined) {
      x=12;
    }
    const note = synthNotes[Math.round(Math.abs((x===undefined || scale(x)>1.0 ) ?  0.5:scale(x)) * (synthNotes.length - 1))];
    synth.setNote(note);
    synth.vibratoAmount.value = (y===undefined || scale(y)>1.0 ) ?  0.5:scale(y);
  }

  function triggerAttack(x, y) {
    if(x === undefined) {
      x=12;
    }
    // use the x and y values to set the note and vibrato
    const note = synthNotes[Math.round(Math.abs((x===undefined || scale(x)>1.0 ) ?  0.5:scale(x)) * (synthNotes.length - 1))];
    synth.triggerAttack(note);
    synth.vibratoAmount.value = (y===undefined || scale(y)>1.0 ) ?  0.1:scale(y);
  }

 
  circle.addEventListener("mousedown", (event) => {
    const values = dragStart(event);
    triggerAttack(values[0], values[1]);
  }, false);
  circle.addEventListener("mouseup", (event) => { 
    dragEnd(event);
    synth.triggerRelease();
  }, false);
  circle.addEventListener("mousemove", (event) => { 
    Tone.start();
    const values = drag(event);
    move(values[0], values[1]);
  }, false);


  // Function for mapping to scale 
  function scale (number, inMin=-75, inMax=75, outMin=0, outMax=1) {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  }

  function checkBounds(coordinates) {
    const marginX = 20;
    const marginY = 15;
    const fieldBounds = field.getBoundingClientRect();
    const fieldBoundsY = (fieldBounds.bottom - fieldBounds.top - marginY)/2;
    const fieldBoundsX = (fieldBounds.right - fieldBounds.left - marginX)/2;
    if (coordinates[0]>= fieldBoundsX) {
      coordinates[0] = fieldBoundsX;
    } else if (coordinates[0] <= -1 * fieldBoundsX) {
      coordinates[0] = -1 * fieldBoundsX;
    }
    if (coordinates[1]>= fieldBoundsY) {
      coordinates[1] = fieldBoundsY;
    } else if (coordinates[1] <= -1 * fieldBoundsY) {
      coordinates[1] = -1 * fieldBoundsY;
    }
    return coordinates;
  }