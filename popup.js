const bgp = browser.extension.getBackgroundPage()
const optionsUrl = browser.runtime.getURL('options.html')

const lang = {
  title: browser.i18n.getMessage('enable_cross_origin_resource_sharing'),
  cors: browser.i18n.getMessage('CORS'),
  list: browser.i18n.getMessage('white_list'),
  custom: browser.i18n.getMessage('options'),
  more_details: browser.i18n.getMessage('more_details')
}

const convert = str => {
  str = str.replace(/&/g, '&amp;')
  str = str.replace(/>/g, '&gt;')
  str = str.replace(/</g, '&lt;')
  str = str.replace(/"/g, '&quot;')
  str = str.replace(/'/g, '&#039;')
  return str
}

const eventHandler = () => {
  const bindEvents = () => {
    const $inputs = document.querySelectorAll('#white_list .weui-check')

    document.getElementById('switch').addEventListener('change', function(event) {
      bgp.setConfig({ active: event.target.checked })
    })

    for (const input of $inputs) {
      input.addEventListener('click', function(event) {
        const id = parseInt(event.target.dataset['key'])
        bgp.getConfig('urls', ({urls}) => {
          urls = urls.map(url=>{
            if (url.id === id) {
              url.active = event.target.checked
            }
            return url
          })

          bgp.setConfig({ urls })
        })
      })
    }

    document.getElementById('options').addEventListener('click', event => {
      event.preventDefault()

      browser.runtime.openOptionsPage()
    })
  }

  // init switch and filter list
  bgp.getConfig(['active', 'urls'], function(data) {
    // prevent list to long to display scroll bar
    if (data.urls.length > 8) {
      data.urls.length = 8
    }

    const urls = data.urls.map(item => {
      item.url = convert(item.url)
      item.description = convert(item.description)
      return item
    })

    let filterListHtml = tmpl('filter_list_template', { urls })
    // console.log('filterListHtml: ', filterListHtml)
    let containerHtml = tmpl('container_template', { data, lang, filterListHtml })
    // console.log('containerHtml: ', containerHtml)
    document.getElementById('container').innerHTML = containerHtml

    bindEvents()

    // set active icon
    bgp.setIcon(data.active)
  })
}

document.addEventListener('DOMContentLoaded', eventHandler)
