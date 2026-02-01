import React from 'react'
import { useConnectionStore } from '../firebase/connection'
import { Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react'

export const ConnectionStatus: React.FC = () => {
  const { status, syncStatus, checkConnection } = useConnectionStore()

  const getStatusIcon = () => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-gray-500" />
      case 'connecting':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'disconnected':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Connected'
      case 'offline':
        return 'Offline'
      case 'connecting':
        return 'Connecting...'
      case 'disconnected':
        return 'Disconnected'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      case 'offline':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
      case 'connecting':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'disconnected':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const handleRetry = () => {
    checkConnection()
  }

  // Only show if not online or if there are pending changes
  if (status === 'online' && syncStatus.pendingChanges === 0) {
    return null
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-sm font-medium">
        {getStatusText()}
      </span>

      {syncStatus.pendingChanges > 0 && (
        <span className="text-xs">
          ({syncStatus.pendingChanges} pending)
        </span>
      )}

      {(status === 'disconnected' || status === 'offline') && (
        <button
          onClick={handleRetry}
          className="ml-2 p-1 hover:bg-black/10 rounded"
          title="Retry connection"
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export default ConnectionStatus
