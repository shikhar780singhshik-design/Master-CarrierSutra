/**
 * characters/characters.js
 * The logo, the four cartoon characters and the night scenes, all drawn in code.
 */
"use strict";

// The character picked on the sign-up form.
let chosenCharacter = 0;

// The Master Carriersutra logo.
const logoSvg = n => `<svg viewBox='0 0 32 32' width='${n}' height='${n}' aria-hidden='true'><rect width='32' height='32' rx='7' fill='#0e1426' stroke='#f2b84b' stroke-width='1.5'/><path d='M7 25c8 0 4-9 11-9s3-8 9-9' fill='none' stroke='#f2b84b' stroke-width='3' stroke-linecap='round'/><circle cx='26' cy='7' r='3' fill='#f2b84b'/></svg>`;

// Wraps drawing instructions in an SVG picture.
const svgFrame = b => `<svg viewBox='0 0 100 100' width='104' height='104' aria-hidden='true'>${b}</svg>`;

const OUTLINE = " stroke='#1d2320' stroke-linejoin='round'";

const eyes = (a, b, y, c, r) => `<circle class='eye' cx='${a}' cy='${y}' r='${r}' fill='${c}'/><circle class='eye' cx='${b}' cy='${y}' r='${r}' fill='${c}'/>`;

// Names of the characters, in the same order.
const CHARACTER_NAMES = ['Fox', 'Robot', 'Owl', 'Dino'];

// The four cartoon characters, each drawn with SVG so they can move.
const CHARACTERS = [
    () => svgFrame(`<g class='tail'><path d='M70 72c20-2 26-22 16-34-1 13-9 21-22 22z' fill='#e8742c'${OUTLINE} stroke-width='2.5'/></g><ellipse class='f1' cx='38' cy='91' rx='9' ry='5' fill='#c85f1f'/><ellipse class='f2' cx='62' cy='91' rx='9' ry='5' fill='#c85f1f'/><path d='M22 42l-3-26 24 13zM78 42l3-26-24 13z' fill='#e8742c'${OUTLINE} stroke-width='2.5'/><ellipse cx='50' cy='64' rx='31' ry='27' fill='#f0813a'${OUTLINE} stroke-width='3'/><path d='M27 68q23 26 46 0q-8-13-23-13t-23 13z' fill='#fff1de'/>${eyes(37, 63, 56, '#1d2320', 5)}<circle cx='38.5' cy='54.5' r='1.6' fill='#fff'/><circle cx='64.5' cy='54.5' r='1.6' fill='#fff'/><ellipse cx='50' cy='66' rx='4' ry='3' fill='#1d2320'/><path class='mouth' d='M43 72q7 6 14 0' fill='none' stroke='#1d2320' stroke-width='2.5' stroke-linecap='round'/>`),
    () => svgFrame(`<path d='M50 26V14' stroke='#33405f' stroke-width='3'/><circle class='ant' cx='50' cy='11' r='5' fill='#f2b84b'/><rect x='13' y='46' width='9' height='16' rx='3' fill='#f2b84b'${OUTLINE} stroke-width='2'/><rect x='78' y='46' width='9' height='16' rx='3' fill='#f2b84b'${OUTLINE} stroke-width='2'/><rect class='f1' x='33' y='84' width='13' height='8' rx='4' fill='#3e9b96'/><rect class='f2' x='54' y='84' width='13' height='8' rx='4' fill='#3e9b96'/><rect x='22' y='26' width='56' height='60' rx='16' fill='#5cc8c0'${OUTLINE} stroke-width='3'/><rect x='30' y='36' width='40' height='28' rx='9' fill='#12263a'/>${eyes(42, 58, 49, '#8ff5ea', 5)}<path class='mouth' d='M43 58q7 5 14 0' fill='none' stroke='#8ff5ea' stroke-width='2.5' stroke-linecap='round'/><rect x='38' y='71' width='24' height='8' rx='4' fill='#f2b84b'/>`),
    () => svgFrame(`<ellipse class='f1' cx='40' cy='92' rx='8' ry='4' fill='#f2b84b'/><ellipse class='f2' cx='60' cy='92' rx='8' ry='4' fill='#f2b84b'/><path d='M28 30l-6-16 17 9M72 30l6-16-17 9' fill='#8a5a3c'${OUTLINE} stroke-width='2.5'/><ellipse cx='50' cy='62' rx='30' ry='31' fill='#a9744f'${OUTLINE} stroke-width='3'/><ellipse cx='50' cy='73' rx='17' ry='17' fill='#f3dcc0'/><g class='wing'><ellipse cx='20' cy='68' rx='7' ry='16' fill='#8a5a3c'${OUTLINE} stroke-width='2'/></g><g class='wing'><ellipse cx='80' cy='68' rx='7' ry='16' fill='#8a5a3c'${OUTLINE} stroke-width='2'/></g><circle cx='38' cy='50' r='11' fill='#fff'${OUTLINE} stroke-width='2.5'/><circle cx='62' cy='50' r='11' fill='#fff'${OUTLINE} stroke-width='2.5'/>${eyes(39, 61, 51, '#1d2320', 5)}<path class='mouth' d='M45 58l5 9 5-9z' fill='#f2b84b'${OUTLINE} stroke-width='2'/>`),
    () => svgFrame(`<g class='tail'><path d='M72 74c16 2 22-10 16-20-1 9-7 14-18 14z' fill='#58b857'${OUTLINE} stroke-width='2.5'/></g><ellipse class='f1' cx='38' cy='91' rx='10' ry='5' fill='#3f9a40'/><ellipse class='f2' cx='62' cy='91' rx='10' ry='5' fill='#3f9a40'/><path d='M30 34l6-14 6 14M44 28l6-14 6 14M58 34l6-14 6 14' fill='#f2b84b'${OUTLINE} stroke-width='2'/><ellipse cx='50' cy='64' rx='32' ry='28' fill='#6cc36a'${OUTLINE} stroke-width='3'/><ellipse cx='50' cy='75' rx='19' ry='14' fill='#d8f2b5'/>${eyes(38, 62, 56, '#1d2320', 5.5)}<circle cx='39.5' cy='54.5' r='1.7' fill='#fff'/><circle cx='63.5' cy='54.5' r='1.7' fill='#fff'/><ellipse cx='28' cy='66' rx='4' ry='3' fill='#f08a8a'/><ellipse cx='72' cy='66' rx='4' ry='3' fill='#f08a8a'/><circle cx='46' cy='64' r='1.2' fill='#1d2320'/><circle cx='54' cy='64' r='1.2' fill='#1d2320'/><path class='mouth' d='M42 70q8 7 16 0' fill='none' stroke='#1d2320' stroke-width='2.5' stroke-linecap='round'/>`)
];

const SCENE_COLOURS = [['#0e1426', '#1b2a4a', '#243a63'], ['#0f1f20', '#1b3a36', '#25524a'], ['#211814', '#3a2a1e', '#54402c'], ['#101c15', '#1f3a2a', '#2d5a3d']];

// Draws the night scene shown behind the app.
function sceneBackground(k) {
    const c = SCENE_COLOURS[k % 4];
    let st = '';
    for (let i = 0; i < 40; i++)
        st += `<circle cx='${(i * 97) % 800}' cy='${(i * 53) % 260 + 10}' r='${i % 5 ? 1.2 : 2}' fill='#fff' opacity='${.35 + (i % 4) * .15}'/>`;
    const g = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500' preserveAspectRatio='xMidYMid slice'><rect width='800' height='500' fill='${c[0]}'/>${st}<circle cx='650' cy='90' r='34' fill='#f6e7b4'/><path d='M0 360L160 230L300 340L460 200L640 330L800 250V500H0z' fill='${c[1]}'/><path d='M0 430Q200 340 400 410T800 380V500H0z' fill='${c[2]}'/><path d='M120 500Q300 420 440 400T700 330' stroke='#f2b84b' stroke-width='6' fill='none' stroke-dasharray='2 14' stroke-linecap='round'/><path d='M700 330v-46' stroke='#eee' stroke-width='3'/><path d='M700 284l30 10-30 10z' fill='#f2b84b'/></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(g).replace(/'/g, '%27');
}
