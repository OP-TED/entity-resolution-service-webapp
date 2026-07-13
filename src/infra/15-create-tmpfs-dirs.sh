#!/bin/sh
# Create writable directories for read-only rootfs environments.
# Runs early (before 20-envsubst-on-templates.sh) to prepare paths.
# Required when /tmp is a tmpfs overlay (e.g., Fargate with readonlyRootFilesystem).

if [ -n "$NGINX_ENVSUBST_OUTPUT_DIR" ]; then
  mkdir -p "$NGINX_ENVSUBST_OUTPUT_DIR"
  echo "15-create-tmpfs-dirs.sh: created $NGINX_ENVSUBST_OUTPUT_DIR"
fi
