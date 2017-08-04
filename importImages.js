const axios = require('axios');

// arg 2 is url prefix of images to import
const urlPrefix = process.argv[3];
// arg 1 is WP REST API v2 url for the target site
const wpapi = process.argv[2];
// arg 3 is the basic authentication token
// this works with the JSON Basic Authetication WP plugin
const token = process.argv[4];
// array of get promises
const promises = [];
// array of media lib import promises
const promises2 = [];
// array of importer objects (one per image)
const importers = [];

// import a image from a matching url
function importImage(url) {
  if (!url.startsWith(urlPrefix)) return url;
  if (importers.find(pair => pair.url === url)) return;
  // if not already imported, get the image
  const importer = {url, name: url.substring(url.lastIndexOf('/')+1)};
  console.log('importing '+importer.name);
  importers.push(importer);
  promises.push(
    axios.get(url, {responseType: 'arraybuffer'}).then((v) => {
      console.log('got content for '+importer.name);
      importer.data = v.data;
      promises2.push(
        axios.post(wpapi+'media', v.data, {headers: {
          'Authorization': 'Basic '+token,
          'Content-Type': (importer.name.endsWith('.jpg') ? 'image/jpeg' : 'image/png'),
          'Content-Disposition': 'attachment; filename=' + importer.name
        }}).then(res => {
          console.log('import succeeded '+importer.name);
          importer.newurl = res.data.guid.rendered;
        }).catch(error => console.log("error posting "+importer.name+" "+error))
      );
    }).catch(error => console.log("error getting "+importer.name+" "+error)));
}

// find media urls matching prefix in page and start import
function importImagesFromPage(page) {
  const background = page.mpat_content.background;
  if (background.startsWith(urlPrefix)) {
    importImage(page.mpat_content.background);
  }
  const content = page.mpat_content.content;
  Object.keys(content).forEach((boxName) => {
    // test the content of the component data
    const boxContent = content[boxName];
    // for each state, check
    Object.keys(boxContent).forEach((stateName) => {
      const component = boxContent[stateName];
      const type = component.type;
      switch(type) {
        case 'link':
        case 'video':
          if (component.data.thumbnail) {
            importImage(component.data.thumbnail);
          }
          break;
        case 'image':
          if (component.data.imgUrl) {
            importImage(component.data.imgUrl);
          }
          break;
        case 'launcher':
          component.data.listArray.forEach((element) => {
            if (element.thumbnail) {
              importImage(element.thumbnail);
            }
          });
          break;
        default:
          break;
      }
    });
  });
}

// check that import when well and return newurl, or keep old url
function newurl(url) {
  const importer = importers.find(pair => pair.url === url);
  if (!importer) {
    console.log('no importer for '+url);
    return url;
  }
  if (!importer.data) {
    console.log('no data for '+importer.name);
    return url;
  }
  if (!importer.newurl) {
    console.log('lib import failed for '+importer.name);
    return url;
  }
  return importer.newurl;
}

// mirror of importImagesFromPage, updating urls and saving updated page
function updatePage(page) {
  let modified = false;
  const background = page.mpat_content.background;
  if (background.startsWith(urlPrefix)) {
    page.mpat_content.background = newurl(page.mpat_content.background);
    modified = true;
  }
  const content = page.mpat_content.content;
  const name = page.title.rendered || page.id;
  Object.keys(content).forEach((boxName) => {
    // test the content of the component data
    const boxContent = content[boxName];
    // for each state, check
    Object.keys(boxContent).forEach((stateName) => {
      const component = boxContent[stateName];
      const type = component.type;
      switch(type) {
        case 'link':
        case 'video':
          if (component.data.thumbnail &&
              component.data.thumbnail.startsWith(urlPrefix)) {
            component.data.thumbnail = newurl(component.data.thumbnail);
            modified = true;
          }
          break;
        case 'image':
          if (component.data.imgUrl&&
              component.data.imgUrl.startsWith(urlPrefix)) {
            component.data.imgUrl = newurl(component.data.imgUrl);
            modified = true;
          }
          break;
        case 'launcher':
          component.data.listArray.forEach((element) => {
            if (element.thumbnail &&
                element.thumbnail.startsWith(urlPrefix)) {
              element.thumbnail = newurl(element.thumbnail);
              modified = true;
            }
          });
          break;
        default:
          break;
      }
    });
  });
  if (modified) {
    const apiurl = `${wpapi}pages/${page.id}`;
    axios.put(
      apiurl,
      {
        id: page.id,
        title: page.title.rendered,
        parent: page.parent,
        status: page.status,
        mpat_content: page.mpat_content
      },
      {headers: {
        'Authorization': 'Basic '+token
      }}).then(() => {console.log('updated page '+name)})
         .catch((e) => {
        console.log('error saving page ' + name + ' ' + e);
      });
  }
}

function doPages(res) {
  const pages = res.data;
  pages.forEach(importImagesFromPage);
  Promise.all(promises).then(() => {
    Promise.all(promises2).then(() => {
      pages.forEach(updatePage);
    });
  })
}

// limited to a site with less than 100 pages, otherwise needs another loop
axios.get(wpapi+'pages?per_page=100').then(doPages);

