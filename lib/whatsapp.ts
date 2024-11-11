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
              id: "2762702990552401",
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
