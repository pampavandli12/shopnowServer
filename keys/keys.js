/* ============ DB URL BASED ON ENVIRONMENT =================== */
module.exports =
  process.env.NODE_ENV == "dev"
    ? process.env.MONGODBDEV_URL
    : process.env.MONGODB_URL;
