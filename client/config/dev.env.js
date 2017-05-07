module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  bind_host: "localhost",
  bind_port: "3000"
});