import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'

import { useStyles } from './styles'

import type { AttributeDiff } from '@utils/comparison'

type DiffType = AttributeDiff['type']

type DiffIconConfig = {
  Icon: React.ComponentType<{ className?: string }>
  style: string
}

type Props = {
  type: DiffType
}

export const DiffIcon = ({ type }: Props) => {
  const { styles, cx } = useStyles()

  const DIFF_ICON_MAP: Record<DiffType, DiffIconConfig> = {
    added: {
      Icon: PlusCircleOutlined,
      style: cx(styles.diffIcon, styles.diffIconAdded)
    },
    removed: {
      Icon: CloseCircleOutlined,
      style: cx(styles.diffIcon, styles.diffIconRemoved)
    },
    modified: {
      Icon: EditOutlined,
      style: cx(styles.diffIcon, styles.diffIconModified)
    },
    unchanged: {
      Icon: CheckCircleOutlined,
      style: cx(styles.diffIcon, styles.diffIconUnchanged)
    }
  }

  const config = DIFF_ICON_MAP[type]
  if (!config) return null

  const { Icon, style } = config

  return <Icon className={style} />
}
