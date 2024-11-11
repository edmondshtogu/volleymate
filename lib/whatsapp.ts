import axios, { AxiosRequestConfig } from "axios";

const whatsapp = {
  startNewEvent: async (): Promise<void> => {
    const requestConfig: AxiosRequestConfig = {
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        // to: process.env.WHATSAPP_GROUP_ID,
        recipient_type: "individual",
        to: "355697748184",
        type: "interactive",
        interactive: {
          type: "button",
          header: {
            type: "image",
            image: {
              link: "https://scontent.whatsapp.net/v/t61.29466-34/465210699_1276700240134274_8954537288700425218_n.png?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=Tm92z77LNjoQ7kNvgGYXo1v&_nc_zt=3&_nc_ht=scontent.whatsapp.net&_nc_gid=AykfzBM6o7APsfpILoM8WbJ&oh=01_Q5AaIBZdDxzVcTm2gvKixKyjuf26bKgOFHURvwgbO57951wv&oe=675A15DC",
            },
          },
          body: {
            text: `*Help Us Capture Player Skills!*
To create balanced and competitive games, please take a moment to rate your skills (or your teammates’ skills) in each key area of play. Providing honest and thoughtful ratings will help us ensure fair team assignments and improve everyone’s experience on the court.

*Instructions:*
For each skill below, rate from 1 to 10 based on consistency, accuracy, power, and other qualities described. Feel free to skip any skills that don’t apply to you.

*Skill Categories:*
 • Serving
 • Passing
 • Setting
 • Hitting/Spiking
 • Blocking
 • Defense/Digging
 • Team Play
 • Athleticism`,
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "start-button",
                  title: "/start",
                },
              },
            ],
          },
        },
      },
    };

    await axios(requestConfig);
  },

  markMessageAsSeen: async (
    phoneNumberId: string,
    messageId: number
  ): Promise<void> => {
    const requestConfig: AxiosRequestConfig = {
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      },
    };

    await axios(requestConfig);
  },

  sendMessage: async (
    phoneNumberId: string,
    to: string,
    message: string,
    replyToMessageId?: number
  ): Promise<void> => {
    const requestConfig: AxiosRequestConfig = {
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: to,
        text: { body: message },
      },
    };

    if (replyToMessageId && replyToMessageId > 0) {
      requestConfig.data.context = {
        message_id: replyToMessageId,
      };
    }

    await axios(requestConfig);
  },
};

export default whatsapp;
