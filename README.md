Bank Account Manager
=====================

#### Install
```
$ cp .env.dist .env
$ npm install
$ apt install mongodb
```

#### Run

```
$ npm start
```

#### MongoDB
```
$ mongo
$ show dbs
$ use airbnbapi
$ show collections
$ db.users.find()
```

#### ApiDoc
```
$ npm run apidoc
```
Custom
```
$ node_modules/apidoc/bin/apidoc -i routes/ -o doc/
```