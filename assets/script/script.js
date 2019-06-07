const data = JSON.parse(document.getElementById('Json').innerHTML);
const $metronome = document.getElementById('Metronome');
const $playButton = document.getElementById('Play');
const $stopButton = document.getElementById('Stop');
const $body = document.body;
let activeRepeatIdCache = '';
let clic;

const drummerWarmUpListenMeasures = 1;
const drummerWarmUpPlayMeasures = 1;

function playMetronomeSound() {
  $metronome.play();
}

function playRepeat(s, c, r) {
  const $repeat = document.getElementById(`S${s}C${c}R${r}`);
  console.log($repeat);
  const $progressBar = $repeat.getElementsByClassName('progress')[0];
  if (activeRepeatIdCache !== '') {
    document.getElementById(activeRepeatIdCache).classList.remove('active');
  }
  $repeat.classList.add('active');
  activeRepeatIdCache = `S${s}C${c}R${r}`;
  
  const repeatTopPos = $repeat.getBoundingClientRect().top + window.scrollY;
  window.scrollTo(0, repeatTopPos - 200);

  playMetronomeSound()
  let repeatClics = 1;
  $progressBar.style.height = `${repeatClics * 100 / (data.sections[s].cycles[c].length * data.sections[s].signature.top)}%`;
  clic = window.setInterval(() => {
    if (repeatClics < data.sections[s].cycles[c].length * data.sections[s].signature.top) {
      playMetronomeSound();
      repeatClics += 1;
      $progressBar.style.height = `${repeatClics * 100 / (data.sections[s].cycles[c].length * data.sections[s].signature.top)}%`;
    } else {
      clearInterval(clic);
      playNextRepeat(s, c, r);
    }
  }, (60 / data.sections[s].tempo) * 1000);

}

function playNextRepeat(s, c, r) {
  if (r + 1 < data.sections[s].cycles[c].repeat) {
    playRepeat(s, c, r + 1);
  } else {
    if (c + 1 < data.sections[s].cycles.length) {
      playRepeat(s, c + 1, 0);
    } else {
      if (s + 1 < data.sections.length) {
        playRepeat(s + 1, 0, 0);
      } else {
        console.log('END !');
      }
    }
  }
}

function playSong() {
  $stopButton.style.display = 'block';
  window.scrollTo(0, 0);
  const $precountWindow = document.createElement('div');
  $precountWindow.classList.add('full-screen-info');
  $precountWindow.innerHTML = `
    <div class="full-screen-info__content">
      <div>
        Clic batterie
      </div>
    </div>
  `;
  $body.appendChild($precountWindow);
  
  playMetronomeSound();
  let warmUpClics = 1;
  clic = window.setInterval(() => {
    if (warmUpClics < (drummerWarmUpListenMeasures + drummerWarmUpPlayMeasures) * data.sections[0].signature.top) {
      playMetronomeSound();
      warmUpClics += 1;
    } else {
      clearInterval(clic);
      $body.removeChild($precountWindow);
      playRepeat(0,0,0);
    }
  }, (60 / data.sections[0].tempo) * 1000);
}

function stopSong() {
  clearInterval(clic);
  window.scrollTo(0, 0);
  $playButton.style.display = 'block';
  $stopButton.style.display = 'none';
  if (activeRepeatIdCache !== '') {
    document.getElementById(activeRepeatIdCache).classList.remove('active');
  }
  $fullScreenInfo = document.getElementsByClassName('full-screen-info');
  if ($fullScreenInfo.length > 0) {
    $body.removeChild($fullScreenInfo[0]);
  }
}

$playButton.addEventListener('click', () => {
  playSong();
});

$stopButton.addEventListener('click', () => {
  stopSong();
});



