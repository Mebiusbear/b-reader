export interface NovelUrl {
    title: string,
    url: string,
}

export interface NovelText {
    title: string,
    text: string,
}

export interface search_data {
	bookname : string,
	author : string,
	uptime : string,
	bookimg_url : string,
	book_url: string,
}

export interface node_data {
	book_name    : string,
	chapter_name : string,
	chapter_path : string,
	chapter_url  : string,
    chapter_group: string,
	chapter_id   : number,
}