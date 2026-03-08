export interface SurahResponse {
    code:    number;
    message: string;
    data:    Datum[];
}

export interface Datum {
    nomor:       number;
    nama:        string;
    namaLatin:   string;
    jumlahAyat:  number;
    tempatTurun: TempatTurun;
    arti:        string;
    deskripsi:   string;
    audioFull:   { [key: string]: string };
}

export enum TempatTurun {
    Madinah = "Madinah",
    Mekah = "Mekah",
}
