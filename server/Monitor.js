import { Meteor } from 'meteor/meteor'
import { StatusCollection } from '../imports/collections/StatusCollection'
import { MonitorCollection } from '../imports/collections/MonitorCollection'

export const Monitor = {}

Monitor.init = async ({ name, url, method, interval }) => {
  return StatusCollection.upsert({ name }, {
    $set: { name, url, method, interval }
  })
}

Monitor.add = async document => {
  const { name, hasTimedOut } = document
  const status = await StatusCollection.findOneAsync({ name })
  console.debug('Monitor add:', document.name, status.url, status.up, document.duration)
  let statusChanged = false

  // we just went down :-(
  if (status.up && hasTimedOut) {
    statusChanged = true
    status.up = false
  }

  // we're back
  if (!status.up && !hasTimedOut) {
    statusChanged = true
    status.up = true
  }

  if (statusChanged) {
    await StatusCollection.updateAsync(status._id, {
      $set: status
    })
    // TODO notify user
  }

  await MonitorCollection.insertAsync(document)
}

Meteor.publish('status', function ({ name }) {
  return StatusCollection.find({ name })
})

Meteor.publish('monitor', function ({ name }) {
  return MonitorCollection.find({ name }, {
    limit: 250,
    hint: { $natural: -1 }
  })
})
