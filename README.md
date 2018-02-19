## Utility to get the MPAT info from a published MPAT page url

### Requirements
- node.js to run the application
- an MPAT installation to make use of the produced files

### Installation

In this directory, do:
```
npm install
```

### Usage
```
node getinfofrompage.js <URL> <exportName>
```

or 

```
npm start <URL> <exportName>
```


A file called `<exportName>.mpat-page` is generated in the current directory.

In the file, there is a page called `<exportName>` and a page layout called `<exportName>layout`

You can then import this file from the ImportExport page by clicking on the 
`import page` button and pointing to this file. If a page of the same name exists,
 the page is not imported.
If a layout of the same name exist, the layout is not imported.

### Usage of getsite

A whole site can be recursively downloaded, page by page. 

```
node getsite.js <URL> <exportNameForFirstPage>
```

After the first page, the file names are retrieved as part of the link url.
Only pages pointed by a MPAT Link component are discovered and processed.
Each file is created in its own *.mpat-page.
Each link is considered an external link.

### Usage of packSite

After running the above getsite.js, your current directory is full of single pages.

```
node packSite.js
```

packSite creates a single ```all-pages.mpat-page``` from all .mpat-page in the current 
directory, taking care that internal links are properly dealt with when you import the package 
in an MPAT instance. Internal links are replaced with ```page://number``` URLs.
