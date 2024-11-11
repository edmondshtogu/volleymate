import axios, {AxiosRequestConfig} from "axios";

// Send message back to WhatsApp via Meta API
export async function sendMessage(
  phoneNumberId: string,
  to: string,
  message: string,
  replyToMessageId?: number
) {
  const requestConfig: AxiosRequestConfig = {
    method: "POST",
    url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
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
}

export async function markMessageAsSeen(
  phoneNumberId: string,
  messageId: number
) {
  const requestConfig: AxiosRequestConfig = {
    method: "POST",
    url: `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
    },
    data: {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    },
  };

  await axios(requestConfig);
}
