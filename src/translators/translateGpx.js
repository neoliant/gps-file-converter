import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';
import { newGpxModel, newLink, newWayPoint, newTrack, newTrackPoint } from '../models/GPXModel';
import { newExportOptions, optimizePointArray, optimizationLevel, PGGeoFromGPX } from '../models/PGGeoModel';
import { XMLFromObj } from '../helpers/common';
import { parseDate } from '../helpers/date';
import { commentString } from '../helpers/xml';

export const dataFromModel = (model, options) => {
    if (!options) {
        options = newExportOptions()
    }
    let ret = newGpxModel()
    if (model.name) {
        ret.gpx.metadata.name = commentString(model.name)
    } else (
        delete ret.gpx.metadata.name
    )
    if (model.desc) {
        ret.gpx.metadata.desc = commentString(model.desc)
    } else (
        delete ret.gpx.metadata.desc
    )
    if (model.link && model.link.url !== '') {
        let l = newLink(model.link.url, model.link.text)
        ret.gpx.metadata.link = l
    } else {
        delete ret.gpx.metadata.link
    }
    if (model.timestamp) {
        let d = parseDate(model.timestamp)
        ret.gpx.metadata.time = d.gpzdate
    } else {
        delete ret.gpx.metadata.time
    }
    if (!options.onlyTracks) {
        let wps = model.waypoints
        if (!wps || wps.length === 0) {
            delete ret.gpx.wp
        } else {
            wps.forEach(w => {
                let wp = newWayPoint(w.point[0], w.point[1], w.point[2], w.name)
                ret.gpx.wpt.push(wp)
            })
        }
    }

    if (!options.onlyWaypoints) {
        let tks = model.tracks
        if (!tks) {
            delete ret.gpx.trk
        } else {
            let ord = 1
            tks.forEach(tk => {
                let track = newTrack(commentString(tk.name), commentString(tk.desc), [], ord)
                let points = tk.points

                if (options.optimizationLevel !== optimizationLevel.lossless) {
                    points = optimizePointArray(points, options.optimizationLevel)
                }

                points.forEach(p => {
                    let tp = newTrackPoint(p[0], p[1], p[2])
                    track.trkseg.trkpt.push(tp)
                })
                ret.gpx.trk.push(track)
                ord += 1
            })
        }
    }

    return XMLFromObj(ret)
}

export const parseData = async (data) => {
    return new Promise((resolve, reject) => {
        let content = {}
        let gpsContent = undefined
        if (typeof data === 'string') {
            const options = {
                ignoreAttributes: false,
            }
            const parser = new XMLParser(options)
            gpsContent = parser.parse(data)
        } else {
            gpsContent = data
        }

        if (gpsContent) {
            content = PGGeoFromGPX(gpsContent)
            return resolve(content)
        } else {
            return reject('Data could not be parsed')
        }
    })
}