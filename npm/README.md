# Metric Mongrel Client NPM Packages

This directory contains all the NPM packages for the Metric Mongrel project.

#### Environment Variables

The following environment variables are required to run the Metric Mongrel client.

- `MM_API_KEY`: The API key for the Metric Mongrel API. This is required to send data to the Metric Mongrel API.

The followig environment variables are optional.

- `MM_BASE_URL`: The base URL for the Metric Mongrel API. This is required to send data to the Metric Mongrel API.

#### Configuration

There are multiple ways to use MM. Please follow the instructions relevent to what you'd like to setup.

##### Express Middleware

First make sure you have setup your httpContext middleware. This should be at the towards the top of your middleware stack, **before authentication**.

```ts
/**
 * HTTP Context middlware
 */
app.use(httpContext.middleware);
```

Then you can use the `mmExpressMiddleware` middleware.

```ts
/**
 * Metric Mongrel middleware
 */
app.use(ErrorRequestHandler);
```
