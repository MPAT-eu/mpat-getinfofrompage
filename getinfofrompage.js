const afterLoad = require('after-load');
const jsdom = require('jsdom');
const fs = require('fs');

function processHtml(html) {
  const exportName = process.argv[3] || 'export';
  const { JSDOM } = jsdom;
  const document = new JSDOM(html).window.document;
  const scripts = document.getElementsByTagName('script');
  const style = document.getElementsByTagName('style')[0].textContent;
  const pageIndex = style.indexOf('.page {');
  const endPageIndex = style.indexOf('}', pageIndex);
  const backgroundColorIndex = style.indexOf('background-color:', pageIndex);
  const backgroundImageIndex = style.indexOf('background-image:', pageIndex);
  let background = '';
  if (backgroundImageIndex > 0 && backgroundImageIndex < endPageIndex) {
    background =
      style.substring(backgroundImageIndex + 23,
                      style.indexOf('"', backgroundImageIndex+24));
  } else if (backgroundColorIndex > 0 && backgroundColorIndex < endPageIndex) {
    background = style.substring(backgroundColorIndex + 18,
                                 style.indexOf(';', backgroundColorIndex + 19));
  }
  let script = null;
  for (let i = 0; i < scripts.length; i++) {
    script = scripts[i];
    if (script.textContent.indexOf('MPATGlobalInformation') > 0) break;
  }
  if (script === null) {
    console.log('did not find an MPAT script in this content');
    console.log(scripts.length);
    return;
  }
  eval(script.textContent);
  background = MPATGlobalInformation.Post.meta.background || background;
  console.log(`background: ${background}`);
  const result = {
    page: {
      post_name: exportName,
      post_title: exportName,
      meta: {
        mpat_content: {
          componentStyles: MPATGlobalInformation.Post.meta.componentStyles,
          background: background,
          content: MPATGlobalInformation.Post.meta.content
        }
      }
    },
    page_layout: {
      post_name: `${exportName}layout`,
      post_title: `${exportName}layout`,
      meta: {
        mpat_content: {
          layout: MPATGlobalInformation.Post.meta.layout
        }
      }
    }
  };
  fs.writeFileSync(`${exportName}.mpat-page`,
                JSON.stringify(result));
  console.log(`Wrote: ${exportName}.mpat-page`);
}

afterLoad(process.argv[2], processHtml);

