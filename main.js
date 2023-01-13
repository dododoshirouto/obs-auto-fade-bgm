var APP_POWER = true;

var OBS_SCENES = [];
var OBS_SCENES_LAST_LOADTIME = -1;
var OBS_CURRENT_SCENE = '';

var BGM_FADE = {
    EMPTY: 0,
    FADE_IN: 1,
    FADE_OUT: 2,
    PLAY: 3,
    PAUSE: 4,
};
var BGM_FADE_STATUS = BGM_FADE.EMPTY;
var BGM_FADE_START_TIME = -1;

/** @type {{scene:bool}} */
var SCENE_BGM_SWITCH = {};

var DELTA_TIME = 0;
var LAST_FRAME_TIME = 0;

/** @type {HTMLInputElement} */
var bgm_file = document.getElementById('bgm_file');
/** @type {HTMLMediaElement} */
var bgm_player = document.getElementById('bgm_player');
/** @type {HTMLInputElement} */
var set_not_fade_in = document.getElementById('set_not_fade_in');
/** @type {HTMLInputElement} */
var set_fade_time_ms = document.getElementById('set_fade_time_ms');
/** @type {HTMLDivElement} */
var scene_switch_list = document.getElementById('scene_switch_list');

function init() {
    if (typeof obsstudio != 'object') {
        APP_POWER = false;
        return;
    }

    (query.scenes ?? '').split(',').map((v) => {
        if (v) SCENE_BGM_SWITCH[decodeURIComponent(v)] = true;
    });

    obsstudio.getControlLevel((level) => (APP_POWER = level >= 2));

    update();
}
init();

function update() {
    if (APP_POWER) requestAnimationFrame(update);

    if (Date.now() - OBS_SCENES_LAST_LOADTIME > 1000) getScenes();

    obsstudio.getCurrentScene((scene) => {
        if (scene.name != OBS_CURRENT_SCENE) {
            console.log(scene.name);
            console.log(SCENE_BGM_SWITCH[scene.name]);
            if (BGM_FADE_STATUS != BGM_FADE.FADE_IN && BGM_FADE_STATUS != BGM_FADE.PLAY && scene.name in SCENE_BGM_SWITCH && SCENE_BGM_SWITCH[scene.name]) {
                // BGM start.
                console.log('BGM start.');
                BGM_FADE_START_TIME = Date.now();
                BGM_FADE_STATUS = BGM_FADE.FADE_IN;
                // bgm_player.volume = 0;
                bgm_player.play();

                if (set_not_fade_in.checked) {
                    bgm_player.currentTime = 0;
                    bgm_player.volume = 1;
                    BGM_FADE_STATUS = BGM_FADE.PLAY;
                }
            }
            if (BGM_FADE_STATUS != BGM_FADE.FADE_OUT && (!scene.name in SCENE_BGM_SWITCH || !SCENE_BGM_SWITCH[scene.name])) {
                // BGM end.
                console.log('BGM end.');
                BGM_FADE_START_TIME = Date.now();
                BGM_FADE_STATUS = BGM_FADE.FADE_OUT;
            }
        }

        OBS_CURRENT_SCENE = scene.name;
    });

    if (BGM_FADE_STATUS == BGM_FADE.FADE_IN) {
        // Fade In.
        console.log('Fade In.');
        let volume = bgm_player.volume;
        volume += DELTA_TIME / (set_fade_time_ms.value / 1000);
        bgm_player.volume = Math.min(1, volume);

        if (volume >= 1.0) {
            // Fade In end.
            console.log('Fade In end.');
            bgm_player.volume = 1.0;
            BGM_FADE_STATUS = BGM_FADE.PLAY;
        }
    }

    if (BGM_FADE_STATUS == BGM_FADE.FADE_OUT) {
        // Fade Out.
        console.log('Fade Out.');
        let volume = bgm_player.volume;
        volume -= DELTA_TIME / (set_fade_time_ms.value / 1000);
        bgm_player.volume = Math.max(0, volume);

        if (volume <= 0.0) {
            // Fade Out end.
            console.log('Fade Out end.');
            bgm_player.pause();
            BGM_FADE_STATUS = BGM_FADE.PAUSE;
        }
    }

    DELTA_TIME = (Date.now() - LAST_FRAME_TIME) / 1000;
    LAST_FRAME_TIME = Date.now();
}

/** たまに監視して更新したほうがいいかも。 */
function getScenes() {
    obsstudio.getScenes((scenes) => {
        OBS_SCENES = scenes;

        // debug_view.innerText = JSON.stringify(SCENE_BGM_SWITCH);

        [...document.getElementsByClassName('scene_switch')].map((elem) => {
            if (scenes.indexOf(elem.innerText) == -1) elem.remove();
        });

        scenes.map((scene) => {
            if (scene_switch_list.querySelector('#scene_switch_' + scene.easyHash())) return;

            let elem = document.createElement('p');
            elem.innerHTML = `<label><input type="checkbox" id="scene_switch_${scene.easyHash()}">${scene}</label>`;
            elem.classList.add('scene_switch');
            scene_switch_list.appendChild(elem);

            elem.querySelector('input').checked = SCENE_BGM_SWITCH[scene] ?? false;
            elem.querySelector('input').addEventListener('change', (ev) => {
                SCENE_BGM_SWITCH[scene] = ev.target.checked;
            });
        });
    });
    OBS_SCENES_LAST_LOADTIME = Date.now();
}

/** @param {Event} */
function setAudioFile(ev) {
    const urlObj = URL.createObjectURL(ev.target.files[0]);
    bgm_player.src = urlObj;
    BGM_FADE_STATUS = BGM_FADE.PAUSE;
    bgm_player.volume = 0;
}
bgm_file.addEventListener('change', setAudioFile);

bgm_player.addEventListener('playing', (ev) => {
    if (BGM_FADE_STATUS != BGM_FADE.FADE_IN) {
        bgm_player.volume = 1.0;
        BGM_FADE_STATUS = BGM_FADE.PLAY;
    }
});
bgm_player.addEventListener('pause', (ev) => {
    BGM_FADE_STATUS = BGM_FADE.PAUSE;
});
