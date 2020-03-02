# Airlock

A very basic prototype of an Airlock system developed as part of an internship at the Garvin Institute of Medical Research (Kinghorn Centre for Clinical Genomics).

This is restricted to an extremely limited scope as only one component of a larger working demo for The GeneTrustee system.

## Scope

- Clincian (WIP)
  - Validate and confirm details (Done)
  - Retrieve consenting patient variants (Done)
  - Filter variants to potential causes based on the KCCG Orrery pipeline (Done)
- Researcher
  - Retrieve intentions mapped to DUO codes (Done)
  - Retrieve all Dynamic Consent users consenting to those intentions (Done)
  - Retrieve their samples from a GeneTrustee (Done, PoC only)
  - Retrieve and display statistics on number of variants, pathogenicity, type, etc (Done)
- Adherence to GH4GH DUO codes

Things such as authentication **are not present.** This is only a working Proof of Concept.

## Setup

This project was written mostly under the assumption of my specific machine, and as such, it probably will not work out of the box so to speak. Documentation pending.

There are three services to run this prototype - the frontend interface, a very basic GeneTrustee that is essentially just a join table of User ID and Sample ID, and a backend to execute the queries on Vectis/VEP.

For setup instructions of the frontend, refer to the readme in `airlock-interface`.
For setup instructions of the backend, refer to the readme in `airlock-backend`.
For setup instructions of the GeneTrustee, refer to the readme in `gene_trustee`.
