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
    name: '柴犬 Shiba',
    blurb: 'loyal pup; wags its tail, ears flop when sleepy',
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
    name: '猫 Cat',
    blurb: 'aloof; flicks an ear, purrs when it cares',
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
    name: '兔子 Bunny',
    blurb: 'shy; ears perk up, hops when happy',
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
    name: '史莱姆 Slime',
    blurb: 'gooey blob; squishes, jiggles with joy',
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
    name: '狐狸 Fox',
    blurb: 'sly; sharp ears, swishes its tail',
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
