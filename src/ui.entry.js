import './style.scss'


let _valueCurrSelected = null


/**
 * Posts a message to the main.entry.ts
 * @param {string} type String with type of action
 * @param {*} action Data for action (Object, ...)
 */
const postMsg = (type, action) => {
  parent.postMessage({ pluginMessage: { action, type } }, '*')
}


/**
 * Opens a view by it's ID-name.
 * @param {string} viewName The name of the view (for "#view--main" it's "main").
 */
const selectView = (viewName) => {
  for (let item of document.querySelectorAll('[id^=view--]')) {
    item.classList.remove('is-active')
  }
  document.querySelector(`#view--${viewName}`).classList.add('is-active')
}


/**
 * Listens for clicks on <a href="#VIEW_NAME">... elements.
 */
for (let item of document.querySelectorAll('a')) {
  item.addEventListener('click', () => {
    const viewName = item.getAttribute('href').replace('#', '')
    selectView(viewName)
  })
}


onmessage = (event) => {
  const msg = event.data.pluginMessage

  switch (msg.type) {
    case 'clientStorageUpdated': {
      _valueCurrSelected = msg.value.valueCurrSelected
      document.querySelector('.dropdown__value').innerHTML = `by ${_valueCurrSelected}px`

      // Generate dropdown options
      let html = ''
      for (let entry of msg.value.values) {
        let isSelected = (entry === msg.value.valueCurrSelected) ? 'is-selected' : ''
        html += `<div class="dropdown__option ${isSelected}" data-value="${entry}">by ${entry}px</div>`
      }
      document.querySelector('#dropdown__options-group--values').innerHTML = html

      // Generate list of options inside options page
      // Clear HTML
      let htmlWithoutAddBtn = document.querySelectorAll('#view--options .value:not(.add-btn')
      for (let htmlItem of htmlWithoutAddBtn) {
        htmlItem.remove()
      }
      html = document.querySelector('#view--options .values').innerHTML
      for (let entry of msg.value.values) {
        html = `<article class="value" data-value="${entry}">${entry}px</article>` + html
      }
      document.querySelector('#view--options .values').innerHTML = html

      // Add event listener
      for (let item of document.querySelectorAll('#view--options .value:not(.add-btn)')) {
        item.addEventListener('click', async (e) => {
          let value = parseInt(e.target.getAttribute('data-value'))
          await postMsg('removeOneValueFromArr', value)
        })
      }

      document.querySelector('#view--options .add-btn').addEventListener('click', (e) => {
        const $addBtn = e.target
        $addBtn.insertAdjacentHTML('beforebegin', '<article class="value-with-input"><input type="number"/>px</article>');

        const $item = document.querySelector('#view--options .value-with-input')
        const $input = $item.querySelector('input')
        $input.focus()

        $input.addEventListener('blur', (e) => {
          postMsg('addOneValueToArr', e.target.value)
          $item.remove()
        })
      })      

      break
    }

    case 'alreadyRoundedData': {
      for (const valueKey of Object.keys(msg.value)) {
        const key = `#item--${valueKey}`, 
              value = msg.value[valueKey]

        document.querySelector(key).classList.remove('is-disabled')
        document.querySelector(key).classList.remove('is-done')

        if (value === null) 
          document.querySelector(key).classList.add('is-disabled')
        else if (value === true)
          document.querySelector(key).classList.add('is-done')
      }
    }
  }
}


for (let item of document.querySelectorAll('#view--main .item')) {
  item.addEventListener('click', () => {
    let type = item.getAttribute('id').replace('item--', '')
    postMsg('roundValue', type)
    item.classList.add('is-done')
  })
}


const $dropdown = document.querySelector('.dropdown')
$dropdown.addEventListener('click', async (event) => {
  $dropdown.classList.toggle('is-opened')

  if (event.target.getAttribute('class') === 'dropdown__value') 
    return

  if (event.target.getAttribute('id') === 'dropdown__option--edit-values-btn')
    return selectView('options')

  const value = event.target.getAttribute('data-value')
  if (!value)
    return false

  await postMsg('changeValueCurrSelected', parseInt(value))
})