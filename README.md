# Floogar

*NOTE: this project is in ultra-alpha mode*.

**Floogar** is a platform for developing online interactive experiences, [*hence forth and forever known—inline with video and audio nomenclature—as a "Floogar."*](https://medium.com/@arxpoetica/a-new-mythology-6ab0aaad0f37)

## Development

After doing database setup below, run the app with `sapper dev.`

### ArangoDB Setup

To install:

```bash
brew install arangodb
```

To run:

```bash
/usr/local/opt/arangodb/sbin/arangod
```

To initialize a database, run the following script:

```bash
yarn run db:init
```

Once running, a user friendly gui can be reached at http://localhost:8529/. (username: 'root', password: '')

### ArangoDB Migrations

First time migration:

```bash
/usr/local/opt/arangodb/sbin/arangod
```
