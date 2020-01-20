/**
 * The main JS file for all the functionality.
 */

figma.showUI(__html__, { 
	width: 360, 
	height: 192
});


const round = (x, by) => Math.round(x / by) * by

const generateMsg = (propName, oldVal, newVal, nodeName) => {
	return `Rounded ${propName} (${oldVal}px → ${newVal}px) of "${nodeName}"`
}

const checkAlreadyRounded = async () => {
	let alreadyRounded = { width: [], height: [], x: [], y: [] },
			alreadyRoundedFinalValues = { width: null, height: null, x: null, y: null	}

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
				y: round(node.y, roundBy)
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
	}

	figma.ui.postMessage({
		type: 'alreadyRoundedData',
		value: alreadyRoundedFinalValues
	})
}


// On plugin start
(async () => {
	// temp
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
				let msgArr = [],
						newHeight: number, 
						newWidth: number,
						newY: number,
						newX: number
			
				switch (type) {
					case 'height':
						newHeight = round(node.height, roundBy)
						if (newHeight !== node.height) {
							msgArr.push(generateMsg('height', node.height, newHeight, node.name))
							node.resize(node.width, newHeight)
						}
						break
			
					case 'width':
						newWidth = round(node.width, roundBy)
						if (newWidth !== node.width) {
							msgArr.push(generateMsg('width', node.width, newWidth, node.name))
							node.resize(newWidth, node.height)
						}
						break
			
					case 'x':
						newX = round(node.x, roundBy)
						if (newX !== node.x) {
							msgArr.push(generateMsg('X-Axis', node.x, newX, node.name))
							node.x = newX
						}
						break
			
					case 'y':
						newY = round(node.y, roundBy)
						if (newY !== node.y) {
							msgArr.push(generateMsg('Y-Axis', node.y, newY, node.name))
							node.y = newY
						}
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
			console.log('before deletion', values)
			const key = values.findIndex(i => i === valueToRemove)
			values.splice(key, 1)
			await figma.clientStorage.setAsync('valuesArr', values)
			console.log('after deletion', values)

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