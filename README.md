# Blizzbot

### A Discord bot developed for Content Creator [Blizzor](https://blizzor.de)

This bot is capable of handling [Discord](https://discord.com) features.

# Installation

Prequisites:

> This bot runs on [bun](https://bun.sh) and uses the Discord.js library. It uses a Postgresql database as a back-end.

It requires the following:

- `git` command line ([Windows](https://git-scm.com/download/win)|[Linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)|[MacOS](https://git-scm.com/download/mac)) installed
- Bun
- A Postgres instance. The installation for Windows and MacOS is found at [Installation Guide](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads), for Linux use your package manager.
<details>
<summary>example for Debian+Ubuntu</summary>

```zsh
# Create the file repository configuration:
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

# Import the repository signing key:
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -

# Update the package lists:
sudo apt-get update

# Install the latest version of PostgreSQL.
# If you want a specific version, use 'postgresql-12' or similar instead of 'postgresql':
sudo apt-get -y install postgresql
```

</details>

# Installation

You can install the bot using

```sh
npm install
```

To start the bot use

```sh
bun src/blizzbot.ts
```

or

```sh
bun start
```
