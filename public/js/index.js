const socket = io();

const submit = document.getElementById("submit");
const subreddit = document.querySelector("#subreddit");
const roomId = document.querySelector("#roomId");
const username = document.querySelector("#username");

socket.on("connect", () => {
  submit.onclick = (e) => {
    console.log(e);
    e.preventDefault();

    socket.emit(
      "joinRoom",
      {
        username: username.value,
        room: roomId.value,
      },
      (data) => {
        if (data.nameAvailable) {
          // showMainScreen();
          document.body.innerHTML =
            '<h1> You are connected \n Start by requesting a meme</h1><input type="text" name="subreddit" id="subreddit" /><button onclick="reqMeme()">Request Meme</button>';
        } else {
          document.body.append("p").value = data.error;
        }
      }
    );
  };
});

socket.on("reqMeme", (data) => {
  console.log(data);
  showMainScreen(data);
});

function showMainScreen(data) {
  // console.log(data.subreddit);
  document.body.innerHTML += `
  <div>
  <input type="text" name="subreddit" id="subreddit" />
  <button onclick="reqMeme()">Request Meme</button>
  <h1>${data.subreddit}</h1>
  <a href="https://reddit.com/user/${data.author}"
    ><h2>u/${data.author}</h2></a
  >
  <h1>${data.title}</h1>
  <img src="${data.img}" alt="${data.title}" />
  <p>${data.ups}</p>
  </div>
`;
}

function reqMeme() {
  const subreddit = document.querySelector("#subreddit");

  // console.log(subreddit.value);
  socket.emit("reqMeme", subreddit.value);
}
