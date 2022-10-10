export let commentString = (str) => {
    return `<![CDATA[${str}]]>`
}

export let deCommentString = (str) => {
    return str.replace('<![CDATA[','').replace(']]>','')
}
