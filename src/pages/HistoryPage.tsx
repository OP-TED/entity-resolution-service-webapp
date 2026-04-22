import {
  Header,
  UserActionDetailPanel,
  UserActionsFilterBar,
  UserActionsSideMenu
} from '@components'
import { Col, Flex, Row } from 'antd'
import { useState } from 'react'

import type { UserActionSummary } from '@api/types.gen'

export const HistoryPage = () => {
  const [activeAction, setActiveAction] = useState<UserActionSummary>()

  return (
    <Flex vertical className="h-100vh overflow-hidden">
      <Header />

      <UserActionsFilterBar />

      <main className="flex-1 overflow-hidden">
        <Row className="h-full">
          <Col
            xs={24}
            sm={12}
            md={8}
            lg={7}
            xl={6}
            xxl={5}
            className="h-full overflow-hidden"
          >
            <UserActionsSideMenu
              activeAction={activeAction}
              onSelect={setActiveAction}
            />
          </Col>

          <Col
            xs={24}
            sm={12}
            md={16}
            xl={18}
            xxl={19}
            className="h-full overflow-hidden"
          >
            <UserActionDetailPanel currentAction={activeAction} />
          </Col>
        </Row>
      </main>
    </Flex>
  )
}
