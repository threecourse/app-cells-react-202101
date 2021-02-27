import React from 'react'
import Cell from './Cell'
import { useSelector, useDispatch } from 'react-redux'
import { useGridEvent } from './GridEvent'

const Grid: React.FC = () => {
  // Redux
  const gridState = useSelector((state: any) => state.gridState)
  const dispatch = useDispatch()
  // Custom Hooks
  const gridEvent = useGridEvent()

  // Redux State
  const gridData = gridState.data
  const gridIndex = gridState.index
  const gridHeader = gridState.header
  // UI Logic Propetries
  const cmi = gridEvent.cellMoveInfo
  const hmi = gridEvent.headerMoveInfo
  const imi = gridEvent.indexMoveInfo

  // Properties
  const cellWidth = 100
  const cellHeight = 50
  const cellsH = gridData.length
  const cellsW = cellsH == 0 ? 0 : gridData[0].length
  const scrollbarWidth = 15
  const dataFrameWidth = 800
  const dataFrameHeight = 600

  // CSS Properties
  const frameStyle = {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties
  const headerFrameStyle = {
    width: dataFrameWidth,
    height: cellHeight,
    overflow: 'hidden',
    marginBottom: 10,
  } as React.CSSProperties
  const indexFrameStyle = {
    width: cellWidth,
    height: dataFrameHeight,
    overflow: 'hidden',
    marginRight: 10,
  } as React.CSSProperties
  const rowStyle = {
    display: 'flex',
    flexDirection: 'row',
  } as React.CSSProperties
  const cellsFrameStyle = {
    width: dataFrameWidth + scrollbarWidth,
    height: dataFrameHeight + scrollbarWidth,
    overflow: 'scroll',
  } as React.CSSProperties
  const upLeftStyle = {
    width: cellWidth,
    height: cellHeight,
    marginRight: 10,
    marginBottom: 10,
  } as React.CSSProperties
  const indexStyle = {
    top: -gridEvent.scrollPosition.y,
    position: 'relative',
  } as React.CSSProperties
  const headerStyle = {
    left: -gridEvent.scrollPosition.x,
    position: 'relative',
  } as React.CSSProperties

  const Index: React.FC = () => {
    const W = 1
    const H = cellsH
    const pxHeight = cellHeight
    const pxWidth = cellWidth
    const grids = []
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const isSrc = imi.isSrc(y)
        const classes: string[] = []
        if (isSrc) classes.push('src-cell')
        else classes.push('index-cell')
        if (imi.isSrc(y) || imi.isBottomEmpty(y)) classes.push('is-bottom-cell')
        const props = {
          isRightEnd: x === W - 1,
          isBottom: y === H - 1,
          top: pxHeight * y + imi.yPosOffset(y) + pxHeight * imi.yOffset(y),
          left: pxWidth * x,
          height: pxHeight,
          width: pxWidth,
          content: gridIndex[y],
          classes: classes,
          key: y * W + x,
          opacity: 1.0,
          zIndex: imi.isSrc(y) ? 3 : 0,
        }
        grids.push(<Cell {...props} />)
      }
    }

    return (
      <div style={{ position: 'relative' }}>
        <div style={indexStyle}>{grids} </div>
      </div>
    )
  }

  const Header: React.FC = () => {
    const W = cellsW
    const H = 1
    const pxHeight = cellHeight
    const pxWidth = cellWidth
    const grids = []
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const classes = []
        if (hmi.isSrc(x)) classes.push('src-cell')
        else classes.push('header-cell')
        if (hmi.isSrc(x) || hmi.isRightEmpty(x)) classes.push('is-right-cell')
        const props = {
          isRightEnd: x === W - 1,
          isBottom: y === H - 1,
          top: pxHeight * y,
          left: pxWidth * x + hmi.xPosOffset(x) + pxWidth * hmi.xOffset(x),
          height: pxHeight,
          width: pxWidth,
          content: gridHeader[x],
          classes: classes,
          key: y * W + x,
          opacity: 1.0,
          zIndex: hmi.isSrc(x) ? 3 : 0,
        }
        grids.push(<Cell {...props} />)
      }
    }

    return (
      <div style={{ position: 'relative' }}>
        <div style={headerStyle}>{grids} </div>
      </div>
    )
  }

  const Cells: React.FC = () => {
    const W = cellsW
    const H = cellsH
    const pxHeight = cellHeight
    const pxWidth = cellWidth
    const grids = []
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const isSrcCell = cmi.isSrcCell(y, x)
        const isDstCell = cmi.isDstCell(y, x)
        const isSrcAny = cmi.isSrcCell(y, x) || imi.isSrc(y) || hmi.isSrc(x)
        const createProp = (isPreview: boolean) => {
          let classes: string[] = []
          if (isPreview) {
            classes = classes.concat([
              'is-right-cell',
              'is-bottom-cell',
              'src-cell',
            ])
          } else {
            if (!isSrcCell && !isDstCell) classes.push('main-cell')
            else if (isSrcCell) {
              classes.push('src-cell')
            } else {
              // if (!isSrcCell && isDstCell)
              classes.push('dst-cell')
            }
            if (hmi.isSrc(x) || hmi.isRightEmpty(x))
              classes.push('is-right-cell')
            if (imi.isSrc(y) || imi.isBottomEmpty(y))
              classes.push('is-bottom-cell')
          }

          return {
            isRightEnd: x === W - 1,
            isBottom: y === H - 1,
            top:
              pxHeight * y +
              imi.yPosOffset(y) +
              pxHeight * imi.yOffset(y) +
              (isPreview ? cmi.posOffset(y, x).y : 0),
            left:
              pxWidth * x +
              hmi.xPosOffset(x) +
              pxWidth * hmi.xOffset(x) +
              (isPreview ? cmi.posOffset(y, x).x : 0),
            height: pxHeight,
            width: pxWidth,
            content: `${gridData[y][x]}`,
            classes: classes,
            onClick: () => {
              dispatch({
                type: 'GRIDSTATE_UPDATE',
                payload: { addition: 10, y: y, x: x },
              })
            },
            opacity: isPreview ? 0.7 : 1.0,
            key: y * W + x + (isPreview ? 1000000 : 0),
            zIndex: isSrcAny ? 3 : 0,
          }
        }
        const props = createProp(false)
        grids.push(<Cell {...props} />)
        if (isSrcCell) {
          const propsPreview = createProp(true)
          grids.push(<Cell {...propsPreview} />)
        }
      }
    }

    return (
      <div style={{ position: 'relative' }}>
        <div>{grids} </div>
      </div>
    )
  }

  return (
    <div style={frameStyle} {...gridEvent.gridEvents}>
      <div style={rowStyle}>
        <div style={upLeftStyle} />
        <div style={headerFrameStyle}>
          <Header />
        </div>
      </div>
      <div style={rowStyle}>
        <div style={indexFrameStyle}>
          <Index />
        </div>
        <div style={cellsFrameStyle} {...gridEvent.dataFrameEvents}>
          <Cells />
        </div>
      </div>
    </div>
  )
}

export default Grid
