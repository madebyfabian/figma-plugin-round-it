/**
 * The main JS file for all the functionality.
 */

figma.showUI(__html__, { 
	width: 360, 
	height: 224
});


// On plugin start
(async () => {
	let values 						= await figma.clientStorage.getAsync('valuesArr'),
			valueCurrSelected = await figma.clientStorage.getAsync('valueCurrSelected')

	if (!values || !valueCurrSelected) {
		console.log('main.entry.ts:', 'Either "values" or "valueCurrSelected" is not in clientStorage. Create it.')
		await figma.clientStorage.setAsync('valuesArr', 				[ 8, 10 ])
		await figma.clientStorage.setAsync('valueCurrSelected', 8)
		values = await figma.clientStorage.getAsync('valuesArr')
		valueCurrSelected = await figma.clientStorage.getAsync('valueCurrSelected')
	}
	
	figma.ui.postMessage({ 
		type: 'clientStorageUpdated', 
		value: {
			values, valueCurrSelected
		}
	})
})()


figma.ui.onmessage = async (msg) => {
	switch (msg.type) {
		case 'changeValueCurrSelected': {
			let key = 'valueCurrSelected',
					valueCurrSelected = msg.action

			await figma.clientStorage.setAsync(key, valueCurrSelected)
			valueCurrSelected = await figma.clientStorage.getAsync(key)

			console.log('main.entry.ts:', 'clientStorageSet() =>', valueCurrSelected)

			figma.ui.postMessage({ 
				type: 'clientStorageUpdated', 
				value: {
					values: await figma.clientStorage.getAsync('valuesArr'), 
					valueCurrSelected
				}
			})

			break
		}
			

	}
}