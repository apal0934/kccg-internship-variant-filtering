# Airlock

A very basic prototype of an Airlock system developed as part of an internship at the Garvin Institute of Medical Research (Kinghorn Centre for Clinical Genomics).

This is restricted to an extremely limited scope as only one component of a larger working demo for The GeneTrustee system.

## Scope

- Clincian (WIP)
  - Validate and confirm details (Done)
  - Retrieve consenting patient variants (Done)
  - Retrieve relatives for trio analysis (WIP)
  - Filter variants to potential causes based on the KCCG Orrery pipeline (WIP)
- Researcher
  - Retrieve intentions mapped to DUO codes (Done)
  - Retrieve all Dynamic Consent users consenting to those intentions (Done)
  - Retrieve their samples from a GeneTrustee (Done, PoC only)
  - Retrieve and display statistics on number of variants, pathogenicity, type, etc (Done)
- Adherence to GH4GH DUO codes

Things such as authentication **are not present.** Additionally, no security has been implemented for leakage of data in the middle of requests.

## Setup

This project was written mostly using WSL 2. It assumes the LAN IP address to be that of my WSL 2 system for requests and networking in general, and those have been hardcoded as - at the moment - it's only intended to run on my machine. You can change this through the `API_IP` variable in `App.js`.

There are two services to run this prototype - the frontend interface, and a very basic GeneTrustee that is essentially just a join table of User ID and Sample ID.

For setup instructions of the frontend, refer to the readme in `airlock-interface`.
For setup instructions of the GeneTrustee, refer to the readme in `gene_trustee`.
