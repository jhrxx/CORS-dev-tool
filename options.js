const bgp = browser.extension.getBackgroundPage()
const headers = [
    {
        id: 'allow_origin',
        title: 'Access-Control-Allow-Origin',
        placeholder: '<origin> | *',
        description: browser.i18n.getMessage('allow_origin_desc')
    },
    {
        id: 'allow_headers',
        title: 'Access-Control-Allow-Headers',
        placeholder: '<field-name>[, <field-name>]*',
        description: browser.i18n.getMessage('allow_headers_desc')
    },
    {
        id: 'expose_headers',
        title: 'Access-Control-Expose-Headers',
        placeholder: '',
        description: browser.i18n.getMessage('expose_headers_desc')
    },
    {
        id: 'allow_credentials',
        title: 'Access-Control-Allow-Credentials',
        placeholder: 'true | false',
        description: browser.i18n.getMessage('allow_credentials_desc')
    },
    {
        id: 'max_age',
        title: 'Access-Control-Max-Age',
        placeholder: '<delta-seconds>',
        description: browser.i18n.getMessage('max_age_desc')
    },
    {
        id: 'allow_methods',
        title: 'Access-Control-Allow-Methods',
        placeholder: '<method>[, <method>]*',
        description: browser.i18n.getMessage('allow_methods_desc')
    }
]
// i18n
const lang = {
    add: browser.i18n.getMessage('add'),
    del: browser.i18n.getMessage('delete'),
    edit: browser.i18n.getMessage('edit'),
    more_details: browser.i18n.getMessage('more_details'),
    patterns: browser.i18n.getMessage('white_list'),
    enable: browser.i18n.getMessage('enable'),
    confirm: browser.i18n.getMessage('confirm'),
    cancel: browser.i18n.getMessage('cancel'),
    confirm_delete: browser.i18n.getMessage('confirm_delete'),
    settings: browser.i18n.getMessage('CORS_Settings'),
    headers: browser.i18n.getMessage('response_headers'),
    about: browser.i18n.getMessage('about'),
    new_filter: browser.i18n.getMessage('new_filter'),
    github: browser.i18n.getMessage('project_on_github'),
    list: browser.i18n.getMessage('filter_url_patterns'),
    description: browser.i18n.getMessage('description'),
    about_content: browser.i18n.getMessage('about_content'),
    pattern_placeholder: browser.i18n.getMessage('pattern_placeholder'),
    desc_placeholder: browser.i18n.getMessage('desc_placeholder'),
    more_details_url: `https://developer.mozilla.org/${browser.i18n.getUILanguage()}/docs/Mozilla/Add-ons/WebExtensions/Match_patterns`
}

const convert = str => {
    str = str.replace(/&/g, '&amp;')
    str = str.replace(/>/g, '&gt;')
    str = str.replace(/</g, '&lt;')
    str = str.replace(/"/g, '&quot;')
    str = str.replace(/'/g, '&#039;')
    return str
}

const getTimestamp = function() {
    return new Date().getTime()
}

const storageHeaderValue = (id, type, value) => {
    bgp.getConfig('headers', ({ headers: headerData }) => {
        headerData[id][type] = value
        bgp.setConfig({ headers: headerData })
    })
}

const storageUrlData = (urls, callback) => {
    // storage url list data
    bgp.setConfig({ urls: urls }, callback)
}

// Url List
const getUrlIndexById = (urls, id) => {
    return Array.from(urls, value => value.id).indexOf(parseInt(id))
}

const saveUrl = (newValue, callback) => {
    bgp.getConfig('urls', function({ urls }) {
        let data = [...urls]
        if ('id' in newValue) {
            // edit
            let index = getUrlIndexById(urls, newValue.id)
            newValue.last_modify = getTimestamp()
            data[index] = newValue
        } else {
            // add
            newValue.id = urls[urls.length - 1].id + 1
            newValue.last_modify = getTimestamp()
            data.push(newValue)
        }
        storageUrlData(data, callback)
    })
}

const deleteUrlById = (id, callback) => {
    bgp.getConfig('urls', ({ urls }) => {
        let data = [...urls]
        var index = getUrlIndexById(urls, id)
        if (index > 0) {
            data.splice(index, 1)
            storageUrlData(data, callback)
        }
    })
}

const eventHandler = () => {
    const $dialog = document.getElementById('dialog')

    // dialog
    const bindDialogEvents = () => {
        // bind hide dialog
        document
            .querySelector('.cancel')
            .addEventListener('click', function(event) {
                event.preventDefault()
                hideDialog()
            })

        let $close = document.getElementById('close_dialog')
        $close &&
            $close.addEventListener('click', function(event) {
                event.preventDefault()
                hideDialog()
            })

        // bind confirm delete
        let $confirm = document.querySelector('.confirm-delete')
        $confirm &&
            $confirm.addEventListener('click', function(event) {
                event.preventDefault()
                deleteUrlById(event.target.dataset['id'], () => {
                    hideDialog()
                    initFilterList()
                })
            })

        // bind save add
        let $add = document.querySelector('.save-add')
        $add &&
            $add.addEventListener('click', function(event) {
                event.preventDefault()
                let $url_pattern = document.getElementById('url_pattern')
                let $url_active = document.getElementById('url_active')
                let $url_description = document.getElementById(
                    'url_description'
                )
                if ($url_pattern.value) {
                    saveUrl(
                        {
                            active: $url_active.checked,
                            url: $url_pattern.value,
                            description: $url_description.value
                        },
                        () => {
                            hideDialog()
                            initFilterList()
                        }
                    )
                } else {
                    $url_pattern.focus()
                }
            })

        // bind save edit
        let $edit = document.querySelector('.save-edit')
        $edit &&
            $edit.addEventListener('click', function(event) {
                // event.preventDefault()
                let $url_pattern = document.getElementById('url_pattern')
                let $url_active = document.getElementById('url_active')
                let $url_description = document.getElementById(
                    'url_description'
                )
                if ($url_pattern.value) {
                    saveUrl(
                        {
                            id: parseInt(event.target.dataset['id']),
                            active: $url_active.checked,
                            url: $url_pattern.value,
                            description: $url_description.value
                        },
                        () => {
                            hideDialog()
                            initFilterList()
                        }
                    )
                } else {
                    $url_pattern.focus()
                }
            })
    }

    const showDialog = (type, data) => {
        let html = tmpl(`${type === 'delete' ? type : 'add_edit'}_template`, {
            data,
            lang
        })
        document.querySelector('#dialog .page').innerHTML = html
        $dialog.classList.remove('transparent')
        if (type !== 'delete') {
            document.getElementById('url_pattern').focus()
        } else {
            document.querySelector('.confirm-delete').focus()
        }
        bindDialogEvents()
    }

    const hideDialog = () => {
        $dialog.classList.add('transparent')
    }

    const initMainContent = () => {
        const defaultItem = 'response_headers'
        const className = 'selected'

        const getId = url => {
            let arr = url.split('.html#')
            if (arr.length > 1) {
                return arr[1]
            } else {
                return defaultItem
            }
        }

        const switchClassName = (newId, oldId = defaultItem) => {
            if (oldId !== newId) {
                document.getElementById(newId).classList.add(className)
                document.getElementById(oldId).classList.remove(className)
                document
                    .getElementById(`${newId}_item`)
                    .classList.add(className)
                document
                    .getElementById(`${oldId}_item`)
                    .classList.remove(className)
            }
        }

        // render content
        let main_content_html =
            tmpl('nav_template', lang) + tmpl('mainview_template', lang)
        document.getElementById('main_content').innerHTML = main_content_html

        if (window.location.hash) {
            let id = window.location.hash.replace('#', '')
            switchClassName(id)
        }

        // bind events
        window.addEventListener(
            'hashchange',
            function(e) {
                let newId = getId(e.newURL)
                let oldId = getId(e.oldURL)
                switchClassName(newId, oldId)
            },
            false
        )
    }

    const initResponseHeaders = () => {
        const bindEvents = () => {
            // enable/disable checkbox
            let $checkbox = document.querySelectorAll(
                '#response_headers input[type=checkbox]'
            )
            for (const input of $checkbox) {
                input.addEventListener('change', function(event) {
                    let key = event.target.dataset['key']
                    document.getElementById(
                        'access_control_' + key
                    ).disabled = !event.target.checked
                    storageHeaderValue(key, 'active', event.target.checked)
                })
            }

            // input fields
            let $inputs = document.querySelectorAll(
                '#response_headers input[type=text]'
            )
            for (const input of $inputs) {
                input.addEventListener('change', function(event) {
                    let key = event.target.dataset['key']
                    storageHeaderValue(key, 'value', event.target.value)
                })
            }
        }
        // render content
        bgp.getConfig('headers', ({ headers: headerData }) => {
            let data = headers.map(header => {
                return Object.assign(header, headerData[header.id])
            })
            let html = tmpl('response_headers_template', { lang, data })
            document.getElementById('response_headers_content').innerHTML = html

            bindEvents()
        })
    }

    const initFilterList = () => {
        const bindEvents = () => {
            // filter list events
            // delete comfire
            let $del = document.querySelectorAll('#white_list .del')
            for (const item of $del) {
                item.addEventListener('click', function(event) {
                    event.preventDefault()
                    showDialog('delete', {
                        type: 'delete',
                        id: event.target.dataset['id']
                    })
                })
            }

            // open edit dialog
            let $edit = document.querySelectorAll('#white_list .edit')
            for (const item of $edit) {
                item.addEventListener('click', function(event) {
                    event.preventDefault()
                    showDialog('edit', {
                        type: 'edit',
                        title: lang.edit,
                        id: event.target.dataset['id'],
                        active: event.target.dataset['active'],
                        pattern: event.target.dataset['pattern'],
                        description: event.target.dataset['description']
                    })
                })
            }

            // enable / disable filter
            let $inputs = document.querySelectorAll(
                '#white_list input[type=checkbox]'
            )
            for (const input of $inputs) {
                input.addEventListener('change', function(event) {
                    let id = event.target.dataset['id']
                    bgp.getConfig('urls', function({ urls }) {
                        let index = getUrlIndexById(urls, id)
                        if (index !== -1) {
                            urls[index].active = event.target.checked
                            urls[index].last_modify = getTimestamp()
                            storageUrlData(urls)
                        }
                    })
                })
            }
        }

        // render content
        bgp.getConfig('urls', ({ urls }) => {
            const data = urls.map(url => {
                url.url = convert(url.url)
                url.description = convert(url.description)
                return url
            })
            // render filter list
            const html = tmpl('filter_list_template', { data, lang })
            document.getElementById('white_list').innerHTML = html

            bindEvents()

        })

        document
            .getElementById('add_url')
            .addEventListener('click', function() {
                showDialog('add', { type: 'add', title: lang.add })
            })
    }

    initMainContent()

    initResponseHeaders()

    initFilterList()

    // press ESC hide dialog
    document.onkeydown = function(event) {
        event = event || window.event
        if (event.keyCode == 27) {
            // console.log('Esc key pressed.');
            hideDialog()
        }
    }

    // pulse dialog
    $dialog.addEventListener('click', function(event) {
        if (event.target.id === 'dialog') {
            $page = document.querySelector('#dialog .page')
            $page.classList.add('pulse')
            setTimeout(function() {
                $page.classList.remove('pulse')
            }, 200)
        }
    })

    // sync popup => option page filter settings
    browser.runtime.onMessage.addListener(() => {
        initFilterList()
    })
}

document.addEventListener('DOMContentLoaded', eventHandler)
