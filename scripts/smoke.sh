#!/bin/bash
# PetPrompt smoke test. Runs in a sandboxed $HOME with a fake `claude` and no-op clipboard
# tools, so it touches nothing real and burns no quota. Usage: bash scripts/smoke.sh
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

T="$(mktemp -d)"
mkdir -p "$T/bin"
cat > "$T/bin/claude" <<'EOF'
#!/bin/sh
echo "Refined demo prompt: implement the requested change with clear acceptance criteria."
EOF
chmod +x "$T/bin/claude"
# no-op clipboard tools so preview-mode tests don't clobber the real clipboard
for c in pbcopy clip wl-copy xclip xsel; do printf '#!/bin/sh\ncat >/dev/null\n' > "$T/bin/$c"; chmod +x "$T/bin/$c"; done
export HOME="$T"
export PATH="$T/bin:$PATH"

fail=0
pass() { echo "  ok   $1"; }
bad()  { echo "  FAIL $1"; fail=1; }
hook() { printf '{"prompt":"%s","model":"m","cwd":"%s"}' "$1" "$ROOT" | node src/cli.js hook; }
mode() { node src/cli.js mode "$1" >/dev/null; }

for f in src/*.js; do node --check "$f" || { echo "syntax FAIL: $f"; exit 1; }; done
echo "syntax: ok"

node src/cli.js init >/dev/null
SETTINGS="$HOME/.claude/settings.json"

grep -q statusLine "$SETTINGS" && pass "init wires statusline" || bad "init wires statusline"
[ "$(grep -c 'cli\.js.*hook"' "$SETTINGS")" = "1" ] && pass "init wires one hook" || bad "init wires one hook"
node src/cli.js config | grep -E '^[[:space:]]+mode' | grep -q preview && pass "default mode is preview" || bad "default mode is preview"
node src/cli.js init >/dev/null
[ "$(grep -c 'cli\.js.*hook"' "$SETTINGS")" = "1" ] && pass "re-init does not duplicate" || bad "re-init does not duplicate"

# preview mode (default): marker blocks the raw prompt and shows the rewrite
[ -z "$(hook "make the login page")" ] && pass "preview ignores un-marked" || bad "preview ignores un-marked"
hook "pp make the login page" | grep -q '"decision":"block"' && pass "preview blocks raw on marker" || bad "preview blocks raw on marker"
hook "pp make the login page" | grep -q 'Refined demo prompt' && pass "preview shows the rewrite" || bad "preview shows the rewrite"
[ -z "$(hook "ppfix the login page")" ] && pass "preview ignores 'ppfix' (no space, H2)" || bad "preview ignores 'ppfix' (no space, H2)"
node src/cli.js set marker '' >/dev/null 2>&1
[ -z "$(hook "a normal sentence not a command")" ] && pass "empty marker does not hijack (H3)" || bad "empty marker does not hijack (H3)"
node src/cli.js set marker 'pp ' >/dev/null 2>&1

# auto mode: inject as additionalContext, skip trivial
mode auto
[ -z "$(hook yes)" ] && pass "auto skips trivial" || bad "auto skips trivial"
hook "make the login page" | grep -q additionalContext && pass "auto injects additionalContext" || bad "auto injects additionalContext"
mode preview

# pet / character commands
node src/cli.js pet cat >/dev/null && node src/cli.js config | grep -E '^[[:space:]]+character' | grep -q cat && pass "pet selects character" || bad "pet selects character"
node src/cli.js pet nope 2>/dev/null && bad "pet rejects unknown character" || pass "pet rejects unknown character"
node src/cli.js pet | grep -q "PetPrompt characters" && pass "pet lists characters" || bad "pet lists characters"
node src/cli.js set minWords abc 2>/dev/null && bad "set rejects non-number (M1)" || pass "set rejects non-number (M1)"

# statusline renders the chosen character (multi-line)
echo '{"status":"idle","ts":0}' > "$HOME/.claude/petprompt/state.json"
echo '{}' | node src/cli.js statusline | grep -q PetPrompt && pass "statusline renders pet" || bad "statusline renders pet"
[ "$(echo '{}' | node src/cli.js statusline | wc -l | tr -d ' ')" -ge 1 ] && pass "statusline is multi-line" || bad "statusline is multi-line"

# i18n
node src/cli.js lang zh >/dev/null
node src/cli.js help | grep -q "可爱桌宠" && pass "lang zh localizes help" || bad "lang zh localizes help"
node src/cli.js lang auto >/dev/null
LANG=ja_JP.UTF-8 node src/cli.js help | grep -q "ペット" && pass "auto-detects ja from \$LANG" || bad "auto-detects ja from \$LANG"
node src/cli.js lang en >/dev/null

# H1: the 'think' state must actually render (status key matches pet.js)
echo '{"status":"think","ts":1}' > "$HOME/.claude/petprompt/state.json"
echo '{}' | node src/cli.js statusline | grep -q 'refining' && pass "think state renders (H1)" || bad "think state renders (H1)"

node src/cli.js uninstall >/dev/null
grep -q statusLine "$SETTINGS" && bad "uninstall removes statusline" || pass "uninstall removes statusline"

rm -rf "$T"
if [ "$fail" = 0 ]; then echo "ALL PASS"; else echo "SOME FAILED"; exit 1; fi
