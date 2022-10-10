import crypto from 'crypto';
import Readable from 'stream';
//const Readable = require('stream').Readable
import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser';

export const deepCopy = (obj) => {
    let ret = JSON.parse(JSON.stringify(obj))
    return ret
}

export const zeroFill = (num, pos) => {
    let ret = ''
    var s = num.toString()
    var arr = s.split('')
    var diff = pos - arr.length
    for(var p=0;p<diff;p++){
        arr.unshift('0')
    }
    ret = arr.join('')
    return ret
}

export const getFileHash =  (fileStr) => {
    return new Promise((resolve,reject) => {
        try {
            const output = crypto.createHash('md5')
            const fileStream = new Readable();
            fileStream._read = () => {}
            fileStream.push(fileStr);
            fileStream.push(null)
            output.once('readable', () => {
              return resolve(output.read().toString('hex'))
            })
            fileStream.pipe(output)
        } catch (e) {
            return reject(e)
        }
    })     
}

export const asyncForEach = async (array, handlerfunction) => {
    return new Promise(async (resolve,reject) => {
      if(array) {
        for (let index = 0; index < array.length; index++) {
            await handlerfunction(array[index], index, array)
            if(index === array.length -1) {
                return resolve()
            }
        }
      } else {
        return reject(`asyncForEach got no array`)
      } 
    })
}

export const XMLFromObj = (obj, nodeName, wrapperName, forceXML) => {
    const XMLHeader = '<?xml version="1.0" encoding="utf-8"?>\n'
    const options = {
        ignoreAttributes : false,
        format: true,
        htmlEntities: true
    }
    if(nodeName) {
        options.arrayNodeName = nodeName
    }

    const xb = new XMLBuilder(options)
    let xmlRet = xb.build(obj)

    if(wrapperName) {
        const xp = new XMLParser()
        let jObj = xp.parse(xmlRet)
        let addObj = {}
        addObj[wrapperName] = jObj
        xmlRet = xb.build(addObj)
    }

    if(xmlRet.startsWith('<?xml></?xml>')) {
        xmlRet = xmlRet.replace('<?xml></?xml>', XMLHeader)
    }
    if(forceXML && !xmlRet.startsWith('<?xml ')) {
        xmlRet = XMLHeader + xmlRet
    }
    xmlRet = xmlRet.replace(/'&amp;amp;'/g, '&') 
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    return xmlRet
}