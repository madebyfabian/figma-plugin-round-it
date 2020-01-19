import './style.scss'


let _valuesArr = null,
    _valueCurrSelected = null


/**
 * Posts a message to the main.entry.ts
 * @param {*} type The action type.
 * @param {*} action The action name.
 */
const postMsg = (type, action) => {
  parent.postMessage({ pluginMessage: { action, type } }, '*')
}


/**
 * Opens a view by it's ID-name.
 * @param {string} viewName The name of the view (for "#view--main" it's "main").
 */
const selectView = (viewName) => {
  const newViewId = `#view--${viewName}`
  for (let item of document.querySelectorAll('[id^=view--]')) {
    item.classList.remove('is-active')
  }
  document.querySelector(newViewId).classList.add('is-active')
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
      console.log('Client storage is been updated. New value:', msg.value)

      _valuesArr = msg.value.values
      _valueCurrSelected = msg.value.valueCurrSelected
      document.querySelector('.dropdown__value').innerHTML = _valueCurrSelected + 'px'

      // Generate dropdown options
      let html = ''
      for (let entry of msg.value.values) {
        let isSelected = (entry === msg.value.valueCurrSelected) ? 'is-selected' : ''
        html += `<div class="dropdown__option ${isSelected}" data-value="${entry}">${entry}px</div>`
      }
      document.querySelector('#dropdown__options-group--values').innerHTML = html
      break
    }
  }
}





for (let item of document.querySelectorAll('.item')) {
  item.addEventListener('click', () => {
    item.classList.add('is-done')
  })
}



const $dropdown = document.querySelector('.dropdown')
$dropdown.addEventListener('click', async (event) => {
  $dropdown.classList.toggle('is-opened')

  if (event.target.getAttribute('class') === 'dropdown__value') 
    return

  if (event.target.getAttribute('id') === 'dropdown__option--add-option-btn')
    return selectView('options')

  const value = event.target.getAttribute('data-value')
  if (!value)
    return false

  await postMsg('changeValueCurrSelected', parseInt(value))
})