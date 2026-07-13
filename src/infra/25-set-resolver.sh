#!/bin/sh
# Inject the system DNS resolver into the nginx config.
# Runs after 20-envsubst-on-templates.sh so the rendered config exists.
# Works on Docker (127.0.0.11), Fargate (VPC DNS), and bare metal.
RESOLVERS=$(awk '/^nameserver/{print $2}' /etc/resolv.conf | tr '\n' ' ' | sed 's/ *$//')
if [ -z "$RESOLVERS" ]; then
  RESOLVERS="127.0.0.11"
fi
# nginx-main.conf includes /tmp/nginx/*.conf; keep resolver injection aligned with that output dir.
CONF_DIR="${NGINX_ENVSUBST_OUTPUT_DIR:-/tmp/nginx}"
CONF_FILE="$CONF_DIR/default.conf"

if [ ! -f "$CONF_FILE" ]; then
  echo "25-set-resolver.sh: expected rendered config at $CONF_FILE but it does not exist" >&2
  exit 1
fi

sed -i "s/__RESOLVERS__/$RESOLVERS/g" "$CONF_FILE"
echo "25-set-resolver.sh: resolver set to: $RESOLVERS (in $CONF_FILE)"
