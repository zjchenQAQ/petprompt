// PetPrompt characters — all original art (no third-party IP).
//
// Each character maps a STATE to an array of FRAMES; each frame is an array of text
// lines rendered top-to-bottom in the statusline. The renderer cycles frames to animate
// and appends a status label to the last (face) line. Give each character its own
// personality through distinct frames per state.
//
// States: idle (gentle loop + a blink), think (while refining), done (excited reaction),
// sleep (after a long idle).

export const CHARACTERS = {
  shiba: {
    name: '柴犬 Shiba',
    blurb: 'loyal, a little smug; wags its tail',
    states: {
      idle: [
        ['∪   ∪', '(●ᴥ●)'],
        ['∪   ∪', '(●ᴥ●)U'],
        ['∪   ∪', '(˘ᴥ˘)'],
      ],
      think: [
        ['∪   ∪', '(・ᴥ・)?'],
        ['∪   ∪', '(・ᴥ・).'],
      ],
      done: [
        ['∪ ! ∪', '٩(＾ᴥ＾)و✨'],
        ['∪   ∪', '(＾ᴥ＾)U✨'],
      ],
      sleep: [['▽   ▽', '(˘ᴥ˘) zZ']],
    },
  },

  cat: {
    name: '猫 Cat',
    blurb: 'aloof, but secretly cares',
    states: {
      idle: [
        ['/\\_/\\', '(=・ω・=)'],
        ['/\\_/\\', '(=-ω-=)'],
        ['/\\_/\\', '(=・ω・=)ﾉ'],
      ],
      think: [
        ['/\\_/\\', '(=・ω・=)?'],
        ['/\\_/\\', '(=・ω・=).'],
      ],
      done: [
        ['/\\_/\\', '(=^ω^=)✨'],
        ['/\\!/\\', '٩(=^ω^=)و✨'],
      ],
      sleep: [['/\\_/\\', '(=-ω-=) zZ']],
    },
  },

  slime: {
    name: '史莱姆 Slime',
    blurb: 'bouncy, easily delighted; squishes',
    states: {
      idle: [
        [' ▁▁▁ ', '(˘ ω ˘)'],
        ['  ▁  ', '(˘ ω ˘)'],
        [' ▁▁▁ ', '(˘ ‿ ˘)'],
      ],
      think: [
        [' ▁▁▁ ', '(・ ω ・)?'],
        [' ▁▁▁ ', '(・ ω ・).'],
      ],
      done: [
        ['*▁▁▁*', '(˃ ω ˂)✨'],
        [' ^^^ ', '٩(˃ ω ˂)و✨'],
      ],
      sleep: [[' ~~~ ', '(˘ ﹏ ˘) zZ']],
    },
  },

  fox: {
    name: '狐狸 Fox',
    blurb: 'sly and quick-witted',
    states: {
      idle: [
        ['▲   ▲', '( •ω• )'],
        ['▲   ▲', '( -ω- )'],
        ['▲   ▲', '( •ω• )ﾉ'],
      ],
      think: [
        ['▲   ▲', '( •ω• )?'],
        ['▲   ▲', '( •ω• ).'],
      ],
      done: [
        ['▲ ! ▲', '( ＞ω＜ )✨'],
        ['▲   ▲', '٩( ＞ω＜ )و✨'],
      ],
      sleep: [['▿   ▿', '( -ω- ) zZ']],
    },
  },

  bunny: {
    name: '兔子 Bunny',
    blurb: 'shy; hops when happy',
    states: {
      idle: [
        ['(\\(\\', '( •ㅅ• )'],
        ['(\\(\\', '( -ㅅ- )'],
        ['(\\(\\', '( •ㅅ• )♡'],
      ],
      think: [
        ['(\\(\\', '( •ㅅ• )?'],
        ['(\\(\\', '( ・ㅅ・).'],
      ],
      done: [
        ['(\\(\\', '( ◕ᴗ◕ )✨'],
        [')\\)\\', '⸜( ◕ᴗ◕ )⸝✨'],
      ],
      sleep: [['(\\(\\', '( ˘ㅅ˘ ) zZ']],
    },
  },
};

export const DEFAULT_CHARACTER = 'shiba';

export function characterKeys() {
  return Object.keys(CHARACTERS);
}
