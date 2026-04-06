import { createStyles } from 'antd-style'

export const useStyles = createStyles(({ token }) => ({
  sideMenu: {
    background: token.colorBgContainer,
    borderRight: `1px solid ${token.colorBorder}`,
    maxWidth: '300px',
    height: '100%'
  },

  menu: {
    overflowY: 'auto',
    height: 'calc(100% - 65px)',
    '&.ant-menu-light.ant-menu-root.ant-menu-inline': {
      borderInlineEnd: 'none'
    },

    '.ant-menu-item': {
      borderBottom: `1px solid ${token.colorBorderSecondary}`,
      borderLeft: '3px solid transparent'
    },

    '.ant-menu-item-selected': {
      borderLeft: `3px solid ${token.colorPrimary}`
    }
  }
}))
