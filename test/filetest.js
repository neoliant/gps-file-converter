import GFC from '../gps-file-converter';
import { readdirSync, rmSync } from 'fs';
import path from 'path';
import {asyncForEach} from '../src/helpers/common';
const geo = new GFC()

const infile_path = './Files/Test'
const outfile_path = './Files/Test/out'

const infiles = {
    gpx: [
        'TrackGpx.gpx',
        'WaypointGpx.gpx',
        'TrackNWaypointGpx.gpx'
    ],
    kml: [
        'TrackKml.kml',
        'TrackNWaypointKml.kml'
    ]
}
const output = [
    {
        format: 'gpx',
        handler: geo.exportGPX
    },
    {
        format: 'kml',
        handler: geo.exportKML
    },
    {
        format: 'geojson',
        handler: geo.exportGeoJSON
    },
    {
        format: 'pgt',
        handler: geo.exportPGT
    }
]

const clearOut = async () => {
    readdirSync(outfile_path).forEach(f => rmSync(`${outfile_path}/${f}`))
}

const testFiles = async (type) => {
    await clearOut()
    asyncForEach(Object.keys(infiles),(k) => {
        if(type && type !== k) {
            console.log(`--- Not testing ${k}`)
            return
        }
        console.log(`--- Testing ${k}`)
        asyncForEach(infiles[k], async (fn) => {
            let fileBase = path.basename(fn, path.extname(fn))
            let infilepath = `${infile_path}/${fn}`
            console.log(`Testing ${infilepath}`)
            geo.importGeoFile(infilepath)
            .then(async(c) => {
                output.forEach(o => {
                    const o_fn = `${outfile_path}/${fileBase}.${o.format}`
                    o.handler(o_fn)
                })
            })
        })
    })
}

testFiles('kml')
    
