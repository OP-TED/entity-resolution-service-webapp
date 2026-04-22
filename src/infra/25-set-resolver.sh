#!/bin/sh
# Inject the system DNS resolver into the nginx config.
# Runs after 20-envsubst-on-templates.sh so the rendered config exists.
# Works on Docker (127.0.0.11), Fargate (VPC DNS), and bare metal.
RESOLVERS=$(awk '/^nameserver/{print $2}' /etc/resolv.conf | tr '\n' ' ' | sed 's/ *$//')
if [ -z "$RESOLVERS" ]; then
  RESOLVERS="127.0.0.11"
fi
sed -i "s/__RESOLVERS__/$RESOLVERS/g" /etc/nginx/conf.d/default.conf
echo "25-set-resolver.sh: resolver set to: $RESOLVERS"
