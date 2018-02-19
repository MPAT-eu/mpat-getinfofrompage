const fs = require('fs');

function packSite() {
  'use strict';
  let list = fs.readdirSync(".");
  list = list.filter(a => a.endsWith('.mpat-page')).map(a => a.substring(0, a.length-10));
  const all = list.indexOf('all-pages');
  if (all >= 0) list.splice(all, 1);
  const res = [];
  list.forEach((name, i) => {
    const obj = JSON.parse(fs.readFileSync(name+'.mpat-page'));
    console.log(">>> processing "+name);
    obj.clones = [];
    obj.page_links = [];
    obj.page.ID = i+1;
    obj.page.post_parent = "";
    obj.page.layoutId = obj.page_layout.ID = i+1+list.length;
    Object.keys(obj.page.meta.mpat_content.content).forEach((a) => {
      let component = obj.page.meta.mpat_content.content[a];
      Object.keys(component).forEach((s) => {
        let state = component[s];
        if (state.type === 'link') {
          if (state.data.url) {
            let url = state.data.url;
            if (url.startsWith('http://')) {
              if (url.endsWith('/#preview')) {
                url = url.substring(0, url.length-9);
              } else if (url.endsWith('/')) {
                url = url.substring(0, url.length-1);
              }
              url = url.substring(url.lastIndexOf('/')+1);
            }
            const i = list.indexOf(url);
            if (i >= 0) {
              console.log("lien "+url+" "+(i+1));
              state.data.url = "page://"+(i+1);
              obj.page_links.push({path: [a, s, 'data', 'url'], text: "page://"+(i+1), id:(i+1)})
            }
          }
        }
      })
    });
    res.push(obj)
  });
  return res;
}

fs.writeFileSync("all-pages.mpat-page", JSON.stringify(packSite(), 2));
