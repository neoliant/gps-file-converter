//import AdmZip from 'adm-zip';
import { deepCopy } from '../helpers/common';
import { optimizationLevel, optimizePointArray, compressPointArray, deCompressPointArray, newExportOptions } from '../models/PGGeoModel';

export const dataFromModel = (model, options) => {
    if(!options) {
        options = newExportOptions()
    }
    let m = deepCopy(model)
    if(options.onlyTracks) {
        m.waypoints = []
    }
    if(options.onlyWaypoints) {
        m.tracks = []
    }
    if(options.useCompression){
        let tps = m.tracks ? m.tracks[0].points : undefined //TODO: Mayby not only the first
        if(tps){
            if(options.optimizationLevel !== optimizationLevel.lossless) {
                tps = optimizePointArray(tps, options.optimizationLevel)
            }
            let compressed = compressPointArray(tps)
            m.tracks[0].points = compressed
        } 
    }
    return JSON.stringify(m,'',2)
}

export const parseData = async(data) => {
    return new Promise((resolve, reject) =>{
        let gpsContent = undefined
        if(typeof data === 'string'){
            const options = {
                ignoreAttributes : false
            }
            gpsContent = JSON.parse(data)
        } else {
            gpsContent = data
        }
        if(gpsContent) {
            let compressedTrackPoints = gpsContent.tracks[0].points
            if(compressedTrackPoints) {
                let dec = deCompressPointArray(compressedTrackPoints)
                gpsContent.tracks[0].points = dec
            }            
            return resolve(gpsContent)
        }  else {
            return reject('Data could not be parsed')
        }  
    })
}