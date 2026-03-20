import { type FullToken, createStyles } from 'antd-style'

export const useStyles = createStyles(
  (
    { token },
    props: {
      size?: number
      weight?: number
      color?: keyof FullToken
    }
  ) => ({
    text: {
      fontSize: `${props.size || 14}px !important`,
      fontWeight: `${props.weight || 400}`,
      color:
        props?.color && ((token[props?.color] || token.colorTextBase) as string)
    }
  })
)
