<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Nest - IP Tracker - RESTful API

_This is a nestJs project wich exposes two resources:_

- /traces: This endpoint receive, via HTTP POST, an IP address in the format 100.100.100.100, and return information associated with that IP address.
- /statistics: This endpoint, via HTTP GET, returns the longest distance to USA from requested traces and the most traced country.

## Starting ▶️

The following instructions will allow you to get a working copy of the project on your local machine for development and testing purposes.

### Installation ⚙️

- Run `npm install` to install all dependencies.
- Have Nest CLI installed.
- Have Docker installed and a Mongo image.
- Run `docker-compose up -d` to setup Database.
- Run `npm run build` and `npm run start` to run the app locally.
- You can find the project running on `localhost:8080`.

### Testing 🧪

Run `npm run test` to execute unit tests.

### Deployment 🚀

Run `npm run build` and `npm run start:prod` to run the app in production mode.

## Stack and services used 🛠️

- NestJs.
- Typescript: For handling data types.
- MongoDB: For persisting data.
- IpApi: To get information about the IP address (https://ip-api.com/docs).
- CurrencyApi: To get information about the currency (https://currencyapi.com/docs).

## General considerations 📖

### General Info

- For the development of the project, I have designed a layered structure, in order to obtain advantages such as separation of responsibilities, greater scalability, code reuse, among others.
- To meet this need, I structured the project as follows:
  - src:
    - config
    - controllers
    - filters
    - middlewares
    - models
    - modules
    - services
    - utils
    - app.module.ts
    - main.ts
  - test

### Config

I grouped by functionality the environment variables, in different Nest configuration files.

### Controllers

Separation by controller functionality.

### Filters

- I have developed an Exception Filters, in order to handle all the exceptions and errors that occur in the app.
- In this filters I have applied logic to build the error responses in a generic way, returning always the same error object, independently of the exception or error that occurs in the app. The response object provides two more friendly properties that can be useful for the user (statusCode, message) and an error prop, which is another object (code, stack, timestamp) that would be useful for the developer.
- This filter is responsible for logging in error mode.
- This filter is applied globally in the app.module.ts.

### Middlewares

- I have developed a middleware that allows to configure the CORS origins enabled to be able to request to the app.
- The allowed origins can be configured in the WHITE_LIST_ORIGIN environment variable, which is an array with an asterisk to allow all origins, or you can set different addresses that you want to prevent by CORS.
- It is applied globally in the app.module.ts for all application routes.

### Models

In this folder, separate the dtos, entities, mongo schemas and documents, and typescript types.

### Modules

- I developed separate modules for each functionality, so that they can be easily reused if needed, and at the same time I developed a custom module for handling http requests.
- This customHttpModule.ts module allows to configure for the http module of Nest and Axios, the timeOut and the maximum amount of redirects before throwing an exception.
- These variables are configurable from the environment variables: HTTP_TIMEOUT and HTTP_MAX_REDIRECTS.
- This module is imported into the traces.module.ts, which performs http requests to the ip-api and currency services.

### Services

In this folder separate the different services by functionality.

### Utils

- In that folder I developed two injectable classes, so that they can be easily reused by dependency injection, where necessary.
- distanceToUsa.ts is used to calculate the distance to USA from a latitude and longitude sent by parameter.
- formatter.ts is used to capitalize a string sent by parameter.

### Log Management

I use the Logger provided by Nest, but by means of an environment variable I can manage the log level according to the different log hierarchies (LOGGER_LEVEL variable).

### Data Model

- I use mongoDB to persist the data of each request to /traces, so that it serves to build the response of /statistics.
- In this model I store a document for each request.
- Each document has the properties regionName, city, country and distanceToUsa.

### Swagger

By making a request to /api-docs path, I exposed the corresponding swagger with the complete information of both endpoints.

### Cache Management

- In order to make a more performant api I have implemented the use of a cache.
- I use the cache provided by Nest, but two separate instances, one for the traces module and another for the statistics module, so that I can use environment variables to handle different ttl and maximum number of records (TRACES_CACHE_TTL, TRACES_CACHE_MAX_REG, STATISTICS_CACHE_TTL and STATISTICS_CACHE_MAX_REG).
- Caching logic applied for the /traces endpoint: If ip is found in cache, I respond from cache, looking for record by ip (saving call to ip-api service, currencies, latest and distance_to_usa function). If the record is not found, I search in the cache for the currency (since it can be a different ip, but with the same currency, and I save the call to the currencies and latest services). And finally I search in the cache by location, the distance to USA, since it can be a different ip of the same region (saving call to the function that calculates the distance to USA).
- Caching logic applied for the endpoint /statistics: In this case I use the cache to always respond from the cache during the time set in STATISTICS_CACHE_TTL. Once it is fulfilled, the next request will cache again the result, and during the set time it will respond again from the cache.

### Improvements proposed

- Use a more robust cache like redis for example.
- Use a more powerful logging tool like winston for example.
- Cover all the unit tests for each project file.
- Perform e2e testing.
- Handling jwt for secure authentication.
- Perform a correct backup and maintenance of the data model.
- Deploy the application in two different clusters and use a load balancer.

## Author ✒️

- Romano, Rodrigo Ruben - Information systems engineer.

## Contact 📋

- [LinkedIn](https://www.linkedin.com/in/rodrigo-ruben-romano/)
- [Mail](mailto:romano.rodrigo19@gmail.com)
