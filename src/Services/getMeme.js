const axios = require("axios");

const data = [];
const fetchMeme = async (subreddit, room) => {
  await axios
    .get(`https://meme-api.herokuapp.com/gimme/${subreddit}`)
    .then((e) =>
      data.push({
        room: room,
        results: {
          postLink: e.data.postLink,
          subreddit: e.data.subreddit,
          title: e.data.title,
          img: e.data.url,
          author: e.data.author,
          ups: e.data.ups,
        },
      })
    )
    .catch((err) => {
      return data.push({
        error: true,
        message: "there's no such subreddit",
      });
    });
  return data;
};
const getMeme = (room) => {
  const filteredData = data.filter((o) => o.room === room);
  return filteredData;
};
module.exports = { fetchMeme, getMeme };
