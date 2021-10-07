# Insomnia API collection for JupiterOne - Heroku Integration

## Installing Insomnia

You can navigate to <https://insomnia.rest/download> to install Insomnia, a REST
API client that JupiterOne developers use to test API endpoints during
integration development & troubleshooting.

## Importing this collection into Insomnia

In the Insomnia client, navigate to `Preferences > Data > Import Data` and
select `./docs/insomnia/collection.yaml`. See Insomnia docs for more
information: <https://docs.insomnia.rest/insomnia/import-export-data>

## Updating environment variables

In the Insomnia client, navigate to the collection you just imported, then
navigate to `No Environment > Manage Environments` (alternatively, you can
access environments using `command + e`). Update the environment variables with
valid credentials for this provider. See Insomnia docs for more information:
<https://docs.insomnia.rest/insomnia/environment-variables>

NOTE: Make sure you have access to valid integration credentials (see
`.env.example` for a list of required credentials).

## Exporting an updated collection from Insomnia

If you have created a new collection, or updated an existing collection, you can
export your collection by navigating to `Preferences > Data > Export Data`.
Please export the insomnia collection as **YAML** filetype. See Insomnia docs
for more information: <https://docs.insomnia.rest/insomnia/import-export-data>
