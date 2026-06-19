#!/bin/bash
# Prompet smoke test. Runs in a sandboxed $HOME with a fake `claude`, so it touches
# nothing real and burns no quota. Usage: bash scripts/smoke.sh
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
export HOME="$T"
export PATH="$T/bin:$PATH"

fail=0
pass() { echo "  ok   $1"; }
bad()  { echo "  FAIL $1"; fail=1; }

# Pipe a hook payload built with a single-quoted format (no quote escaping needed).
hook() { printf '{"prompt":"%s","model":"m","cwd":"%s"}' "$1" "$ROOT" | node src/cli.js hook; }

for f in src/*.js; do node --check "$f" || { echo "syntax FAIL: $f"; exit 1; }; done
echo "syntax: ok"

node src/cli.js init >/dev/null
SETTINGS="$HOME/.claude/settings.json"

grep -q statusLine "$SETTINGS" && pass "init wires statusline" || bad "init wires statusline"
[ "$(grep -c 'cli\.js.*hook"' "$SETTINGS")" = "1" ] && pass "init wires one hook" || bad "init wires one hook"

node src/cli.js init >/dev/null
[ "$(grep -c 'cli\.js.*hook"' "$SETTINGS")" = "1" ] && pass "re-init does not duplicate" || bad "re-init does not duplicate"

[ -z "$(hook yes)" ] && pass "trivial prompt passed through" || bad "trivial prompt passed through"
hook "make the login page" | grep -q additionalContext && pass "substantive -> additionalContext" || bad "substantive -> additionalContext"

node src/cli.js mode marker >/dev/null
[ -z "$(hook "make the login page")" ] && pass "marker mode ignores un-marked" || bad "marker mode ignores un-marked"
hook "pp make the login page" | grep -q additionalContext && pass "marker mode triggers on marker" || bad "marker mode triggers on marker"
node src/cli.js mode auto >/dev/null

echo '{}' | node src/cli.js statusline | grep -q Prompet && pass "statusline renders pet" || bad "statusline renders pet"

node src/cli.js lang zh >/dev/null
node src/cli.js help | grep -q "可爱桌宠" && pass "lang zh localizes help" || bad "lang zh localizes help"
node src/cli.js lang auto >/dev/null
LANG=ja_JP.UTF-8 node src/cli.js help | grep -q "ペット" && pass "auto-detects ja from \$LANG" || bad "auto-detects ja from \$LANG"
node src/cli.js lang en >/dev/null
node src/cli.js help | grep -q "cute pet" && pass "lang en help" || bad "lang en help"

node src/cli.js uninstall >/dev/null
grep -q statusLine "$SETTINGS" && bad "uninstall removes statusline" || pass "uninstall removes statusline"

rm -rf "$T"
if [ "$fail" = 0 ]; then echo "ALL PASS"; else echo "SOME FAILED"; exit 1; fi
