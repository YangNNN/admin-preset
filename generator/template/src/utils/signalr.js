import config from '@/config'

const createConnect = (options) => {
  if (window._isSignalrToNotice) {
    return
  }
  const signalR = window.signalR
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(config.signalrApi)
    .configureLogging(signalR.LogLevel.Information)
    .build()
  connection.on('Receive', (title, message) => {
    options.options.onmessage.call(this, title, message)
  })
  connection.start()
    .then(() => {
      invokeConnect(connection, options.data)
      window._isSignalrToNotice = true
    })
    .catch(err => console.error(err.toString()))
  return connection
}

const invokeConnect = (connection, data) => {
  connection.invoke('Login', data)
}

export const invokeSignalr = (options) => {
  const connection = createConnect(options)
  return connection
}
