export interface User {
  id: number;
  img?: string;
  title: string;
  info: {
    username?: string;
    fullname?: string;
    email?: string;
    status?: string;
    verified?: boolean;
  };
  chart?: {
    dataKeys: { name: string; color: string }[];
    data: object[];
  };
  activities?: { time: string; text: string }[];
}

export const userRows: User[] = [
  {
    id: 1,
    title: "John Doe",
    img: "https://images.pexels.com/photos/17397364/pexels-photo-17397364.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
    info: {
      username: "Johndoe99",
      fullname: "John Doe",
      email: "johndoe@gmail.com",
      status: "verified",
    },
    chart: {
      dataKeys: [
        { name: "visits", color: "#82ca9d" },
        { name: "clicks", color: "#8884d8" },
      ],
      data: [
        { name: "Sun", visits: 4000, clicks: 2400 },
        { name: "Mon", visits: 3000, clicks: 1398 },
        { name: "Tue", visits: 2000, clicks: 3800 },
        { name: "Wed", visits: 2780, clicks: 3908 },
        { name: "Thu", visits: 1890, clicks: 4800 },
        { name: "Fri", visits: 2390, clicks: 3800 },
        { name: "Sat", visits: 3490, clicks: 4300 },
      ],
    },
    activities: [
      {
        text: "John Doe purchased Playstation 5 Digital Edition",
        time: "3 day ago",
      },
      {
        text: "John Doe added 3 items into their wishlist",
        time: "1 week ago",
      },
      { text: "John Doe purchased Sony Bravia KD-32w800", time: "2 weeks ago" },
      { text: "John Doe reviewed a product", time: "1 month ago" },
      {
        text: "John Doe added 1 item into their wishlist",
        time: "1 month ago",
      },
    ],
  },
  {
    id: 2,
    title: "Stella Manning",
    img: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Manning",
      fullname: "Stella Manning",
      email: "comhuhmit@gmail.com",
      status: "verified",
    },
  },
  {
    id: 3,
    title: "Mary Greer",
    img: "https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Greer",
      fullname: "Mary Greer",
      email: "ujudokon@hottmail.com",
      status: "verified",
    },
  },
  {
    id: 4,
    title: "Mildred Williamson",
    img: "https://images.pexels.com/photos/871495/pexels-photo-871495.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Williamson",
      fullname: "Mildred Williamson",
      email: "tinhavabe@gmail.com",
      status: "verified",
    },
  },
  {
    id: 5,
    title: "Jose Gross",
    img: "https://images.pexels.com/photos/1758144/pexels-photo-1758144.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Gross",
      fullname: "Jose Gross",
      email: "gobtagbes@yahoo.com",
    },
  },
  {
    id: 6,
    title: "Jeremy Sharp",
    img: "https://images.pexels.com/photos/769745/pexels-photo-769745.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Sharp",
      fullname: "Jeremy Sharp",
      email: "vulca.eder@mail.com",
      status: "verified",
    },
  },
  {
    id: 7,
    title: "Christina Lowe",
    img: "https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Lowe",
      fullname: "Christina Lowe",
      email: "reso.bilic@gmail.com",
    },
  },
  {
    id: 8,
    title: "Garrett Dean",
    img: "https://images.pexels.com/photos/428364/pexels-photo-428364.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Dean",
      fullname: "Garrett Dean",
      email: "codaic@mail.com",
      status: "verified",
    },
  },
  {
    id: 9,
    title: "Leah Parsons",
    img: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Parsons",
      fullname: "Leah Parsons",
      email: "uzozor@gmail.com",
    },
  },
  {
    id: 10,
    title: "Elnora Reid",
    img: "https://images.pexels.com/photos/775358/pexels-photo-775358.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Reid",
      fullname: "Elnora Reid",
      email: "tuhkabapu@gmail.com",
      status: "verified",
    },
  },
  {
    id: 11,
    title: "Gertrude Dunn",
    img: "https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Dunn",
      fullname: "Gertrude Dunn",
      email: "gibo@gmail.com",
      status: "verified",
    },
  },
  {
    id: 12,
    title: "Mark Williams",
    img: "https://images.pexels.com/photos/774095/pexels-photo-774095.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Williams",
      fullname: "Mark Williams",
      email: "tic.harvey@hotmail.com",
    },
  },
  {
    id: 13,
    title: "Charlotte Cruz",
    img: "https://images.pexels.com/photos/761977/pexels-photo-761977.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Cruz",
      fullname: "Charlotte Cruz",
      email: "ceuc@gmail.com",
    },
  },
  {
    id: 14,
    title: "Sara Harper",
    img: "https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=1600",
    info: {
      username: "Harper",
      fullname: "Sara Harper",
      email: "bafuv@hotmail.com",
    },
  },
  {
    id: 15,
    title: "Eric Griffin",
    img: "https://images.pexels.com/photos/8405873/pexels-photo-8405873.jpeg?auto=compress&cs=tinysrgb&w=1600&lazy=load",
    info: {
      username: "Griffin",
      fullname: "Eric Griffin",
      email: "ubi@gmail.com",
    },
  },
];
