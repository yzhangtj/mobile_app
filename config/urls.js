// REPLACE WITH YOUR BACKEND DOMAIN NAME
const domain = "capstone80.eastus.cloudapp.azure.com";
//const domain = "192.168.1.88"

export const backend = {
  sock_domain: "ws://" + domain + ":6000",
  http_domain: "http://" + domain + ":3000",
};
