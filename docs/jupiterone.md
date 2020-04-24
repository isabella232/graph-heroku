# Integration with JupiterOne

## Setup

Follow the steps in `docs/development.md` to create an API key and begin using
the
[Heroku Rest API](https://devcenter.heroku.com/articles/platform-api-reference)

## Data Model

### Entities

The following entity resources are ingested when the integration runs.

| Resources           | \_type of the Entity    | \_class of the Entity |
| ------------------- | ----------------------- | --------------------- |
| Enterprise Accounts | `heroku_account`        | `Account`             |
| Team                | `heroku_team`           | `Team`                |
| User                | `heroku_account_member` | `User`                |
| Application         | `heroku_application`    | `Application`         |

### Relationships

| From             | Edge    | To                      |
| ---------------- | ------- | ----------------------- |
| `heroku_account` | **HAS** | `heroku_team`           |
| `heroku_account` | **HAS** | `heroku_account_member` |
| `heroku_team`    | **HAS** | `heroku_account_member` |
