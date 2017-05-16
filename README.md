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


