import { round, roundWidth, roundHeight, roundX, roundY } from './functions/round'
import generateMsg from './functions/generateMsg'


figma.showUI(__html__, { 
	width: 360, 
	height: 248
});


const checkAlreadyRounded = async () => {
	let alreadyRounded = { width: [], height: [], x: [], y: [] },
			alreadyRoundedFinalValues = { width: null, height: null, x: null, y: null }

	if (figma.currentPage.selection.length) {
		const roundBy = await figma.clientStorage.getAsync('valueCurrSelected')

		for (const node of figma.currentPage.selection) {
			let isNotAutoLayout = true
			if (node.type === 'FRAME')
				isNotAutoLayout = node.layoutMode === 'NONE'

			// Check, if some values are already rounded. 
			let alreadyRoundedThisNode = {
				width: round(node.width, roundBy),
				height: round(node.height, roundBy),
				x: round(node.x, roundBy),
				y: round(node.y, roundBy),
			}

			for (const propertyKey of Object.keys(alreadyRoundedThisNode)) {
				if ((propertyKey === 'width' || propertyKey === 'height') && !isNotAutoLayout)
					alreadyRounded[propertyKey].push(null)
				else
					alreadyRounded[propertyKey].push(alreadyRoundedThisNode[propertyKey] === node[propertyKey])
			}
		}

		for (const propertyKey of Object.keys(alreadyRounded)) {
			if (alreadyRounded[propertyKey].includes(null))
				alreadyRoundedFinalValues[propertyKey] = null
			else
				alreadyRoundedFinalValues[propertyKey] = !alreadyRounded[propertyKey].includes(false)
		}

		let everythingRounded = Object.values(alreadyRoundedFinalValues).every(value => !!value)
		alreadyRoundedFinalValues['all'] = everythingRounded
	} else {
		alreadyRoundedFinalValues['all'] = null
	}

	

	figma.ui.postMessage({
		type: 'alreadyRoundedData',
		value: alreadyRoundedFinalValues
	})
}


// On plugin start
(async () => {
	// dev for testing:
	// await figma.clientStorage.setAsync('valuesArr', [ 8, 10 ])

	let values 						= await figma.clientStorage.getAsync('valuesArr'),
			valueCurrSelected = await figma.clientStorage.getAsync('valueCurrSelected')

	if (!values || !valueCurrSelected) {
		await figma.clientStorage.setAsync('valuesArr', 				[ 8, 10 ])
		await figma.clientStorage.setAsync('valueCurrSelected', 8)
		values = await figma.clientStorage.getAsync('valuesArr')
		valueCurrSelected = await figma.clientStorage.getAsync('valueCurrSelected')
	}

	if (!values.includes(valueCurrSelected)) {
		valueCurrSelected = values[0]
		await figma.clientStorage.setAsync('valueCurrSelected', valueCurrSelected)
	}
	
	figma.ui.postMessage({ 
		type: 'clientStorageUpdated', 
		value: {
			values, valueCurrSelected
		}
	})

	await checkAlreadyRounded()
})()


figma.on('selectionchange', async () => await checkAlreadyRounded())


figma.ui.onmessage = async (msg) => {
	switch (msg.type) {
		case 'changeValueCurrSelected': {
			let key = 'valueCurrSelected',
					valueCurrSelected = msg.action

			await figma.clientStorage.setAsync(key, valueCurrSelected)
			valueCurrSelected = await figma.clientStorage.getAsync(key)

			figma.ui.postMessage({ 
				type: 'clientStorageUpdated', 
				value: {
					values: await figma.clientStorage.getAsync('valuesArr'), 
					valueCurrSelected
				}
			})

			await checkAlreadyRounded()

			break
		}

		case 'roundValue': {
			const type = msg.action,
						roundBy = await figma.clientStorage.getAsync('valueCurrSelected')

			if (figma.currentPage.selection.length === 0) 
				return figma.notify('⚠️ You must select at least one layer.')

			for (const node of figma.currentPage.selection) {
				let msgArr = []
			
				switch (type) {
					case 'height':
						msgArr.push(roundHeight(node, roundBy))
						await checkAlreadyRounded()
						break
			
					case 'width':
						msgArr.push(roundWidth(node, roundBy))
						await checkAlreadyRounded()
						break
			
					case 'x':
						msgArr.push(roundX(node, roundBy))
						await checkAlreadyRounded()
						break
			
					case 'y':
						msgArr.push(roundY(node, roundBy))
						await checkAlreadyRounded()
						break

					default:
						roundHeight(node, roundBy)
						roundWidth(node, roundBy)
						roundX(node, roundBy)
						roundY(node, roundBy)

						msgArr.push(generateMsg('everything', node.name, roundBy))

						await checkAlreadyRounded()

						break
				}
			
				figma.notify((msgArr.length === 0) ? 'Nothing to round here 👍' : msgArr.join(', '), { timeout: 2000 })
			}

			break
		}

		case 'removeOneValueFromArr': {
			let valueToRemove 		= msg.action,
					values 						= await figma.clientStorage.getAsync('valuesArr'),
					valueCurrSelected = await figma.clientStorage.getAsync('valueCurrSelected')
			
			// Remove from array
			// console.log('before deletion', values)
			const key = values.findIndex(i => i === valueToRemove)
			values.splice(key, 1)
			await figma.clientStorage.setAsync('valuesArr', values)
			// console.log('after deletion', values)

			// Check if curr selected value was the one which was removed
			if (valueToRemove === valueCurrSelected) {
				valueCurrSelected = values[0]
				await figma.clientStorage.setAsync('valueCurrSelected', values[0])
			}

			figma.ui.postMessage({ 
				type: 'clientStorageUpdated', 
				value: { values, valueCurrSelected }
			})

			await checkAlreadyRounded()

			break
		}

		case 'addOneValueToArr': {
			let valueToAdd 				= parseInt(msg.action),
					values 						= await figma.clientStorage.getAsync('valuesArr'),
					valueCurrSelected = await figma.clientStorage.getAsync('valueCurrSelected')

			// Add to array
			if (values.includes(valueToAdd))
				return

			values.unshift(valueToAdd)
			await figma.clientStorage.setAsync('valuesArr', values)

			figma.ui.postMessage({ 
				type: 'clientStorageUpdated', 
				value: { values, valueCurrSelected }
			})

			break
		}
	}
}