const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const redis = require("redis");
const axios = require("axios");

const client = redis.createClient(6379);
client.connect();
client.on("error", (error) => {
  console.log("redis error");
});

const apiMock = "https://jsonplaceholder.typicode.com/users";

app.get("/user", async (req, res) => {
  const { email } = req.query;
  try {
    const getRedis = await client.get(`${email}`);
    if (getRedis) {
      console.log("retrieve from redis");
      return res.status(200).json({
        result: JSON.parse(getRedis),
      });
    } else {
      const response = await axios.get(`${apiMock}?email=${email}`);
      await client.setEx(`${email}`, 60, JSON.stringify(response.data));
      console.log("set to redis");
      return res.status(200).json({
        result: response.data,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`app is listening at port`, port);
});
