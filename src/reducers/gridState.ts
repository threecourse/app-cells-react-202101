const H = 8
const W = 8

type GridState = {
  headerNextId: number
  indexNextId: number
  header: string[]
  index: string[]
  data: number[][]
}

function initializeGridState(H: number, W: number): GridState {
  const headerNextId = W
  const indexNextId = H
  const index = []
  for (let y = 0; y < H; y++) {
    index.push(`R${y}`)
  }

  const header = []
  for (let x = 0; x < W; x++) {
    header.push(`C${x}`)
  }

  const data = []
  for (let y = 0; y < H; y++) {
    const row = []
    for (let x = 0; x < W; x++) {
      row.push(0)
    }
    data.push(row)
  }
  return {
    header,
    index,
    data,
    headerNextId: headerNextId,
    indexNextId: indexNextId,
  }
}

function updateGrid(
  input: GridState,
  addition: number,
  targetY: number,
  targetX: number
) {
  const data = []
  for (let y = 0; y < input.data.length; y++) {
    const row = []
    for (let x = 0; x < input.data[0].length; x++) {
      const v =
        input.data[y][x] + (y === targetY && x === targetX ? addition : 0)
      row.push(v)
    }
    data.push(row)
  }
  return { ...input, data }
}

function swapGridValues(
  input: GridState,
  srcY: number,
  srcX: number,
  dstY: number,
  dstX: number
) {
  const data = []
  const srcValue = input.data[srcY][srcX]
  const dstValue = input.data[dstY][dstX]
  for (let y = 0; y < input.data.length; y++) {
    const row = []
    for (let x = 0; x < input.data[0].length; x++) {
      const v = input.data[y][x]
      row.push(v)
    }
    data.push(row)
  }
  data[srcY][srcX] = dstValue
  data[dstY][dstX] = srcValue
  return { ...input, data }
}

function moveGridHeader(input: GridState, srcX: number, dstX: number) {
  const data = []
  const header = []

  const refOffsetCalc = (x: number) => {
    let refOffset = 0
    if (x === dstX) refOffset = srcX - dstX
    else if (dstX < srcX && x > dstX && x <= srcX) refOffset = -1
    else if (srcX < dstX && x < dstX && x >= srcX) {
      refOffset = 1
    }
    return refOffset
  }

  for (let x = 0; x < input.data[0].length; x++) {
    const v = input.header[x + refOffsetCalc(x)]
    header.push(v)
  }

  for (let y = 0; y < input.data.length; y++) {
    const row = []
    for (let x = 0; x < input.data[0].length; x++) {
      const v = input.data[y][x + refOffsetCalc(x)]
      row.push(v)
    }
    data.push(row)
  }

  return { ...input, data, header }
}

function moveGridIndex(input: GridState, srcY: number, dstY: number) {
  const data = []
  const index = []

  const refOffsetCalc = (y: number) => {
    let refOffset = 0
    if (y === dstY) refOffset = srcY - dstY
    else if (dstY < srcY && y > dstY && y <= srcY) refOffset = -1
    else if (srcY < dstY && y < dstY && y >= srcY) {
      refOffset = 1
    }
    return refOffset
  }

  for (let y = 0; y < input.data.length; y++) {
    const v = input.index[y + refOffsetCalc(y)]
    index.push(v)
  }

  for (let y = 0; y < input.data.length; y++) {
    const row = []
    for (let x = 0; x < input.data[0].length; x++) {
      const v = input.data[y + refOffsetCalc(y)][x]
      row.push(v)
    }
    data.push(row)
  }

  return { ...input, data, index }
}

function changeGridShape(
  input: GridState,
  NH: number,
  NW: number,
  initialValue: number
) {
  const data = []
  const IH = input.data.length
  const IW = IH === 0 ? 0 : input.data[0].length
  const header = []
  const index = []
  let headerNextId = input.headerNextId
  let indexNextId = input.indexNextId

  for (let y = 0; y < NH; y++) {
    if (y < IH) {
      index.push(input.index[y])
    } else {
      index.push(`R${indexNextId}`)
      indexNextId += 1
    }
  }

  for (let x = 0; x < NW; x++) {
    if (x < IW) {
      header.push(input.header[x])
    } else {
      header.push(`C${headerNextId}`)
      headerNextId += 1
    }
  }

  for (let y = 0; y < NH; y++) {
    const row = []
    for (let x = 0; x < NW; x++) {
      const v = y < IH && x < IW ? input.data[y][x] : initialValue
      row.push(v)
    }
    data.push(row)
  }
  return { data, index, header, headerNextId, indexNextId }
}

const initialState = initializeGridState(H, W)

export function gridState(state = initialState, action: any): any {
  const payload = action.payload
  const H = state.data.length
  const W = H === 0 ? 0 : state.data[0].length

  switch (action.type) {
    case 'GRIDSTATE_RESET':
      return initializeGridState(payload.H, payload.W)
    case 'GRIDSTATE_UPDATE':
      return updateGrid(
        state,
        action.payload.addition,
        action.payload.y,
        action.payload.x
      )
    case 'GRIDSTATE_SWAP':
      return swapGridValues(
        state,
        action.payload.srcY,
        action.payload.srcX,
        action.payload.dstY,
        action.payload.dstX
      )
    case 'GRIDSTATE_ADD_ROW': {
      return changeGridShape(state, H + 1, W, 0)
    }
    case 'GRIDSTATE_REMOVE_ROW':
      return changeGridShape(state, Math.max(H - 1, 0), W, 0)
    case 'GRIDSTATE_ADD_COLUMN':
      return changeGridShape(state, H, W + 1, 0)
    case 'GRIDSTATE_REMOVE_COLUMN':
      return changeGridShape(state, H, Math.max(W - 1, 0), 0)
    case 'GRIDSTATE_MOVE_HEADER':
      return moveGridHeader(state, action.payload.srcX, action.payload.dstX)
    case 'GRIDSTATE_MOVE_INDEX':
      return moveGridIndex(state, action.payload.srcY, action.payload.dstY)
    default:
      return state
  }
}
