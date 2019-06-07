// const toto = require('./../songs/rape-me-nirvana.json');
const fs = require('fs');

const songsFolder = './../data/songs';

const listData = [];

function writeFile(fileName, fileContent) {
  fs.writeFile(fileName, fileContent, function(err) {
    if(err) {
      return console.log(err);
    }
  });
}

function generateSongPage(data) {
  let contentHtml = '';
  let overviewHtml = '';
  const sectionDurations = []; // in seconds
  let rythmKeyCache = '';
  
  for (let i = 0; i < data.sections.length; i += 1) {
    let sectionHtml = '';
    const section = data.sections[i];
    
    const rythmKey = `${section.tempo}-${section.signature.top}-${section.signature.bottom}`;
    if (rythmKey !== rythmKeyCache) {
      sectionHtml += `
        <div class="content__rythm">
          <span>
            <span>${section.signature.top}</span>
            <span>${section.signature.bottom}</span>
          </span>
          <span>${section.tempo}</span>
        </div>
      `;
      rythmKeyCache = rythmKey;
    }
    
    let sectionDuration = 0;
    let sectionBeatCount = 0;
    sectionHtml += `
      <div class="content__section">
        <div class="content__section__name content__section__name--color-${section.color}">${section.name}</div>
      `;
   
    for (let j = 0; j < section.cycles.length; j += 1) {
      const cycle = data.sections[i].cycles[j];
      const cycleBeatCount = cycle.length * cycle.repeat * section.signature.top;
      sectionBeatCount += cycleBeatCount;
      let chordsHtml = '';
      for (let k = 0; k < cycle.chords.length; k += 1) {
        chordsHtml += `${k > 0 ? ' &bull; ' : ''}${cycle.chords[k]}`;
      }
      sectionHtml += `
          <div class="content__section__cycle">
            <div class="content__section__cycle__info">
              <span>
                <small>${cycle.length}</small>
                <strong>${cycle.repeat}</strong>
              </span>
              <span>${chordsHtml}</span>
            </div>
            <div class="content__section__cycle__lyrics">
        `;
      
      for (let k = 0; k < cycle.repeat; k += 1) {
        sectionHtml += `
          <div id="S${i}C${j}R${k}">
            <span><span class="progress"></span></span>
        `;
        if (cycle.lyrics[k].length > 0) {
          for (let l = 0; l < cycle.lyrics[k].length; l += 1) {
            sectionHtml += `${cycle.lyrics[k][l]}<br />`;
          }
        } else {
          sectionHtml += `(Instrumental)<br />`;
        }
      
        
        sectionHtml += `
          </div>
        `;
      }

      sectionHtml += `
            </div>
          </div>
      `;
    }

    sectionHtml += `
        </div>
      `;

    sectionDuration += sectionBeatCount * (60 / section.tempo);
    sectionDurations.push(sectionDuration);
    contentHtml += sectionHtml;
  }

  contentHtml += '</div>';

  const songDuration = sectionDurations.reduce((a, b) => a + b, 0);

  overviewHtml += `
    <div class="overview">
      <div class="overview__track">
  `;

  for(let i = 0; i < data.sections.length; i += 1) {
    overviewHtml += `
        <div class="overview__section overview__section--color-${data.sections[i].color}" style="width:${sectionDurations[i] * 100 / songDuration}%;">
          <div></div>
        </div>
    `;
  }

  overviewHtml += `
      </div>
    </div>
  `;

  // wrap page HTML
  
  let totalHtml = `
    <!doctype html>
    <html>
      <head>
        <title>${data.title} (${data.artist})</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="../assets/style/style.css" />
      </head>
      <body>
        <button id="Play" class="play">play</button>
        <button id="Stop" class="stop">stop</button>
        <div class="content">
          <h1>
            <span>${data.title}</span>
            <span>${data.artist}</span>
          </h1>
  `;

  totalHtml += contentHtml;
  totalHtml += overviewHtml;

  totalHtml += `
      
      <audio id="Metronome">
        <source src="../assets/sound/hit-hat.mp3" type="audio/mpeg">
      </audio>
      <div id="Json" class="json">${JSON.stringify(data)}</div>
      <script src="../assets/script/script.js"></script>
      </body>
    </html>
  `;
  
  return totalHtml;
}

function generateListPage() {
  let html = `
    <!doctype html>
    <html>
      <head>
        <title>Songs</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="./assets/style/style.css" />
      </head>
      <body>
        <div class="song-list">
      `;
  
  for (let i = 0; i < listData.length; i += 1) {
    html += `
          <a href="./songs/${listData[i].file}">
            <span>${listData[i].title}</span>
            <span>${listData[i].artist}</span>
          </a>
      `;
  }
  
          
    
  html += `
        </div>
      </body>
    </html>
  `;
  
  return html;
}

fs.readdir(songsFolder, (err, files) => {
  files.forEach(file => {
    const json = require(`${songsFolder}/${file}`);
    listData.push({
      title: json.title,
      artist: json.artist,
      file: file.replace('.json', '.html')
    });
    writeFile(`../songs/${file.replace('.json', '')}.html`, generateSongPage(json));
  });
});

setTimeout(() => {
  writeFile(`../index.html`, generateListPage());
}, 1000);