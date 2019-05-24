const getTimestamp = function() {
    return new Date().getTime()
}

const headerObjs = {
    allow_origin: 'Access-Control-Allow-Origin',
    allow_headers: 'Access-Control-Allow-Headers',
    expose_headers: 'Access-Control-Expose-Headers',
    allow_credentials: 'Access-Control-Allow-Credentials',
    max_age: 'Access-Control-Max-Age',
    allow_methods: 'Access-Control-Allow-Methods'
}

let headersCfg

function headersReceivedListener(details) {
    let { responseHeaders } = details
    const keys = responseHeaders.map(header=>header.name)
    // console.log('headersReceivedListener: ', responseHeaders)
    // console.log('headersCfg: ', headersCfg)

    for (let [key, value] of Object.entries(headersCfg)) {
        // console.log(
        //     `${JSON.stringify(key)}: ${JSON.stringify(value)}`
        // );
        if(value.active) {
            let index = keys.indexOf(headerObjs[key])
            let data = { name: headerObjs[key], value: value.value}
            if(index === -1) {
                responseHeaders.push(data)
            } else {
                responseHeaders[index] = data
            }
        }
    }

    // console.log({ responseHeaders })

    return { responseHeaders }
}

/*Reload settings*/
function reloadSettings() {
    /*Remove Listeners*/
    /*
     * onHeadersReceived (optionally synchronous)
     * Fires each time that an HTTP(S) response header is received.
     * Due to redirects and authentication requests this can happen multiple times per request.
     * This event is intended to allow extensions to add, modify, and delete response headers,
     * such as incoming Set-Cookie headers.
     * The caching directives are processed before this event is triggered,
     * so modifying headers such as Cache-Control has no influence on the browser's cache.
     * It also allows you to redirect the request.
     */
    browser.webRequest.onHeadersReceived.removeListener(headersReceivedListener)

    getConfig(['active', 'urls', 'headers'], data => {
        // console.log('getConfig: ', data)
        headersCfg = data.headers
        if (data.urls.length > 0) {
            const urls = data.urls
                .filter(url => url.active)
                .map(data => data.url)

            if (data.active && urls.length > 0) {
                // console.log('addListener: ', urls)
                browser.webRequest.onHeadersReceived.addListener(
                    headersReceivedListener,
                    { urls },
                    ['blocking', 'responseHeaders']
                )
            }
        }
    })
}

function getConfig(keys, callback) {
    // console.log('getConfig: ', keys)
    browser.storage.local.get(keys, callback)
}

function setConfig(value, callback) {
    // console.log('setConfig: ', value)
    if (typeof callback !== 'function') {
        callback = function() {}
    }

    // Save it using the browser extension storage API.
    browser.storage.local.set(value, () => {
        if ('active' in value) {
            // let icon = value.active ? 'on' : 'off'
            // browser.browserAction.setIcon({ path: `${icon}.png` })
            setIcon(value.active)
        }


        reloadSettings()

        callback()
    })
}

function setIcon(state){
    let icon = state ? 'on' : 'off'
    browser.browserAction.setIcon({ path: `${icon}.png` })
}

//  add listener after enabled/installed
browser.runtime.onInstalled.addListener(() => {
    getConfig('active', data => {
        // if is update save user config
        if (Object.keys(data).length === 0) {
            browser.storage.local.set({
                active: false,
                urls: [
                    {
                        id: 0,
                        active: false,
                        url: '<all_urls>',
                        description: browser.i18n.getMessage('all_urls'),
                        last_modify: getTimestamp()
                    }
                ],
                headers: {
                    allow_origin: { active: true, value: '*' },
                    allow_headers: { active: false, value: '' },
                    expose_headers: { active: false, value: '' },
                    allow_credentials: { active: false, value: '' },
                    max_age: { active: false, value: '' },
                    allow_methods: { active: true, value: 'GET, PUT, POST' }
                }
            })
            reloadSettings()
        }

    })
})

reloadSettings()

getConfig('active', data => {
    if (Object.keys(data).length !== 0) {
        setIcon(data.active)
    }
})
