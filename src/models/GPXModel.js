import { deepCopy, XMLFromObj } from '../helpers/common';
import { config } from '../config';

const GpxTrack = {
    name:'',
    desc:'',
    trkseg: {
        trkpt: []
    }
}

const GpxTrackPoint = {
        ele:''
}
const GpxLink = {
    text:''
}

const GpxWayPoint = {
    ele:'',
    time:'',
    name: '',
    sym:'' 
}

const GpxModel = {
    '?xml':'',
    gpx: {
        metadata: {
            name:'',
            desc:'',
            link:{},
            time:''
        },
        trk: [],
        wpt:[]
    }
}

export const newGpxModel = () => {
    let ret = deepCopy(GpxModel)
    const meta = config.gpx
    Object.keys(meta).forEach(key => {
        ret.gpx[`@_${key}`] = meta[key]
    })

    return ret
}

export const newTrackPoint = (lat, lon, ele) => {
    let pt = deepCopy(GpxTrackPoint)
    pt['@_lat'] = lat
    pt['@_lon'] = lon

    if(ele) {
        pt.ele = ele
    } else {
        delete pt.ele
    }
    return pt
}

export const newTrack = (name, desc, points) => {
    let ret = deepCopy(GpxTrack)
    ret.name = name
    ret.desc = desc
    ret.trkseg.trkpt = points

    return ret
}

export const newWayPoint = (lat, lon, ele, name, time, sym) => {
    if(!sym) {
        sym = 'Flag, Orange'
    }
    let ret = deepCopy(GpxWayPoint)
    ret['@_lat'] = lat
    ret['@_lon'] = lon
    ret.ele = ele
    ret.name = name
    ret.time = time
    ret.sym = sym

    return ret
}

export const newLink = (url, text) => {
    let ret = common.deepCopy(GpxLink)
    ret['@_href'] = url
    ret.text = text
    return ret
}

export const toXML = (model) => {
    return XMLFromObj(model)
}