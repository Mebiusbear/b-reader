
import cheerio = require("cheerio")
import axios from "axios"

import * as vscode from 'vscode';
import fs = require("fs")
import {store} from "./store"
import path = require("path");

import { NovelUrl,
        NovelText,
        search_data,
        node_data} from "../@types"

// const got = require("got")


export function searchOn_bqg (bookname : string): Promise<search_data[]> {
    const bqg_url:string = "https://www.bqg78.com"
    return new Promise ((resolve) => {
        axios.get(`${bqg_url}/s?q=${bookname}`).then(res => {
            console.log(res);
            let search_list : search_data[] = []
            const $ = cheerio.load(res.data)
            $(".bookbox").map((i,a) => {
                const $_bookinfo = cheerio.load(String($(a).html()))
                search_list.push({
                    bookname : $_bookinfo(".bookname").text(),
                    author : $_bookinfo(".author").text().replace(/作者：/g,""),
                    uptime : $_bookinfo(".uptime").text(),
                    bookimg_url : bqg_url + $_bookinfo(".bookimg a img").attr("src")!,
                    book_url : bqg_url + $_bookinfo(".bookname a").attr("href")!,
                })
            })
            resolve(search_list)
        })
    })
}

interface chapter_d {
    sortId?: number,
    name : string,
    urls : string
}

export const searchOnline_bqg = async function (book_data:search_data) {
    const book_name = `${book_data.bookname}-${book_data.author}`
    const bqg_url:string = "https://www.bqg78.com";
    let chapter_list: chapter_d[] = [];

    axios.get(book_data.book_url).then(res => {
        console.log(res);
        const $ = cheerio.load(res.data)
        $("div.listmain dd a").map((item, a) => {
            if ($(a).attr("href")!.match(/book/g)){
                chapter_list.push({name:$(a).text(),
                    urls: bqg_url + $(a).attr("href") as string})
            }
        })

        const total_count:number =  Math.floor(chapter_list.length / 50);
        let book_json = JSON.parse('{}');
        let count:number = 0;
        while (count < total_count) {
            const group_name = `第${count*50+1}章-第${(count+1)*50}章`;
            let ccount = count * 50;

            while (ccount < (count+1)*50) {
                let chapter_name = chapter_list[ccount].name;
                let chapter_path = path.join(store.book_path(book_name)["content"],`${chapter_name}.txt`);

                const chapter_json:node_data = {book_name    : book_name,
                                                chapter_name : chapter_name,
                                                chapter_path : chapter_path,
                                                chapter_url  : chapter_list[ccount].urls,
                                                chapter_group: group_name,
                                                chapter_id   : ccount};
                book_json[ccount] = chapter_json;
                ccount ++ ;
            }
            count ++;
        }
        if (total_count*50 != chapter_list.length) {
            const group_name = `第${count*50+1}章-第${(count+1)*50}章`;
            let ccount = count * 50;

            while (ccount < chapter_list.length) {
                let chapter_name = chapter_list[ccount].name;
                let chapter_path = path.join(store.book_path(book_name)["content"],`${chapter_name}.txt`);
                
                const chapter_json:node_data = {book_name    : book_name,
                                                chapter_name : chapter_name,
                                                chapter_path : chapter_path,
                                                chapter_url  : chapter_list[ccount].urls,
                                                chapter_group: group_name,
                                                chapter_id   : ccount};
                book_json[ccount] = chapter_json;
                ccount ++ ;
            }
            count ++;   
        }
        fs.writeFileSync(store.book_path(book_name)["meta"],
                        JSON.stringify(book_json,null,2),
                        {encoding:'utf-8'});
    })
    return new Promise(resolve=>setTimeout(resolve, 1000));
}

export const Sleep = (ms:number)=> {
    return new Promise(resolve=>setTimeout(resolve, ms));
}

export const downloadOnline_bqg = async function (book_data:search_data) {
    const book_path_root = store.book_path(`${book_data.bookname}-${book_data.author}`)
    const book_meta_json = JSON.parse(fs.readFileSync(book_path_root["meta"],{encoding:"utf-8"}))
    async function run_list() {
        for (let i in book_meta_json) {
            const chapter_json:node_data = book_meta_json[i]

            axios.get(chapter_json.chapter_url).then(res => {
                const $ = cheerio.load(res.data);
                let chapter_content = $("#chaptercontent").html()!;
                chapter_content     = chapter_content.replace(/<br><br>/g,"\n");
                chapter_content     = chapter_content.replace(/(<p.*?p>)/g,"");
                fs.writeFileSync(chapter_json.chapter_path,chapter_content,{encoding:"utf-8"});
            }).catch(error => {
                let chapter_path = path.join(store.book_path(`${book_data.bookname}-${book_data.author}`)["error_chapter"],`${chapter_json.chapter_name}.txt`)
                fs.writeFileSync(chapter_path,"",{encoding:"utf-8"}); // meta加判定
            })
            await Sleep(300);
            }
        return new Promise(resolve=>setTimeout(resolve, 1000))
    }
    run_list().then(res =>{
        console.log("download finish");
    }) // 为了统计下载失败章节
    return new Promise(resolve=>setTimeout(resolve, 1000))
}


export const searchOnline = async function () {
	const msg = await vscode.window.showInputBox({
		value: 'https://www.bqg78.com/book/111576',
		valueSelection: [27, 33],
		placeHolder: 'For example: https://www.bqg78.com/book/2345',
		validateInput: text => {
            let flag:boolean = true;
			vscode.window.showInformationMessage(`Validating: ${text}`);
            if (text.match(/https\:\/\/www\.bqg78\.com\/book/)) { flag = false }
			return flag ? 'Just https://www.bqg78.com/book/{...} !' : null;
        }
	});
    let chapter_list: chapter_d[] = []
    axios.get(msg as string).then(res => {
        console.log(res);
        const $ = cheerio.load(res.data)
        $("dd a").map((item, a) => {
            if ($(a).attr("href")!.match(/book/g)){
                chapter_list.push({name:$(a).text(),urls:$(a).attr("href") as string})
            }
        })
        chapter_list.forEach((item,index) => item.sortId = index+1)
        fs.writeFileSync(store.book_path("test")["meta"],
                        JSON.stringify(chapter_list,null,2),
                        {encoding:'utf-8'})
    })
    // console.log(msg);
};


class Online_novel {
    public chapters_text: NovelText[] = []
    // public search_url = "http://www.xhytd.com"
    public search_url = "https://www.bqg78.com"
    public url = ""

	async set_url(url:string){
		this.url = url
	}

    async getHTML(url: string) {
        const HTML = "1"
        console.log(HTML)
        return HTML
    }

    async getNovelUrl(novel_url: string=this.url) {
        const chapters_list: NovelUrl[] = []
        console.log(novel_url)
        const html = await this.getHTML(novel_url)
        const $ = cheerio.load(html)
        $("dd a").map((i,a) => {
            const origin_url: string = String($(a).attr("href"))
            console.log(origin_url)
            const title: string = $(a).text()
            const url: string = this.search_url + origin_url
			chapters_list.push({title, url});
        })
        // console.log(chapters_list)
        return chapters_list
    }

    async getNovelText(chapter_url: string) {
        const html = await this.getHTML(chapter_url)

        const $ = cheerio.load(html)
        const re_br = /<br>/gi
        const re_space = /&nbsp;/gi

        var text = String($("#content").html())
        text = text.replace(re_br,"\n")
        text = text.replace(re_space,"  ")
        return text
    }

}



export {Online_novel}