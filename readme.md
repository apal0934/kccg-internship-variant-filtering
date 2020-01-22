# Airlock

A very basic prototype of an Airlock system developed as part of an internship at the Garvin Institute of Medical Research (KCCG).

This is restricted to an extremely limited scope as only one component of a larger working demo for The GeneTrustee system.

## Scope

- Clincian (WIP)
  - Retrieve consenting patient variants
- Researcher (WIP)
  - Retrieve number of matching & consenting samples
- Adherence to GH4GH DUO codes (WIP)

## Setup

This project was written mostly using WSL 2. It assumes the LAN IP address to be that of my WSL 2 system for requests and networking in general, and those have been hardcoded as - at the moment - it's only intended to run on my machine. You can change this through the `API_IP` variable in `App.js`

For setup instructions, refer to the readme in `airlock-interface`.
