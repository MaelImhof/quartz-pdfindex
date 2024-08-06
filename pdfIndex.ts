import { QuartzEmitterPlugin } from "../types"
import DepGraph from "../../depgraph"
import { FilePath, FullSlug, joinSegments, slugifyFilePath } from "../../util/path"
import { Argv, BuildCtx } from "../../util/ctx"
import { QuartzConfig } from "../../cfg"
import { glob } from "../../util/glob"
import PDFParser from "pdf2json"
import fs from "fs/promises"
import { write } from "./helpers"
import { ProcessedContent } from "../vfile"
import { StaticResources } from "../../util/resources"

interface Options { }

interface IndexElement {
    title: string;
    links: string[];
    tags: string[];
    content: string;
}

const filesToIndex = async (argv: Argv, cfg: QuartzConfig) => {
    return await glob("**.pdf", argv.directory, cfg.configuration.ignorePatterns)
}

const extractTextFromPDF = (fp: FilePath): Promise<string> => {
    return new Promise((resolve, reject) => {
        let pdfParser = new PDFParser(this, true);

        pdfParser.on('pdfParser_dataError', errData => reject(errData));
        pdfParser.on('pdfParser_dataReady', _pdfData => {
            // @ts-ignore
            const text = pdfParser.getRawTextContent();
            resolve(text);
        });

        pdfParser.loadPDF(fp);
    });
}

async function readTextFromFile(filePath: string): Promise<string> {
    const data = await fs.readFile(filePath, 'utf8');
    return data;
}

export const PDFIndex: QuartzEmitterPlugin<Partial<Options>> = (opts) => {
    return {
        name: "PDFIndex",
        async getDependencyGraph(_ctx: BuildCtx, _content: ProcessedContent[], _resources: StaticResources) {
            return new DepGraph<FilePath>()
        },
        async emit(ctx: BuildCtx, content, _resources) {

            // Obtain the PDF files that need to be added to the index
            const { argv, cfg } = ctx
            const fps = await filesToIndex(argv, cfg)

            // Extract text from each PDF file
            let index = JSON.parse(await readTextFromFile("./public/static/contentIndex.json"));
            index = new Map<string, IndexElement>(Object.entries(index));

            for (const fp of fps) {
                const filePath = joinSegments(argv.directory, fp) as FilePath;
                const text = await extractTextFromPDF(filePath);
                const indexElement = {
                    title: fp,
                    links: [],
                    tags: [],
                    content: text
                }
                index.set(slugifyFilePath(fp, false), indexElement);
            }

            return [
                await write({
                    ctx,
                    content: JSON.stringify(Object.fromEntries(index)),
                    slug: joinSegments("static", "contentIndex") as FullSlug,
                    ext: ".json"
                })
            ]
        },
        getQuartzComponents: () => []
    }
}