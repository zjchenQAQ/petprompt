// PetPrompt characters — all original art (no third-party IP).
//
// Each character maps a STATE to an array of FRAMES; each frame is an array of text lines
// rendered top-to-bottom in the statusline. The renderer cycles frames to animate and
// appends a status label to the last line. Each character has its own ears / eyes / paws or
// tail and its own reactions, so it reads as a distinct, expressive little creature.
//
// States: idle (gentle loop + blink/look), think (while rewriting), done (excited reaction),
// sleep (after a long idle).

export const CHARACTERS = {
  shiba: {
    name: { en: 'Shiba', zh: '柴犬', ja: '柴犬' },
    blurb: {
      en: 'loyal pup; wags its tail',
      zh: '忠诚的小狗，会摇尾巴',
      ja: '忠実な子犬。しっぽを振る',
    },
    states: {
      idle: [
        ['U     U', '( ◕ᴥ◕ )', ' \\___/'],
        ['U     U', '( -ᴥ- )', ' \\___/'], // blink
        ['U     U', '( ◕ᴥ◕ )', ' \\___/ ~'], // tail wag
      ],
      think: [
        ['U     U', '( ◕ᴥ◕ )?', ' \\___/'],
        ['U     U', '( ·ᴥ· )', ' \\___/'],
      ],
      done: [
        ['U  !  U', '( ＾ᴥ＾ )', ' \\___/ ✨'],
        ['\\     /', '( ＾ᴥ＾ )', ' \\_♥_/ ✨'],
      ],
      sleep: [['n     n', '( -ᴥ- )', ' \\___/ z']],
    },
  },

  cat: {
    name: { en: 'Cat', zh: '猫', ja: '猫' },
    blurb: {
      en: 'aloof, but secretly cares',
      zh: '高冷，但其实很在意你',
      ja: 'クールだけど実は気にかけている',
    },
    states: {
      idle: [
        ['/\\_/\\', '( o.o )', ' > ^ <'],
        ['/\\_/\\', '( -.- )', ' > ^ <'], // blink
        ['/\\_/\\', '( o.O )', ' > ^ <'], // look
      ],
      think: [
        ['/\\_/\\', '( o.o )?', ' > ^ <'],
        ['/\\_/\\', '( ·_· )', ' > ^ <'],
      ],
      done: [
        ['/\\_/\\', '( ^.^ )', ' >‿< ✨'],
        ['/\\_/\\', '( ^o^ )', ' ♪ ♪ '],
      ],
      sleep: [['/\\_/\\', '( =.= )', ' zzZ ']],
    },
  },

  bunny: {
    name: { en: 'Bunny', zh: '兔子', ja: '兎' },
    blurb: {
      en: 'shy; hops when happy',
      zh: '害羞，开心时蹦跶',
      ja: '内気で、嬉しいと跳ねる',
    },
    states: {
      idle: [
        ['(\\_/)', '( •ᴥ• )', 'c(")(")'],
        ['(\\_/)', '( -ᴥ- )', 'c(")(")'], // blink
        ['(\\_/)', '( •ᴥ• )♡', 'c(")(")'],
      ],
      think: [
        ['(\\_/)', '( •ᴥ• )?', 'c(")(")'],
        ['(\\_/)', '( ·ᴥ· )', 'c(")(")'],
      ],
      done: [
        ['(\\_/)', '( >ᴥ< )', 'c(")(") ✨'],
        ['(\\_/) ', '( ^ᴥ^ )', '  ⌒⌒ ✨'], // mid-hop
      ],
      sleep: [['(\\_/)', '( -ᴥ- )', ' zzZ ']],
    },
  },

  slime: {
    name: { en: 'Slime', zh: '史莱姆', ja: 'スライム' },
    blurb: {
      en: 'gooey blob; squishes with joy',
      zh: '弹弹的史莱姆，会一缩一缩',
      ja: 'ぷるぷる、すぐ喜ぶ',
    },
    states: {
      idle: [
        [' ╭───╮', '( ˘ ᵕ ˘ )', ' ╰───╯'],
        ['  ╭─╮ ', '( ˘ ᵕ ˘ )', ' ╰───╯'], // squish
        [' ╭───╮', '( ˘ ‿ ˘ )', ' ╰───╯'],
      ],
      think: [
        [' ╭───╮', '( ·ᵕ· )?', ' ╰───╯'],
        [' ╭───╮', '( ·ᵕ· )', ' ╰───╯'],
      ],
      done: [
        [' ╭───╮', '( ˃ ᵕ ˂ )', ' ╰───╯ ✨'],
        [' ╭✦──╮', '( ˃ ᵕ ˂ )', ' ╰───╯ ✨'],
      ],
      sleep: [[' ╭───╮', '( ˘ ~ ˘ )', ' ╰───╯ z']],
    },
  },

  fox: {
    name: { en: 'Fox', zh: '狐狸', ja: '狐' },
    blurb: {
      en: 'sly; swishes its tail',
      zh: '狡黠机灵，会甩尾巴',
      ja: 'ずる賢く、しっぽを振る',
    },
    states: {
      idle: [
        ['▲     ▲', '( ◔ ω ◔ )', ' ╰─~──╯'],
        ['▲     ▲', '( - ω - )', ' ╰─~──╯'], // blink
        ['▲     ▲', '( ◔ ω ◔ )', ' ╰──~─╯'], // tail swish
      ],
      think: [
        ['▲     ▲', '( ◔ ω ◔ )?', ' ╰─~──╯'],
        ['▲     ▲', '( · ω · )', ' ╰─~──╯'],
      ],
      done: [
        ['▲  !  ▲', '( ◕ ω ◕ )', ' ╰─~──╯ ✨'],
        ['▲     ▲', '( ˃ ω ˂ )', ' ╰─~──╯ ✨'],
      ],
      sleep: [['▽     ▽', '( ˘ ω ˘ )', ' ╰─~──╯ z']],
    },
  },
};

export const DEFAULT_CHARACTER = 'shiba';

export function characterKeys() {
  return Object.keys(CHARACTERS);
}
