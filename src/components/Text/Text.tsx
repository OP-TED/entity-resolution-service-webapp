import { Typography } from 'antd'

import { useStyles } from './styles'

import type { TextProps as AntTextProps } from 'antd/es/typography/Text'
import type { FullToken } from 'antd-style'

const { Text: AntText } = Typography

export type TextProps = {
  size?: number
  weight?: number
  color?: keyof FullToken
  isEllipsis?: boolean
} & AntTextProps

export const Text = ({
  size,
  weight,
  color,
  isEllipsis = false,
  children,
  className,
  ...props
}: TextProps) => {
  const { styles, cx } = useStyles({ size, weight, color })

  return (
    <AntText
      className={cx(styles.text, className)}
      ellipsis={isEllipsis ? { tooltip: { title: children } } : false}
      {...props}
    >
      {children}
    </AntText>
  )
}
