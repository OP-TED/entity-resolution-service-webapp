#!/bin/sh
# Inject the system DNS resolver into the nginx config.
# Runs after 20-envsubst-on-templates.sh so the rendered config exists.
# Works on Docker (127.0.0.11), Fargate (VPC DNS), and bare metal.
#
# Only link-local resolvers are used (127.0.0.x, 169.254.x.x) — these are the
# service-discovery resolvers in Docker (embedded DNS) and AWS Fargate (VPC DNS).
# Corporate/on-prem DNS servers from resolv.conf don't know about Cloud Map
# private namespaces or Docker service names, and nginx round-robins between
# all resolvers in the directive, causing intermittent 502s.
RESOLVERS=$(awk '/^nameserver/{print $2}' /etc/resolv.conf | grep -E '^(127\.|169\.254\.)' | tr '\n' ' ' | sed 's/ *$//')
if [ -z "$RESOLVERS" ]; then
  # Fallback: first nameserver if no link-local found
  RESOLVERS=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf)
fi
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
