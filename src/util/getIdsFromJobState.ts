export async function getIdsFromJobState(_type, jobState) {
  const ids = [];
  await jobState.iterateEntities({ _type }, (entity) => {
    ids.push(entity._rawData[0].rawData.id);
  });
  return ids;
}
