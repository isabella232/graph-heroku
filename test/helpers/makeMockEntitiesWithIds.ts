import { Entity } from '@jupiterone/integration-sdk-core';

export function makeMockEntitiesWithIds(
  jobStateIds: { _type: string; id: string }[],
): Entity[] {
  return jobStateIds.map((t) => {
    return {
      _class: 'class',
      _key: 'key',
      _type: t._type,
      _rawData: [
        {
          name: 'name',
          rawData: {
            id: t.id,
          },
        },
      ],
    };
  });
}
