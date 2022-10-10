import { XMLParser, XMLBuilder, XMLValidator} from 'fast-xml-parser';
import { newKmlModel, newWaypointStyle, newTrackStyle, newKMLTrack } from '../models/KMLModel';
import { PGGeoFromKML, newExportOptions } from '../models/PGGeoModel';
import { XMLFromObj } from '../helpers/common';
import { commentString } from '../helpers/xml';

export const dataFromModel = (model, options) => {
    if(!options) {
        options = newExportOptions()
    }
    let ret = newKmlModel()
    if(model.name) {
        ret.kml.Document.name = commentString(model.name)
    } else (
        delete ret.kml.Document.name
    )
    if(model.desc) {
        ret.kml.Document.description = commentString(model.desc)
    } else {
        delete ret.kml.Document.description
    }

    if(!options.onlyTracks) {
        const wpStyleId = 'waypoint'
        let style = newWaypointStyle(wpStyleId)

        ret.kml.Document.StyleMap.push(...style.StyleMap)
        ret.kml.Document.Style.push(...style.Style)

        model.waypoints.forEach(wp => {
            let w = newKMLWaypoint(wp.name,wp.desc,wp.point,wpStyleId)
            ret.kml.Document.Placemark.push(w)
        })
    }
    
    if(!options.onlyWaypoints) {
        let nr = 1
        model.tracks.forEach(tr => {
            if(tr.points.length > 0) {
                const trStyleId = `waytogo_${nr}`
                let tstyle = newTrackStyle(trStyleId,'Red')
                ret.kml.Document.StyleMap.push(...tstyle.StyleMap)
                ret.kml.Document.Style.push(...tstyle.Style)
                
                let pt = newKMLTrack(tr.name,tr.desc,tr.points,trStyleId)
                ret.kml.Document.Placemark.push(pt)
                nr++
            }
        })
    }
    return XMLFromObj(ret)
}

export const parseData = async(data) => {
    return new Promise((resolve, reject) =>{
        let content = {}
        let gpsContent = undefined
        if(typeof data === 'string'){
            const options = {
                ignoreAttributes : false
            }
            const parser = new XMLParser(options)
            gpsContent = parser.parse(data)
        } else {
            gpsContent = data
        }
        
        if(gpsContent) {
            content = PGGeoFromKML(gpsContent)
            return resolve(content)
        } else {
            return reject('Data could not be parsed')
        }
    })
}