# /bin/sh

DOMAIN='microbiomes.chevalvert.fr'
BROWSER='Google Chrome'
URL='screen/1'

# Kill all previously opened browsers
for i in {1..2}; do pkill -9 -o $BROWSER; done

# Wait for available connection
DELAY=3
while ! ping -c 1 -n -W 1 "$DOMAIN" &> /dev/null; do
  echo "Cannot reach $DOMAIN, next try in $DELAY seconds…"
  sleep $DELAY
done

open "https://$DOMAIN/$URL" -n -a "$BROWSER" --args --window-position=0,0 --app --disable-features=Translate --no-first-run --kiosk
