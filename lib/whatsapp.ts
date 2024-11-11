import axios, { AxiosRequestConfig } from "axios";

const whatsapp = {
  startNewEvent: async (): Promise<void> => {
    const requestConfig: AxiosRequestConfig = {
      method: "POST",
      url: `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: "355697748184", 
        // to: process.env.WHATSAPP_GROUP_ID, 
        type: "template",
        template: {
          name: "skills_registration",
          language: {
            code: "en_US",
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
      url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
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
      url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
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
