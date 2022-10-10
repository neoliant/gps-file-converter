import { deepCopy } from '../helpers/common';
import { commentString } from '../helpers/xml';
import { config } from '../config';

const waypointStyleHeader = {
    IconStyle: {
        scale: 1.0,
        Icon: {
            href:'https://www.gstatic.com/mapspro/images/stock/93-parkinglot.png'
        }
    },
    LabelStyle: {
        scale: 0,
    }
}

const waypointStyleMapPair = {
    key:'',
    styleUrl:''
}

const styleMapHeader = {
    StyleMap: [],
    Style: []
}

const trackStyleHeader = {
    LineStyle: {
        color:'',
        width: 4
    }
}


const KMLTrack = {
    name: '',
    description: '',
    styleUrl: '',
    LineString: {
        coordinates: ''
    }
}

const KMLWaypoiny = {
    name: '',
    description: '',
    styleUrl: '',
    Point: {
        coordinates: ''
    }
}

const KmlModel = {
    '?xml':'',
    kml: {
        Document: {
            name: '',
            StyleMap: [],
            Style: [],
            Placemark: []
        }
    }
}

export const newWaypointStyle = (id) => {
    let ret = deepCopy(styleMapHeader)
    let sm = {}
    sm['@_id'] = id
    let kp = deepCopy(waypointStyleMapPair)
    kp.key = 'normal'
    kp.styleUrl = `${id}-normal`
    sm.Pair =[]
    sm.Pair.push(kp)
    kp = deepCopy(waypointStyleMapPair)
    kp.key = 'highlight'
    kp.styleUrl = `${id}-highlight`
    sm.Pair.push(kp)
    ret.StyleMap.push(sm)

    let s1 = deepCopy(waypointStyleHeader)
    s1['@_id'] = `${id}-normal`
    ret.Style.push(s1)
    let s2 = deepCopy(waypointStyleHeader)
    s2['@_id'] = `${id}-highlight`
    ret.Style.push(s2)

    return ret
}

export const newTrackStyle = (id, color, width) => {
    if(!color) {
        color = config.kml.default.LineStyle.color
    }
    if(!width) {
        width = config.kml.default.LineStyle.width
    }
    var ret = deepCopy(styleMapHeader)
    let sm = {}
    sm['@_id'] = id
    let kp = deepCopy(waypointStyleMapPair)
    kp.key = 'normal'
    kp.styleUrl = `${id}-normal`
    sm.Pair =[]
    sm.Pair.push(kp)
    kp = deepCopy(waypointStyleMapPair)
    kp.key = 'highlight'
    kp.styleUrl = `${id}-highlight`
    sm.Pair.push(kp)
    ret.StyleMap.push(sm)

    let s1 = deepCopy(trackStyleHeader)
    s1['@_id'] = `${id}-normal`
    s1.LineStyle.color = color
    s1.LineStyle.width = width
    ret.Style.push(s1)
    let s2 = deepCopy(trackStyleHeader)
    s2['@_id'] = `${id}-highlight`
    s2.LineStyle.color = color
    s2.LineStyle.width = width
    ret.Style.push(s2)

    return ret
}

export const newKMLTrack = (name, desc, points,  styleId) => {
    if(!styleId) {
        styleId = config.kml.default.LineStyleId
    }
    let ret = deepCopy(KMLTrack)
    ret.name = commentString(name)
    ret.description = commentString(desc)
    ret.styleUrl = `#${styleId}`
    let pointStr= ''
    points.forEach(p => {
        pointStr += `${p[1]},${p[0]},${p[2] || 0}\n`
    })
    ret.LineString.coordinates = pointStr

    return ret
}

export const newKMLWaypoint = (name, desc, point, styleId) => {
    if(!styleId) {
        styleId = config.kml.default.LineStyleId
    }
    let ret = deepCopy(KMLWaypoiny)
    ret.name = commentString(name)
    ret.description = commentString(desc)
    ret.styleUrl = `#${styleId}`
    let pointStr = `${point[1]},${point[0]},${point[2] || 0}\n`

    ret.Point.coordinates = pointStr

    return ret
}


export const newKmlModel = () => {
    let ret = deepCopy(KmlModel)
    const meta = config.kml
    return ret
}