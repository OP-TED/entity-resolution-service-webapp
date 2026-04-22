import Skeleton, { type SkeletonProps } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import type { PropsWithChildren } from 'react'

type Props = { isLoading: boolean, marginBottom?: number } & SkeletonProps & PropsWithChildren

export const SkeletonWrapper = ({ isLoading, children, marginBottom, ...props }: Props) => {
  return <>{isLoading ? <Skeleton {...props} style={{ marginBottom }} /> : children}</>
}
