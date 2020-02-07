import generateMsg from './generateMsg'


export const round = (x: number, by: number) => {
  return Math.round(x / by) * by;
}


export const roundWidth = (node: SceneNode, roundBy: number) => {
	let newWidth = round(node.width, roundBy)
	if (newWidth !== node.width) {
		node.resize(newWidth, node.height)
		return generateMsg('width', node.name, roundBy)
	}
}


export const roundHeight = (node: SceneNode, roundBy: number) => {
  let newHeight = round(node.height, roundBy)
  if (newHeight !== node.height) {
    node.resize(node.width, newHeight)
    return generateMsg('height', node.name, roundBy)
  }
}


export const roundX = (node: SceneNode, roundBy: number) => {
  let newX = round(node.x, roundBy)
  if (newX !== node.x) {
    node.x = newX
    return generateMsg('X-Axis', node.name, roundBy)
  }
}


export const roundY = (node: SceneNode, roundBy: number) => {
  let newY = round(node.y, roundBy)
  if (newY !== node.y) {
    node.y = newY
    return generateMsg('Y-Axis', node.name, roundBy)
  }
}