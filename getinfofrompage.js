const afterLoad = require('after-load');
const jsdom = require('jsdom');
const fs = require('fs');

function processHtml(html) {
  const exportName = process.argv[3] || 'export';
  const { JSDOM } = jsdom;
  const document = new JSDOM(html).window.document;
  const scripts = document.getElementsByTagName('script');
  let script = null;
  for (let i = 0; i < scripts.length; i++) {
    script = scripts[i];
    if (script.textContent.indexOf('MPATGlobalInformation') > 0) break;
  }
  eval(script.textContent);
  const result = {
    "page": {
      "post_name": exportName,
      "post_title": exportName,
      "meta": {
        "mpat_content": {
          componentStyles: MPATGlobalInformation.Post.meta.componentStyles,
          background: MPATGlobalInformation.Post.meta.background,
          content: MPATGlobalInformation.Post.meta.content
        }
      }
    },
    "page_layout": {
      "post_name": exportName+'layout',
      "post_title": exportName+'layout',
      "meta": {
        "mpat_content": {
          layout: MPATGlobalInformation.Post.meta.layout
        }
      }
    }
  };
  fs.writeFileSync(exportName+".mpat-page",
                JSON.stringify(result));
}

afterLoad(process.argv[2], processHtml);

