// eslint-disable-next-line no-unused-vars
import React from 'react'
import styles from './Cell.module.css'

type Props = {
  isRightEnd: boolean
  isBottom: boolean
  top: number
  left: number
  width: number
  height: number
  opacity: number
  content: string
  onClick?: (event: React.MouseEvent<HTMLInputElement>) => void
  classes?: string[]
  zIndex: number
}

const Cell: React.FC<Props> = (props: Props) => {
  // default props
  const additionalClasses =
    typeof props.classes === 'undefined' ? [] : props.classes
  const onClick =
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    typeof props.onClick === 'undefined' ? () => {} : props.onClick

  const classes = [styles['cell']]
  for (const cls of additionalClasses) {
    classes.push(styles[cls])
  }
  if (props.isRightEnd) {
    classes.push(styles['is-right-cell'])
  }
  if (props.isBottom) {
    classes.push(styles['is-bottom-cell'])
  }
  const style = {
    top: `${props.top}px`,
    left: `${props.left}px`,
    width: `${props.width}px`,
    height: `${props.height}px`,
    opacity: props.opacity,
    zIndex: props.zIndex,
  }
  return (
    <div className={classes.join(' ')} style={style} onClick={onClick}>
      <div className={styles['inner-cell']}>{props.content}</div>
    </div>
  )
}

export default Cell
