import { TagInput } from "./tag-input";

const tag = new TagInput('#country', {
  option: {value: 'name', label: ''},
  chip:[
   {
      "name":"Ã…land Islands",
      "active":false,
      "code":"AX"
   },
   {
      "name":"Albania",
      "active":true,
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
httpReq('http://www.mocky.io/v2/5ecbbd6c30000001acddd881', { method: 'get'});
