import fs from 'fs/promises';
import { parseData as gpxParseData, dataFromModel as gpxDataFromModel } from './src/translators/translateGpx';
/* import { parseData as pgtParseData, parsePGTZ, dataFromModel as pgtDataFromModel } from './src/translators/translatePgt' */
import { parseData as kmlParseData, dataFromModel as kmlDataFromModel } from './src/translators/translateKml';
import { parseData as geoJSONParseData, dataFromModel as geoJSONDataFromModel } from './src/translators/translateGeoJSON';
import admzip from 'adm-zip';
import path from 'path';
import { getFileData } from './src/helpers/fileinfo';
import { newExportOptions, optimizationLevel } from './src/models/PGGeoModel';

let content = {}
let filetype = {}
let filename_extension = ''

const importFile = async (filePath, handler) => {
    return new Promise((resolve, reject) => {
        filename_extension = path.extname(filePath)
        getFileContent(filePath)
            .then(c => {
                filetype = getFileData(c, filename_extension)
                handler(c).then(() => {
                    return resolve()
                })
            })
            .catch(e => { return reject(e) })
    })
}

const getFileContent = async (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath)
            .then((c) => {
                return resolve(c.toString())
            })
            .catch((e) => { return reject(e) })
    })
}

const exportFile = async (filePath, contents) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, contents)
            .then(c => {
                return resolve()
            })
            .catch(e => { return reject(e) })
    })
}
const exportFileCompressed = async (filePath, filename, contentString) => {
    const zip = new admzip()
    zip.addFile(filename, Buffer.from(contentString))
    const zipContent = zip.toBuffer()
    return exportFile(filePath, zipContent)
}

export class PGGeo {
    constructor() {
    }
    // General
    importGeoFile = async (filePath) => {
        return new Promise((resolve, reject) => {
            filename_extension = path.extname(filePath)
            getFileContent(filePath)
                .then(c => {
                    const fileinfo = getFileData(c, filename_extension)
                    filetype = {
                        ext: fileinfo.ext,
                        desc: fileinfo.desc,
                        format: fileinfo.format,
                    }
                    let handler = undefined

                    switch (fileinfo.ext) {
                        case 'gpx': handler = this.parseGPX
                            break
                        case 'kml': handler = this.parseKML
                            break
                        case 'pgt': handler = this.parsePGT
                            break
                        case 'pgtz':
                        case 'zip': handler = this.parsePGTZ
                            break
                        case 'json': handler = this.parseGeoJSON
                            break
                        default:
                            return reject(`No handler available for filetype ${fileinfo.ext}`)

                    }
                    return handler(fileinfo.data).then(() => {
                        return resolve({
                            ...filetype,
                            filename_ext: filename_extension
                        })
                    })
                })
                .catch(e => { return reject(e) })
        })
    }

    stringify = async (type, options) => {
        return new Promise((resolve, reject) => {
            let data = undefined;
            let handler = undefined
            switch (type) {
                case 'gpx': data = gpxDataFromModel(content, options)
                    break
                case 'kml': data = kmlDataFromModel(content, options)
                    break
                /* case 'pgt': data = pgtDataFromModel(content, options)
                    break */
                case 'json': data = geoJSONDataFromModel(content, options)
                    break
                default:
                    return reject(`No handler available for stringify to format '${type}'`)
            }
            return resolve(data)
            
            //return reject(`Handler for stringify to format '${type}' not implemented`)
        })
    }

    // Garmin GPX files
    importGPX = async (filePath) => {
        return importFile(filePath, this.parseGPX)
    }
    parseGPX = async (data) => {
        return gpxParseData(data)
            .then(d => {
                content = d
            })
    }
    exportGPX = (filePath, options) => {
        let c = gpxDataFromModel(content, options)
        return exportFile(filePath, c)
    }

    // Google KLM files
    importKML = (filePath) => {
        return importFile(filePath, this.parseKML)
    }

    parseKML = async (data) => {
        return kmlParseData(data)
            .then(d => {
                content = d
            })
    }
    exportKML = (filePath, options) => {
        let c = kmlDataFromModel(content, options)
        return exportFile(filePath, c)
    }

    // GeoJSON
    importGeoJSON = (filePath) => {
        return importFile(filePath, this.parseGeoJSON)
    }

    parseGeoJSON = async (data) => {
        return geoJSONParseData(data)
            .then(d => {
                content = d
            })
    }

    exportGeoJSON = (filePath, options) => {
        let c = geoJSONDataFromModel(content, options)
        return exportFile(filePath, c)
    }

    // PlaceGaze files
    /* importPGT = (filePath) => {
        return importFile(filePath, this.parsePGT)
    }
    importPGTZ = (filePath) => {
        console.log(filePath)
    }
    parsePGT = async (data) => {
        return pgtParseData(data)
            .then(d => {
                content = d
            })
    }
    parsePGTZ = async (data) => {
        return parsePGTZ(data)
            .then(d => {
                content = d
            })
    }

    exportPGT = (filePath, options) => {
        let c = pgtDataFromModel(content, options, true)
        return exportFile(filePath, c)
    }
    exportPGTZ = (filePath, options) => {
        let fname = path.basename(filePath.toLowerCase(), '.zip') + '.pgt'
        let c = pgtDataFromModel(content, options, true)
        return exportFileCompressed(filePath, fname, c)
    } */

    newExportOptions = () => {
        return newExportOptions()
    }

    optimizationLevel = optimizationLevel

    getContent = () => {
        return content
    }

    getDataType = () => {
        return {
            ...filetype,
            filename_ext: filename_extension
        }
    }
}