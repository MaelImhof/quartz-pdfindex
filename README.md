# Quartz - PDF Index

Quartz has a search feature that lets user enter text and find relevant results across the whole website. However, by default, PDF documents are not included in this search feature.

Including PDFs in indexing can prove to be very useful. For example, I created this plugin to create a website with my notes for an academic course and be able to search through my notes and through the slides very rapidly.

Hence, I publish this plugin here with some instructions about how to use it.

> [!WARNING]
> This plugin is very basic and has some known flaws that are not adressed yet:
>
> - PDF indexes are re-computed at each build, which is highly time consuming.
> - No limit to the size of a PDF to index. If `content` contains a large PDF file, indexing it will take more time.
> - No timeout to indexing a PDF file. If a file takes 10 minutes to index, it will be indexed at each build anyway.
> - No ignore pattern specific to the plugin (meaning a pattern to ignore for PDF indexing but still publish with Quartz).
> - No way to give a more readable title to a PDF, the name that appears in the search bar will be the file name.
> - In the search bar, the PDF appears as a result but no preview of the content is provided. The user must go to the document and manually search for the information in that document.

## Features

- Extract text from PDFs in the `content` folder and add them to the search index of the website.
- Ignore PDFs that correspond to the [`ignorePatterns`](https://quartz.jzhao.xyz/configuration) defined in the configuration.

PDF documents will then show up in the search results if they correspond to the query :

![Image of an example of search where PDF documents show up in the results](example-search.png)

## How to use

1. Add [`pdf2json`](https://www.npmjs.com/package/pdf2json) as a dependency to your project using the command `npm i pdf2json`.
2. Copy the contents of [pdfIndex.ts](pdfIndex.ts).
3. In your Quartz installation, in the folder `quartz/plugins/emitters`, create a file called `pdfIndex.ts` and paste the copied contents in there.
4. In `quartz/plugins/emitters/index.ts`, add the following line
```typescript
export { PDFIndex } from "./pdfIndex"
```
5. In `quartz.config.json`, find the emitter plugins list. It should look something like
```typescript
emitters: [
    Plugin.AliasRedirects(),
    ...
    Plugin.NotFoundPage(),
],
```
6. Add the `PDFIndex` plugin to the list of emitters. TO do this, add `Plugin.PDFIndex(),` to the list, like so (add it after the `ContentIndex` plugin) :
```typescript
emitters: [
    Plugin.AliasRedirects(),
    ...
    Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
    }),
    Plugin.PDFIndex(),
    ...
    Plugin.NotFoundPage(),
],
```

The PDF index plugin is now enabled in your Quartz installation and will allow users of your website to make search queries that will also be matched to PDF documents.

Please take note, however, of the limitations described at the beginning of this README. If your build time gets excessive, try disabling the plugin by removing

```typescript
Plugin.PDFIndex(),
```

from the plugins list in the Quartz configuration. An extended build-time can be due to large PDF files that take time to be parsed and indexed.

## Contributing

Contributions are welcome, in the form of an issue or a pull request.

If you are planning to contribute a significant amount of code to the project, please reach out with an issue first so that you do not waste your time on a pull-request that might be out-of-scope.

Happy coding !