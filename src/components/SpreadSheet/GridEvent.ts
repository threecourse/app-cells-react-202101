import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

type Position = {
  x: number
  y: number
}

class YXCell {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  isEmpty(): boolean {
    return this.x === -1
  }
}

class YXHeader {
  x: number

  constructor(x: number) {
    this.x = x
  }

  isEmpty(): boolean {
    return this.x === -1
  }
}

class YXIndex {
  y: number

  constructor(y: number) {
    this.y = y
  }

  isEmpty(): boolean {
    return this.y === -1
  }
}

// カスタムフックで管理する状態 ----------------------------
class HeaderMoveState {
  src: YXHeader
  dst: YXHeader
  startPos: Position
  constructor(src: YXHeader, dst: YXHeader, startPos: Position) {
    this.src = src
    this.dst = dst
    this.startPos = startPos
  }
  static Empty(): HeaderMoveState {
    return new HeaderMoveState(new YXHeader(-1), new YXHeader(-1), {
      x: 0,
      y: 0,
    })
  }
}

class IndexMoveState {
  src: YXIndex
  dst: YXIndex
  startPos: Position
  constructor(src: YXIndex, dst: YXIndex, startPos: Position) {
    this.src = src
    this.dst = dst
    this.startPos = startPos
  }
  static Empty(): IndexMoveState {
    return new IndexMoveState(new YXIndex(-1), new YXIndex(-1), { x: 0, y: 0 })
  }
}

class CellMoveState {
  src: YXCell
  dst: YXCell
  startPos: { x: number; y: number }
  constructor(src: YXCell, dst: YXCell, startPos: Position) {
    this.src = src
    this.dst = dst
    this.startPos = startPos
  }
  static Empty(): CellMoveState {
    return new CellMoveState(new YXCell(-1, -1), new YXCell(-1, -1), {
      x: 0,
      y: 0,
    })
  }
}

// コンポーネントで利用する情報 ----------------------------

type CellMoveInfo = {
  isSrcCell: (y: number, x: number) => boolean // 移動元かどうか
  isDstCell: (y: number, x: number) => boolean // 移動先かどうか
  posOffset: (y: number, x: number) => Position // 移動元である場合、どの程度右・下にずらして表示するべきか
}

type HeaderMoveInfo = {
  isSrc: (x: number) => boolean // 移動元かどうか
  xPosOffset: (x: number) => number // 移動元である場合、どの程度右にずらして表示するべきか
  xOffset: (x: number) => number // セルを何個分右にずらして表示するべきか
  isRightEmpty: (x: number) => boolean // 右のセルが存在するか
}
type IndexMoveInfo = {
  isSrc: (y: number) => boolean // 移動元かどうか
  yPosOffset: (y: number) => number // 移動元である場合、どの程度下にずらして表示するべきか
  yOffset: (y: number) => number // セルを何個分下にずらして表示するべきか
  isBottomEmpty: (y: number) => boolean // 下のセルが存在するか
}

export function useGridEvent() {
  const gridData = useSelector((state: any) => state.gridState.data)
  const dispatch = useDispatch()
  const cellsH = gridData.length
  const cellsW = cellsH == 0 ? 0 : gridData[0].length

  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 })
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [headerMove, setHeaderMove] = useState<HeaderMoveState>(
    HeaderMoveState.Empty()
  )
  const [indexMove, setIndexMove] = useState<IndexMoveState>(
    IndexMoveState.Empty()
  )
  const [cellMove, setCellMove] = useState<CellMoveState>(CellMoveState.Empty())

  const cellWidth = 100
  const cellHeight = 50
  const HeaderFrameHeight = 50
  const IndexFrameWidth = 100
  const dataFrameWidth = 800
  const dataFrameHeight = 600
  const margin = 10

  // スクロールイベントの処理 -------------------------------------------------
  const onScroll = (e: any) => {
    const positionY = e.target.scrollTop
    const positionX = e.target.scrollLeft
    setScrollPosition({ x: positionX, y: positionY })
  }

  // ユーティリティ -----------------------------------------------------------

  // グリッド全体の左上点からのオフセットを求める
  function getPositionWholeGrid(
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    const currentTargetRect = event.currentTarget.getBoundingClientRect()
    const x = event.pageX - currentTargetRect.left
    const y = event.pageY - currentTargetRect.top
    return { x, y }
  }

  // データの左上座標を(0, 0)とした場合のピクセル座標
  function getPosition(posWholeGrid: Position) {
    return {
      x: posWholeGrid.x - cellWidth - margin,
      y: posWholeGrid.y - cellHeight - margin,
    }
  }

  // スクロールを加味したデータの左上座標を(0, 0)とした場合のピクセル座標
  // 座標の計算にはこちらを用いる
  function getPositionScrolled(pos: Position) {
    return {
      x: pos.x + scrollPosition.x,
      y: pos.y + scrollPosition.y,
    }
  }

  // セル --------------------------------------------------------
  // 範囲内のセルにマウスがあるかどうか（見た目上）
  function isInDataPos(pos: Position): boolean {
    return (
      pos.x >= 0 &&
      pos.x < dataFrameWidth &&
      pos.y >= 0 &&
      pos.y < dataFrameHeight
    )
  }

  // 範囲内のセルにマウスがあるかどうか（セル座標）
  function isInDataYX(pos: Position): boolean {
    const yx = CellYX(pos)
    return isInCellYXValid(yx)
  }

  // セルが範囲内かどうか
  function isInCellYXValid(yx: { x: number; y: number }): boolean {
    return yx.x >= 0 && yx.x < cellsW && yx.y >= 0 && yx.y < cellsH
  }

  // セルの座標（マイナス・超過も許容する）
  function CellYX(pos: Position): YXCell {
    const posScrolled = getPositionScrolled(pos)
    const x = Math.floor(posScrolled.x / cellWidth)
    const y = Math.floor(posScrolled.y / cellHeight)
    return new YXCell(x, y)
  }

  // ヘッダー ------------------

  // ヘッダー上にマウスがあるかどうか（見た目上）
  function isInHeaderPos(pos: Position): boolean {
    return (
      pos.x >= 0 &&
      pos.x < dataFrameWidth &&
      pos.y >= -margin - HeaderFrameHeight &&
      pos.y < -margin
    )
  }

  // 範囲内のセルにマウスがあるかどうか（セル座標）
  function isInHeaderYX(pos: Position): boolean {
    const yx = HeaderYX(pos)
    return isHeaderYXValid(yx)
  }

  // ヘッダーが範囲内かどうか
  function isHeaderYXValid(yx: { x: number }): boolean {
    return yx.x >= 0 && yx.x < cellsW
  }

  // ヘッダーの座標（マイナス・超過も許容する）
  function HeaderYX(pos: Position): YXHeader {
    const posScrolled = getPositionScrolled(pos)
    const x = Math.floor(posScrolled.x / cellWidth)
    return new YXHeader(x)
  }

  // インデックス --------------------------------------------------

  // インデックス上にマウスがあるかどうか（見た目上）
  function isInIndexPos(pos: Position): boolean {
    return (
      pos.x >= -margin - IndexFrameWidth &&
      pos.x < -margin &&
      pos.y >= 0 &&
      pos.y < dataFrameHeight
    )
  }

  // 範囲内のセルにマウスがあるかどうか（セル座標）
  function isInIndexYX(pos: Position): boolean {
    const yx = IndexYX(pos)
    return isIndexYXValid(yx)
  }

  // インデックスが範囲内かどうか
  function isIndexYXValid(yx: { y: number }): boolean {
    return yx.y >= 0 && yx.y < cellsH
  }

  // ヘッダーの座標（マイナス・超過も許容する）
  function IndexYX(pos: Position): YXIndex {
    const posScrolled = getPositionScrolled(pos)
    const y = Math.floor(posScrolled.y / cellHeight)
    return new YXIndex(y)
  }

  // イベント -------------------------------------------------------

  const onMouseDown: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = (event) => {
    event.preventDefault()

    const posGrid = getPositionWholeGrid(event)
    const pos = getPosition(posGrid)
    setMousePos(pos)

    // ヘッダー
    if (headerMove.src.isEmpty()) {
      if (isInHeaderPos(pos) && isInHeaderYX(pos)) {
        const headerYX = HeaderYX(pos)
        setHeaderMove({
          src: new YXHeader(headerYX.x),
          dst: new YXHeader(headerYX.x),
          startPos: pos,
        })
      }
    }

    // インデックス
    if (indexMove.src.isEmpty()) {
      if (isInIndexPos(pos) && isInIndexYX(pos)) {
        const indexYX = IndexYX(pos)
        setIndexMove({
          src: new YXIndex(indexYX.y),
          dst: new YXIndex(indexYX.y),
          startPos: pos,
        })
      }
    }

    // セル
    if (cellMove.src.isEmpty()) {
      if (isInDataPos(pos) && isInDataYX(pos)) {
        const cellPos = CellYX(pos)
        setCellMove({
          src: new YXCell(cellPos.x, cellPos.y),
          dst: new YXCell(cellPos.x, cellPos.y),
          startPos: pos,
        })
      }
    }
  }

  const onMouseMove: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = (event) => {
    event.preventDefault()
    const posGrid = getPositionWholeGrid(event)
    const pos = getPosition(posGrid)

    setMousePos(pos)

    // ヘッダー
    if (!headerMove.src.isEmpty()) {
      if (!isInHeaderPos(pos)) {
        setHeaderMove(HeaderMoveState.Empty())
      } else {
        if (isInHeaderYX(pos)) {
          setHeaderMove((prevState) => {
            return {
              ...prevState,
              dst: HeaderYX(pos),
            }
          })
        }
      }
    }

    // インデックス
    if (!indexMove.src.isEmpty()) {
      if (!isInIndexPos(pos)) {
        setIndexMove(IndexMoveState.Empty())
      } else {
        if (isInIndexYX(pos)) {
          setIndexMove((prevState) => {
            return {
              ...prevState,
              dst: IndexYX(pos),
            }
          })
        }
      }
    }

    // セルのドラッグアンドドロップ
    if (!cellMove.src.isEmpty()) {
      if (!isInDataPos(pos)) {
        setCellMove(CellMoveState.Empty())
      } else {
        if (isInDataYX(pos)) {
          const cellPos = CellYX(pos)
          setCellMove((prevState) => {
            return {
              ...prevState,
              dst: new YXCell(cellPos.x, cellPos.y),
            }
          })
        }
      }
    }
  }

  const onMouseUp: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => void = (event) => {
    event.preventDefault()
    // ヘッダー
    if (!headerMove.src.isEmpty()) {
      onDropHeader(headerMove.src, headerMove.dst)
      setHeaderMove(HeaderMoveState.Empty())
    }

    // インデックス
    if (!indexMove.src.isEmpty()) {
      onDropIndex(indexMove.src, indexMove.dst)
      setIndexMove(IndexMoveState.Empty())
    }

    // セル
    if (!cellMove.src.isEmpty()) {
      onDropCell(cellMove.src, cellMove.dst)
      setCellMove(CellMoveState.Empty())
    }
  }

  function onDropHeader(srcHeader: YXHeader, dstHeader: YXHeader) {
    if (isHeaderYXValid(srcHeader) && isHeaderYXValid(dstHeader)) {
      if (srcHeader.x === dstHeader.x) {
        // do nothing
      } else {
        dispatch({
          type: 'GRIDSTATE_MOVE_HEADER',
          payload: {
            srcX: srcHeader.x,
            dstX: dstHeader.x,
          },
        })
      }
    }
  }

  function onDropIndex(srcIndex: YXIndex, dstIndex: YXIndex) {
    if (isIndexYXValid(srcIndex) && isIndexYXValid(dstIndex)) {
      if (srcIndex.y === dstIndex.y) {
        // do nothing
      } else {
        dispatch({
          type: 'GRIDSTATE_MOVE_INDEX',
          payload: {
            srcY: srcIndex.y,
            dstY: dstIndex.y,
          },
        })
      }
    }
  }

  function onDropCell(srcPos: YXCell, dstPos: YXCell) {
    if (isInCellYXValid(srcPos) && isInCellYXValid(dstPos)) {
      if (srcPos.y == dstPos.y && srcPos.x === dstPos.x) {
        // update value
        dispatch({
          type: 'GRIDSTATE_UPDATE',
          payload: { addition: 10, y: srcPos.y, x: srcPos.x },
        })
      } else {
        // swap value
        dispatch({
          type: 'GRIDSTATE_SWAP',
          payload: {
            srcY: srcPos.y,
            srcX: srcPos.x,
            dstY: dstPos.y,
            dstX: dstPos.x,
          },
        })
      }
    }
  }

  let cellMoveInfo: CellMoveInfo
  {
    const isSrcCell = (y: number, x: number) =>
      x === cellMove.src.x && y === cellMove.src.y
    const isDstCell = (y: number, x: number) =>
      x === cellMove.dst.x && y === cellMove.dst.y
    const posOffset = (y: number, x: number) => {
      return {
        y:
          x === cellMove.src.x && y === cellMove.src.y
            ? mousePos.y - cellMove.startPos.y
            : 0,
        x:
          x === cellMove.src.x && y === cellMove.src.y
            ? mousePos.x - cellMove.startPos.x
            : 0,
      }
    }
    cellMoveInfo = {
      isSrcCell,
      isDstCell,
      posOffset,
    }
  }

  let headerMoveInfo: HeaderMoveInfo
  {
    const move = headerMove
    const isSrc = (x: number) => x === move.src.x
    const xPosOffset = (x: number) =>
      isSrc(x) ? mousePos.x - move.startPos.x : 0
    const xOffset = (x: number) => {
      if (x < move.src.x && x >= move.dst.x) {
        return +1
      }
      if (x > move.src.x && x <= move.dst.x) {
        return -1
      }
      return 0
    }
    const isRightEmpty = (x: number) => {
      if (x < move.src.x && x === move.dst.x - 1) {
        return true
      }
      if (x > move.src.x && x === move.dst.x) {
        return true
      }
      return false
    }

    headerMoveInfo = {
      isSrc,
      isRightEmpty,
      xPosOffset,
      xOffset,
    }
  }

  let indexMoveInfo: IndexMoveInfo
  {
    const move = indexMove
    const isSrc = (y: number) => y === move.src.y
    const yPosOffset = (y: number) =>
      isSrc(y) ? mousePos.y - move.startPos.y : 0
    const isBottomEmpty = (y: number) => {
      if (y < move.src.y && y === move.dst.y - 1) {
        return true
      }
      if (y > move.src.y && y === move.dst.y) {
        return true
      }
      return false
    }

    const yOffset = (y: number) => {
      if (y < move.src.y && y >= move.dst.y) {
        return 1
      }
      if (y > move.src.y && y <= move.dst.y) {
        return -1
      }
      return 0
    }

    indexMoveInfo = {
      isSrc,
      yPosOffset,
      isBottomEmpty,
      yOffset,
    }
  }

  return {
    cellMoveInfo,
    headerMoveInfo,
    indexMoveInfo,
    scrollPosition,
    gridEvents: {
      onMouseDown: onMouseDown,
      onMouseMove: onMouseMove,
      onMouseUp: onMouseUp,
    },
    dataFrameEvents: {
      onScroll: onScroll,
    },
  }
}
