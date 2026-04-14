import { BaseOrdering, UserActionType } from '@api/types.gen'
import { Text } from '@components'
import { UsersSelect } from '@components/UsersSelect'
import { useQueryUpdate } from '@hooks'
import { Flex, Select } from 'antd'

import { useStyles } from './styles'

const actionTypeOptions = [
  { label: 'All Actions', value: '' },
  { label: 'Accept Top', value: UserActionType.ACCEPT_TOP },
  { label: 'Accept Alternative', value: UserActionType.ACCEPT_ALTERNATIVE },
  { label: 'Reject All', value: UserActionType.REJECT_ALL }
]

const orderingOptions = [
  { label: 'Created At (Newest)', value: BaseOrdering['-CREATED_AT'] },
  { label: 'Created At (Oldest)', value: BaseOrdering.CREATED_AT }
]

export const UserActionsFilterBar = () => {
  const { updateQuery, params } = useQueryUpdate()
  const { styles } = useStyles()

  return (
    <Flex className={styles.filterBar} align="center" gap={16} wrap>
      <Flex align="center" gap={8}>
        <Text weight={500}>Action:</Text>

        <Select
          value={params?.action_type ? String(params.action_type) : ''}
          className="select-min-width"
          options={actionTypeOptions}
          onChange={(value) => updateQuery({ action_type: value || undefined })}
          aria-label="Filter by action type"
        />
      </Flex>

      <Flex align="center" gap={8}>
        <Text weight={500}>User:</Text>

        <UsersSelect
          onChange={(value) => updateQuery({ actor: value || undefined })}
        />
      </Flex>

      <Flex align="center" gap={8}>
        <Text weight={500}>Sort by:</Text>

        <Select
          value={params?.ordering ? String(params.ordering) : undefined}
          className="select-min-width"
          options={orderingOptions}
          placeholder="Default sorted by created at (newest)"
          onChange={(value) => updateQuery({ ordering: value })}
          aria-label="Sort by"
        />
      </Flex>
    </Flex>
  )
}
