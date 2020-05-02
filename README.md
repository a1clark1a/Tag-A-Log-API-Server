# Tag-A-Log - Server API

## LIVE APP:

- Tag-A-Log = - https://tag-a-log.now.sh/
- Tag-A-Log-API_Endpoint = https://arcane-ocean-61329.herokuapp.com/

## Summary

- A Node.js, Express and PostreSQL server API that handles CRUD requests for the Tag-A-Log app. This server utilizes RESTful API architecture, mocha, chai and supertest endpoints testing and validation, JWT and bcryptjs hashing authentication, XSS cross-site scripting sanitation, and Knex library for query building and database management.

## Tech Stack

- JavaScript ES6
- Node.js
- Express
- Mocha, Chai and Supertest
- PostgreSQL
- Morgan and Winston logger
- Knex
- XSS
- bcryptjs
- jsonwebtoken
- Treeize

## API-ENDPOINTS

### logs

- `/GET /api/logs`

- `/GET /api/logs/:logs_id`

- `/GET /api/logs/:logs_id/tags`

- `/POST /api/logs`

- `/DELETE /api/logs/:logs_id`

- `/PATCH /api/logs/:logs_id`

### users

- `/GET /api/users` -

- `/POST /api/users` - Request body needs a password, user_name, email

### tags

- `/GET /api/tags`

- `/GET /api/tags/:tags_id`

- `/GET /api/tags/:tags_id/logs`

- `/POST /api/tags`

- `/DELETE /api/tags/:tags_id`

- `/PATCH /api/tags/:tags_id`

### logs-tags relations

- `/GET /api/relations`

- `/GET /api/relations/:logs_id/:tags_id`

- `/POST /api/relations`

- `/DELETE /api/relations/:logs_id/:tags_id`

- `/PATCH /api/relations/:logs_id/:tags_id`

## In Development

- Optimize Database Query to minimize fetch request
- Handle Image and File uploads
