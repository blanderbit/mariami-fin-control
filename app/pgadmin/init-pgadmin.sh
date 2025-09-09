#!/bin/bash

# Wait for pgAdmin to start
sleep 10

# Set proper permissions for pgpass file
chmod 600 /pgpass

# Import server configuration
if [ -f /pgadmin4/servers.json ]; then
    python /pgadmin4/setup.py --load-servers /pgadmin4/servers.json --user admin@gmail.com
fi
