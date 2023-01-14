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

export interface book_data {
	book_name : string,
	book_author : string,
	book_intro : string,
	bookimg_url : string,
	book_url: string,
}


export interface node_data {
	book_name     : string,
	chapter_name  : string,
	chapter_url   : string,
	chapter_id    : number,
	chapter_path?  : string,
    chapter_group? : string,
	chapter_exist? : boolean
}