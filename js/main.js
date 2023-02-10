//Speech Synthesizer:

//Populating the voice selector
function populateVoiceList() {
  if (typeof speechSynthesis === "undefined") {
    return;
  }

  const voices = speechSynthesis.getVoices();

  for (let i = 0; i < voices.length; i++) {
    const option = document.createElement("option");
    option.textContent = `${voices[i].name} (${voices[i].lang})`;

    if (voices[i].default) {
      option.textContent += " — DEFAULT";
    }

    option.setAttribute("data-lang", voices[i].lang);
    option.setAttribute("data-name", voices[i].name);
    document.getElementById("voiceSelect").appendChild(option);
  }
}

populateVoiceList();
if (
  typeof speechSynthesis !== "undefined" &&
  speechSynthesis.onvoiceschanged !== undefined
) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

// Text-To Speech Setup:
let repeatSpeech = null;
if ("speechSynthesis" in window) {
  speechForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const msg = useFormInputs(event);
    const loopCheckbox = document.querySelector("#loop_box");
    if (loopCheckbox.checked) {
      repeatSpeech = setInterval(function () {
        speechSynthesis.speak(msg);
      }, 5);
    } else {
      speechSynthesis.speak(msg);
    }
  });
} else {
  console.log("Speech synthesis is not supported in your browser");
}

loop_box.addEventListener("change", (event) => {
  event.preventDefault();
  if (!loop_box.checked) {
    clearInterval(repeatSpeech);
    window.speechSynthesis.cancel();
  }
});

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

//  function for the button event to trigger the speech synth.
document.getElementById("HideButton").addEventListener("click", function () {
  let speechSynthContainer = document.getElementById("speech_synth_container");
  if (speechSynthContainer.style.display === "none") {
    speechSynthContainer.style.display = "block";
  } else {
    speechSynthContainer.style.display = "none";
  }
});

function toggleForm() {
  var speechFormContainer = document.getElementById("speechFormContainer");
}

document.getElementById("HideButton").onclick = toggleForm;

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
  if (event.type === "touchstart") {
    initialX = event.touches[0].clientX - xOffset;
    initialY = event.touches[0].clientY - yOffset;
  } else {
    initialX = event.clientX - xOffset;
    initialY = event.clientY - yOffset;
  }
  if (event.target === circle) {
    active = true;
  }
  return [initialX, initialY];
}

function drag(event) {
  if (active) {
    event.preventDefault();

    currentX = event.clientX - initialX;
    currentY = event.clientY - initialY;
    [currentX, currentY] = checkBounds([currentX, currentY]);
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
  el.style.transform = "translate3d(" + xPos + "px," + yPos + "px,0)";
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
      type: "sawtooth",
    },
    filter: {
      Q: 1,
      type: "lowpass",
      rolloff: -24,
    },
    envelope: {
      attack: 0.01,
      decay: 0.25,
      sustain: 0.4,
      release: 1.2,
    },
    filterEnvelope: {
      attack: 0.001,
      decay: 0.05,
      sustain: 0.3,
      release: 2,
      baseFrequency: 100,
      octaves: 4,
    },
  },
  voice1: {
    oscillator: {
      type: "sawtooth",
    },
    filter: {
      Q: 2,
      type: "bandpass",
      rolloff: -12,
    },
    envelope: {
      attack: 0.25,
      decay: 4,
      sustain: 0.1,
      release: 0.8,
    },
    filterEnvelope: {
      attack: 0.05,
      decay: 0.05,
      sustain: 0.7,
      release: 2,
      baseFrequency: 5000,
      octaves: -1.5,
    },
  },
}).toDestination();

const synthNotes = [
  "C2",
  "E2",
  "G2",
  "A2",
  "C3",
  "D3",
  "E3",
  "G3",
  "A3",
  "B3",
  "C4",
  "D4",
  "E4",
  "G4",
  "A4",
  "B4",
  "C5",
];

function move(x, y) {
  // use the x and y values to set the note and vibrato
  if (x === undefined) {
    x = 12;
  }
  const note =
    synthNotes[
      Math.round(
        Math.abs(x === undefined || scale(x) > 1.0 ? 0.5 : scale(x)) *
          (synthNotes.length - 1)
      )
    ];
  synth.setNote(note);
  synth.vibratoAmount.value =
    y === undefined || scale(y) > 1.0 ? 0.5 : scale(y);
}

function triggerAttack(x, y) {
  if (x === undefined) {
    x = 12;
  }
  // use the x and y values to set the note and vibrato
  const note =
    synthNotes[
      Math.round(
        Math.abs(x === undefined || scale(x) > 1.0 ? 0.5 : scale(x)) *
          (synthNotes.length - 1)
      )
    ];
  synth.triggerAttack(note);
  synth.vibratoAmount.value =
    y === undefined || scale(y) > 1.0 ? 0.1 : scale(y);
}

field.addEventListener(
  "mousedown",
  (event) => {
    const values = dragStart(event);
    triggerAttack(values[0], values[1]);
  },
  false
);
field.addEventListener(
  "mouseup",
  (event) => {
    dragEnd(event);
    synth.triggerRelease();
  },
  false
);
field.addEventListener(
  "mousemove",
  (event) => {
    Tone.start();
    const values = drag(event);
    move(values[0], values[1]);
  },
  false
);

// Function for mapping to scale
function scale(number, inMin = -75, inMax = 75, outMin = 0, outMax = 1) {
  return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

function checkBounds(coordinates) {
  const marginX = 30;
  const marginY = 30;
  const fieldBounds = field.getBoundingClientRect();
  const fieldBoundsY = (fieldBounds.bottom - fieldBounds.top - marginY) / 2;
  const fieldBoundsX = (fieldBounds.right - fieldBounds.left - marginX) / 2;
  if (coordinates[0] >= fieldBoundsX) {
    coordinates[0] = fieldBoundsX;
  } else if (coordinates[0] <= -1 * fieldBoundsX) {
    coordinates[0] = -1 * fieldBoundsX;
  }
  if (coordinates[1] >= fieldBoundsY) {
    coordinates[1] = fieldBoundsY;
  } else if (coordinates[1] <= -1 * fieldBoundsY) {
    coordinates[1] = -1 * fieldBoundsY;
  }
  return coordinates;
}

// //Required for Local Videos
// background_video.addEventListener("click", (event) => {
//   if (event.target.id === "visualizer1") {
//     video_control.pause();
//     video.setAttribute(
//       "src",
//       " ./styles/Images/cyan-psychedelic-plasma-background-loop-4k-2021-09-02-19-51-33-utc.mp4"
//     );
//     video_control.load();
//     video_control.play();
//   }

//   if (event.target.id === "visualizer2") {
//     video_control.pause();
//     video.setAttribute(
//       "src",
//       "./styles/Images/colorful-time-space-warp-wormhole-science-fiction-2022-08-10-09-33-08-utc.mp4"
//     );
//     video_control.load();
//     video_control.play();
//   }

//   if (event.target.id === "visualizer3") {
//     video_control.pause();
//     video.setAttribute(
//       "src",
//       "./styles/Images/blue-plasma-energy-background-loop-4k-2021-09-02-19-56-13-utc.mp4"
//     );
//     video_control.load();
//     video_control.play();
//   }

//   if (event.target.id === "visualizer4") {
//     video_control.pause();
//     video.setAttribute(
//       "src",
//       "./styles/Images/wormhole-through-time-and-space-warp-through-scie-2022-08-04-20-26-38-utc.mp4"
//     );
//     video_control.load();
//     video_control.play();
//   }

//   if (event.target.id === "visualizer5") {
//     video_control.pause();
//     video.setAttribute(
//       "src",
//       "./styles/Images/warp-speed-digital-rays-2022-08-10-14-34-06-utc.mp4"
//     );
//     video_control.load();
//     video_control.play();
//   }

//   if (event.target.id === "visualizer6") {
//     video_control.pause();
//     video.setAttribute("src", "./styles/Images/Sequence 01.mp4");
//     video_control.load();
//     video_control.play();
//   }

//   if (event.target.id === "visualizer7") {
//     video_control.pause();
//     video.setAttribute("src", "");
//     video_control.load();
//     video_control.play();
//   }

//   if (event.target.id === "visualizer8") {
//     video_control.pause();
//     video.setAttribute("src", "./styles/Images/Fire.mp4");
//     video_control.load();
//     video_control.play();
//   }

//   if (event.target.id === "visualizer9") {
//     video_control.pause();
//     video.setAttribute("src", "");
//     video_control.load();
//     video_control.play();
//   }
// });

//Required for Embedded Videos
background_video.addEventListener("click", (event) => {
  if (event.target.id === "visualizer1") {
    embeddedVideo.setAttribute(
      "src",
      "https://player.vimeo.com/video/797278248?autoplay=1&autopause=0&loop=1&byline=0&title=0&quality=4K&muted=1"
    );
  }

  if (event.target.id === "visualizer2") {
    embeddedVideo.setAttribute(
      "src",
      "https://player.vimeo.com/video/797277922?autoplay=1&autopause=0&loop=1&byline=0&title=0&quality=4K&muted=1"
    );
  }

  if (event.target.id === "visualizer3") {
    embeddedVideo.setAttribute(
      "src",
      "https://player.vimeo.com/video/797278124?autoplay=1&autopause=0&loop=1&byline=0&title=0&quality=4K&muted=1"
    );
  }

  if (event.target.id === "visualizer4") {
    embeddedVideo.setAttribute(
      "src",
      "https://player.vimeo.com/video/797277820?autoplay=1&autopause=0&loop=1&byline=0&title=0&quality=4K&muted=1"
    );
  }

  if (event.target.id === "visualizer5") {
    embeddedVideo.setAttribute(
      "src",
      "https://player.vimeo.com/video/797277464?autoplay=1&autopause=0&loop=1&byline=0&title=0&quality=4K&muted=1"
    );
  }

  if (event.target.id === "visualizer6") {
    embeddedVideo.setAttribute(
      "src",
      "https://player.vimeo.com/video/797277025?autoplay=1&autopause=0&loop=1&byline=0&title=0&quality=4K&muted=1"
    );
  }

  if (event.target.id === "visualizer7") {
    embeddedVideo.setAttribute(
      "src",
      "https://player.vimeo.com/video/797451041?autoplay=1&autopause=0&loop=1&byline=0&title=0&quality=4K&muted=1"
    );
  }

  if (event.target.id === "visualizer8") {
    embeddedVideo.setAttribute(
      "src",
      "https://player.vimeo.com/video/797523040?autoplay=1&autopause=0&loop=1&byline=0&title=0&quality=4K&muted=1"
    );
  }
});

//Step Sequencers

//Inst1 (Percussion)
const inst1 = new Tone.Players({
  urls: {
    0: "hihat.mp3",
    1: "snare.mp3",
    2: "kick.mp3",
    3: "tom1.mp3",
  },
  fadeOut: "64n",
  baseUrl: "https://tonejs.github.io/audio/drum-samples/Techno/",
}).toDestination();

//Inst2
const inst2 = new Tone.Players({
  urls: {
    0: "Kalimba_1.mp3",
    1: "Kalimba_2.mp3",
    2: "Kalimba_3.mp3",
    3: "Kalimba_4.mp3",
  },
  fadeOut: "64n",
  baseUrl: "https://tonejs.github.io/audio/berklee/",
}).toDestination();

//Inst3
const inst3 = new Tone.Players({
  urls: {
    0: "bulbpop_1.mp3",
    1: "bulbpop_2.mp3",
    2: "bulbpop_3.mp3",
    3: "bulbpop_4.mp3",
  },
  fadeOut: "64n",
  baseUrl: "https://tonejs.github.io/audio/berklee/",
}).toDestination();
//Inst3
const inst4 = new Tone.Players({
  urls: {
    0: "A1.mp3",
    1: "Cs2.mp3",
    2: "E2.mp3",
    3: "Fs2.mp3",
  },
  fadeOut: "64n",
  baseUrl: "https://tonejs.github.io/audio/casio/",
}).toDestination();

//Step Sequencer Stop/Start Button
right_container
  .querySelector("tone-play-toggle")
  .addEventListener("start", (event) => {
    Tone.Transport.start();
  });
right_container
  .querySelector("tone-play-toggle")
  .addEventListener("stop", (event) => {
    Tone.Transport.stop();
  });
tempoSlider.addEventListener(
  "input",
  (e) => (Tone.Transport.bpm.value = parseFloat(e.target.value))
);

//Inst1 Step Controls
inst1Seq.addEventListener("trigger", ({ detail }) => {
  inst1.player(detail.row).start(detail.time, 0, "16t");
});

//Inst2 Step Controls

inst2Seq.addEventListener("trigger", ({ detail }) => {
  inst2.player(detail.row).start(detail.time, 0, "16t");
});

//Inst3 Step Controls

inst3Seq.addEventListener("trigger", ({ detail }) => {
  inst3.player(detail.row).start(detail.time, 0, "16t");
});

//Inst4 Step Controls

inst4Seq.addEventListener("trigger", ({ detail }) => {
  inst4.player(detail.row).start(detail.time, 0, "16t");
});

//Pitch Shift
const pitchShift = new Tone.PitchShift().toDestination();
inst1.connect(pitchShift);
inst2.connect(pitchShift);
inst3.connect(pitchShift);
inst4.connect(pitchShift);
synth.connect(pitchShift);

const toneFFT = new Tone.FFT();
pitchShift.connect(toneFFT);
fft({
  parent: document.querySelector("#content"),
  tone: toneFFT,
});

content.querySelector("tone-slider").addEventListener("input", (e) => {
  pitchShift.pitch = parseFloat(e.target.value);
});

//Overall Effects Controls

const filter = new Tone.AutoFilter({
  frequency: 2,
  depth: 0.6,
})
  .toDestination()
  .start();

const crusher = new Tone.BitCrusher(4).toDestination();
const shift = new Tone.FrequencyShifter(0).toDestination();

const osc = new Tone.Oscillator({
  volume: -20,
  type: "square6",
  frequency: "C4",
})
  .connect(filter)
  .connect(crusher)
  .connect(shift);

overall_controls_container.addEventListener("input", (event) => {
  if (event.target.id === "volRange") {
    osc.volume.value = parseFloat(event.target.value);
  }
  if (event.target.id === "filterRange") {
    filter.frequency.value = parseFloat(event.target.value);
    filter.depth.value = 1;
  }
  if (event.target.id === "bitRange") {
    crusher.bits.value = parseFloat(event.target.value);
  }
  if (event.target.id === "freqRange") {
    shift.frequency.value = parseFloat(event.target.value);
  }
});

left_container
  .querySelector("tone-play-toggle")
  .addEventListener("start", (event) => {
    if (event.target.id === "oscillator") {
      osc.start();
    }
  });
left_container
  .querySelector("tone-play-toggle")
  .addEventListener("stop", (event) => {
    if (event.target.id === "oscillator") {
      osc.stop();
    }
  });

//Set Up Shadow DOM elements for styling
const cells = new Set([
  inst1Seq.shadowRoot.querySelectorAll(".cell"),
  inst2Seq.shadowRoot.querySelectorAll(".cell"),
  inst3Seq.shadowRoot.querySelectorAll(".cell"),
  inst4Seq.shadowRoot.querySelectorAll(".cell"),
]);

cells.forEach((arr) => {
  arr.forEach((element) => {
    element.setAttribute("part", "cell");
  });
});

//Listen for user to trigger step sequence buttons
step_synth_container.addEventListener("click", (event) => {
  const currentCells = new Set([
    inst1Seq.shadowRoot.querySelectorAll(".cell"),
    inst2Seq.shadowRoot.querySelectorAll(".cell"),
    inst3Seq.shadowRoot.querySelectorAll(".cell"),
    inst4Seq.shadowRoot.querySelectorAll(".cell"),
  ]);
  currentCells.forEach((instrument) => {
    instrument.forEach((element) => {
      element.style.transform = "scale(1, 1)";
      element.style.filter = "";
    });
  });

  const filledCells = new Set([
    inst1Seq.shadowRoot.querySelectorAll(".cell[filled]"),
    inst2Seq.shadowRoot.querySelectorAll(".cell[filled]"),
    inst3Seq.shadowRoot.querySelectorAll(".cell[filled]"),
    inst4Seq.shadowRoot.querySelectorAll(".cell[filled]"),
  ]);
  filledCells.forEach((instrument) => {
    instrument.forEach((element) => {
      element.style.transform = "scale(1.2, 1.2)";
      element.style.filter = "blur(4px)";
    });
  });
});

// Look for attribute changes in shadow dom columns
const cols = new Set([
  inst1Seq.shadowRoot.querySelectorAll(".column"),
  inst2Seq.shadowRoot.querySelectorAll(".column"),
  inst3Seq.shadowRoot.querySelectorAll(".column"),
  inst4Seq.shadowRoot.querySelectorAll(".column"),
]);

let cellObserver = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (mutation.type === "attributes") {
      if (mutation.target.hasAttribute("highlighted")) {
        mutation.target.style.opacity = 0.2;
      } else {
        mutation.target.style.opacity = 1;
      }
    }
  });
});
cols.forEach((arr) =>
  arr.forEach((element) => {
    element.setAttribute("part", "column");
    cellObserver.observe(element, {
      attributes: true,
    });
  })
);

const fftPlot = document.querySelectorAll("tone-fft-vis");
const sliders = document.querySelectorAll("tone-slider");
sliders.forEach((element) => {
  const trackContainer = element.shadowRoot
    .querySelector("mwc-slider")
    .shadowRoot.querySelector(".mdc-slider__track-container");
  trackContainer.style.backgroundColor = "white";
  trackContainer.style.color = "white";

  const track = element.shadowRoot
    .querySelector("mwc-slider")
    .shadowRoot.querySelector(".mdc-slider__track");
  track.style.backgroundColor = "white";
  track.style.color = "white";

  const trackThumb = element.shadowRoot
    .querySelector("mwc-slider")
    .shadowRoot.querySelector(".mdc-slider__thumb");
  trackThumb.style.fill = "#FF24FF";
  trackThumb.style.stroke = "#FF24FF";
});

window.addEventListener("load", (event) => {
  fftPlot[0].shadowRoot.querySelector("style").innerHTML = `#container {
    margin-top: 5px;
  }
  canvas {
    background-color: transparent;
    width: 100%;
    border-radius: 4px;
    height: 40px;`;
});
