import axios from "axios";
import cheerio = require("cheerio");
import path = require("path");
import { writeFileSync } from "fs";
import { book_data,node_data } from "../@types";
import { store } from "./store";

class Search {
    public origin_url : string;
    public part_search: string;
    public search_div : string;

    constructor () {
        // TODO 完善参数
        this.origin_url  = "https://www.bqg78.com";
        this.part_search = "/s?q=";
        this.search_div  = ".bookbox";
    }

    set_args (origin_url:string, part_search:string, search_div:string) {
        this.origin_url  = origin_url;
        this.part_search = part_search;
        this.search_div  = search_div;
    }

    get_HTML (url:string): Promise<string> {
        return new Promise ( (resolve) => {
            axios.get(url).then( (res) => {
                resolve(res.data);
            })
        });
    }

    html_match (html_p:Promise<string>, search_div:string): Promise<string[]> {
        return new Promise ( (resolve) => {
            html_p.then (html => {
                const $ = cheerio.load(html);
                let res:string[] = [];
                $(search_div).map( (i,element) => {
                    const div_html = $(element).html();
                    if (div_html) { res.push(div_html); }
                })
                resolve(res)
            })
        })
    }

    search_function (book_name:string, search_div:string): Promise<book_data[]>  {
        const search_url  =  `${this.origin_url}${this.part_search}`;
        const HTML = this.get_HTML(`${search_url}${encodeURI(book_name)}`);
        let search_list : book_data[] = []
    
        return new Promise ( (resolve) => {
            this.html_match(HTML,search_div).then (div_html => {
                // FIXME 如果搜索不到
                div_html.map ( (val,ind) => {
                    const $ = cheerio.load(val);
                    search_list.push({
                        book_name   : $(".bookname").text(),
                        book_author : $(".author").text().replace(/作者：/,""),
                        book_intro  : $(".uptime").text(),
                        bookimg_url : $(".bookimg a img").attr("src")!,
                        book_url    : $(".bookname a").attr("href")!
                    })
                })
                
                resolve(search_list);
            })
        })
    }

	meta_output (chapter_list_p:Promise<node_data[]>) {
        let book_json = JSON.parse('{}');
		chapter_list_p.then (
			res => {
				res.map ( (val,index) => {
					const chapter_group_id = Number(val.chapter_group);
					book_json[index] = val;
					book_json[index].chapter_group = `第${chapter_group_id*50}章-第${chapter_group_id*50+50}章`;
					book_json[index].chapter_path  = store.chapter_path(val.book_name,val.chapter_name);
				})
				writeFileSync(store.book_path(book_json["0"].book_name)["meta"],JSON.stringify(book_json,null,2),{encoding:"utf-8"});
			}
		)
	}

	get_catalogue (search_data: book_data) {
		const book_name = `${search_data.book_name}-${search_data.book_author}`;
		const book_url  = `${this.origin_url}${search_data.book_url}`;

		const chapter_list:Promise<node_data[]> = axios.get(book_url).then(res => {
			const chapter_list:node_data[] = [];
			const $ = cheerio.load(res.data);
			$("div.listmain dd a").map((item, a) => {
				if ($(a).attr("href")!.match(/book/g)){
					chapter_list.push({book_name    : book_name,
										chapter_name : $(a).text(),
										chapter_url  : `${this.origin_url}${$(a).attr("href")}`,
										chapter_id   : item});
				}
			})
			return chapter_list
		})
		// NOTE 处理chapter_group
		chapter_list.then(res => {
			let count = 0;
			res.map ((val,ind) => {
				if (val.chapter_id <= 50*(count+1)) {
					val.chapter_group = String(count);
				}
				else {
					count ++;
					val.chapter_group = String(count);
				}
			})
		})
		this.meta_output(chapter_list)
	}
}

export const search = new Search();
