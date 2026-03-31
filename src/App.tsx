import {
  ComparisonPanel,
  DecisionsSideMenu,
  FilterBar,
  Header,
  KeyboardShortcuts
} from '@components'
import { Col, Flex, Row } from 'antd'
import { useState } from 'react'

import type { DecisionSummary } from '@api/types.gen'

function App() {
  const [activeDecision, setActiveDecision] = useState<DecisionSummary>()

  return (
    <Flex vertical className="h-100vh overflow-hidden">
      <Header />

      <FilterBar />

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
            <DecisionsSideMenu
              activeDecision={activeDecision}
              onSelect={setActiveDecision}
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
            <ComparisonPanel currentDecision={activeDecision} />
          </Col>
        </Row>
      </main>

      <KeyboardShortcuts activeDecision={activeDecision} />
    </Flex>
  )
}

export default App
