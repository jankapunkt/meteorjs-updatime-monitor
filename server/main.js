import '/imports/api/customers';
import { Meteor } from 'meteor/meteor'
import { Monitor } from './Monitor'
import { UptimeRequest } from './UptimeRequest'

Meteor.startup(async () => {
  const myDomain = Meteor.settings.monitors.meteor
  await Monitor.init(myDomain)

  const runMonitor = async () => {
    const request = new UptimeRequest(myDomain)
    await request.fire()
    return Monitor.add(request.toDocument())
  }

  Meteor.setInterval(runMonitor, myDomain.interval)
});
