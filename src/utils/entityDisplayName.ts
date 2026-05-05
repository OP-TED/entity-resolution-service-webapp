type EntityMentionLike = {
  identified_by?: {
    request_id?: string | null
    entity_type?: string | null
  } | null
  parsed_representation?: Record<string, unknown> | null
} | null | undefined

const asString = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value || undefined
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)

  return undefined
}

// Resolve the entity display title.
// Order: parsed_representation[descriptors[entity_type]] → parsed_representation.name → request_id.
export const getEntityDisplayName = (
  mention: EntityMentionLike,
  descriptors?: Record<string, string>
): string | undefined => {
  const parsed = mention?.parsed_representation ?? null
  const entityType = mention?.identified_by?.entity_type ?? undefined
  const field = entityType ? descriptors?.[entityType] : undefined

  if (parsed && field) {
    const fromField = asString(parsed[field])
    if (fromField) return fromField
  }

  if (parsed) {
    const fromName = asString(parsed.name)
    if (fromName) return fromName
  }

  return asString(mention?.identified_by?.request_id)
}

// Same resolution against a raw parsed_representation when only that and the
// entity type are available (e.g. proposed canonical entity previews).
export const getDisplayNameFromParsed = (
  parsed: Record<string, unknown> | null | undefined,
  entityType: string | null | undefined,
  descriptors?: Record<string, string>
): string | undefined => {
  if (!parsed) return undefined
  const field = entityType ? descriptors?.[entityType] : undefined
  if (field) {
    const fromField = asString(parsed[field])
    if (fromField) return fromField
  }

  return asString(parsed.name)
}
