# GeneTrustee

Note: this is barely an implementation of the official GeneTrustee paper published in 2003 (Burnett, L.) and ratified by the Australian Law Reform Comittee in 2008.

It is nothing more than a table with a User ID and a Sample ID and an API to retrieve one given the other.

It is merely proof of concept at the most basic level.

## Setup

```sh
# Install dependancies
pipenv install

# Run server
uvicorn gene_trustee.main:app --port 7000
```

Run from root of repo. Port 7000 is assumed in the frontend code, you will have to change it there as well.
