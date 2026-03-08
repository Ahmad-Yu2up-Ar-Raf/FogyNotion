export interface ArticleTypeResponse {
  status: string;
  feed: Feed;
  items: Item[];
}

export interface Feed {
  url: string;
  title: string;
  link: string;
  author: string;
  description: string;
  image: string;
}

export interface Item {
  title: string;
  pubDate: Date;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure: Enclosure;
  categories: Category[];
}

export enum Category {
  Dunia = 'Dunia',
  FilantropiKhazanah = 'Filantropi Khazanah',
  IslamNusantara = 'Islam Nusantara',
}

export interface Enclosure {
  link: string;
}
