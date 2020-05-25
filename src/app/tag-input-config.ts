import { TagInput } from "./tag-input";

const tag = new TagInput('#country', {
  option: {value: 'name', label: ''},
  chip:[
   {
      "name":"Ã…land Islands",
      "disabled":false,
      "code":"AX"
   },
   {
      "name":"Albania",
      "disabled":true,
      "code":"AL"
   }],
  output: (data: any) => {
  console.log(data);
  }
});

const httpReq = async (url: RequestInfo, methods: RequestInit) => {
const promise = fetch(url, methods);
const response = await promise;
const data = await response.json();
tag.data(data);
}
httpReq('http://www.mocky.io/v2/5ec9044b2f0000cd43db7101', { method: 'get'});
