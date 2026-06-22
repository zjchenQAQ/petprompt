# Record the README GIF from PetPrompt's built-in demo.
#   brew install vhs        # one-time (https://github.com/charmbracelet/vhs)
#   vhs assets/demo.tape    # run from the repo root -> writes assets/demo.gif
#
# The demo is fully scripted (no claude, no network), so the GIF is deterministic.

Output assets/demo.gif

Require node

Set Shell "bash"
Set FontSize 18
Set Width 1240
Set Height 680
Set Padding 28
Set Theme "Dracula"

Hide
Type "node src/cli.js demo"
Enter
Sleep 600ms
Show
Sleep 12s
